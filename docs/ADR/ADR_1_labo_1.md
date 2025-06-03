# ADR #1 : Choix de la plateforme (langage de programmation)

**Titre :** Langage de programmation principal - **Python**

**Statut :** Acceptée

## Contexte

Dans le cadre d'un système de caisse d'un petit magasin, l'application developpée doit être facilement maintenable, rapide à développer et évolutive. Le langage Python permet la conception d'une telle application.

## Décision

Le langage de programmation principal retenu pour l’application est **Python**. Ce choix repose sur les raisons suivantes :

- Je voulais approfondir mes connaissances en Python, car mes projets personnels n'étaient pas aussi complexes que l'application du laboratoire. 
- Les librairies disponibles pour Python permettent aussi d'avoir des fonctionnalités sans avoir le besoin de les coder.
- La simplicité et la lisibilité du langage facilitant la maintenance.

## Conséquences

### Avantages: 

- **Maintenabilité :** Améliorée grâce à un code plus lisible et au support de tests avec Pytest.

- **Scalabilité :** Dans ce laboratoire, l'application risque d'avoir une architecture évolutive et les librairies de Python permettront d'avoir les outils pour s'adapter.

- **Rapidité de développement :** Élevée, car la syntaxe de Python est simple à comprendre et offre déjà des fonctions "built-in" pour éviter de les coder à partir de zéro.

### Inconvénients: 

- **Performance :** Python est généralement plus lent que les autres langages (ex: langages compliés comme C++, Java), mais c'est acceptable pour le cadre de cours LOG430.





