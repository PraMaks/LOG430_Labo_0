from django.urls import path
from magasins.views import admin_views

urlpatterns = [
    path('', admin_views.magasin_admin, name='magasin_admin'),
    path('rechercher/', admin_views.rechercher_produit, name='admin_rechercher_produit'),
]
