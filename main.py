from mongoengine import connect, Document, StringField, IntField
import time

connect(db="labo1", host="localhost", port=27017)

class MagasinInventaire(Document):
    meta = {'collection': 'magasinInventaire'}
    name = StringField(required=True)
    price = IntField(required=True)
    qty = IntField(required=True)

def main():
    while True:
        for item in MagasinInventaire.objects:
            print(f"Produit: {item.name}, Quantité: {item.qty}, Price: {item.price}")
        time.sleep(2)

if __name__ == "__main__":
    main()
