from django.db.models.aggregates import Sum
from django.shortcuts import get_object_or_404
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView, GenericAPIView, RetrieveDestroyAPIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from reward.models import PointTransaction
from .serializers import SubtaskSerializer, TaskSerializer
from .services import generate_subtasks
from django.db import transaction
from .models import Subtask, Task

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