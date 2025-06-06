from django.http import HttpResponse
import requests
from datetime import datetime, timedelta
from django.shortcuts import render, redirect
from django.contrib import messages

def magasin_admin(request):
    return render(request, 'magasins/admin/magasin_admin.html')

def rechercher_produit(request):
    produit = None
    query = None
    selected_store = None

    if request.method == "POST":
        query = request.POST.get("nom_produit")
        selected_store = request.POST.get("store")

        if query and selected_store:
            store_param = selected_store if selected_store == "Central" else int(selected_store)
            response = requests.get(f"http://localhost:3000/{store_param}/productSearch/{query}")
            if response.status_code == 200:
                produit = response.json()

    return render(request, 'magasins/admin/rechercher_produit.html', {
        'produit': produit,
        'query': query,
        'selected_store': selected_store
    })

def enregistrer_vente(request):
    selected_store = request.POST.get("store", "1")  # Valeur par défaut : magasin 1
    store_param = selected_store if selected_store == "Central" else int(selected_store)
    url_stock = f"http://127.0.0.1:3000/{store_param}/products"
    url_vente = f"http://127.0.0.1:3000/{store_param}/registerSale"

    if request.method == "POST":
        action = request.POST.get("action", "submit")

        # Si l'utilisateur a seulement changé de magasin
        if action == "change_store":
            produits = requests.get(url_stock).json()
            return render(request, "magasins/admin/enregistrer_vente.html", {
                "produits": produits,
                "selected_store": selected_store
            })

        # Sinon, c'est une soumission de vente
        produits = []
        total = 0
        for key in request.POST:
            if key.startswith("produit_"):
                name = key[len("produit_"):]
                qty = int(request.POST[key])
                if qty > 0:
                    description = request.POST.get(f"description_{name}")
                    price = float(request.POST.get(f"price_{name}"))
                    total_price = price * qty
                    produits.append({
                        "name": name,
                        "description": description,
                        "qty": qty,
                        "price": price,
                        "total_price": total_price
                    })
                    total += total_price

        if not produits:
            return render(request, "magasins/admin/enregistrer_vente.html", {
                "produits": requests.get(url_stock).json(),
                "selected_store": selected_store,
                "message": "Aucun produit sélectionné."
            })

        try:
            response = requests.post(url_vente, json=produits)
            response.raise_for_status()
            return render(request, "magasins/admin/vente_success.html", {
                "produits": produits,
                "total": total,
                "selected_store": selected_store
            })
        except requests.exceptions.RequestException as e:
            return render(request, "magasins/admin/enregistrer_vente.html", {
                "produits": requests.get(url_stock).json(),
                "selected_store": selected_store,
                "message": f"Erreur lors de l'envoi de la vente : {e}"
            })

    else:
        produits = requests.get(url_stock).json()
        return render(request, "magasins/admin/enregistrer_vente.html", {
            "produits": produits,
            "selected_store": selected_store
        })
    
def retour_vente(request):
    # Récupérer le magasin choisi, par défaut 1
    selected_store = request.POST.get("store", "1")

    store_param = selected_store if selected_store == "Central" else int(selected_store)

    url = f"http://127.0.0.1:3000/{store_param}/sales"
    ventes = []

    try:
        response = requests.get(url)
        response.raise_for_status()
        ventes = response.json()
        for vente in ventes:
            if '_id' in vente:
                vente['id'] = vente['_id']
    except requests.exceptions.RequestException as e:
        messages.error(request, f"Erreur de communication avec le serveur : {e}")
        return render(request, "magasins/admin/retour_vente.html", {
            "ventes": [], 
            "store_number": selected_store,
            "selected_store": selected_store,
        })

    if request.method == "POST":
        # Si on traite un retour de vente (bouton retour)
        sale_id = request.POST.get("sale_id")
        if sale_id:
            delete_url = f"http://127.0.0.1:3000/{store_param}/returnSale/{sale_id}"
            try:
                delete_response = requests.delete(delete_url)
                delete_response.raise_for_status()
                result = delete_response.json()
                messages.success(request, result.get("message", "Vente retournée avec succès."))
                # Après suppression, on recharge les ventes pour le même magasin
                try:
                    response = requests.get(url)
                    response.raise_for_status()
                    ventes = response.json()
                    for vente in ventes:
                        if '_id' in vente:
                            vente['id'] = vente['_id']
                except requests.exceptions.RequestException as e:
                    messages.error(request, f"Erreur de communication avec le serveur après suppression : {e}")
            except requests.exceptions.RequestException as e:
                messages.error(request, f"Erreur lors de la suppression : {e}")

    return render(request, "magasins/admin/retour_vente.html", {
        "ventes": ventes,
        "store_number": selected_store,
        "selected_store": selected_store,
    })


