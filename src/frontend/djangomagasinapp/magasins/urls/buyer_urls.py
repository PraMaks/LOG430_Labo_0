"""Contient les URLs de la vue de buyer"""
from django.urls import path
from magasins.views import buyer_views, login_views

urlpatterns = [
    path('', buyer_views.magasin_buyer, name='magasin_buyer'),
    path('stock/', buyer_views.liste_produits, name='liste_produits'),
    path('cart/', buyer_views.panier, name='panier'),
    path('logout/', login_views.logout, name='deconnexion')
]
