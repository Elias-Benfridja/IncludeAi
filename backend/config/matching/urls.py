from django.urls import path
from .views import ChatMessagesView, ChatSessionCreateView, SimilarTasksView

urlpatterns = [
    path('', ChatSessionCreateView.as_view(), name='create_chat_session'),
    path('tasks/<int:pk>/similar/', SimilarTasksView.as_view(), name='similar_tasks'),
    path('sessions/<int:pk>/messages/', ChatMessagesView.as_view(), name='chat_messages'),
]