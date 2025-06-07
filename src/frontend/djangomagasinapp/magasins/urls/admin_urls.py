from django.urls import path
from magasins.views import admin_views

urlpatterns = [
    path('', admin_views.magasin_admin, name='magasin_admin'),
    path('rechercher/', admin_views.rechercher_produit, name='admin_rechercher_produit'),
    path('vente/', admin_views.enregistrer_vente, name='admin_enregistrer_vente'),
    path('retours/', admin_views.retour_vente, name='admin_retour_vente'),
    path('stock-magasin/', admin_views.liste_produits, name='admin_liste_produits'),
    path('stock-central/', admin_views.liste_produits_central, name='admin_liste_produits_central'),
    path('reapprovisionnement/', admin_views.demande_reappro, name='admin_demande_reappro'),
]
