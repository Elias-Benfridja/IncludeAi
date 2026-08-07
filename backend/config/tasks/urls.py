from django.urls import path
from .views import SubtaskExpandView, TaskListCreateView, TaskDetailView,SubtaskListCreateView, SubtaskDetailView, SubtaskCompleteView, TimerPauseView, TimerStartView, TimerStopView

urlpatterns = [
    path('tasks/', TaskListCreateView.as_view(), name='list_create_task'),
    path('tasks/<int:pk>/', TaskDetailView.as_view(), name='detail_task'),
    path('tasks/<int:task_pk>/subtasks/', SubtaskListCreateView.as_view(), name='list_create_subtask'),
    path('subtasks/<int:pk>/', SubtaskDetailView.as_view(), name='detail_subtask'),
    path('subtasks/<int:pk>/complete/', SubtaskCompleteView.as_view(), name='complete_subtask'),
    path('subtasks/<int:pk>/expand/', SubtaskExpandView.as_view(), name='expand_subtask'),
    path('tasks/<int:pk>/timer/start/', TimerStartView.as_view(), name='start_timer'),
    path('tasks/<int:pk>/timer/pause/', TimerPauseView.as_view(), name='pause_timer'),
    path('tasks/<int:pk>/timer/stop/', TimerStopView.as_view(), name='stop_timer'),
]