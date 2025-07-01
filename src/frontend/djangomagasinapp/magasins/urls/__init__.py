# pylint: disable=no-name-in-module
"""Fichier pour pouvoir exporter les urls"""
from django.urls import include, path
from magasins.urls import seller_urls, admin_urls, login_urls, buyer_urls

urlpatterns = [
    path('seller/', include(seller_urls)),
    path('admin/', include(admin_urls)),
    path('buyer/', include(buyer_urls)),
    path('', include(login_urls))
]
