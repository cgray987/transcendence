from django.shortcuts import render

# Create your views here.

# Define a view function for the home page
def home(request):
    return render(request, 'home.html')