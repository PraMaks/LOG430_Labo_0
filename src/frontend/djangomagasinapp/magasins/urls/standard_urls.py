"""Contient les URLs de la vue 'standard'"""

from django.urls import path
from magasins.views import standard_views, login_views

urlpatterns = [
    path('', standard_views.magasin_standard, name='magasin_standard'),
    path('rechercher/', standard_views.rechercher_produit, name='rechercher_produit'),
    path('vente/', standard_views.enregistrer_vente, name='enregistrer_vente'),
    path('retours/', standard_views.retour_vente, name='retour_vente'),
    path('stock-magasin/', standard_views.liste_produits, name='liste_produits'),
    path('stock-central/', standard_views.liste_produits_central, name='liste_produits_central'),
    path('reapprovisionnement/', standard_views.demande_reappro, name='demande_reappro'),
    path('logout/', login_views.logout, name='deconnexion')
]
