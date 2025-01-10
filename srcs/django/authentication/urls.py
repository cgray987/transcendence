from django.urls import path
from . import views

urlpatterns = [
	path('', views.home, name='home'),
    path('login/', views.login_view, name='login_page'),
    path('register/', views.register_view, name='register'),
]