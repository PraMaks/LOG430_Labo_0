from django.http import HttpResponse
import requests
from django.shortcuts import render, redirect
from django.contrib import messages
from ..utils.decorators import login_required, standard_required

EXPRESS_STANDARD_API_URL = 'http://localhost:3000/api/v1/standard'
EXPRESS_STANDARD_API_URL_STORES = EXPRESS_STANDARD_API_URL + '/stores'
EXPRESS_STANDARD_API_URL_STOCK = '/stock'
EXPRESS_STANDARD_API_URL_SALES = '/sales'
EXPRESS_STANDARD_API_URL_SUPPLIES = '/supplies'

@login_required
@standard_required
def magasin_standard(request):
    return render(request, 'magasins/standard/magasin_standard.html')

@login_required
@standard_required
def rechercher_produit(request):
    produit = None
    name = None
    headers = {
                'Authorization': request.session.get('token')
            }
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
        name = request.POST.get("nom_produit")
        url_search = EXPRESS_STANDARD_API_URL_STORES + '/' + numero + EXPRESS_STANDARD_API_URL_STOCK + '/' + name
        response = requests.get(url_search, headers=headers) 
        if response.status_code == 200:
            produit = response.json()

    return render(request, 'magasins/standard/rechercher_produit.html', {
        'produit': produit,
        'query': name,
    })

@login_required
@standard_required
def enregistrer_vente(request):
    headers = {
                'Authorization': request.session.get('token')
            }
    numero = None
    stores = request.session.get('stores', [])
    if stores:
        try:
            numero = stores[0].split()[-1] # retourne le chiffre du magasin
        except Exception:
            numero = '?'
    else:
        numero = '?' 
    url_stock = EXPRESS_STANDARD_API_URL_STORES + '/' + numero + EXPRESS_STANDARD_API_URL_STOCK

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
                "produits": requests.get(url_stock, headers=headers).json(),
                "message": "Aucun produit sélectionné."
            })

        url_vente = EXPRESS_STANDARD_API_URL_STORES + '/' + numero + EXPRESS_STANDARD_API_URL_SALES
        try:
            response = requests.post(url_vente, json=produits, headers=headers)
            response.raise_for_status()
            return render(request, "magasins/standard/vente_success.html", {
                "produits": produits,
                "total": total
            })
        except requests.exceptions.RequestException as e:
            return render(request, "magasins/standard/enregistrer_vente.html", {
                "produits": requests.get(url_stock, headers=headers).json(),
                "message": f"Erreur lors de l'envoi de la vente : {e}"
            })

    else:  
        response = requests.get(url_stock, headers=headers)
        produits = response.json()
        return render(request, "magasins/standard/enregistrer_vente.html", {"produits": produits})

@login_required
@standard_required
def retour_vente(request): 
    headers = {
                'Authorization': request.session.get('token')
            }
    numero = None
    stores = request.session.get('stores', [])
    if stores:
        try:
            numero = stores[0].split()[-1] # retourne le chiffre du magasin
        except Exception:
            numero = '?'
    else:
        numero = '?'
    url = EXPRESS_STANDARD_API_URL_STORES + '/' + numero + EXPRESS_STANDARD_API_URL_SALES
    ventes = []

    try:
        response = requests.get(url, headers=headers)
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
            delete_url =  url + '/' + sale_id
            try:
                delete_response = requests.delete(delete_url, headers=headers)
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
    headers = {
                'Authorization': request.session.get('token')
            }
    numero = None
    stores = request.session.get('stores', [])
    if stores:
        try:
            numero = stores[0].split()[-1] # retourne le chiffre du magasin
        except Exception:
            numero = '?'
    else:
        numero = '?'
    url = EXPRESS_STANDARD_API_URL_STORES + '/' + numero + EXPRESS_STANDARD_API_URL_STOCK
    response = requests.get(url, headers=headers)
    produits = response.json()
    return render(request, 'magasins/standard/liste_produits.html', {'produits': produits})

@login_required
@standard_required
def liste_produits_central(request):
    headers = {
                'Authorization': request.session.get('token')
            }
    url = EXPRESS_STANDARD_API_URL_STORES + '/warehouse' + EXPRESS_STANDARD_API_URL_STOCK
    response = requests.get(url, headers=headers)
    produits = response.json()
    return render(request, 'magasins/standard/liste_produits_central.html', {'produits': produits})

@login_required
@standard_required
def demande_reappro(request):
    headers = {
                'Authorization': request.session.get('token')
            }
    numero = None
    stores = request.session.get('stores', [])
    if stores:
        try:
            numero = stores[0].split()[-1] # retourne le chiffre du magasin
        except Exception:
            numero = '?'
    else:
        numero = '?'

    url_stock_magasin = EXPRESS_STANDARD_API_URL_STORES + '/' + numero + EXPRESS_STANDARD_API_URL_STOCK
    url_stock_central = EXPRESS_STANDARD_API_URL_STORES + '/warehouse' + EXPRESS_STANDARD_API_URL_STOCK

    try:
        stock_magasin = requests.get(url_stock_magasin, headers=headers).json()
        stock_mere = requests.get(url_stock_central, headers=headers).json()
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
            url_post = EXPRESS_STANDARD_API_URL_STORES + '/' + numero + EXPRESS_STANDARD_API_URL_SUPPLIES
            try:
                response = requests.post(url_post, json=produits_demandes, headers=headers)
                response.raise_for_status()
                messages.success(request, "Demande d'approvisionnement envoyée avec succès.")
                return redirect("demande_reappro")
            except requests.exceptions.RequestException as e:
                messages.error(request, f"Erreur lors de l'envoi de la demande : {e}")

    return render(request, "magasins/standard/demande_reappro.html", {
        "stock_magasin": stock_magasin,
        "stock_mere": stock_mere
    })

