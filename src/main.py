"""Module principal de gestion d'inventaire et de ventes pour un magasin."""
import requests
import sys

def search_product(store_number, product_name, print_func=print):
    """Recherche un produit dans l'inventaire."""
    url = f"http://127.0.0.1:3000/{store_number}/productSearch/{product_name}"
    try:
        response = requests.get(url)
        if response.status_code == 404:
            # Workaround pour ne pas lever d'exception
            print_func(f"Erreur: Produit '{product_name}' introuvable dans le magasin {store_number}")
            return
        response.raise_for_status()  
        
        data = response.json()  
        print_func(f"Produit trouvé dans Magasin {store_number} :")
        print_func(f"  Nom: {data.get('name')}")
        print_func(f"  Prix: {data.get('price')}")
        print_func(f"  Quantité: {data.get('qty')}")
    except requests.exceptions.RequestException as e:
        print_func(f"Erreur lors de la requête : {e}")

def register_sale(store_number, input_func=input, print_func=print):
    """Enregistre une vente via des entrées utilisateur."""
    print_func("--- État du stock actuel ---")
    data = display_inventory(store_number, print_func=print)
    print_func("----------------------------")

    product_map = {product['name']: product for product in data}

    sold_products = []
    while True:
        product_name = input_func("Nom du produit (laisser vide pour terminer) : ").strip()
        if product_name == "":
            break

        if product_name not in product_map:
            print_func(f"Produit '{product_name}' introuvable.")
            continue

        try:
            quantity = int(input_func(f"Quantité de '{product_name}' à vendre : "))
            if quantity <= 0:
                print_func("La quantité doit être positive.")
                continue
        except ValueError:
            print_func("Quantité invalide.")
            continue

        # Vérification du stock
        available_qty = product_map[product_name]['qty']
        if quantity > available_qty:
            print_func(f"Stock insuffisant. Il reste seulement {available_qty} unités.")
            continue

        sold_products.append({
            "name": product_name,
            "qty": quantity,
            "price": product_map[product_name]['price'],
            "total_price": product_map[product_name]['price'] * quantity
        })

    if not sold_products:
        print_func("Aucun produit saisi, vente annulée.")
        return
    
    url = f"http://127.0.0.1:3000/{store_number}/registerSale"
    try:
        response = requests.post(url, json=sold_products)
        response.raise_for_status()
        print("Vente envoyée avec succès.")
        print_func("--- Vente enregistrée ---")
        total = sum(p["total_price"] for p in sold_products)
        for p in sold_products:
            print_func(f"{p['qty']}x {p['name']} à {p['price']}$ - Total: {p['total_price']}$")
        print_func(f"Montant total : {total}$")
    except requests.exceptions.RequestException as e:
        print(f"Erreur lors de l'envoi de la vente : {e}")

def handle_return(input_func=input, print_func=print):
    """Gère le retour d'une vente."""
    """ventes = list(StoreSale.objects())
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
    """

def display_inventory(store_number, print_func=print):
    """Affiche l'état actuel de l'inventaire."""
    url = f"http://127.0.0.1:3000/{store_number}/products"
    try:
        response = requests.get(url)
        response.raise_for_status()  
        data = response.json()  
        print_func(f"Inventaire du Magasin {store_number} :")
        for item in data:
            print_func(f"Produit: {item['name']}, Quantité: {item['qty']}, Prix: {item['price']}")
        return data
    except requests.exceptions.RequestException as e:
        print_func(f"Erreur lors de la requête : {e}")

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
            product_name = input_func("Entrez le nom du produit recherché : ")
            search_product(store_number, product_name)

        elif choice == 'b':
            register_sale(store_number, input_func=input_func, print_func=print_func)

        elif choice == 'c':
            handle_return(input_func=input_func, print_func=print_func)

        elif choice == 'd':
            display_inventory(store_number, print_func=print_func)

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
            main_loop(num_magasin_int)
        else:
            print("Magasin choisi n'existe pas")
    elif num_magasin_string == "admin" :
        print("console maison mère")

    else:
        print("Option non supportée")
