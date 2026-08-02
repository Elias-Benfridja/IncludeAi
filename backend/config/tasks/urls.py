from django.urls import path
from .views import TaskListCreateView, TaskDetailView,SubtaskListCreateView, SubtaskDetailView, SubtaskCompleteView

urlpatterns = [
    path('tasks/', TaskListCreateView.as_view(), name='list_create_task'),
    path('tasks/<int:pk>/', TaskDetailView.as_view(), name='detail_task'),
    path('tasks/<int:task_pk>/subtasks/', SubtaskListCreateView.as_view(), name='list_create_subtask'),
    path('subtasks/<int:pk>/', SubtaskDetailView.as_view(), name='detail_subtask'),
    path('subtasks/<int:pk>/complete/', SubtaskCompleteView.as_view(), name='complete_subtask'),
]