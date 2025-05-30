"""Module principal de gestion d'inventaire et de ventes pour un magasin."""
from bson.objectid import ObjectId
from src.db_models import StoreInventory, StoreSale, ProductSold
from src.db_config import init_db
import requests
import sys

def search_product(product_name):
    """Recherche un produit dans l'inventaire."""
    """product = StoreInventory.objects(name=product_name).first()
    if product:
        return {
            "name": product.name,
            "price": product.price,
            "qty": product.qty
        }
    return None"""
    url = "http://127.0.0.1:3000/products"

    try:
        response = requests.get(url)
        response.raise_for_status()  
        data = response.json()  
        print(data)  
    except requests.exceptions.RequestException as e:
        print(f"Erreur lors de la requête : {e}")

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

        print_func(f"\n   {vente_num} | Date: {vente.date.strftime('%Y-%m-%d %H:%M:%S')} " +
                    f" | Total: {vente.total_price}$")
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

def main_loop(store_number, input_func=input, print_func=print):
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
    if len(sys.argv) < 2:
        print("Veuillez spécifier un numéro de magasin (1-5) ou 'admin'.")
        sys.exit(1)

    num_magasin_string = sys.argv[1]
    
    if num_magasin_string.isdigit():
        num_magasin_int = int(num_magasin_string)
        if num_magasin_int > 0 and num_magasin_int < 6:
            print("Numero de magasin:", sys.argv[1])
            init_db(prod=True)
            main_loop(num_magasin_int)
        else:
            print("Magasin choisi n'existe pas")
    elif num_magasin_string == "admin" :
        print("console maison mère")

    else:
        print("Option non supportée")
