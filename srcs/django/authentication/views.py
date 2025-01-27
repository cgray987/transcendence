from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import *
from .models import CustomUser, PacmanMatch
from rest_framework import status
from rest_framework import serializers
from rest_framework import views
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import ValidationError
from django.http import FileResponse
from rest_framework.exceptions import APIException
from rest_framework.generics import ListAPIView
from django.db.models import Q
from django.contrib.contenttypes.models import ContentType

class CookieTokenAuthentication(TokenAuthentication):
    def authenticate(self, request):
        token = request.COOKIES.get('jwt')
        if not token:
            raise AuthenticationFailed('No jwt cookie found')
        return super().authenticate_credentials(token)

### AUTHENTICATION ###

class login(views.APIView):
    def post(self, request):
        username = request.data['username']
        password = request.data['password']
        user = authenticate(username=username, password=password)
        if user:
            user.online_status = True
            user.save()
            token, created = Token.objects.get_or_create(user=user)
            serializer = CustomUserSerializer(instance=user)
            response = Response(status=status.HTTP_200_OK)
            response.set_cookie(key='jwt', value=token.key, httponly=True, secure=True)
            return response
        return Response({'error': ['invalid-credentials-error']}, status=status.HTTP_400_BAD_REQUEST)

class signup(views.APIView):
    def post(self, request):
        serializer = CustomUserSerializer(data=request.data)
        if serializer.is_valid():
            try:
                serializer.save()
            except ValidationError as e:
                return Response({'password': e.messages}, status=status.HTTP_400_BAD_REQUEST)
            user = CustomUser.objects.get(username=serializer.data['username'])
            return Response(status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class logout(views.APIView):
    authentication_classes = [CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request):
        request.user.online_status = False
        request.user.save()
        request.user.auth_token.delete()
        return Response(status=status.HTTP_200_OK)

### USER PROFILE ###

class profile(views.APIView):
    authentication_classes = [CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self, request):
        serializer = CustomUserSerializer(request.user)
        return Response({"user": serializer.data}, status=status.HTTP_200_OK)

class UpdateUser(views.APIView):
    authentication_classes = [CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def put(self, request):
        user = request.user
        serializer = CustomUserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            try:
                serializer.save()
            except ValidationError as e:
                return Response({'password': e.messages}, status=status.HTTP_400_BAD_REQUEST)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class UserAvatar(views.APIView):
    authentication_classes = [CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        if user.profile_picture:
            return FileResponse(open(user.profile_picture.path, 'rb'), content_type='image/jpeg')
        else:
            return Response({"error": "No profile photo found"}, status=status.HTTP_404_NOT_FOUND)

### FRIENDS ###

class AddFriend(views.APIView):
    authentication_classes = [CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request):
        friend_username = request.data.get('username')
        if friend_username == request.user.username:
            return Response({"error": "You cannot add yourself as a friend"}, status=status.HTTP_400_BAD_REQUEST)
        friend = get_object_or_404(CustomUser, username=friend_username)
        if friend in request.user.friends.all():
            return Response({"error": "This user is already your friend"}, status=status.HTTP_400_BAD_REQUEST)
        request.user.friends.add(friend)
        return Response(status=status.HTTP_200_OK)

class RemoveFriend(views.APIView):
    authentication_classes = [CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request):
        friend_username = request.data.get('username')
        if friend_username == request.user.username:
            return Response({"error": "You cannot remove yourself from friends"}, status=status.HTTP_400_BAD_REQUEST)
        friend = get_object_or_404(CustomUser, username=friend_username)
        if friend not in request.user.friends.all():
            return Response({"error": "This user is not your friend"}, status=status.HTTP_400_BAD_REQUEST)
        request.user.friends.remove(friend)
        return Response(status=status.HTTP_200_OK)

class FriendsList(views.APIView):
    authentication_classes = [CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self, request):
        friends = request.user.friends.all()
        friends_data = []
        for friend in friends:
            serializer = CustomUserSerializer(friend)
            friend_data = {
                'username': serializer.data['username'],
                'profile_picture_url': serializer.data['profile_picture_url'],
                'online_status': serializer.data['online_status']
            }
            friends_data.append(friend_data)
        return Response(friends_data, status=status.HTTP_200_OK)

class UsersList(views.APIView):
    authentication_classes = [CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self, request):
        try:
            users = CustomUser.objects.all()
            users_data = []
            for user in users:
                serializer = CustomUserSerializer(user)
                user_data = {
                    'username': serializer.data['username'],
                    'profile_picture_url': serializer.data['profile_picture_url'],
                    'online_status': serializer.data['online_status']
                }
                users_data.append(user_data)
            return Response(users_data, status=status.HTTP_200_OK)
        except Exception as e:
            raise APIException(str(e))

### PACMAN ###

class RecordPacmanMatch(views.APIView):
    authentication_classes = [CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = PacmanMatchSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            user_stats = request.user
            stats_data = {
                'total_pacman_matches': user_stats.total_pacman_matches + 1,
                'total_pacman_time': user_stats.total_pacman_time + request.data['match_duration'],
            }
            stats_serializer = UserPacmanStatsSerializer(user_stats, data=stats_data, partial=True)
            if stats_serializer.is_valid():
                stats_serializer.save()
            else:
                return Response(stats_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserPacmanMatchesHistory(ListAPIView):
    serializer_class = PacmanMatchSerializer
    authentication_classes = [CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        user = self.request.user
        return PacmanMatch.objects.filter(user=user).order_by('-match_date')

class UserPacmanStats(views.APIView):
    authentication_classes = [CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        serializer = UserPacmanStatsSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
   
class UpdateMaxEndlessScore(views.APIView):
    authentication_classes = [CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def put(self, request):
        user = request.user
        new_score = request.data.get('max_endless_score', None)
        if new_score is not None and new_score < user.max_endless_score:
            return Response({"error": "New score cannot be less than current score."}, status=status.HTTP_400_BAD_REQUEST)
        serializer = UpdateMaxEndlessScoreSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

### PONG ###

class UserPongStats(views.APIView):
    authentication_classes = [CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        serializer = UserPongStatsSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

class RecordAIPongMatch(views.APIView):
    authentication_classes = [CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = AIPongMatchSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            user_stats = request.user
            stats_data = {
                'total_pong_matches': user_stats.total_pong_matches + 1,
                'total_pong_ai_matches': user_stats.total_pong_ai_matches + 1,
                'total_pong_time': user_stats.total_pong_time + request.data['match_duration'],
            }
            stats_serializer = UserPongStatsSerializer(user_stats, data=stats_data, partial=True)
            if stats_serializer.is_valid():
                stats_serializer.save()
            else:
                return Response(stats_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RecordPvPongMatch(views.APIView):
    authentication_classes = [CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = PvPongMatchSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            user_stats = request.user
            stats_data = {
                'total_pong_matches': user_stats.total_pong_matches + 1,
                'total_pong_pvp_matches': user_stats.total_pong_pvp_matches + 1,
                'total_pong_time': user_stats.total_pong_time + request.data['match_duration'],
            }
            stats_serializer = UserPongStatsSerializer(user_stats, data=stats_data, partial=True)
            if stats_serializer.is_valid():
                stats_serializer.save()
            else:
                return Response(stats_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserPvPongMatchHistory(ListAPIView):
    serializer_class = PvPongMatchSerializer
    authentication_classes = [CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        user = self.request.user
        return PvPongMatch.objects.filter(user=user).order_by('-match_date')

class UserAIPongMatchHistory(ListAPIView):
    serializer_class = AIPongMatchSerializer
    authentication_classes = [CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        user = self.request.user
        return AIPongMatch.objects.filter(user=user).order_by('-match_date')

### PONG TOURNAMENT ###

class RecordPongTournament(views.APIView):
    authentication_classes = [CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = PongTournamentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            user_stats = request.user
            stats_data = {
                'total_pong_matches': user_stats.total_pong_matches + 3,
                'total_tournament_played': user_stats.total_tournament_played + 1,
                'total_pong_time': user_stats.total_pong_time + request.data['duration'],
            }
            stats_serializer = UserPongStatsSerializer(user_stats, data=stats_data, partial=True)
            if stats_serializer.is_valid():
                stats_serializer.save()
            else:
                return Response(stats_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserPongTournamentHistory(ListAPIView):
    serializer_class = PongTournamentSerializer
    authentication_classes = [CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        user = self.request.user
        return PongTournament.objects.filter(user=user).order_by('-date')