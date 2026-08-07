from django.urls import path
from .views import (
    BlockUserView,
    ChatMessagesView,
    ChatNotificationsView,
    ChatSessionCreateView,
    ChatSessionDetailView,
    ChatSessionListView,
    SimilarTasksView,
)

urlpatterns = [
    path('', ChatSessionCreateView.as_view(), name='create_chat_session'),
    path('tasks/<int:pk>/similar/', SimilarTasksView.as_view(), name='similar_tasks'),
    path('notifications/', ChatNotificationsView.as_view(), name='chat_notifications'),
    path('sessions/', ChatSessionListView.as_view(), name='chat_sessions'),
    path('sessions/<int:pk>/', ChatSessionDetailView.as_view(), name='chat_session_detail'),
    path('sessions/<int:pk>/messages/', ChatMessagesView.as_view(), name='chat_messages'),
    path('block/', BlockUserView.as_view(), name='block_user'),
]