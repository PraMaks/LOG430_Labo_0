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
        print_func(f"  Description: {data.get('description')}")
        print_func(f"  Prix: {data.get('price')}")
        print_func(f"  Quantité: {data.get('qty')}")
        print_func(f"  Quantité Max: {data.get('max_qty')}")
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

        available_qty = product_map[product_name]['qty']
        if quantity > available_qty:
            print_func(f"Stock insuffisant. Il reste seulement {available_qty} unités.")
            continue

        sold_products.append({
            "name": product_name,
            "description": product_map[product_name]['description'],
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
        print_func("Vente envoyée avec succès.")
        print_func("--- Vente enregistrée ---")
        total = sum(p["total_price"] for p in sold_products)
        for p in sold_products:
            print_func(f"{p['qty']}x {p['name']} à {p['price']}$ - Total: {p['total_price']}$")
        print_func(f"Montant total : {total}$")
    except requests.exceptions.RequestException as e:
        print_func(f"Erreur lors de l'envoi de la vente : {e}")

def handle_return(store_number, input_func=input, print_func=print):
    """Gère le retour d'une vente."""
    url = f"http://127.0.0.1:3000/{store_number}/sales"
    try:
        response = requests.get(url)
        response.raise_for_status()  
        sales = response.json()  

        if not sales:
            print_func("Aucune vente enregistrée pour ce magasin.")
            return

        print_func(f"Ventes du Magasin {store_number} :")
        for i, sale in enumerate(sales, start=1):
            print_func(f"Vente #{i} — Date: {sale['date']} — Total: {sale['total_price']} $")
            print_func("  Produits vendus :")
            for item in sale['contents']:
                print_func(f"    - Produit: {item['name']}, Quantité: {item['qty']}, Prix unitaire: {item['price']} $, Total: {item['total_price']} $")
        
    except requests.exceptions.RequestException as e:
        print_func(f"Erreur lors de la requête : {e}")

    sale_choice = input_func("\nEntrez le numéro de la vente à retourner : ").strip()
    
    if not sale_choice.isdigit():
        print_func("Entrée invalide. Veuillez entrer un nombre.")
        return

    sale_index = int(sale_choice) - 1

    if sale_index < 0 or sale_index >= len(sales):
        print_func(f"Numéro hors plage. Veuillez choisir un nombre entre 0 et {len(sales) - 1}.")
        return

    sale_id = sales[sale_index]['_id']
    url = f"http://127.0.0.1:3000/{store_number}/returnSale/{sale_id}"
    try:
        response = requests.delete(url)
        response.raise_for_status()
        result = response.json()
        print_func(f"{result.get('message', 'Vente supprimée avec succès.')}")
        
    except requests.exceptions.RequestException as e:
        print_func(f"Erreur lors de l'envoi de la vente : {e}")


def display_inventory(store_number, print_func=print):
    """Affiche l'état actuel de l'inventaire."""
    url = f"http://127.0.0.1:3000/{store_number}/products"
    try:
        response = requests.get(url)
        response.raise_for_status()  
        data = response.json()  
        print_func(f"Inventaire du Magasin {store_number} :")
        for item in data:
            print_func(f"Produit: {item['name']}, Quantité: {item['qty']}, Quantité Max: {item['max_qty']},  Prix: {item['price']}")
        return data
    except requests.exceptions.RequestException as e:
        print_func(f"Erreur lors de la requête : {e}")

def display_main_inventory(print_func=print):
    """Affiche l'état actuel de l'inventaire du magasin mère."""
    url = f"http://127.0.0.1:3000/mainStore/products"
    try:
        response = requests.get(url)
        response.raise_for_status()  
        data = response.json()  
        print_func(f"Inventaire du Magasin Mère :")
        for item in data:
            print_func(f"Produit: {item['name']}, Quantité: {item['qty']}, Quantité Max: {item['max_qty']},  Prix: {item['price']}")
        return data
    except requests.exceptions.RequestException as e:
        print_func(f"Erreur lors de la requête : {e}")

def request_supplies(store_number, input_func=input, print_func=print):
    """Affiche l'état actuel de l'inventaire du magasin mère."""
    print_func("--- État du stock actuel ---")
    dataStore = display_inventory(store_number, print_func=print)
    print_func("----------------------------")
    print_func("--- État du stock de la maison Mère ---")
    dataStoreMain = display_main_inventory(print_func=print)
    print_func("----------------------------")  

    product_map = {product['name']: product for product in dataStore}
    product_main_map = {product['name']: product for product in dataStoreMain}

    requested_products = []
    while True:
        product_name = input_func("Nom du produit (laisser vide pour terminer) : ").strip()
        if product_name == "":
            break

        if product_name not in product_map:
            print_func(f"Produit '{product_name}' introuvable.")
            continue

        try:
            quantity = int(input_func(f"Quantité de '{product_name}' à demander : "))
            if quantity <= 0:
                print_func("La quantité doit être positive.")
                continue
        except ValueError:
            print_func("Quantité invalide.")
            continue

        available_qty = product_main_map[product_name]['qty']
        if quantity > available_qty:
            print_func(f"Stock insuffisant. Il reste seulement {available_qty} unités.")
            continue

        requested_products.append({
            "name": product_name,
            "qty": quantity,
        })

    if not requested_products:
        print_func("Aucun produit saisi, vente annulée.")
        return


    url = f"http://127.0.0.1:3000/{store_number}/requestSupplies"
    try:
        response = requests.post(url, json=requested_products)
        response.raise_for_status()
        print_func("Demande d'approvisionnement envoyée avec succès.")
        print_func("Détails de la demande :")
        for product in requested_products:
            print_func(f" - {product['qty']}x {product['name']}")
    except requests.exceptions.RequestException as e:
        print_func(f"Erreur lors de la demande d'approvisionnement : {e}")

def generate_sales_report(print_func=print):
    """Affiche le rapport des ventes parmi les magasins."""
    report_sales_dict = { 
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
    }
    report_products_dict = { }
    for i in range(1, 6):
        url = f"http://127.0.0.1:3000/{i}/products"
        try:
            response = requests.get(url)
            response.raise_for_status()  
            data = response.json()  
            report_products_dict[i] = data;
        except requests.exceptions.RequestException as e:
            print_func(f"Erreur lors de la requête : {e}")

    for i in range(1, 6):
        url = f"http://127.0.0.1:3000/{i}/sales"
        try:
            response = requests.get(url)
            response.raise_for_status()  
            sales = response.json()  

            if not sales:
                continue
            report_sales_dict[i] = sales;
        except requests.exceptions.RequestException as e:
            print_func(f"Erreur lors de la requête : {e}")
    
    print_func("------------ RAPPORT ------------")
    for i in range(1, 6):
        product_sold_dict = {}

        print_func(f"Magasin #{i} :")
        print_func(f"   Stock restant du Magasin #{i} :")
        for item in report_products_dict[i]:
            print_func(f"       Produit: {item['name']}, Description: {item['description']}, Quantité: {item['qty']}, Quantité Max: {item['max_qty']}, Prix: {item['price']}")

        print_func(f"   Ventes du Magasin #{i} :")
        if not report_sales_dict[i]:
            print_func("        Aucune vente enregistrée pour ce magasin.")
            print_func("        Impossible de determiner quel produit est le plus vendu")
        else:
            for j, sale in enumerate(report_sales_dict[i], start=1):
                print_func(f"           Vente #{j} — Date: {sale['date']} — Total: {sale['total_price']} $")
                print_func("                Produits vendus :")
                for item in sale['contents']:
                    print_func(f"                   - Produit: {item['name']}, Quantité: {item['qty']}, Prix unitaire: {item['price']} $, Total: {item['total_price']} $")
                    product_sold_dict[item['name']] = product_sold_dict.get(item['name'], 0) + item['qty']

            max_qty = max(product_sold_dict.values())
            most_sold_products = [name for name, qty in product_sold_dict.items() if qty == max_qty]
            print_func("    Produit(s) le(s) plus vendu(s) : " + ", ".join(most_sold_products))



def main_loop(store_number, input_func=input, print_func=print):
    """Boucle principale d'interaction utilisateur."""
    while True:
        print_func("Options:")
        print_func("   'a': Rechercher un produit")
        print_func("   'b': Enregistrer une vente")
        print_func("   'c': Gestion des retours")
        print_func("   'd': Consulter état de stock du magasin")
        print_func("   'e': Consulter état de stock du magasin mère")
        print_func("   'f': Déclencher un réapprovisionnement")
        print_func("   'q': Quitter")

        choice = input_func("Entrez votre choix: ")

        if choice == 'a':
            product_name = input_func("Entrez le nom du produit recherché : ")
            search_product(store_number, product_name)

        elif choice == 'b':
            register_sale(store_number, input_func=input_func, print_func=print_func)

        elif choice == 'c':
            handle_return(store_number, input_func=input_func, print_func=print_func)

        elif choice == 'd':
            display_inventory(store_number, print_func=print_func)

        elif choice == 'e':
            display_main_inventory(print_func=print_func)

        elif choice == 'f':
            request_supplies(store_number, print_func=print_func)

        elif choice == 'q':
            print_func("Fin du programme...")
            break

        else:
            print_func("Commande inconnue")

        print_func("---------------------------")

def main_loop_admin(input_func=input, print_func=print):
    """Boucle principale d'interaction utilisateur."""
    while True:
        print_func("Options:")
        print_func("   'a': Rechercher un produit")
        print_func("   'b': Enregistrer une vente")
        print_func("   'c': Gestion des retours")
        print_func("   'd': Consulter état de stock")
        print_func("   'e': Consulter état de stock du magasin mère")
        print_func("   'f': Générer un rapport consolidé des ventes")
        print_func("   'g': Visualiser les performances des magasins")
        print_func("   'q': Quitter")

        choice = input_func("Entrez votre choix: ")

        if choice == 'a':
            store_number = int(input_func("Entrez le numéro de magasin (1 à 5) : "))
            if 1 <= store_number <= 5:
                product_name = input_func("Entrez le nom du produit recherché : ")
                search_product(store_number, product_name)
            else : 
                print_func("Numéro de magasin invalide")

        elif choice == 'b':
            store_number = int(input_func("Entrez le numéro de magasin (1 à 5) : "))
            if 1 <= store_number <= 5:
                register_sale(store_number, input_func=input_func, print_func=print_func)
            else : 
                print_func("Numéro de magasin invalide")

        elif choice == 'c':
            store_number = int(input_func("Entrez le numéro de magasin (1 à 5) : "))
            if 1 <= store_number <= 5:
                handle_return(store_number, input_func=input_func, print_func=print_func)
            else : 
                print_func("Numéro de magasin invalide")

        elif choice == 'd':
            store_number = int(input_func("Entrez le numéro de magasin (1 à 5) : "))
            if 1 <= store_number <= 5:
                display_inventory(store_number, print_func=print_func)
            else : 
                print_func("Numéro de magasin invalide")

        elif choice == 'e':
            display_main_inventory(print_func=print_func)

        elif choice == 'f':
            generate_sales_report(print_func=print_func)

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
        print("Console maison mère")
        main_loop_admin()

    else:
        print("Option non supportée")
