from datetime import timedelta

from django.contrib.auth.models import User
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.exceptions import APIException, PermissionDenied
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Block, ChatMessage, ChatSession
from .serializers import BlockSerializer, ChatMessageSerializer, ChatSessionSerializer
from .services import extract_keywords, keyword_overlap_score
from tasks.models import Task

# Create your views here.


def is_blocked_either_way(user_a, user_b):
    return Block.objects.filter(blocker=user_a, blocked=user_b).exists() or \
        Block.objects.filter(blocker=user_b, blocked=user_a).exists()


class SimilarTasksView(GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        task = get_object_or_404(Task, pk=pk, user=request.user)

        if not request.user.profile.matching_enabled:
            return Response(
                {"detail": "Turn on matching in your settings to find similar tasks."},
                status=status.HTTP_400_BAD_REQUEST
            )

        my_keywords = extract_keywords(task.description)

        blocked_user_ids = set(
            Block.objects.filter(blocker=request.user).values_list('blocked_id', flat=True)
        ) | set(
            Block.objects.filter(blocked=request.user).values_list('blocker_id', flat=True)
        )

        candidates = Task.objects.filter(
            user__profile__matching_enabled=True
        ).exclude(user=request.user).exclude(user_id__in=blocked_user_ids)

        results = []
        for other_task in candidates:
            score = keyword_overlap_score(my_keywords, extract_keywords(other_task.description))
            if score > 0:
                results.append({
                    "task_id": other_task.id,
                    "user_id": other_task.user.id,
                    "username": other_task.user.username,
                    "description": other_task.description,
                    "score": round(score, 2),
                })

        results.sort(key=lambda r: r["score"], reverse=True)
        return Response(results[:10])

class ChatSessionCreateView(GenericAPIView):
    serializer_class = ChatSessionSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        other_user_id = request.data['other_user_id']
        my_task_id = request.data['my_task_id']
        other_task_id = request.data['other_task_id']

        other_user = get_object_or_404(User, pk=other_user_id)
        if not other_user.profile.matching_enabled:
            return Response({"message": "User doesn't want to chat"}, status=status.HTTP_400_BAD_REQUEST)

        if is_blocked_either_way(request.user, other_user):
            return Response(
                {"detail": "You can't start a chat with this user."},
                status=status.HTTP_403_FORBIDDEN
            )

        my_task = get_object_or_404(Task, pk=my_task_id, user=request.user)
        other_task = get_object_or_404(Task, pk=other_task_id, user=other_user)

        if request.user.id <= other_user.id:
            user_a, task_a = request.user, my_task
            user_b, task_b = other_user, other_task
        else:
            user_a, task_a = other_user, other_task
            user_b, task_b = request.user, my_task

        session = ChatSession.objects.filter(user_a=user_a, user_b=user_b).first()
        if not session:
            session = ChatSession.objects.create(
                user_a=user_a, user_b=user_b, task_a=task_a, task_b=task_b,
                initiator=request.user,
            )

        return Response(
            ChatSessionSerializer(session, context={'request': request}).data,
            status=status.HTTP_200_OK
        )
        
        
class ChatExpired(APIException):
    status_code = 410
    default_detail = "This chat has expired due to inactivity."
    default_code = "chat_expired"


def get_active_session(request, pk):
    session = get_object_or_404(ChatSession, pk=pk)

    if request.user not in (session.user_a, session.user_b):
        raise PermissionDenied("You're not part of this chat.")

    if timezone.now() - session.last_activity_at > timedelta(minutes=60):
        session.delete()
        raise ChatExpired()

    return session


class ChatSessionListView(GenericAPIView):
    """Active chats for the current user — powers the 'Active Chats' page."""
    serializer_class = ChatSessionSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cutoff = timezone.now() - timedelta(minutes=60)
        # Tidy up anything that's expired before listing.
        ChatSession.objects.filter(
            Q(user_a=request.user) | Q(user_b=request.user),
            last_activity_at__lt=cutoff,
        ).delete()

        sessions = ChatSession.objects.filter(
            Q(user_a=request.user) | Q(user_b=request.user)
        ).order_by('-last_activity_at')

        return Response(
            ChatSessionSerializer(sessions, many=True, context={'request': request}).data
        )


class ChatSessionDetailView(GenericAPIView):
    serializer_class = ChatSessionSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        session = get_active_session(request, pk)
        return Response(ChatSessionSerializer(session, context={'request': request}).data)


class ChatNotificationsView(GenericAPIView):
    """Lightweight, poll-friendly endpoint: only sessions with something new
    (an unseen chat request or unread messages) for the current user."""
    serializer_class = ChatSessionSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cutoff = timezone.now() - timedelta(minutes=60)
        sessions = ChatSession.objects.filter(
            Q(user_a=request.user) | Q(user_b=request.user),
            last_activity_at__gte=cutoff,
        )

        data = ChatSessionSerializer(sessions, many=True, context={'request': request}).data
        data = [s for s in data if s['is_new_request'] or s['unread_count'] > 0]
        return Response(data)


class ChatMessagesView(GenericAPIView):
    serializer_class = ChatMessageSerializer
    permission_classes = [IsAuthenticated]

    def _get_active_session(self, request, pk):
        return get_active_session(request, pk)

    def get(self, request, pk):
        session = self._get_active_session(request, pk)

        other = session.user_b if request.user == session.user_a else session.user_a
        if is_blocked_either_way(request.user, other):
            return Response({"detail": "This chat is no longer available."}, status=status.HTTP_403_FORBIDDEN)

        # Opening the chat acknowledges the request and clears unread count.
        if not session.request_seen:
            session.request_seen = True
            session.save(update_fields=['request_seen'])
        session.clear_unread_for(request.user)

        messages = session.chatmessage_set.order_by('created_at')
        return Response(ChatMessageSerializer(messages, many=True).data)

    def post(self, request, pk):
        session = self._get_active_session(request, pk)

        other = session.user_b if request.user == session.user_a else session.user_a
        if is_blocked_either_way(request.user, other):
            return Response({"detail": "This chat is no longer available."}, status=status.HTTP_403_FORBIDDEN)

        content = request.data.get('content', '').strip()
        if not content:
            return Response({"detail": "Message content is required."}, status=status.HTTP_400_BAD_REQUEST)

        message = ChatMessage.objects.create(session=session, sender=request.user, content=content)

        session.last_activity_at = timezone.now()
        session.save(update_fields=['last_activity_at'])
        session.bump_unread_for_recipient_of(request.user)

        return Response(ChatMessageSerializer(message).data, status=status.HTTP_201_CREATED)


class BlockUserView(GenericAPIView):
    serializer_class = BlockSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        blocked_id = request.data.get('user_id')
        blocked_user = get_object_or_404(User, pk=blocked_id)

        if blocked_user == request.user:
            return Response({"detail": "You can't block yourself."}, status=status.HTTP_400_BAD_REQUEST)

        Block.objects.get_or_create(blocker=request.user, blocked=blocked_user)

        # A block ends any active chat between them immediately, rather than
        # waiting for the 60-minute inactivity expiry.
        ChatSession.objects.filter(user_a=request.user, user_b=blocked_user).delete()
        ChatSession.objects.filter(user_a=blocked_user, user_b=request.user).delete()

        return Response({"detail": "User blocked."}, status=status.HTTP_200_OK)