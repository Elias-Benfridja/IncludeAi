from django.urls import path
from .views import PointsBalanceView, RewardItemListCreateView, RewardItemDetailView, RewardPointsRecommendationView, RewardRedeemView

urlpatterns = [
    path('', RewardItemListCreateView.as_view(), name='list_create_reward'),
    path('<int:pk>/', RewardItemDetailView.as_view(), name='detail_reward'),
    path('<int:pk>/redeem/', RewardRedeemView.as_view(), name='redeem_reward'),
    path('points/balance/', PointsBalanceView.as_view(), name='points_balance'),
    path('recommend-points/', RewardPointsRecommendationView.as_view(), name='recommend_reward_points'),
]