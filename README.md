# LOG430_Labo_1

## C'est quoi ?

Une application Python de gestion de l'inventaire d'un magasin. Permet de consulter l'inventaire, faire une recherche d'un produit, enregistrer une vente et faire un retour de vente.

## Architecture/Structure du projet

Une application Python avec architecture de Client/Serveur à deux niveaux (2-tier)

Langage de programmation utilisé : Python (version 3.12.3)
Ce langage est préinstallé sur la VM pour ce lab. 

Technologie utilisée pour les tests unitaires (en Python) : Pytest (version 8.3.5). Ce framework de tests unitaires est documenté et populaire dans les autres projets.

Base de données : MongoDB. C'est une base de données NoSQL, les données sont stockées sous forme de documents (comme des objets JSON). Pas besoin de schéma rigide, donc parfait pour les laboratoires à venir où la structure peut évoluer. Permet la persistance des données.

Abstraction de la couche de persistance : ODM - Open Document Mapper (pas un ORM, car la base de données est NoSQL) est utilisé. Mongoengine est le ODM du projet.

Il faut utiliser l'environnement virtuel pour faire fonctionner le projet: "source venv/bin/activate"

Application principale est dans le package src : main.py. Celui-ci contient la logique de gestion du magasin ainsi que la connexion à la base de données.

Fichier pour lancer les tests unitaires : test_db_models.py. Celui-ci contient les tests unitaires en lien avec la manipulation de la base de données 

Docker est utilisé pour générer une image de l'application (main.py). Le modèle de l'image Docker utilisé est "python:3.12-slim" qui permet de générer une image lègère et optimisée.

Docker Compose est utilisée pour lancer l'image Docker générée. Docker est utilisée pour pouvoir créer une image Docker de l'application pour après pouvoir les lancer dans des containers indépendants. Docker compose permet aussi de lancer l'image de l'application et l'image de mongodb pour faire fonctionner l'application.

Ce projet utilise un pipeline CI/CD avec GitHub Actions après chaque push sur la branche principale (main) pour tester le code poussé. Le pipeline contient 4 jobs:

    1) PyLint pour verifier le format des fichiers .py
    2) Pytest pour lancer les tests unitaires et verifier qu'il n'y a pas d'erreurs de logique
    3) Création et sauvegarde (comme un artifact) d'une image Docker de l'application 
    4) Utilisation de l'image Docker stoquée comme un artifact et push de celle-ci sur Docker Hub

Le lien vers l'image Docker sur Docker Hub : https://hub.docker.com/repository/docker/pramaks/python-magasin-app

## Comment cloner le projet et lancer le projet ?

Avec git d'installé sur le poste, lancer "git clone https://github.com/PraMaks/LOG430_Labo_0.git" dans une ligne de commandes (Git Bash recommandé)

Il faut installer les dépendances du projet : pip install -r requirements.txt

Pour lancer l'application: À partir de la racine de ce projet lancer : "python3 -m src.main"

Pour lancer les tests unitaires: À partor de la racine de ce projet lancer : "python3 -m pytest test/test_db_models.py"

## Comment construire et lancer le conteneur Docker à l'aide de Docker Compose?

Version de Docker utilisée: version 28.1.1, build 4eba377

Version de Docker Compose utilisée : version 2.35.1

Pour créer l'image Docker (à partir du root de l'application) : lancer "docker compose up --builddocker build -t python-addition-app ."

Pour verifier que l'image Docker s'est correctement crée (à partir du root de l'application) : lancer "docker images"

Pour rouler l'image de manière interactive : lancer "docker compose run --rm -it app"

## Réussite des jobs sur le pipeline CI/CD

La réussite des jobs sur le pipeline CI/CD peuvent aussi être visionnées dans le repo GitHub : https://github.com/PraMaks/LOG430_Labo_0/actions

![Preuve que les jobs sur le Pipeline CI/CD ont passé](docs/preuvePipelineCICD.png)

