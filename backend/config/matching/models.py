from django.db import models
from django.contrib.auth.models import User
from django.db.models import CASCADE

# Create your models here.

class ChatSession(models.Model):
    user_a = models.ForeignKey(User, on_delete=CASCADE, related_name='chats_as_user_a')
    user_b = models.ForeignKey(User, on_delete=CASCADE, related_name='chats_as_user_b')
    task_a = models.ForeignKey('tasks.Task', on_delete=CASCADE, related_name='chats_as_task_a')
    task_b = models.ForeignKey('tasks.Task', on_delete=CASCADE, related_name='chats_as_task_b')
    initiator = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='+'
    )
    request_seen = models.BooleanField(default=False)
    user_a_unread_count = models.PositiveIntegerField(default=0)
    user_b_unread_count = models.PositiveIntegerField(default=0)
    last_activity_at = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True) 

    class Meta():
        unique_together = [('user_a', 'user_b')]

    def unread_count_for(self, user):
        return self.user_a_unread_count if user.id == self.user_a_id else self.user_b_unread_count

    def bump_unread_for_recipient_of(self, sender):
        """Increment the unread counter for whichever participant did NOT send
        the message that was just posted by `sender`."""
        if sender.id == self.user_a_id:
            self.user_b_unread_count += 1
            self.save(update_fields=['user_b_unread_count'])
        else:
            self.user_a_unread_count += 1
            self.save(update_fields=['user_a_unread_count'])

    def clear_unread_for(self, user):
        if user.id == self.user_a_id and self.user_a_unread_count:
            self.user_a_unread_count = 0
            self.save(update_fields=['user_a_unread_count'])
        elif user.id == self.user_b_id and self.user_b_unread_count:
            self.user_b_unread_count = 0
            self.save(update_fields=['user_b_unread_count'])

class ChatMessage(models.Model):
    session = models.ForeignKey(ChatSession, on_delete=CASCADE)
    sender = models.ForeignKey(User, on_delete=CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)


class Block(models.Model):
    blocker = models.ForeignKey(User, on_delete=CASCADE, related_name='blocking')
    blocked = models.ForeignKey(User, on_delete=CASCADE, related_name='blocked_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [('blocker', 'blocked')]