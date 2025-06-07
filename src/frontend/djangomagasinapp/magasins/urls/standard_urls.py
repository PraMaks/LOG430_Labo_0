from django.urls import path
from magasins.views import standard_views

urlpatterns = [
    path('', standard_views.magasin_standard, name='magasin_standard'),
    path('rechercher/', standard_views.rechercher_produit, name='rechercher_produit'),
    path('vente/', standard_views.enregistrer_vente, name='enregistrer_vente'),
    path('retours/', standard_views.retour_vente, name='retour_vente'),
    path('stock-magasin/', standard_views.liste_produits, name='liste_produits'),
    path('stock-mere/', standard_views.liste_produits_mere, name='liste_produits_mere'),
    path('reapprovisionnement/', standard_views.demande_reappro, name='demande_reappro'),
]
