from django.shortcuts import render

from .models import ChatMessage, ChatSession
from .services import extract_keywords, keyword_overlap_score
from tasks.models import Task
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import GenericAPIView
from .serializers import ChatMessageSerializer, ChatSessionSerializer
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework import status

# Create your views here.

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

        candidates = Task.objects.filter(
            user__profile__matching_enabled=True
        ).exclude(user=request.user)

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
            session = ChatSession.objects.create(user_a=user_a, user_b=user_b, task_a=task_a, task_b=task_b)

        return Response(
            ChatSessionSerializer(session, context={'request': request}).data,
            status=status.HTTP_200_OK
        )
        
        
from datetime import timedelta
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied, APIException


class ChatExpired(APIException):
    status_code = 410
    default_detail = "This chat has expired due to inactivity."
    default_code = "chat_expired"


class ChatMessagesView(GenericAPIView):
    serializer_class = ChatMessageSerializer
    permission_classes = [IsAuthenticated]

    def _get_active_session(self, request, pk):
        session = get_object_or_404(ChatSession, pk=pk)

        if request.user not in (session.user_a, session.user_b):
            raise PermissionDenied("You're not part of this chat.")

        if timezone.now() - session.last_activity_at > timedelta(minutes=60):
            session.delete()
            raise ChatExpired()

        return session

    def get(self, request, pk):
        session = self._get_active_session(request, pk)
        messages = session.chatmessage_set.order_by('created_at')
        return Response(ChatMessageSerializer(messages, many=True).data)

    def post(self, request, pk):
        session = self._get_active_session(request, pk)

        content = request.data.get('content', '').strip()
        if not content:
            return Response({"detail": "Message content is required."}, status=status.HTTP_400_BAD_REQUEST)

        message = ChatMessage.objects.create(session=session, sender=request.user, content=content)

        session.last_activity_at = timezone.now()
        session.save(update_fields=['last_activity_at'])

        return Response(ChatMessageSerializer(message).data, status=status.HTTP_201_CREATED)