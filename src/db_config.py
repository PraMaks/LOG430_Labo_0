"""Module de configuration de base de données"""
import os
from mongoengine import register_connection, get_connection
from src.db_models import (
    Store,
    StoreInventory,
    COLLECTION_INVENTORY,
    COLLECTION_SALES,
    COLLECTION_STORES,
    DEFAULT_PRODUCTS,
    DEFAULT_STORES,
)

def init_db(prod=True):
    """Fonction qui s'occupe d'initialiser la BD selon le contexte (prod ou test)"""
    db_name = "labo2" if prod else "test_labo2"

    # Pour docker-compose pour être capable de lancer MongoDB
    mongo_host = os.getenv("MONGO_HOST", "localhost")
    mongo_port = int(os.getenv("MONGO_PORT", "27017"))  # utiliser 27017 pour local sinon 27018

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
    
    stores = []
    if COLLECTION_STORES not in db.list_collection_names():
        print(f"Collection '{COLLECTION_STORES}' n'existe pas… Elle va être créée.")
    else:
        print(f"Collection '{COLLECTION_STORES}' trouvée.")

    for current_store in DEFAULT_STORES:
        store = Store.objects(name=current_store["name"]).first()
        if not store:
            store = Store(name=current_store["name"], address=current_store["address"])
            store.save()
            print(f"Magasin '{current_store['name']}' créé.")
        else:
            print(f"Magasin '{current_store['name']}' déjà existant.")
        stores.append(store)

    if COLLECTION_INVENTORY not in db.list_collection_names():
        print(f"Collection '{COLLECTION_INVENTORY}' n'existe pas… Elle va être créée.")
    else:
        print(f"Collection '{COLLECTION_INVENTORY}' trouvée.")

    for store in stores:
        for item in DEFAULT_PRODUCTS:
            existing = StoreInventory.objects(store=store, name=item["name"]).first()
            if not existing:
                StoreInventory(
                    store=store,
                    name=item["name"],
                    price=item["price"],
                    qty=item["qty"]
                ).save()
                print(f"Ajout de '{item['name']}' au magasin '{store.name}'")
            else:
                print(f"Produit '{item['name']}' déjà présent dans le magasin '{store.name}'")

    if COLLECTION_SALES not in db.list_collection_names():
        db.create_collection(COLLECTION_SALES)
        print(f"Ajout de la collection '{COLLECTION_SALES}'")
    else:
        print(f"Collection '{COLLECTION_SALES}' trouvée.")
