from django.db import models
from django.contrib.auth.models import User
from django.db.models import CASCADE

# Create your models here.

class ChatSession(models.Model):
    user_a = models.ForeignKey(User, on_delete=CASCADE, related_name='chats_as_user_a')
    user_b = models.ForeignKey(User, on_delete=CASCADE, related_name='chats_as_user_b')
    task_a = models.ForeignKey('tasks.Task', on_delete=CASCADE, related_name='chats_as_task_a')
    task_b = models.ForeignKey('tasks.Task', on_delete=CASCADE, related_name='chats_as_task_b')
    last_activity_at = models.DateTimeField(auto_now_add=True)
    
    class Meta():
        unique_together = [('user_a', 'user_b')]
    
class ChatMessage(models.Model):
    session = models.ForeignKey(ChatSession, on_delete=CASCADE)
    sender = models.ForeignKey(User, on_delete=CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)