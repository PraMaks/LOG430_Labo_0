"""Contient les URLs de la vue de buyer"""
from django.urls import path
from magasins.views import buyer_views, login_views

urlpatterns = [
    path('', buyer_views.magasin_buyer, name='magasin_buyer'),
    path('stock/', buyer_views.liste_produits, name='liste_produits'),
    path('stock/ajouter_panier/', buyer_views.ajouter_panier, name='ajouter_panier'),
    path('cart/', buyer_views.panier, name='panier'),
    path('cart/modifier-article/', buyer_views.modifier_article_panier, name='modifier_article_panier'),
    path('cart/supprimer-article/', buyer_views.supprimer_article_panier, name='supprimer_article_panier'),
    path('cart/acheter/', buyer_views.acheter_panier, name='acheter_panier'),
    path('logout/', login_views.logout, name='deconnexion')
]
