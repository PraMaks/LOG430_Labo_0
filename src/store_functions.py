# pylint: disable=missing-timeout
# pylint: disable=too-many-nested-blocks
"""Module de gestion d'inventaire et de ventes pour un magasin."""
from datetime import timedelta, datetime
import requests

def search_product(store_number, product_name, print_func=print):
    """Recherche un produit dans l'inventaire."""
    url = f"http://127.0.0.1:3000/{store_number}/productSearch/{product_name}"
    try:
        response = requests.get(url)
        if response.status_code == 404:
            # Workaround pour ne pas lever d'exception
            print_func(f"Erreur: Produit '{product_name}' " +
                       f"introuvable dans le magasin {store_number}")
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
        return

def register_sale(store_number, input_func=input, print_func=print):
    """Enregistre une vente via des entrées utilisateur."""
    print_func("--- État du stock actuel ---")
    data = display_inventory(store_number, print_func=print)
    print_func("----------------------------")

    if data is None:
        print_func("Erreur de recolte de données")
        return

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
        return

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
                print_func(f"    - Produit: {item['name']}, Quantité: {item['qty']}," +
                           f" Prix unitaire: {item['price']} $, Total: {item['total_price']} $")

    except requests.exceptions.RequestException as e:
        print_func(f"Erreur lors de la requête : {e}")
        return

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
        return


def display_inventory(store_number, print_func=print):
    """Affiche l'état actuel de l'inventaire."""
    url = f"http://127.0.0.1:3000/{store_number}/products"
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        print_func(f"Inventaire du Magasin {store_number} :")
        for item in data:
            print_func(f"Produit: {item['name']}, Description: {item['description']}, " +
                       f"Quantité: {item['qty']}, " +
                        f" Quantité Max: {item['max_qty']},  Prix: {item['price']}")
        return data
    except requests.exceptions.RequestException as e:
        print_func(f"Erreur lors de la requête : {e}")
        return None

def display_main_inventory(print_func=print):
    """Affiche l'état actuel de l'inventaire du stock central."""
    url = "http://127.0.0.1:3000/mainStore/products"
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        print_func("Inventaire du Stock Central :")
        for item in data:
            print_func(f"Produit: {item['name']}, Description: {item['description']}, " +
                       f"Quantité: {item['qty']}, " +
                        f" Quantité Max: {item['max_qty']},  Prix: {item['price']}")
        return data
    except requests.exceptions.RequestException as e:
        print_func(f"Erreur lors de la requête : {e}")
        return None

def request_supplies(store_number, input_func=input, print_func=print):
    """Affiche l'état actuel de l'inventaire du stock central."""
    print_func("--- État du stock actuel ---")
    data_store = display_inventory(store_number, print_func=print)
    print_func("----------------------------")

    if data_store is None:
        print_func("Erreur de recolte de données")
        return

    print_func("--- État du stock de la maison Mère ---")
    data_store_main = display_main_inventory(print_func=print)
    print_func("----------------------------")

    if data_store_main is None:
        print_func("Erreur de recolte de données")
        return

    product_map = {product['name']: product for product in data_store}
    product_main_map = {product['name']: product for product in data_store_main}

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
        return

