from django.urls import path
from .views import RegisterView, UserMatchingPreferenceView


urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('matching-preference/', UserMatchingPreferenceView.as_view(), name='matching_preference'),
]
