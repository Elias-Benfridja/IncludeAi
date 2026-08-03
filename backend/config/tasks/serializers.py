from rest_framework import serializers
from .models import Subtask, Task

class SubtaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subtask
        fields = ['id', 'task', 'user', 'description', 'points', 'order', 'completed', 'expandable', 'date']
        read_only_fields = ['id', 'user', 'points', 'task', 'expandable' ,'date']
        
class TaskSerializer(serializers.ModelSerializer):
    subtask_set = SubtaskSerializer(many = True, read_only = True)
    class Meta:
        model = Task
        fields = ['id', 'description', 'subtask_set']
        read_only_fields = ['id', 'user', 'date']