def liste_produits(request):
    selected_store = "1"  # Valeur par défaut : magasin 1
    produits = []

    if request.method == "POST":
        selected_store = request.POST.get("store", "1")

    # Prépare l’URL pour le magasin sélectionné
    store_param = selected_store if selected_store == "Central" else int(selected_store)
    response = requests.get(f"http://localhost:3000/{store_param}/products")

    if response.status_code == 200:
        produits = response.json()

    return render(request, 'magasins/admin/liste_produits.html', {
        'produits': produits,
        'selected_store': selected_store,
    })

def liste_produits_central(request):
    response = requests.get("http://localhost:3000/mainStore/products")
    produits = response.json()
    return render(request, 'magasins/admin/liste_produits_central.html', {'produits': produits})

def demande_reappro(request):
    selected_store = request.POST.get("store", "1")

    store_param = selected_store if selected_store == "Central" else int(selected_store)

    # URLs dynamiques selon magasin choisi
    url_stock_magasin = f"http://127.0.0.1:3000/{store_param}/products"
    url_stock_mere = "http://127.0.0.1:3000/mainStore/products"

    try:
        stock_magasin = requests.get(url_stock_magasin).json()
        stock_mere = requests.get(url_stock_mere).json()
    except requests.exceptions.RequestException as e:
        messages.error(request, f"Erreur de communication avec le serveur : {e}")
        return render(request, "magasins/admin/demande_reappro.html", {
            "stock_magasin": [],
            "stock_mere": [],
            "selected_store": selected_store,
        })

    if request.method == "POST":
        produits_demandes = []
        for product in stock_magasin:
            qty_str = request.POST.get(f"qty_{product['name']}")
            if qty_str:
                try:
                    qty = int(qty_str)
                    if qty > 0:
                        stock_mere_item = next((item for item in stock_mere if item['name'] == product['name']), None)
                        if stock_mere_item and qty <= stock_mere_item['qty']:
                            produits_demandes.append({
                                "name": product['name'],
                                "qty": qty
                            })
                        else:
                            messages.warning(request, f"Stock insuffisant pour {product['name']} dans le stock mère.")
                except ValueError:
                    messages.warning(request, f"Quantité invalide pour {product['name']}.")

        if produits_demandes:
            url_post = f"http://127.0.0.1:3000/{store_param}/requestSupplies"
            try:
                response = requests.post(url_post, json=produits_demandes)
                response.raise_for_status()
                messages.success(request, "Demande d'approvisionnement envoyée avec succès.")
                # Rediriger en passant la sélection pour garder le magasin sélectionné affiché
                return redirect("admin_demande_reappro")  
            except requests.exceptions.RequestException as e:
                messages.error(request, f"Erreur lors de l'envoi de la demande : {e}")

    return render(request, "magasins/admin/demande_reappro.html", {
        "stock_magasin": stock_magasin,
        "stock_mere": stock_mere,
        "selected_store": selected_store,
    })

