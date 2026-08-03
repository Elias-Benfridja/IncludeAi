from reward.models import RewardItem
from rest_framework import serializers
from django.contrib.auth.models import User

DEFAULT_REWARDS = [
    {"name": "Quick Break", "price": 15},
    {"name": "Screen Time", "price": 30},
    {"name": "Sweet Treat", "price": 50},
    {"name": "Gaming Session", "price": 60},
]

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
        )
        RewardItem.objects.bulk_create([
            RewardItem(user=user, name=r['name'], price=r['price'])
            for r in DEFAULT_REWARDS
        ])
        return user