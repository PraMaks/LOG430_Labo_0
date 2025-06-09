from django.http import HttpResponse
import requests
from django.shortcuts import render, redirect
from django.contrib import messages
from ..utils.decorators import login_required, standard_required
from requests.exceptions import RequestException, ConnectionError

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
        name = request.POST.get("nom_produit", "").strip()
        if not name:
            messages.error(request, "Le nom du produit ne peut pas être vide.")
            return render(request, 'magasins/standard/rechercher_produit.html', {
                'produit': produit,
                'query': name,
            })
        url_search = EXPRESS_STANDARD_API_URL_STORES + '/' + numero + EXPRESS_STANDARD_API_URL_STOCK + '/' + name
        response = requests.get(url_search, headers=headers) 
        if response.status_code == 200:
            produit = response.json()
        else:
            json_data = response.json()
            timestamp = json_data['timestamp']
            status = json_data['status']
            error = json_data['error']
            message = json_data['message']
            path = json_data['path']
            error_message = f"Erreur {status} ({error}): {message} à {timestamp} sur {path}"
            messages.warning(request, error_message)

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

    stores = request.session.get('stores', [])
    try:
        numero = stores[0].split()[-1] if stores else '?'
    except Exception:
        numero = '?'

    url_stock = f"{EXPRESS_STANDARD_API_URL_STORES}/{numero}{EXPRESS_STANDARD_API_URL_STOCK}"

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

        # Aucun produit sélectionné
        if not produits:
            try:
                response = requests.get(url_stock, headers=headers, timeout=3)
                if response.status_code == 200:
                    produits_disponibles = response.json()
                else:
                    produits_disponibles = []
                    json_data = response.json()
                    timestamp = json_data['timestamp']
                    status = json_data['status']
                    error = json_data['error']
                    message = json_data['message']
                    path = json_data['path']
                    error_message = f"Erreur {status} ({error}): {message} à {timestamp} sur {path}"
                    messages.warning(request, error_message)
            except ConnectionError:
                produits_disponibles = []
                messages.error(request, "Connexion refusée au serveur distant (port 3000).")
            except RequestException as e:
                produits_disponibles = []
                messages.error(request, f"Erreur lors de la récupération des stocks : {e}")

            return render(request, "magasins/standard/enregistrer_vente.html", {
                "produits": produits_disponibles,
                "message": "Aucun produit sélectionné."
            })

        # Envoi de la vente
        url_vente = f"{EXPRESS_STANDARD_API_URL_STORES}/{numero}{EXPRESS_STANDARD_API_URL_SALES}"
        try:
            response = requests.post(url_vente, json=produits, headers=headers, timeout=3)
            if response.status_code == 201:
                return render(request, "magasins/standard/vente_success.html", {
                    "produits": produits,
                    "total": total
                })
            else:
                try:
                    json_data = response.json()
                    timestamp = json_data['timestamp']
                    status = json_data['status']
                    error = json_data['error']
                    message = json_data['message']
                    path = json_data['path']
                    error_message = f"Erreur {status} ({error}): {message} à {timestamp} sur {path}"
                    messages.warning(request, error_message)
                except Exception:
                    error_message = f"Erreur inattendue : {response.text}"
        except ConnectionError:
            error_message = "Connexion refusée au serveur distant (port 3000)."
        except RequestException as e:
            error_message = f"Erreur lors de l'envoi de la vente : {e}"

        try:
            produits_disponibles = requests.get(url_stock, headers=headers, timeout=3)
            produits_disponibles = produits_disponibles.json() if produits_disponibles.status_code == 200 else []
        except Exception:
            produits_disponibles = []

        return render(request, "magasins/standard/enregistrer_vente.html", {
            "produits": produits_disponibles,
            "message": error_message
        })

    # Méthode GET
    try:
        response = requests.get(url_stock, headers=headers, timeout=3)
        produits = response.json() if response.status_code == 200 else []
        if response.status_code != 200:
            json_data = response.json()
            timestamp = json_data['timestamp']
            status = json_data['status']
            error = json_data['error']
            message = json_data['message']
            path = json_data['path']
            error_message = f"Erreur {status} ({error}): {message} à {timestamp} sur {path}"
            messages.warning(request, error_message)
    except ConnectionError:
        produits = []
        messages.error(request, "Connexion refusée au serveur distant (port 3000).")
    except RequestException as e:
        produits = []
        messages.error(request, f"Erreur lors du chargement des produits : {e}")

    return render(request, "magasins/standard/enregistrer_vente.html", {"produits": produits})


