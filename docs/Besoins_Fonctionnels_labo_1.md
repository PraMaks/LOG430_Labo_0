# Besoins fonctionnels et non fonctionnels

## Besoins fonctionnels

Le système de caisse doit permettre à l'utilisateur du petit magasin d’effectuer les opérations de base suivantes via une application console :

- Le système doit avoir une gestion des produits
    - Rechercher un produit par son nom
    - Consulter l’état du stock du magasin

- Le système doit avoir une gestioon des ventes
    - Enregistrer une vente :
        - sélection de plusieurs produits
        - calcul automatique du total
        - réduction du stock suite à la vente

    - Annuler une vente (gestion des retours) :
        - remettre des produits dans l'inventaire du magasin

- Le système doit avoir la persistence de données
    - Toutes les données doivent être stockées de façon persistante dans une base de données (MongoDB)
    - Utilisation d'une couche d’abstraction de persistance (`mongoengine`) pour interagir avec la base de données

- Le système doit avoir le support "multicaisse" pour supporter plusieurs utilisateurs 
    - Le système doit supporter les intéractions de plusieurs utilisateurs connectés simultatnément à la base de données
    - Les opérations de vente du système doivent être transactionnelles/enregistrées pour garantir la cohérence des données

## Besoins non fonctionnels

- Le système doit pouvoir supporter plusieurs transactions simultanées (ex. : 3 caisses)
- Le système doit avoir la suppression ou l'annulation d'une vente qui ne doit pas corrompre l'état de l'inventaire
- Le code doit être clair, bien structuré et modulaire (séparation de la logique métier, de la présentation et de la persistance)
- Le système doit respecter les bonnes pratiques de développement (pipeline CI/CD, tests unitaires avec Pytest)
- Le système doit être exécutable via **Docker** (Dockerfile + docker-compose.yml)
- Le système doit être conçu de manière évolutive pour pouvoir être reutilisée vers les futures versions (dans les futurs laboratoires):
