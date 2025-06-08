from django.http import HttpResponse
import requests
from django.shortcuts import render, redirect
from django.contrib import messages
from ..utils.decorators import login_required, standard_required

@login_required
@standard_required
def magasin_standard(request):
    return render(request, 'magasins/standard/magasin_standard.html')

@login_required
@standard_required
def rechercher_produit(request):
    produit = None
    query = None
    stores = request.session.get('stores', [])
    numero = None
    if stores:
        try:
            numero = stores[0].split()[-1] # retourne le chiffre du magasin
        except Exception:
            numero = '?'
    else:
        numero = '?'

    
    if request.method == "POST":
        query = request.POST.get("nom_produit")
        response = requests.get(f"http://localhost:3000/{numero}/productSearch/{query}") 
        if response.status_code == 200:
            produit = response.json()

    return render(request, 'magasins/standard/rechercher_produit.html', {
        'produit': produit,
        'query': query,
    })

@login_required
@standard_required
def enregistrer_vente(request):
    numero = None
    stores = request.session.get('stores', [])
    if stores:
        try:
            numero = stores[0].split()[-1] # retourne le chiffre du magasin
        except Exception:
            numero = '?'
    else:
        numero = '?' 
    url_stock = f"http://127.0.0.1:3000/{numero}/products"

    if request.method == "POST":
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
            return render(request, "magasins/standard/enregistrer_vente.html", {
                "produits": requests.get(url_stock).json(),
                "message": "Aucun produit sélectionné."
            })

        url_vente = f"http://127.0.0.1:3000/{numero}/registerSale"
        try:
            response = requests.post(url_vente, json=produits)
            response.raise_for_status()
            return render(request, "magasins/standard/vente_success.html", {
                "produits": produits,
                "total": total
            })
        except requests.exceptions.RequestException as e:
            return render(request, "magasins/standard/enregistrer_vente.html", {
                "produits": requests.get(url_stock).json(),
                "message": f"Erreur lors de l'envoi de la vente : {e}"
            })

    else:  
        response = requests.get(url_stock)
        produits = response.json()
        return render(request, "magasins/standard/enregistrer_vente.html", {"produits": produits})

@login_required
@standard_required
def retour_vente(request): 
    numero = None
    stores = request.session.get('stores', [])
    if stores:
        try:
            numero = stores[0].split()[-1] # retourne le chiffre du magasin
        except Exception:
            numero = '?'
    else:
        numero = '?'
    url = f"http://127.0.0.1:3000/{numero}/sales"
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
        return render(request, "magasins/standard/retour_vente.html", {"ventes": [], "store_number": numero})

    if request.method == "POST":
        sale_id = request.POST.get("sale_id")
        if sale_id:
            delete_url = f"http://127.0.0.1:3000/{numero}/returnSale/{sale_id}"
            try:
                delete_response = requests.delete(delete_url)
                delete_response.raise_for_status()
                result = delete_response.json()
                messages.success(request, result.get("message", "Vente retournée avec succès."))
                return redirect("retour_vente")
            except requests.exceptions.RequestException as e:
                messages.error(request, f"Erreur lors de la suppression : {e}")

    return render(request, "magasins/standard/retour_vente.html", {"ventes": ventes, "store_number": numero})

@login_required
@standard_required
def liste_produits(request):
    numero = None
    stores = request.session.get('stores', [])
    if stores:
        try:
            numero = stores[0].split()[-1] # retourne le chiffre du magasin
        except Exception:
            numero = '?'
    else:
        numero = '?'
    response = requests.get(f"http://localhost:3000/{numero}/products")
    produits = response.json()
    return render(request, 'magasins/standard/liste_produits.html', {'produits': produits})

@login_required
@standard_required
def liste_produits_central(request):
    response = requests.get("http://localhost:3000/mainStore/products")
    produits = response.json()
    return render(request, 'magasins/standard/liste_produits_central.html', {'produits': produits})

@login_required
@standard_required
def demande_reappro(request):
    numero = None
    stores = request.session.get('stores', [])
    if stores:
        try:
            numero = stores[0].split()[-1] # retourne le chiffre du magasin
        except Exception:
            numero = '?'
    else:
        numero = '?'

    url_stock_magasin = f"http://127.0.0.1:3000/{numero}/products"
    url_stock_mere = "http://127.0.0.1:3000/mainStore/products"

    try:
        stock_magasin = requests.get(url_stock_magasin).json()
        stock_mere = requests.get(url_stock_mere).json()
    except requests.exceptions.RequestException as e:
        messages.error(request, f"Erreur de communication avec le serveur : {e}")
        return render(request, "magasins/standard/demande_reappro.html", {
            "stock_magasin": [],
            "stock_mere": [],
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
            url_post = f"http://127.0.0.1:3000/{numero}/requestSupplies"
            try:
                response = requests.post(url_post, json=produits_demandes)
                response.raise_for_status()
                messages.success(request, "Demande d'approvisionnement envoyée avec succès.")
                return redirect("demande_reappro")
            except requests.exceptions.RequestException as e:
                messages.error(request, f"Erreur lors de l'envoi de la demande : {e}")

    return render(request, "magasins/standard/demande_reappro.html", {
        "stock_magasin": stock_magasin,
        "stock_mere": stock_mere
    })

