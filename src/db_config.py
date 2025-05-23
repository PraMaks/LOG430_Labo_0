"""Module de configuration de base de donnees"""
import os
from mongoengine import register_connection, get_connection
from src.db_models import StoreInventory, COLLECTION_INVENTORY, COLLECTION_SALES

def init_db(prod=True):
    """Fonction qui s'occupe d'initialiser la bd selon le contexte (prod ou test)"""
    db_name = "labo1" if prod else "test_labo1"

    # Pour docker-compose pour être capable de lancer mongodb
    mongo_host = os.getenv("MONGO_HOST", "localhost")
    mongo_port = int(os.getenv("MONGO_PORT", "27018"))

    register_connection(
        alias='default',
        name=db_name,
        host=mongo_host,
        port=mongo_port
    )

    client = get_connection()
    db = client[db_name]

    if db_name not in client.list_database_names():
        print(f"Base de données '{db_name}' n'existe pas… Elle va être créée.")
    else:
        print(f"Base de données '{db_name}' trouvée.")

    if COLLECTION_INVENTORY not in db.list_collection_names():
        print(f"Collection '{COLLECTION_INVENTORY}' n'existe pas… Elle va être créée.")
        mylist = [
            {"name": "Bread", "price": "4", "qty": "5"},
            {"name": "Soda", "price": "3", "qty": "10"},
            {"name": "Candy", "price": "2", "qty": "15"},
        ]
        for item in mylist:
            StoreInventory(
                name=item["name"],
                price=int(item["price"]),
                qty=int(item["qty"])
            ).save()
            print(f"Ajout de '{item['name']}'")
    else:
        print(f"Collection '{COLLECTION_INVENTORY}' trouvée.")

    if COLLECTION_SALES not in db.list_collection_names():
        db.create_collection(COLLECTION_SALES)
        print(f"Ajout de la collection '{COLLECTION_SALES}'")
    else:
        print(f"Collection '{COLLECTION_SALES}' trouvée.")
