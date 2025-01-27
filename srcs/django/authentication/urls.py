from django.contrib import admin
from django.urls import path, re_path, include
from .views import *

urlpatterns = [
	path('', login.as_view()),  # Define a view for the root URL
	re_path('login', login.as_view()),
	re_path('signup', signup.as_view()),
	re_path('logout', logout.as_view()),
	re_path('profile', profile.as_view()),
	re_path('update_user', UpdateUser.as_view()),
	re_path('user_avatar', UserAvatar.as_view()),
	re_path('add_friend', AddFriend.as_view()),
	re_path('remove_friend', RemoveFriend.as_view()),
	re_path('friends_list', FriendsList.as_view()),
	re_path('users_list', UsersList.as_view()),
	re_path('record_pacman_match', RecordPacmanMatch.as_view()),
	re_path('pacman_matches_history', UserPacmanMatchesHistory.as_view()),
	re_path('pacman_stats', UserPacmanStats.as_view()),
	re_path('pacman_endless_update', UpdateMaxEndlessScore.as_view()),
	re_path('pong_stats', UserPongStats.as_view()),
	re_path('record_AIpong_match', RecordAIPongMatch.as_view()),
	re_path('record_PvPong_match', RecordPvPongMatch.as_view()),
	re_path('AIpong_match_history', UserAIPongMatchHistory.as_view()),
	re_path('PvPong_match_history', UserPvPongMatchHistory.as_view()),
	re_path('record_tournament', RecordPongTournament.as_view()),
	re_path('tournament_history', UserPongTournamentHistory.as_view()),
]