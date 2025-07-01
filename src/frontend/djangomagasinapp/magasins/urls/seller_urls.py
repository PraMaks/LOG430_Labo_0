"""Contient les URLs de la vue 'seller'"""

from django.urls import path
from magasins.views import seller_views, login_views

urlpatterns = [
    path('', seller_views.magasin_seller, name='magasin_seller'),
    path('rechercher/', seller_views.rechercher_produit, name='rechercher_produit'),
    path('vente/', seller_views.enregistrer_vente, name='enregistrer_vente'),
    path('retours/', seller_views.retour_vente, name='retour_vente'),
    path('stock-magasin/', seller_views.liste_produits, name='liste_produits'),
    path('stock-central/', seller_views.liste_produits_central, name='liste_produits_central'),
    path('reapprovisionnement/', seller_views.demande_reappro, name='demande_reappro'),
    path('logout/', login_views.logout, name='deconnexion')
]
