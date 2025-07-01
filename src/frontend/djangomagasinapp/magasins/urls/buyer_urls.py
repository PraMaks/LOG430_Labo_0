"""Contient les URLs de la vue de buyer"""
from django.urls import path
from magasins.views import buyer_views

urlpatterns = [
    path('', buyer_views.magasin_buyer, name='magasin_buyer'),
]
