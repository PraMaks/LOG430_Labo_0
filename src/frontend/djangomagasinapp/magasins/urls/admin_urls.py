"""Contient les URLs de la vue administrative"""
from django.urls import path
from magasins.views import admin_views, login_views

urlpatterns = [
    path('', admin_views.magasin_admin, name='magasin_admin'),
    path('rechercher/', admin_views.rechercher_produit, name='admin_rechercher_produit'),
    path('vente/', admin_views.enregistrer_vente, name='admin_enregistrer_vente'),
    path('retours/', admin_views.retour_vente, name='admin_retour_vente'),
    path('stock-magasin/', admin_views.liste_produits, name='admin_liste_produits'),
    path('stock-central/', admin_views.liste_produits_central, name='admin_liste_produits_central'),
    path('reapprovisionnement/', admin_views.demande_reappro, name='admin_demande_reappro'),
    path('reapprovisionnement-modif/', admin_views.demande_reappro_modif, name='admin_demande_reappro_modif'),
    path('rapport-ventes/', admin_views.rapport_ventes, name='admin_rapport_ventes'),
    path('tableau-de-bord/', admin_views.tableau_de_bord, name='admin_tableau_de_bord'),
    path('mise-a-jour-produit/', admin_views.mise_a_jour_produit, name='admin_mise_a_jour_produit'),
    path('logout/', login_views.logout, name='admin_deconnexion'),
]
