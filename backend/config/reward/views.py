from django.db.models.aggregates import Sum
from django.shortcuts import render
from rest_framework.generics import GenericAPIView, ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .serializers import RewardItemSerializer
from .models import PointTransaction, RewardItem

# Create your views here.

class RewardItemListCreateView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = RewardItemSerializer
    def get_queryset(self):
        return RewardItem.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        return serializer.save(user=self.request.user)
    
class RewardItemDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = RewardItemSerializer
    
    def get_queryset(self):
            return RewardItem.objects.filter(user=self.request.user)

class RewardRedeemView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = RewardItemSerializer
    
    def post(self ,request, pk):
        reward = get_object_or_404(RewardItem, pk=pk, user=request.user)
        balence = PointTransaction.objects.filter(
                    user=request.user
                ).aggregate(total=Sum('amount'))['total'] or 0
        
        if balence < reward.price:
            return Response({"error": "not enough points to buy item"}, status=status.HTTP_400_BAD_REQUEST)
        
        transaction = PointTransaction(
            user=request.user,
            subtask=None,
            reward= reward,
            amount=-reward.price,
        )
        transaction.save()
        new_balance = balence - reward.price
        return Response({"balance": new_balance} ,status=status.HTTP_200_OK)
    
class PointsBalanceView(GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        balance = PointTransaction.objects.filter(
            user=request.user
        ).aggregate(total=Sum('amount'))['total'] or 0
        return Response({"balance": balance})