def generate_sales_report(print_func=print):
    """Affiche le rapport des ventes parmi les magasins."""
    report_sales_dict = {
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
        6: [],
    }
    report_products_dict = { }
    for i in range(1, 6):
        url = f"http://127.0.0.1:3000/{i}/products"
        try:
            response = requests.get(url)
            response.raise_for_status()
            data = response.json()
            report_products_dict[i] = data
        except requests.exceptions.RequestException as e:
            print_func(f"Erreur lors de la requête : {e}")
            return

    url = "http://127.0.0.1:3000/Central/products"
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        report_products_dict[6] = data
    except requests.exceptions.RequestException as e:
        print_func(f"Erreur lors de la requête : {e}")
        return

    for i in range(1, 6):
        url = f"http://127.0.0.1:3000/{i}/sales"
        try:
            response = requests.get(url)
            response.raise_for_status()
            sales = response.json()

            if not sales:
                continue
            report_sales_dict[i] = sales
        except requests.exceptions.RequestException as e:
            print_func(f"Erreur lors de la requête : {e}")
            return

    url = "http://127.0.0.1:3000/Central/sales"
    try:
        response = requests.get(url)
        response.raise_for_status()
        sales = response.json()
        report_sales_dict[6] = sales
    except requests.exceptions.RequestException as e:
        print_func(f"Erreur lors de la requête : {e}")
        return

    print_func("------------ RAPPORT ------------")
    for i in range(1, 7):
        product_sold_dict = {}

        if i == 6 :
            print_func("Magasin Central :")
            print_func("   Stock restant du Magasin Central :")
        else:
            print_func(f"Magasin #{i} :")
            print_func(f"   Stock restant du Magasin #{i} :")
        for item in report_products_dict[i]:
            print_func(f"       Produit: {item['name']}, Description: {item['description']}," +
                        f" Quantité: {item['qty']}, Quantité Max: {item['max_qty']}," +
                        f" Prix: {item['price']}")

        if i == 6 :
            print_func("   Ventes du Magasin Central :")
        else:
            print_func(f"   Ventes du Magasin #{i} :")
        if not report_sales_dict[i]:
            print_func("        Aucune vente enregistrée pour ce magasin.")
            print_func("        Impossible de determiner quel produit est le plus vendu")
        else:
            for j, sale in enumerate(report_sales_dict[i], start=1):
                print_func(f"           Vente #{j} — Date: {sale['date']} — Total:" +
                            f" {sale['total_price']} $")
                print_func("                Produits vendus :")
                for item in sale['contents']:
                    print_func(f"                   - Produit: {item['name']}, Quantité:" +
                                f" {item['qty']}, Prix unitaire: {item['price']} $," +
                                 f" Total: {item['total_price']} $")
                    product_sold_dict[item['name']] = product_sold_dict.get(item['name'], 0) + item['qty'] # pylint: disable=line-too-long
            max_qty = max(product_sold_dict.values())
            most_sold_products = [name for name, qty in product_sold_dict.items() if qty == max_qty]
            print_func("    Produit(s) le(s) plus vendu(s) : " + ", ".join(most_sold_products))

