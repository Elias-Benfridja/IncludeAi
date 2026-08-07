from .models import Block, ChatSession, ChatMessage
from rest_framework import serializers

class ChatSessionSerializer(serializers.ModelSerializer):
    other_user = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    is_new_request = serializers.SerializerMethodField()

    class Meta:
        model = ChatSession
        fields = [
            'id', 'user_a', 'task_a', 'user_b', 'task_b', 'other_user',
            'unread_count', 'is_new_request', 'last_activity_at', 'created_at',
        ]
        read_only_fields = ['id', 'user_a', 'task_a', 'user_b', 'task_b', 'last_activity_at', 'created_at']

    def get_other_user(self, obj):
        other = obj.user_b if self.context['request'].user == obj.user_a else obj.user_a
        return {"id": other.id, "username": other.username}

    def get_unread_count(self, obj):
        return obj.unread_count_for(self.context['request'].user)

    def get_is_new_request(self, obj):
        request_user = self.context['request'].user
        return obj.initiator_id is not None and obj.initiator_id != request_user.id and not obj.request_seen
        
class ChatMessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source = 'sender.username', read_only = True)
    
    class Meta:
        model = ChatMessage
        fields = ['id', 'session', 'sender', 'sender_username', 'content', 'created_at']
        read_only_fields = ['id', 'session', 'sender', 'created_at']


class BlockSerializer(serializers.ModelSerializer):
    blocked_username = serializers.CharField(source='blocked.username', read_only=True)

    class Meta:
        model = Block
        fields = ['id', 'blocked', 'blocked_username', 'created_at']
        read_only_fields = ['id', 'created_at']