from rest_framework import serializers
from .models import *
from django.conf import settings
from django.core.validators import validate_email as validate_email_func
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password

### USER MANAGEMENT ###

class CustomUserSerializer(serializers.ModelSerializer):
	profile_picture_url = serializers.SerializerMethodField()

	class Meta:
		model = CustomUser
		fields = ('id', 'username', 'email', 'password', 'profile_picture', 'profile_picture_url', 'online_status')	
		extra_kwargs = {'password': {'write_only': True}}

	def get_profile_picture_url(self, obj):
		if obj.profile_picture:
			return settings.HOST_NAME + obj.profile_picture.url
		else:
			return None

	def to_internal_value(self, data):
		if 'email' in data and not data['email']:
			raise serializers.ValidationError({'email': ['e-mail-empty-error']})
		if 'username' in data and not data['username']:
			raise serializers.ValidationError({'username': ['username-empty-error']})
		if 'password' in data and not data['password']:
			raise serializers.ValidationError({'password': ['password-empty-error']})
		return super().to_internal_value(data)
		
	def create(self, validated_data):
		return CustomUser.objects.create_user(**validated_data)

	def update(self, instance, validated_data):
		instance.profile_picture = validated_data.get('profile_picture', instance.profile_picture)
		if 'email' in validated_data:
			email = CustomUser.objects.normalize_email(validated_data['email'])
			try:
				validate_email_func(email)
			except ValidationError:
				raise serializers.ValidationError({'email': ['Saississez une adresse e-mail valide.']})
			if CustomUser.objects.filter(email=email).exclude(id=instance.id).exists():
				raise serializers.ValidationError({'email': ['email-exists-error']})
			instance.email = email
		if 'username' in validated_data:
			username = validated_data['username']
			if CustomUser.objects.filter(username=username).exclude(id=instance.id).exists():
				raise serializers.ValidationError({'username': ['username-exists-error']})
			instance.username = username
		if 'password' in validated_data:
			password = validated_data['password']
			validate_password(password, user=instance)
			instance.set_password(password)
		instance.save()
		return instance

### PACMAN ###

class PacmanMatchSerializer(serializers.ModelSerializer):
	class Meta:
		model = PacmanMatch
		fields = ['pacman_player', 'pacman_character', 'ghost_player', 'ghost_character', 'map_name', 'match_duration', 'winner', 'pacman_score', 'match_date', 'user']

class UpdateMaxEndlessScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['max_endless_score']

class UserPacmanStatsSerializer(serializers.ModelSerializer):
	total_pacman_matches = serializers.IntegerField()
	total_pacman_time = serializers.IntegerField()
	max_endless_score = serializers.IntegerField()
	class Meta:
		model = CustomUser
		fields = ('total_pacman_matches', 'total_pacman_time', 'max_endless_score')

### PONG ###

class AIPongMatchSerializer(serializers.ModelSerializer):
	class Meta:
		model = AIPongMatch
		fields = ['player_one', 'ai_level', 'winner', 'match_score', 'match_duration', 'match_date', 'user']

class PvPongMatchSerializer(serializers.ModelSerializer):
	class Meta:
		model = PvPongMatch
		fields = ['player_one', 'player_two', 'winner', 'match_score', 'match_duration', 'match_date', 'user']

class PongTournamentSerializer(serializers.ModelSerializer):
	class Meta:
		model = PongTournament
		fields = ['date', 'player_one', 'player_two', 'player_three', 'player_four', 'winner', 'duration', 'user']

class UserPongStatsSerializer(serializers.ModelSerializer):
	total_pong_matches = serializers.IntegerField()
	total_pong_time = serializers.IntegerField()
	total_pong_ai_matches = serializers.IntegerField()
	total_pong_pvp_matches = serializers.IntegerField()
	total_tournament_played = serializers.IntegerField()
	class Meta:
		model = CustomUser
		fields = ('total_pong_matches', 'total_pong_time', 'total_pong_ai_matches', 'total_pong_pvp_matches', 'total_tournament_played')