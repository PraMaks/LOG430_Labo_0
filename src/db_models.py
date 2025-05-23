"""Module qui contient les objects de mongodb pour python"""
from datetime import datetime
from mongoengine import (
    DateTimeField, Document, EmbeddedDocument, EmbeddedDocumentField,
    ListField, StringField, IntField
)

COLLECTION_INVENTORY = "magasinInventaire"
COLLECTION_SALES = "magasinVentes"

class StoreInventory(Document):
    """Modèle représentant un produit en inventaire."""
    meta = {
        'collection': COLLECTION_INVENTORY,
        'db_alias': 'default'
    }
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
    date = DateTimeField(default=datetime.utcnow)
    total_price = IntField(required=True)
    contents = ListField(EmbeddedDocumentField(ProductSold))
