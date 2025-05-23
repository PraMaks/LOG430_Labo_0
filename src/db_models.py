from datetime import datetime
from mongoengine import (
    DateTimeField, Document, EmbeddedDocument, EmbeddedDocumentField,
    ListField, StringField, IntField
)

COLLECTION_INVENTORY = "magasinInventaire"
COLLECTION_SALES = "magasinVentes"

class StoreInventory(Document):
    meta = {
        'collection': COLLECTION_INVENTORY,
        'db_alias': 'default'
    }
    name = StringField(required=True)
    price = IntField(required=True)
    qty = IntField(required=True)

class ProductSold(EmbeddedDocument):
    name = StringField(required=True)
    qty = IntField(required=True)
    price = IntField(required=True)
    total_price = IntField(required=True)

class StoreSale(Document):
    meta = {
        'collection': COLLECTION_SALES,
        'db_alias': 'default'
    }
    date = DateTimeField(default=datetime.utcnow)
    total_price = IntField(required=True)
    contents = ListField(EmbeddedDocumentField(ProductSold))
