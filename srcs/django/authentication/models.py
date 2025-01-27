from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager, Group, Permission
from django.contrib.auth.password_validation import validate_password

class CustomUserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        email = self.normalize_email(email)
        user = self.model(username=username.strip(), email=email, **extra_fields)
        validate_password(password, user)
        user.set_password(password)
        user.save(using=self._db)
        return user

class CustomUser(AbstractUser):
    username = models.CharField(
        max_length=15,
        unique=True,
        validators=[],
        error_messages={
            'unique': "username-exists-error",
        }
    )
    email = models.EmailField(
        unique=True,
        error_messages={
            'unique': "email-exists-error",
        }
    )
    profile_picture = models.ImageField(upload_to='profile_pictures/', default='profile_pictures/default.jpg')
    friends = models.ManyToManyField('self', blank=True)
    online_status = models.BooleanField(default=False)
    objects = CustomUserManager()

    total_pong_matches = models.IntegerField(default=0)
    total_pong_time = models.IntegerField(default=0)
    total_pong_ai_matches = models.IntegerField(default=0)
    total_pong_pvp_matches = models.IntegerField(default=0)
    total_tournament_played = models.IntegerField(default=0)

    total_pacman_matches = models.IntegerField(default=0)
    total_pacman_time = models.IntegerField(default=0)
    max_endless_score = models.IntegerField(default=0)

    groups = models.ManyToManyField(
        Group,
        related_name='customuser_set',  # Change related_name to avoid conflict
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name='customuser_set',  # Change related_name to avoid conflict
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

    def __str__(self):
        return self.username

class PacmanMatch(models.Model):
    pacman_player = models.CharField(max_length=255)
    pacman_character = models.CharField(max_length=255)
    ghost_player = models.CharField(max_length=255)
    ghost_character = models.CharField(max_length=255)
    map_name = models.CharField(max_length=255)
    match_duration = models.DurationField()
    winner = models.CharField(max_length=255)
    pacman_score = models.IntegerField()
    match_date = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)

    def __str__(self):
        return f"Pacman: {self.pacman_player}, Ghost: {self.ghost_player}, Winner: {self.winner}"

class AIPongMatch(models.Model):
    player_one = models.CharField(max_length=255)
    ai_level = models.CharField(max_length=255)
    winner = models.CharField(max_length=255)
    match_score = models.CharField(max_length=255)
    match_duration = models.DurationField()
    match_date = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.player_one} ({'won' if self.winner == self.player_one else 'lost'})"

class PvPongMatch(models.Model):
    player_one = models.CharField(max_length=255)
    player_two = models.CharField(max_length=255)
    winner = models.CharField(max_length=255)
    match_score = models.CharField(max_length=255)
    match_duration = models.DurationField()
    match_date = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.player_one} vs {self.player_two} - Winner: {self.winner}"

class PongTournament(models.Model):
    date = models.DateTimeField(auto_now_add=True)
    player_one = models.CharField(max_length=255)
    player_two = models.CharField(max_length=255)
    player_three = models.CharField(max_length=255)
    player_four = models.CharField(max_length=255)
    winner = models.CharField(max_length=255)
    duration = models.DurationField()
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)

    def __str__(self):
        return self.name