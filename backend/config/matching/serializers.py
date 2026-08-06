from .models import ChatSession, ChatMessage
from rest_framework import serializers

class ChatSessionSerializer(serializers.ModelSerializer):
    other_user = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatSession
        fields = ['id', 'user_a', 'task_a', 'user_b', 'task_b', 'other_user', 'last_activity_at', 'created_at']
        read_only_fields = ['id', 'user_a', 'task_a', 'user_b', 'task_b', 'last_activity_at', 'created_at']
        
    def get_other_user(self, obj):
        other = obj.user_b if self.context['request'].user == obj.user_a else obj.user_a
        return {"id": other.id, "username": other.username}
        
class ChatMessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source = 'sender.username', read_only = True)
    
    class Meta:
        model = ChatMessage
        fields = ['id', 'session', 'sender', 'sender_username', 'content', 'created_at']
        read_only_fields = ['id', 'session', 'sender', 'created_at']