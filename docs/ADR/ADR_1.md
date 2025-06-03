# ADR #1 : Choix de framework backend pour la communication entre frontend et la base de données

**Titre :** Framework backend - **Express.js**

**Statut :** Acceptée

## Contexte

L’application est un système de gestion d’inventaire pour un un réseau de magasins. Elle comporte une interface utilisateur en ligne de commande (CLI) développée en Python qui agit comme frontend ainsi qu’une base de données MongoDB pour stocker les données relatives aux produits et ventes.
Ceci était l'architecture du dernier laboratoire.

Il faut évoluer cette architecture pour supporter une architecture 3-tier avec un framework backend qui agit comme intermédiaire entre le frontend et la base de données qui gère les communications via un API.

Ce serveur doit exposer une API simple, efficace, et facilement maintenable pour recevoir les requêtes du frontend et interagir avec la base de données.

## Décision

Le framework backend pour la communication entre frontend et la base de données retenu est **Express.js**. Ce choix repose sur les raisons suivantes :

- Express.js est un framework léger et minimaliste pour Node.js, permettant de créer rapidement des APIs REST.

- Large communauté et nombreux modules complémentaires disponibles grâce à npm.

- Facilité d’intégration avec MongoDB via des bibliothèques comme Mongoose.

- Bonne performance et scalabilité pour gérer les requêtes entre le frontend et la base de données.

## Conséquences

### Avantages: 

- Développement rapide grâce à la simplicité d’Express.js.

- Flexibilité dans la définition des routes et gestion des requêtes HTTP.

- Large écosystème et support communautaire grâce à npm.

- Facilité de déploiement et d’intégration avec d’autres services.

- Bonne gestion des middlewares pour la sécurité, le logging et la validation des données.

### Inconvénients: 

- Dans la dernière version de cette application, le "backend" qui était dans la CMD était en Python, il faudra migrer ce code en JavaScript.

- Il faut remplacer Mongoengine en Python par un autre ORM comme Mongoose.

- Nécessite une connaissance de JavaScript/Node.js en plus de Python pour la CLI.

- Gestion manuelle de certains aspects comme les erreurs et la structure du projet.





