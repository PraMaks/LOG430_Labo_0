from django.urls import path
from . import views

urlpatterns = [
    path('', views.magasin_standard, name='magasin_standard'),
    path('rechercher/', views.rechercher_produit, name='rechercher_produit'),
    path('vente/', views.enregistrer_vente, name='enregistrer_vente'),
    path('retours/', views.gestion_retours, name='gestion_retours'),
    path('stock-magasin/', views.liste_produits, name='liste_produits'),
    path('stock-mere/', views.liste_produits_mere, name='liste_produits_mere'),
    path('reapprovisionnement/', views.declencher_reappro, name='declencher_reappro'),
]