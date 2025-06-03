# Modèle 4+1 vues — Architecture du système de caisse (2-tier: client/serveur)

## 1. Vue logique

![Vue logique](/LOG430_Labo_0/docs/UML/Vue_logique.png)

Toutes les classes sont des Documents ou des EmbeddedDocuments dans la base de données MongoDB intégrés avec Python.

StoreInventory represente l'inventaire du magasin

StoreSale represente une vente du magasin

ProductSold represente les informations d'un produit vendu lors d'une vente (nom, prix, quantité, prix total)

## 2. Vue des processus

![Vue des processus afficher inventaire](/LOG430_Labo_0/docs/UML/Vues_de_processus/afficher_inventaire.png)

L'application communique avec la collection de l'inventaire du magasin dans la base de données MongoDB pour afficher l'inventaire.

![Vue des processus enregistrer une vente](/LOG430_Labo_0/docs/UML/Vues_de_processus/enregistrer_une_vente.png)

L'application communique avec la collection de l'inventaire du magasin dans la base de données MongoDB pour afficher l'inventaire. Ensuite, pour chaque produit choisi par l'utilisateur, un EmbeddedDocument ProductSold est créé et une fois la séléction est terminée, une instance de StoreSale est créée avec les produits vendus.

![Vue des processus gestion de retour](/LOG430_Labo_0/docs/UML/Vues_de_processus/gestion_de_retour.png)

L'application communique avec la collection des ventes dans la base de données MongoDB pour afficher l'inventaire. Une fois que la vente est choisie, l'instance de la vente est supprimée avec les ProductSold et l'inventaire est mis à jour.

![Vue des processus rechercher un produit](/LOG430_Labo_0/docs/UML/Vues_de_processus/rechercher_un_produit.png)

L'application communique avec la collection de l'inventaire du magasin dans la base de données MongoDB pour faire la recherche d'un produit.

## 3. Vue de deploiement

![Vue de deploiement](/LOG430_Labo_0/docs/UML/Vue_de_deploiement.png)

Une fois l'application est déployée avec docker compose, il y a 2 conteneurs créés: Un pour l'application console générée avec Dockerfile et l'autre est une image de la base de données MongoDB.

## 4. Vue d'implémentation

![Vue d'implémentation](/LOG430_Labo_0/docs/UML/Vue_d_implementation.png)

L'application contient 2 packages principaux. "src" pour toutes les fonctionnalitées de l'application console qui utilise la base de données "labo1" de MongoDB. "test" contient les tests unitaires nécessaires et utilise la base de données "test_labo1" pour manipuler les données.

## 5. Vue des cas d'utilisation

![Vue des cas d'utilisation](/LOG430_Labo_0/docs/UML/Vue_de_cas_d_utilisation.png)

L'utilisateur de l'application console du système de caisse peut faire une recherche d'un produit, consulter l'inventaire des produits, enregistrer une vente et faire un retour de vente. 


