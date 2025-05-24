# ADR #2 : Choix de la base de données

**Titre :** Base de données choisie - **MongoDB**

**Statut :** Acceptée

## Contexte

Dans le cadre d'un système de caisse d'un petit magasin, l'application developpée doit être facilement maintenable et rapide à développer. Puisque MongoDB est une base de données NoSQL, celle-ci peut être facilement modifiée et adaptée, et de l'évolution potentielle du magasin (dépendamment du laboratoire).

## Décision

La base de données principale choisie pour l'application est **MongoDB**. Ce choix repose sur les raisons suivantes :

- Je voulais approfondir mes connaissances avec MongoDB, car j'ai vu la théorie au cégép sur les bases de données NoSQL, mais je n'ai pas eu l'opportunité de l'essayer. 
- MongoDB est flexible et sans schéma strict ce qui convient bien aux données évolutives qui risquent de changer au cours des laboratoires.
- Une bonne intégration avec Python via `mongoengine`, qui fournit une approche orientée objet et offrant une couche de persistance avec ODM.
- MongoDB peut être visionné et manipulé à l'aide du shell officiel (mongosh)

## Conséquences

### Avantages: 

- Flexibilité du schéma : Permet d’ajouter ou de modifier les structures de données avoir le besoin de modifier les collections puisque MongoBD est un base de données NoSQL.

- Rapidité de développement : Moins de contraintes sur les schémas initiaux puisque MongoDB est une base de données NoSSQL. Cela permet d’avancer plus rapidement l'écriture de code.

- Intégration avec Python : Grâce à Mongoengine, l’interaction avec la base de données reste simple et suit l'écriture des classes en Python.


### Inconvénients: 

- Moins de contrôle sur la structure des données : L'absence de schéma rigide n'impose pas de règles de structure et peut avoir des incohérences si la structure n'est pas respectée.