@login_required
@standard_required
def retour_vente(request): 
    headers = {
        'Authorization': request.session.get('token')
    }

    stores = request.session.get('stores', [])
    try:
        numero = stores[0].split()[-1] if stores else '?'
    except Exception:
        numero = '?'

    url = f"{EXPRESS_STANDARD_API_URL_STORES}/{numero}{EXPRESS_STANDARD_API_URL_SALES}"
    ventes = []

    # Récupération des ventes
    try:
        response = requests.get(url, headers=headers, timeout=3)
        if response.status_code == 200:
            ventes = response.json()
            for vente in ventes:
                if '_id' in vente:
                    vente['id'] = vente['_id']
        else:
            try:
                json_data = response.json()
                timestamp = json_data['timestamp']
                status = json_data['status']
                error = json_data['error']
                message = json_data['message']
                path = json_data['path']
                error_message = f"Erreur {status} ({error}): {message} à {timestamp} sur {path}"
                messages.warning(request, error_message)
            except Exception:
                messages.error(request, f"Erreur inattendue : {response.text}")
    except ConnectionError:
        messages.error(request, "Connexion refusée au serveur distant (port 3000).")
    except RequestException as e:
        messages.error(request, f"Erreur de communication avec le serveur : {e}")
        return render(request, "magasins/standard/retour_vente.html", {
            "ventes": [],
            "store_number": numero
        })

    # Gestion de la suppression d'une vente
    if request.method == "POST":
        sale_id = request.POST.get("sale_id")
        if sale_id:
            delete_url = f"{url}/{sale_id}"
            try:
                delete_response = requests.delete(delete_url, headers=headers, timeout=3)
                if delete_response.status_code == 200:
                    result = delete_response.json()
                    messages.success(request, result.get("message", "Vente retournée avec succès."))
                else:
                    try:
                        json_data = response.json()
                        timestamp = json_data['timestamp']
                        status = json_data['status']
                        error = json_data['error']
                        message = json_data['message']
                        path = json_data['path']
                        error_message = f"Erreur {status} ({error}): {message} à {timestamp} sur {path}"
                        messages.warning(request, error_message)
                    except Exception:
                        messages.error(request, f"Erreur inattendue : {delete_response.text}")
                return redirect("retour_vente")
            except ConnectionError:
                messages.error(request, "Connexion refusée au serveur distant (port 3000).")
            except RequestException as e:
                messages.error(request, f"Erreur lors de la suppression : {e}")

    return render(request, "magasins/standard/retour_vente.html", {
        "ventes": ventes,
        "store_number": numero
    })

@login_required
@standard_required
def liste_produits(request):
    headers = {
        'Authorization': request.session.get('token')
    }

    stores = request.session.get('stores', [])
    try:
        numero = stores[0].split()[-1] if stores else '?'
    except Exception:
        numero = '?'

    url = f"{EXPRESS_STANDARD_API_URL_STORES}/{numero}{EXPRESS_STANDARD_API_URL_STOCK}"
    produits = []

    try:
        response = requests.get(url, headers=headers, timeout=3)
        if response.status_code == 200:
            produits = response.json()
        else:
            try:
                json_data = response.json()
                timestamp = json_data['timestamp']
                status = json_data['status']
                error = json_data['error']
                message = json_data['message']
                path = json_data['path']
                error_message = f"Erreur {status} ({error}): {message} à {timestamp} sur {path}"
                messages.warning(request, error_message)
            except Exception:
                messages.error(request, f"Erreur inattendue : {response.text}")
    except ConnectionError:
        messages.error(request, "Connexion refusée au serveur distant (port 3000).")
    except RequestException as e:
        messages.error(request, f"Erreur lors de la récupération des produits : {e}")

    return render(request, 'magasins/standard/liste_produits.html', {
        'produits': produits
    })

@login_required
@standard_required
def liste_produits_central(request):
    headers = {
        'Authorization': request.session.get('token')
    }
    url = f"{EXPRESS_STANDARD_API_URL_STORES}/warehouse{EXPRESS_STANDARD_API_URL_STOCK}"
    produits = []

    try:
        response = requests.get(url, headers=headers, timeout=3)
        if response.status_code == 200:
            produits = response.json()
        else:
            try:
                json_data = response.json()
                timestamp = json_data['timestamp']
                status = json_data['status']
                error = json_data['error']
                message = json_data['message']
                path = json_data['path']
                error_message = f"Erreur {status} ({error}): {message} à {timestamp} sur {path}"
                messages.warning(request, error_message)
            except Exception:
                messages.error(request, f"Erreur inattendue : {response.text}")
    except ConnectionError:
        messages.error(request, "Connexion refusée au serveur distant (port 3000).")
    except RequestException as e:
        messages.error(request, f"Erreur lors du chargement des produits : {e}")

    return render(request, 'magasins/standard/liste_produits_central.html', {
        'produits': produits
    })

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

