"""Classe qui gère les URLs de magasins"""
from django.urls import path, include

urlpatterns = [
    path('seller/', include('magasins.urls.seller_urls')),
    path('admin/', include('magasins.urls.admin_urls')),
    path('buyer/', include('magasins.urls.buyer_urls')),
]
