# LOG430_Labo_0

Pour créer l'image Docker : docker build -t python-addition-app .

Pour verifier que l'image s'est crée : docker images

Pour lancer main.py à partir de Docker : docker run --rm python-addition-app python main.py

Pour lancer test_pytest.py à partir de Docker : docker run --rm python-addition-app

Pour lancer docker-compose : docker-compose up --build

Pour fermer les containers de docker-compose : docker-compose down

