from django.db.models.aggregates import Sum
from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView, GenericAPIView, RetrieveDestroyAPIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from reward.models import PointTransaction
from .serializers import SubtaskSerializer, TaskSerializer
from .services import generate_subtasks, redistribute_points, _bank_elapsed_time
from django.db import transaction
from .models import Subtask, Task
from django.db.models import F

# Create your views here.

class SubtaskListCreateView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SubtaskSerializer
    
    def get_queryset(self):
        return Subtask.objects.filter(user = self.request.user, task_id=self.kwargs['task_pk'])
    
    def perform_create(self, serializer):
        task = get_object_or_404(Task, pk=self.kwargs['task_pk'], user=self.request.user)
        return serializer.save(user = self.request.user, task = task)
    
class SubtaskDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SubtaskSerializer
    
    def get_queryset(self):
        return Subtask.objects.filter(user = self.request.user)
    
    
class SubtaskCompleteView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SubtaskSerializer

    def post(self, request, pk):
        subtask = get_object_or_404(Subtask, user=request.user, pk=pk)

        if subtask.completed:
            return Response(
                {"detail": "Subtask already completed."},
                status=status.HTTP_400_BAD_REQUEST
            )

        subtask.completed = True
        subtask.save()
        
        task = subtask.task
        
        if not task.subtask_set.filter(completed=False).exists() and not task.timer_stopped:
            _bank_elapsed_time(task)
            task.timer_stopped = True
            task.save(update_fields=['timer_started_at', 'timer_elapsed_seconds', 'timer_stopped'])

        PointTransaction.objects.create(
            user=request.user,
            amount=subtask.points,
            subtask=subtask
        )

        new_balance = PointTransaction.objects.filter(
            user=request.user
        ).aggregate(total=Sum('amount'))['total'] or 0

        return Response(
            {
                "subtask": self.get_serializer(subtask).data,
                "points_balance": new_balance
            },
            status=status.HTTP_200_OK
        )
        
class TaskListCreateView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TaskSerializer
    
    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        with transaction.atomic():
            task = serializer.save(user=self.request.user)
            subtasks_data = generate_subtasks(task.description)
            subtasks = [
                Subtask(
                    task=task,
                    user=self.request.user,
                    description=item['description'],
                    points=item['points'],
                    order=index,
                )
                for index, item in enumerate(subtasks_data)
            ]
            Subtask.objects.bulk_create(subtasks)
            
            
class TaskDetailView(RetrieveDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TaskSerializer

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)


class SubtaskExpandView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TaskSerializer

    def post(self, request, pk):
        subtask = get_object_or_404(Subtask, pk=pk, user=request.user)

        if subtask.completed:
            return Response(
                {"detail": "Can't break down a step that's already done."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not subtask.expandable:
            return Response(
                {"detail": "This step has already been split and can't be split again."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # smaller range than a full task breakdown (3–7), since we're splitting
        # one already-small piece, not a whole task
        new_items = generate_subtasks(subtask.description, min_items=2, max_items=4)
        new_items = redistribute_points(new_items, subtask.points)

        task = subtask.task
        original_order = subtask.order

        with transaction.atomic():
            Subtask.objects.filter(task=task, order__gt=original_order).update(
                order=F('order') + (len(new_items) - 1)
            )
            subtask.delete()

            new_subtasks = [
                Subtask(
                    task=task,
                    user=request.user,
                    description=item['description'],
                    points=item['points'],
                    order=original_order + i,
                    expandable=False,
                )
                for i, item in enumerate(new_items)
            ]
            Subtask.objects.bulk_create(new_subtasks)

        task.refresh_from_db()
        return Response(TaskSerializer(task).data, status=status.HTTP_200_OK)
    

class TimerStartView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TaskSerializer

    def post(self, request, pk):
        task = get_object_or_404(Task, pk=pk, user=request.user)

        if task.timer_started_at is not None:
            return Response({"detail": "Timer is already running."}, status=status.HTTP_400_BAD_REQUEST)

        # Starting a stopped timer is treated as a restart: it resets the
        # banked time to zero and clears the stopped flag, rather than
        # permanently locking the timer after its first stop.
        if task.timer_stopped:
            task.timer_stopped = False
            task.timer_elapsed_seconds = 0

        task.timer_started_at = timezone.now()
        task.save(update_fields=['timer_started_at', 'timer_elapsed_seconds', 'timer_stopped'])
        return Response(TaskSerializer(task).data)


class TimerPauseView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TaskSerializer

    def post(self, request, pk):
        task = get_object_or_404(Task, pk=pk, user=request.user)

        if task.timer_stopped:
            return Response({"detail": "This task's timer has already been stopped."}, status=status.HTTP_400_BAD_REQUEST)

        if task.timer_started_at is None:
            return Response({"detail": "Timer isn't running."}, status=status.HTTP_400_BAD_REQUEST)

        _bank_elapsed_time(task)
        task.save(update_fields=['timer_started_at', 'timer_elapsed_seconds'])
        return Response(TaskSerializer(task).data)


class TimerStopView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TaskSerializer

    def post(self, request, pk):
        task = get_object_or_404(Task, pk=pk, user=request.user)

        if task.timer_stopped:
            return Response({"detail": "This task's timer has already been stopped."}, status=status.HTTP_400_BAD_REQUEST)

        _bank_elapsed_time(task)
        task.timer_stopped = True
        task.save(update_fields=['timer_started_at', 'timer_elapsed_seconds', 'timer_stopped'])
        return Response(TaskSerializer(task).data)