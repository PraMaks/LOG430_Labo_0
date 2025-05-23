"""Module principal de gestion d'inventaire et de ventes pour un magasin."""
from datetime import datetime
from mongoengine import connect, DateTimeField, Document, EmbeddedDocument, \
    EmbeddedDocumentField, ListField, StringField, IntField, get_connection
from bson.objectid import ObjectId

# Constantes
DB_NAME = "labo1"
COLLECTION_INVENTORY = "magasinInventaire"
COLLECTION_SALES = "magasinVentes"
connect(db=DB_NAME, host="localhost", port=27017)

# pylint: disable=too-few-public-methods
class StoreInventory(Document):
    """Modèle représentant un produit en inventaire."""
    meta = {'collection': COLLECTION_INVENTORY}
    name = StringField(required=True)
    price = IntField(required=True)
    qty = IntField(required=True)

# pylint: disable=too-few-public-methods
class ProductSold(EmbeddedDocument):
    """Modèle représentant un produit vendu."""
    name = StringField(required=True)
    qty = IntField(required=True)
    price = IntField(required=True)
    total_price = IntField(required=True)

# pylint: disable=too-few-public-methods
class StoreSale(Document):
    """Modèle représentant une vente."""
    meta = {'collection': COLLECTION_SALES}
    date = DateTimeField(default=datetime.utcnow)
    total_price = IntField(required=True)
    contents = ListField(EmbeddedDocumentField(ProductSold))

def init_db():
    """Initialise la base de données et remplit l'inventaire si nécessaire."""
    client = get_connection()
    db = client[DB_NAME]

    if DB_NAME not in client.list_database_names():
        print(f"Base de données '{DB_NAME}' n'existe pas sur ce poste...")
        print("Elle va être créée...")
    else:
        print(f"Base de données '{DB_NAME}' trouvée.")

    if COLLECTION_INVENTORY not in db.list_collection_names():
        print(f"Collection '{COLLECTION_INVENTORY}' n'existe pas...")
        print("Elle va être créée et remplie avec des données de base...")
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
        print(f"Collection '{COLLECTION_SALES}' n'existe pas...")
        db.create_collection(COLLECTION_SALES)
        print(f"Ajout de la collection '{COLLECTION_SALES}'")
    else:
        print(f"Collection '{COLLECTION_SALES}' trouvée.")

def search_product(product_name):
    """Recherche un produit dans l'inventaire."""
    product = StoreInventory.objects(name=product_name).first()
    if product:
        return {
            "name": product.name,
            "price": product.price,
            "qty": product.qty
        }
    return None

def register_sale(input_func=input, print_func=print):
    """Enregistre une vente via des entrées utilisateur."""
    print_func("\n--- État du stock actuel ---")
    display_inventory(print_func=print_func)
    print_func("----------------------------\n")

    sold_products = []
    total_price = 0

    while True:
        product_name = input_func("Nom du produit (laisser vide pour terminer) : ").strip()
        if product_name == "":
            break

        product = StoreInventory.objects(name=product_name).first()
        if not product:
            print_func(f"Produit '{product_name}' introuvable.")
            continue

        try:
            quantity = int(input_func(f"Quantité de '{product_name}' à vendre : "))
        except ValueError:
            print_func("Quantité invalide.")
            continue

        if quantity <= 0:
            print_func("La quantité doit être positive.")
            continue

        if product.qty < quantity:
            print_func(f"Stock insuffisant pour '{product_name}'. En stock : {product.qty}")
            continue

        total_item = product.price * quantity
        total_price += total_item

        sold_products.append(ProductSold(
            name=product.name,
            qty=quantity,
            price=product.price,
            total_price=total_item
        ))

        product.qty -= quantity
        product.save()
        print_func(f"Vente enregistrée pour '{product_name}', {quantity} unités.")

    if sold_products:
        sale = StoreSale(
            total_price=total_price,
            contents=sold_products
        )
        sale.save()
        print_func(f"Vente enregistrée. Total : {total_price}$")

def handle_return(input_func=input, print_func=print):
    """Gère le retour d'une vente."""
    ventes = list(StoreSale.objects())
    if not ventes:
        print_func("Aucune vente enregistrée.")
        return None

    vente_dict = {}
    print_func("Liste des ventes :")
    for i, vente in enumerate(ventes, start=1):
        vente_num = f"Vente #{i}"
        vente_dict[vente_num] = vente.id

        print_func(f"\n   {vente_num} | Date: {vente.date.strftime('%Y-%m-%d %H:%M:%S')} | Total: {vente.total_price}$")
        for p in vente.contents:
            print_func(f"      - {p.qty}x {p.name} à {p.price}$ chacun (Total: {p.total_price}$)")

    choix_vente = input_func("\nEntrez le numéro de la vente à retourner (ex: Vente #2) : ").strip()
    if choix_vente not in vente_dict:
        print_func("Numéro de vente invalide.")
        return None

    vente_id = vente_dict[choix_vente]
    sale = StoreSale.objects(id=ObjectId(vente_id)).first()
    if not sale:
        print_func("Vente introuvable.")
        return None

    for produit in sale.contents:
        item = StoreInventory.objects(name=produit.name).first()
        if item:
            item.qty += produit.qty
            item.save()
            print_func(f"Retour : +{produit.qty} {produit.name} dans l'inventaire.")
        else:
            print_func(f"Produit '{produit.name}' non trouvé dans l'inventaire.")

    sale.delete()
    print_func(f"{choix_vente} retournée et supprimée de la base.")
    return vente_id

def display_inventory(print_func=print):
    """Affiche l'état actuel de l'inventaire."""
    print_func("Inventaire du magasin : ")
    for item in StoreInventory.objects:
        print_func(f"Produit: {item.name}, Quantité: {item.qty}, Price: {item.price}")

def main_loop(input_func=input, print_func=print):
    """Boucle principale d'interaction utilisateur."""
    while True:
        print_func("Options:")
        print_func("   'a': Rechercher un produit")
        print_func("   'b': Enregistrer une vente")
        print_func("   'c': Gestion des retours")
        print_func("   'd': Consulter état de stock")
        print_func("   'q': Quitter")

        choice = input_func("Entrez votre choix: ")

        if choice == 'a':
            print_func("Recherche d'un produit")
            product_name = input_func("Entrez le nom du produit recherché : ")
            product = search_product(product_name)
            if product:
                print_func(f"Produit trouvé : {product['name']}")
                print_func(f"Prix : {product['price']}")
                print_func(f"Quantité en stock : {product['qty']}")
            else:
                print_func(f"Produit '{product_name}' introuvable.")

        elif choice == 'b':
            print_func("Enregistrement d'une vente")
            register_sale(input_func=input_func, print_func=print_func)

        elif choice == 'c':
            print_func("Gestion des retours")
            handle_return(input_func=input_func, print_func=print_func)

        elif choice == 'd':
            display_inventory(print_func=print_func)

        elif choice == 'q':
            print_func("Fin du programme...")
            break

        else:
            print_func("Commande inconnue")

        print_func("---------------------------")

if __name__ == "__main__":
    init_db()
    main_loop()
