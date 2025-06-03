# ADR #2 : Choix de l'ORM pour supporter MongoDB avec Express.js

**Titre :** ORM choisi - **Mongoose**

**Statut :** Acceptée

## Contexte

L’application est un système de gestion d’inventaire pour un un réseau de magasins. Elle comporte une interface utilisateur en ligne de commande (CLI) développée en Python qui agit comme frontend ainsi qu’une base de données MongoDB pour stocker les données relatives aux produits et ventes. Mongoengine était utilisé comme ORM entre Python et MongoDB
Ceci était l'architecture du dernier laboratoire.

Avec l'implémentation de Express.js, Mongoengine ne peut plus être utilisé, car le CMD de Python ne communique plus avec la base de données de manière directe. Il faut donc un ORM pour MongoDB entre Express.js et la base de données.

## Décision

Le choix de l’ORM (équivalent d’un ODM pour les bases SQL relationnelles) s’est porté sur Mongoose. Ce module pour Node.js permet de définir des schémas de données, de valider les données en entrée et d’interagir avec MongoDB de manière structurée. Ainsi, Mongoose gère les mêmes responsabilités que Mongoengine.

## Conséquences

### Avantages: 

- Intègre une validation des données avant l’insertion dans la base de données.

- Facilite les opérations CRUD grâce à des méthodes de haut niveau.

- Possède une large communauté et une bonne documentation.

### Inconvénients: 

- Courbe d’apprentissage initiale pour bien comprendre les fonctionnalités de Mongoose après avoir utilisé Mongoengine.

