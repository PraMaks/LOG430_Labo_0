"""Contient les URLs de la vue de connection"""
from django.urls import path
from magasins.views import login_views

urlpatterns = [
    path('', login_views.login, name='login'),
    path('register/', login_views.register, name='register'),
]
