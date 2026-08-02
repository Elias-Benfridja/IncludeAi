from rest_framework import serializers
from .models import RewardItem, PointTransaction

class RewardItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = RewardItem
        fields = ['id', 'user', 'name', 'price', 'active', 'date']
        read_only_fields = ['id', 'user', 'date']