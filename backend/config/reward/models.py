from django.db import models
from django.contrib.auth.models import User
from django.db.models import CASCADE

# Create your models here.

class RewardItem(models.Model):
    user = models.ForeignKey(User, on_delete=CASCADE)
    name = models.CharField(max_length=50)
    price = models.PositiveIntegerField()
    active = models.BooleanField(default=True)
    date = models.DateTimeField(auto_now_add=True)
    
class PointTransaction(models.Model):
    user = models.ForeignKey(User, on_delete=CASCADE)
    subtask = models.ForeignKey('tasks.Subtask', on_delete=CASCADE, null=True, blank=True)
    reward = models.ForeignKey(RewardItem, on_delete=CASCADE, null=True, blank=True)
    amount = models.IntegerField()
    