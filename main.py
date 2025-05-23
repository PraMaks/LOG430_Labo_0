from datetime import datetime
from mongoengine import connect, DateTimeField, Document, EmbeddedDocument, EmbeddedDocumentField, ListField, StringField, IntField, get_connection
from bson.objectid import ObjectId

db_name = "labo1"
collection_inventory = "magasinInventaire"
collection_sales = "magasinVentes"
connect(db=db_name, host="localhost", port=27017)

class StoreInventory(Document):
    meta = {'collection': collection_inventory}
    name = StringField(required=True)
    price = IntField(required=True)
    qty = IntField(required=True)

class ProductSold(EmbeddedDocument):
    name = StringField(required=True)
    qty = IntField(required=True)
    price = IntField(required=True) 
    total_price = IntField(required=True)  

class StoreSale(Document):
    meta = {'collection': collection_sales}
    date = DateTimeField(default=datetime.utcnow)
    total_price = IntField(required=True)
    contents = ListField(EmbeddedDocumentField(ProductSold))

def main():
    client = get_connection()
    db = client[db_name]

    if db_name not in client.list_database_names():
        print(f"Base de données '{db_name}' n'existe pas sur ce poste...")
        print(f"Elle va être créée...")
    else:
        print(f"Base de données '{db_name}' trouvée.")

    if collection_inventory not in db.list_collection_names():
        print(f"Collection '{collection_inventory}' n'existe pas dans la base '{db_name}'...")
        print(f"Elle va être créée et remplie avec des données de base...")
        mylist = [
            { "name": "Bread", "price": "4", "qty": "5" },
            { "name": "Soda", "price": "3", "qty": "10" },
            { "name": "Candy", "price": "2", "qty": "15" },
        ]
        
        for item in mylist:
            StoreInventory(
                name=item["name"],
                price=int(item["price"]),
                qty=int(item["qty"])
            ).save()
            print(f"Ajout de '{item['name']}'")

    else:
        print(f"Collection '{collection_inventory}' trouvée dans la base '{db_name}'.")

    if collection_sales not in db.list_collection_names():
        print(f"Collection '{collection_sales}' n'existe pas dans la base '{db_name}'...")
        print(f"Elle va être créée...")
    
        db.create_collection(collection_sales)
        print(f"Ajout de la collection '{collection_sales}'")
    else:
        print(f"Collection '{collection_sales}' trouvée dans la base '{db_name}'.")

    print(f"Lancement de la console Client")

    while True:
        print(f"Options:")
        print(f"   'a': Rechercher un produit")
        print(f"   'b': Enregistrer une vente")
        print(f"   'c': Gestion des retours")
        print(f"   'd': Consulter état de stock")
        print(f"   'q': Quitter")

        choice = input("Entrez votre choix: ")

        if choice == 'a':
            print("Recherche d'un produit")

            product_name = input("Entrez le nom du produit recherché : ")

            product = StoreInventory.objects(name=product_name).first()

            if product:
                print(f"Produit trouvé : {product.name}")
                print(f"Prix : {product.price}")
                print(f"Quantité en stock : {product.qty}")
            else:
                print(f"Produit '{product_name}' introuvable.")


            
        elif choice == 'b':
            print("Enregistrement d'une vente")

            sold_products = []
            total_price  = 0

            while True:
                product_name = input("Nom du produit (laisser vide pour terminer) : ").strip()
                if product_name == "":
                    break

                product = StoreInventory.objects(name=product_name).first()

                if not product:
                    print(f"Produit '{product_name}' introuvable.")
                    continue

                try:
                    quantite = int(input(f"Quantité de '{product_name}' à vendre : "))

                except ValueError:
                    print("Quantité invalide.")
                    continue

                if quantite <= 0:
                    print("La quantité doit être positive.")
                    continue

                if product.qty < quantite:
                    print(f"Stock insuffisant pour '{product_name}'. En stock : {product.qty}")
                    continue

                # Calcul et création de produit vendu
                total_item = product.price * quantite
                total_price += total_item

                sold_products.append(ProductSold(
                    name=product.name,
                    qty=quantite,
                    price=product.price,
                    total_price=total_item
                ))

                # Mise à jour de l'inventaire
                product.qty -= quantite
                product.save()
                print(f"Vente enregistrée pour '{product_name}', {quantite} unités.")

            if sold_products:
                sale = StoreSale(
                    total_price=total_price,
                    contents=sold_products
                )
                sale.save()
                print(f"Vente enregistrée. Total : {total_price}$")
            else:
                print("Aucune vente enregistrée.")
            
        elif choice == 'c':
            print("Gestion des retours")

            ventes = StoreSale.objects()

            if not ventes:
                print("Aucune vente enregistrée.")
                continue

            vente_dict = {}

            print("Liste des ventes :")
            for i, vente in enumerate(ventes, start=1):
                vente_num = f"Vente #{i}"
                vente_dict[vente_num] = vente.id  # stocker l'ID pour correspondance

                print(f"\n   {vente_num} | Date: {vente.date.strftime('%Y-%m-%d %H:%M:%S')} | Total: {vente.total_price}$")
                for p in vente.contents:
                    print(f"      - {p.qty}x {p.name} à {p.price}$ chacun (Total: {p.total_price}$)")

            choix_vente = input("\nEntrez le numéro de la vente à retourner (ex: Vente #2) : ").strip()

            if choix_vente not in vente_dict:
                print("Numéro de vente invalide.")
                continue
            
            vente_id = vente_dict[choix_vente]
            sale = StoreSale.objects(id=ObjectId(vente_id)).first()

            if not sale:
                print("Vente introuvable.")
                continue

            # Remettre les produits dans l'inventaire
            for produit in sale.contents:
                item = StoreInventory.objects(name=produit.name).first()
                if item:
                    item.qty += produit.qty
                    item.save()
                    print(f"Retour : +{produit.qty} {produit.name} dans l'inventaire.")
                else:
                    print(f"Produit '{produit.name}' non trouvé dans l'inventaire.")

            sale.delete()
            print(f"{choix_vente} retournée et supprimée de la base.")
            
        elif choice == 'd':
            print("Inventaire du magasin : ")
            for item in StoreInventory.objects:
                print(f"Produit: {item.name}, Quantité: {item.qty}, Price: {item.price}")
            
        elif choice == 'q':
            print("Fin du programme...")
            break

        else:
            print(f"Commande inconnue")

        
        print(f"---------------------------")

if __name__ == "__main__":
    main()
