from django.http import HttpResponse
import requests
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
            # Utilise le nom 'Central' ou un numéro de magasin
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
