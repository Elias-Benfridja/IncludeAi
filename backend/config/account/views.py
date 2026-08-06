from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, UserProfileSerializer

# Create your views here.

class RegisterView(CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    
        
class UserMatchingPreferenceView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get(self, request):
        return Response(UserProfileSerializer(request.user.profile).data)

    def patch(self, request):
        serializer = UserProfileSerializer(
            request.user.profile,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    