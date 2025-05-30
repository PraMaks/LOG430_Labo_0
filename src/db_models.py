"""Module qui contient les objects de mongodb pour python"""
from datetime import datetime, UTC
from mongoengine import (
    DateTimeField, Document, EmbeddedDocument, EmbeddedDocumentField,
    ListField, StringField, IntField, ReferenceField
)

COLLECTION_STORES = "magasins"
COLLECTION_INVENTORY = "magasinInventaire"
COLLECTION_SALES = "magasinVentes"

DEFAULT_STORES = [
    {"name": "Magasin 1", "address": "123 rue Principale"},
    {"name": "Magasin 2", "address": "456 avenue du Centre"},
    {"name": "Magasin 3", "address": "789 boulevard Nord"},
    {"name": "Magasin 4", "address": "321 chemin Sud"},
    {"name": "Magasin 5", "address": "654 route Est"},
]

DEFAULT_PRODUCTS = [
    {"name": "Bread", "price": "4", "qty": "5"},
    {"name": "Soda", "price": "3", "qty": "10"},
    {"name": "Candy", "price": "2", "qty": "15"},
]

class Store(Document):
    meta = {'collection': 'magasins',
            'db_alias' : 'default'
    }
    name = StringField(required=True, unique=True)
    address = StringField(required=True)

class StoreInventory(Document):
    """Modèle représentant un produit en inventaire."""
    meta = {
        'collection': COLLECTION_INVENTORY,
        'db_alias': 'default'
    }
    store = ReferenceField(Store, required=True)
    name = StringField(required=True)
    price = IntField(required=True)
    qty = IntField(required=True)

class ProductSold(EmbeddedDocument):
    """Modèle représentant un produit vendu."""
    name = StringField(required=True)
    qty = IntField(required=True)
    price = IntField(required=True)
    total_price = IntField(required=True)

class StoreSale(Document):
    """Modèle représentant une vente."""
    meta = {
        'collection': COLLECTION_SALES,
        'db_alias': 'default'
    }
    store = ReferenceField(Store, required=True)
    date = DateTimeField(default=datetime.now(UTC))
    total_price = IntField(required=True)
    contents = ListField(EmbeddedDocumentField(ProductSold))
