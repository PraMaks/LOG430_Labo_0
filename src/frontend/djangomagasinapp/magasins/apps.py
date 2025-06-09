"""Fichier Apps pour Magasins dans Django"""
from django.apps import AppConfig


class MagasinsConfig(AppConfig):
    """Classe qui configure les magasins"""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'magasins'