def rapport_ventes(request):
    report_sales_dict = {i: [] for i in range(1,7)}
    report_products_dict = {}

    # Récupérer les produits pour magasins 1 à 5
    for i in range(1, 6):
        url = f"http://127.0.0.1:3000/{i}/products"
        try:
            response = requests.get(url)
            response.raise_for_status()
            report_products_dict[i] = response.json()
        except requests.exceptions.RequestException as e:
            messages.error(request, f"Erreur lors de la récupération des produits magasin #{i} : {e}")
            report_products_dict[i] = []

    # Récupérer les produits du magasin Central (6)
    try:
        response = requests.get("http://127.0.0.1:3000/Central/products")
        response.raise_for_status()
        report_products_dict[6] = response.json()
    except requests.exceptions.RequestException as e:
        messages.error(request, f"Erreur lors de la récupération des produits magasin Central : {e}")
        report_products_dict[6] = []

    # Récupérer les ventes pour magasins 1 à 5
    for i in range(1, 6):
        url = f"http://127.0.0.1:3000/{i}/sales"
        try:
            response = requests.get(url)
            response.raise_for_status()
            sales = response.json()
            report_sales_dict[i] = sales if sales else []
        except requests.exceptions.RequestException as e:
            messages.error(request, f"Erreur lors de la récupération des ventes magasin #{i} : {e}")
            report_sales_dict[i] = []

    # Récupérer les ventes du magasin Central (6)
    try:
        response = requests.get("http://127.0.0.1:3000/Central/sales")
        response.raise_for_status()
        sales = response.json()
        report_sales_dict[6] = sales if sales else []
    except requests.exceptions.RequestException as e:
        messages.error(request, f"Erreur lors de la récupération des ventes magasin Central : {e}")
        report_sales_dict[6] = []

    # Préparer les données pour le template
    magasins = []
    for i in range(1, 7):
        product_sold_dict = {}
        products = report_products_dict.get(i, [])
        sales = report_sales_dict.get(i, [])

        for sale in sales:
            for item in sale.get('contents', []):
                product_sold_dict[item['name']] = product_sold_dict.get(item['name'], 0) + item['qty']

        if product_sold_dict:
            max_qty = max(product_sold_dict.values())
            most_sold_products = [name for name, qty in product_sold_dict.items() if qty == max_qty]
        else:
            most_sold_products = []

        magasins.append({
            'id': i,
            'name': 'Magasin Central' if i == 6 else f'Magasin #{i}',
            'products': products,
            'sales': sales,
            'most_sold_products': most_sold_products,
        })

    return render(request, "magasins/admin/rapport_ventes.html", {
        'magasins': magasins,
    })

