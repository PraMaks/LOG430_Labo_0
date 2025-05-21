from datetime import datetime
from mongoengine import connect, DateTimeField, Document, EmbeddedDocument, EmbeddedDocumentField, ListField, StringField, IntField, get_connection
import time

db_name = "labo1"
collection_inventaire = "magasinInventaire"
collection_ventes = "magasinVentes"
connect(db=db_name, host="localhost", port=27017)

class MagasinInventaire(Document):
    meta = {'collection': collection_inventaire}
    name = StringField(required=True)
    price = IntField(required=True)
    qty = IntField(required=True)

class ProduitVendu(EmbeddedDocument):
    name = StringField(required=True)
    qty = IntField(required=True)
    price = IntField(required=True) 
    total_price = IntField(required=True)  

class MagasinVente(Document):
    meta = {'collection': collection_ventes}
    date = DateTimeField(default=datetime.utcnow)
    total_price = IntField(required=True)
    contents = ListField(EmbeddedDocumentField(ProduitVendu))

def main():
    client = get_connection()
    db = client[db_name]

    if db_name not in client.list_database_names():
        print(f"Base de données '{db_name}' n'existe pas sur ce poste...")
        print(f"Elle va être créée...")
    else:
        print(f"Base de données '{db_name}' trouvée.")

    if collection_inventaire not in db.list_collection_names():
        print(f"Collection '{collection_inventaire}' n'existe pas dans la base '{db_name}'...")
        print(f"Elle va être créée et remplie avec des données de base...")
        mylist = [
            { "name": "Bread", "price": "4", "qty": "5" },
            { "name": "Soda", "price": "3", "qty": "10" },
            { "name": "Candy", "price": "2", "qty": "15" },
        ]
        
        for item in mylist:
            MagasinInventaire(
                name=item["name"],
                price=int(item["price"]),
                qty=int(item["qty"])
            ).save()
            print(f"Ajout de '{item['name']}'")

    else:
        print(f"Collection '{collection_inventaire}' trouvée dans la base '{db_name}'.")

    if collection_ventes not in db.list_collection_names():
        print(f"Collection '{collection_ventes}' n'existe pas dans la base '{db_name}'...")
        print(f"Elle va être créée...")
    
        db.create_collection(collection_ventes)
        print(f"Ajout de la collection '{collection_ventes}'")
    else:
        print(f"Collection '{collection_ventes}' trouvée dans la base '{db_name}'.")

    print(f"Lancement de la console Client")

    while True:
        for item in MagasinInventaire.objects:
            print(f"Produit: {item.name}, Quantité: {item.qty}, Price: {item.price}")
        print(f"---------------------------")
        time.sleep(2)

if __name__ == "__main__":
    main()
