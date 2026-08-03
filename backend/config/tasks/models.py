from django.db import models
from django.contrib.auth.models import User
from django.db.models import CASCADE
# Create your models here.

class Task(models.Model):
    user = models.ForeignKey(User, on_delete=CASCADE)
    description = models.TextField()
    date = models.DateTimeField(auto_now_add=True)

class Subtask(models.Model):
    task = models.ForeignKey(Task, on_delete=CASCADE)
    user = models.ForeignKey(User, on_delete=CASCADE)
    description = models.TextField()
    points = models.PositiveIntegerField()
    order = models.PositiveIntegerField()
    completed = models.BooleanField(default=False)
    expandable = models.BooleanField(default=True)
    date = models.DateTimeField(auto_now_add=True)
    