def tableau_de_bord(request):
    magasins = []

    report_sales_dict = {}
    report_products_dict = {}
    report_stores_dict = {}

    for i in range(1, 6):
        try:
            response = requests.get(f"http://127.0.0.1:3000/{i}/products")
            response.raise_for_status()
            report_products_dict[i] = response.json()
        except requests.exceptions.RequestException as e:
            messages.error(request, f"Erreur de récupération des produits du magasin {i}: {e}")
            return render(request, "magasins/admin/tableau_de_bord.html", {"magasins": []})

    try:
        response = requests.get("http://127.0.0.1:3000/Central/products")
        response.raise_for_status()
        report_products_dict[6] = response.json()
    except requests.exceptions.RequestException as e:
        messages.error(request, f"Erreur de récupération des produits du magasin Central: {e}")
        return render(request, "magasins/admin/tableau_de_bord.html", {"magasins": []})

    for i in range(1, 6):
        try:
            response = requests.get(f"http://127.0.0.1:3000/{i}/sales")
            response.raise_for_status()
            report_sales_dict[i] = response.json()
        except requests.exceptions.RequestException as e:
            messages.error(request, f"Erreur de récupération des ventes du magasin {i}: {e}")
            return render(request, "magasins/admin/tableau_de_bord.html", {"magasins": []})

    try:
        response = requests.get("http://127.0.0.1:3000/Central/sales")
        response.raise_for_status()
        report_sales_dict[6] = response.json()
    except requests.exceptions.RequestException as e:
        messages.error(request, f"Erreur de récupération des ventes du magasin Central: {e}")
        return render(request, "magasins/admin/tableau_de_bord.html", {"magasins": []})

    try:
        response = requests.get("http://127.0.0.1:3000/admin/stores")
        response.raise_for_status()
        for store in response.json():
            if store['name'].startswith("Magasin "):
                name_part = store['name'].split()[1]
                if name_part == "Central":
                    report_stores_dict[6] = store
                elif name_part.isdigit():
                    report_stores_dict[int(name_part)] = store
    except requests.exceptions.RequestException as e:
        messages.error(request, f"Erreur de récupération des infos magasins: {e}")
        return render(request, "magasins/admin/tableau_de_bord.html", {"magasins": []})

    for i in range(1, 7):
        ventes = report_sales_dict.get(i, [])
        produits = report_products_dict.get(i, [])
        magasin = report_stores_dict.get(i, {
            "name": f"Magasin #{i}",
            "address": "N/A",
            "nb_requests": 0
        })

        total_profit = sum(sale['total_price'] for sale in ventes)
        ruptures = magasin['nb_requests']
        surstocks = [p for p in produits if p['qty'] > p['max_qty']]

        weekly_sales = {}
        for sale in ventes:
            try:
                date = datetime.fromisoformat(sale['date'].replace('Z', '+00:00'))
                year, week, _ = date.isocalendar()
                key = (year, week)
                weekly_sales[key] = weekly_sales.get(key, 0) + sale['total_price']
            except Exception:
                continue

        weekly_trends = []
        for (year, week), total in sorted(weekly_sales.items()):
            monday = datetime.fromisocalendar(year, week, 1).date()
            sunday = monday + timedelta(days=6)
            weekly_trends.append({
                "week_range": f"Semaine du {monday} au {sunday}",
                "total": total
            })

        magasins.append({
            "name": magasin['name'],
            "address": magasin['address'],
            "total_profit": total_profit,
            "ruptures": ruptures,
            "surstocks": surstocks,
            "weekly_trends": weekly_trends
        })

    return render(request, "magasins/admin/tableau_de_bord.html", {"magasins": magasins})

def mise_a_jour_produit(request):
    products_url = "http://127.0.0.1:3000/mainStore/products"
    try:
        response = requests.get(products_url)
        response.raise_for_status()
        products = response.json()
    except requests.exceptions.RequestException as e:
        messages.error(request, f"Erreur lors de la requête HTTP : {e}")
        return render(request, "magasins/admin/mise_a_jour_produit.html", {"products": []})

    if request.method == "POST":
        selected_index = int(request.POST.get("product_index"))
        selected_product = products[selected_index]
        product_name = selected_product["name"]

        # Champs soumis
        new_name = request.POST.get("name", "").strip()
        new_description = request.POST.get("description", "").strip()
        new_price = request.POST.get("price", "").strip()

        update_data = {}
        if new_name:
            update_data["name"] = new_name
        if new_description:
            update_data["description"] = new_description
        if new_price:
            try:
                update_data["price"] = float(new_price)
            except ValueError:
                messages.warning(request, "Prix invalide, valeur ignorée.")

        if update_data:
            try:
                update_url = f"http://127.0.0.1:3000/admin/product/update/{product_name}"
                update_response = requests.put(update_url, json=update_data)
                update_response.raise_for_status()
                result = update_response.json()
                messages.success(request, result.get("message", "Produit mis à jour avec succès."))
                return redirect("admin_mise_a_jour_produit")
            except requests.exceptions.RequestException as e:
                messages.error(request, f"Erreur lors de la mise à jour : {e}")
        else:
            messages.info(request, "Aucune modification apportée.")

    return render(request, "magasins/admin/mise_a_jour_produit.html", {"products": products})