def display_store_performance(print_func=print):
    """Affiche un tableau de bord des performances des magasins."""
    report_sales_dict = {
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
        6: [],
    }
    report_products_dict = { }
    for i in range(1, 6):
        url = f"http://127.0.0.1:3000/{i}/products"
        try:
            response = requests.get(url)
            response.raise_for_status()
            data = response.json()
            report_products_dict[i] = data
        except requests.exceptions.RequestException as e:
            print_func(f"Erreur lors de la requête : {e}")
            return

    url = "http://127.0.0.1:3000/Central/products"
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        report_products_dict[6] = data
    except requests.exceptions.RequestException as e:
        print_func(f"Erreur lors de la requête : {e}")
        return

    for i in range(1, 6):
        url = f"http://127.0.0.1:3000/{i}/sales"
        try:
            response = requests.get(url)
            response.raise_for_status()
            sales = response.json()

            if not sales:
                continue
            report_sales_dict[i] = sales
        except requests.exceptions.RequestException as e:
            print_func(f"Erreur lors de la requête : {e}")
            return

    url = "http://127.0.0.1:3000/Central/sales"
    try:
        response = requests.get(url)
        response.raise_for_status()
        sales = response.json()

        report_sales_dict[6] = sales
    except requests.exceptions.RequestException as e:
        print_func(f"Erreur lors de la requête : {e}")
        return

    report_stores_dict = { }
    url = "http://127.0.0.1:3000/admin/stores"
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()

        for store in data:
            if store['name'].startswith('Magasin '):
                try:
                    store_name = store['name'].split()[1]
                    if store_name.isdigit():
                        store_number = int(store_name)
                        if 1 <= store_number <= 5:
                            report_stores_dict[store_number] = {
                                'name': store['name'],
                                'address': store['address'],
                                'nb_requests': store['nb_requests']
                            }
                    elif store_name == 'Central':
                        report_stores_dict[6] = {
                            'name': store['name'],
                            'address': store['address'],
                            'nb_requests': store['nb_requests']
                        }

                except ValueError:
                    continue  # Workaround pour sauter Magasin Central

    except requests.exceptions.RequestException as e:
        print_func(f"Erreur lors de la requête : {e}")
        return

    print_func("------------ Tableau de bord ------------")
    print_func("PS: Magasin #6 = Magasin Central")
    for i in range(1, 7):
        total_profit = 0

        print_func(f"Magasin #{i} :")
        print_func(f"   Chiffres d'affaire du Magasin #{i} :")
        if not report_sales_dict[i]:
            print_func("        Aucune vente enregistrée pour ce magasin")
        else:
            for sale in report_sales_dict[i]:
                total_profit += sale['total_price']
        print_func(f"        Profit total: {total_profit}$")

        print_func(f"   Alertes de rupture de stock du Magasin #{i} :" +
                   f" {report_stores_dict[i]['nb_requests']}")

        print_func(f"   Produits en surstock dans le Magasin #{i} : ")
        for product in report_products_dict[i]:
            if product['qty'] > product['max_qty']:
                print_func(f"       {product['name']} est en surstock : Quantité max" +
                            f" {product['max_qty']} mais il en a {product['qty']} en stock")

        weekly_sales = {}
        for sale in report_sales_dict[i]:
            try:
                date = datetime.fromisoformat(sale['date'].replace('Z', '+00:00'))
                year, week, _ = date.isocalendar()
                key = (year, week)
                if key not in weekly_sales:
                    weekly_sales[key] = 0
                weekly_sales[key] += sale['total_price']
            except Exception:
                continue

        sorted_weeks = sorted(weekly_sales.items())
        print_func("        Tendances hebdomadaires :")
        for (year, week), total in sorted_weeks:
            # Calcul du lundi de la semaine
            monday = datetime.fromisocalendar(year, week, 1).date()
            sunday = monday + timedelta(days=6)
            print_func(f"            Semaine du {monday} au {sunday} : {total}$")

def update_product_details(print_func=print, input_func=input):
    """Mise à jour des informations d'un produit dans tous les magasins."""
    url = "http://127.0.0.1:3000/mainStore/products"

    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()

        if not data:
            print_func("Aucun produit trouvé.")
            return

        print_func("Inventaire du Stock Central :")
        for idx, item in enumerate(data, start=1):
            print_func(f"{idx}. Produit: {item['name']}, Quantité: {item['qty']}, " +
                       f"Quantité Max: {item['max_qty']}, Prix: {item['price']}")

        while True:
            try:
                choice = int(input_func("Entrez le numéro du produit à modifier : "))
                if 1 <= choice <= len(data):
                    break
                print_func(f"Veuillez entrer un numéro entre 1 et {len(data)}.")

            except ValueError:
                print_func("Veuillez entrer un nombre entier valide.")

        selected_product = data[choice - 1]
        product_name = selected_product['name']

        print_func("Laissez vide pour ne pas modifier la valeur.")

        new_name = input_func(f"Nouveau nom (actuel: {selected_product['name']}): ")
        new_description = input_func(
            f"Nouvelle description (actuelle: {selected_product['description']}): "
        ) # ligne trop longue
        new_price = input_func(f"Nouveau prix (actuel: {selected_product['price']}): ")

        # Préparer le payload en n'incluant que les champs modifiés
        update_data = {}
        if new_name.strip():
            update_data['name'] = new_name.strip()
        if new_description.strip():
            update_data['description'] = new_description.strip()
        if new_price.strip():
            try:
                update_data['price'] = float(new_price)
            except ValueError:
                print_func("Prix invalide, la valeur ne sera pas modifiée.")

        if not update_data:
            print_func("Aucune modification apportée.")
            return

        update_url = f"http://127.0.0.1:3000/admin/product/update/{product_name}"
        put_response = requests.put(update_url, json=update_data)
        put_response.raise_for_status()

        result = put_response.json()
        print_func(f"Succès : {result.get('message', 'Produit mis à jour.')}")
    except requests.exceptions.RequestException as e:
        print_func(f"Erreur lors de la requête HTTP : {e}")
