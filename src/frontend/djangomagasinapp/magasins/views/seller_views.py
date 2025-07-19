# pylint: disable=line-too-long
# pylint: disable=missing-timeout
# pylint: disable=no-else-return
# pylint: disable=redefined-builtin
# pylint: disable=too-many-nested-blocks
"""Classe qui contient le logique des vues sans les besoins administratifs"""
import requests
from django.shortcuts import render, redirect
from django.contrib import messages
from requests.exceptions import RequestException, ConnectionError
from ..utils.decorators import login_required, seller_required

@login_required
@seller_required
def magasin_seller(request):
    """Page Home"""
    return render(request, 'magasins/seller/magasin_seller.html')

@login_required
@seller_required
def rechercher_produit(request):
    """Page de recherche de produit"""
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
            return render(request, 'magasins/seller/rechercher_produit.html', {
                'produit': produit,
                'query': name,
            })
        url_search = f"http://localhost:80/api/v1/stocks/stores/{numero}/{name}"
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

    return render(request, 'magasins/seller/rechercher_produit.html', {
        'produit': produit,
        'query': name,
    })


@login_required
@seller_required
def enregistrer_vente(request):
    """Page d'enregistrement d'une vente"""
    headers = {
        'Authorization': request.session.get('token')
    }

    stores = request.session.get('stores', [])
    try:
        numero = stores[0].split()[-1] if stores else '?'
    except Exception:
        numero = '?'

    url_stock = f"http://localhost:80/api/v1/stocks/stores/{numero}"

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
            try:
                response = requests.get(url_stock, headers=headers, timeout=3)
                if response.status_code == 200:
                    produits_disponibles = response.json()
                else:
                    produits_disponibles = []
                    json_data = response.json()
                    error_message = f"Erreur {json_data['status']} ({json_data['error']}): {json_data['message']} à {json_data['timestamp']} sur {json_data['path']}"
                    messages.warning(request, error_message)
            except ConnectionError:
                produits_disponibles = []
                messages.error(request, "Connexion refusée au serveur distant (port 3001).")
            except RequestException as e:
                produits_disponibles = []
                messages.error(request, f"Erreur lors de la récupération des stocks : {e}")

            return render(request, "magasins/seller/enregistrer_vente.html", {
                "produits": produits_disponibles,
                "message": "Aucun produit sélectionné."
            })

        # Envoi de la vente
        url_vente = f"http://localhost:80/api/v1/sales/stores/{numero}"
        try:
            response = requests.post(url_vente, json=produits, headers=headers, timeout=3)
            if response.status_code == 201:
                # ✅ Mise à jour du stock après la vente
                url_stock_update = f"http://localhost:80/api/v1/stocks/stores/{numero}/true"
                try:
                    stock_response = requests.patch(url_stock_update, json=produits, headers=headers, timeout=3)
                    if stock_response.status_code != 200:
                        json_data = stock_response.json()
                        messages.warning(request, f"Stock partiellement mis à jour : {json_data.get('message', 'Erreur inconnue')}")
                except Exception as e:
                    messages.warning(request, f"Erreur lors de la mise à jour du stock : {e}")

                return render(request, "magasins/seller/vente_success.html", {
                    "produits": produits,
                    "total": total
                })
            else:
                try:
                    json_data = response.json()
                    error_message = f"Erreur {json_data['status']} ({json_data['error']}): {json_data['message']} à {json_data['timestamp']} sur {json_data['path']}"
                    messages.warning(request, error_message)
                except Exception:
                    error_message = f"Erreur inattendue : {response.text}"
        except ConnectionError:
            error_message = "Connexion refusée au serveur distant (port 3001)."
        except RequestException as e:
            error_message = f"Erreur lors de l'envoi de la vente : {e}"

        try:
            produits_disponibles = requests.get(url_stock, headers=headers, timeout=3)
            produits_disponibles = produits_disponibles.json() if produits_disponibles.status_code == 200 else []
        except Exception:
            produits_disponibles = []

        return render(request, "magasins/seller/enregistrer_vente.html", {
            "produits": produits_disponibles,
            "message": error_message
        })

    # Méthode GET
    try:
        response = requests.get(url_stock, headers=headers, timeout=3)
        produits = response.json() if response.status_code == 200 else []
        if response.status_code != 200:
            json_data = response.json()
            error_message = f"Erreur {json_data['status']} ({json_data['error']}): {json_data['message']} à {json_data['timestamp']} sur {json_data['path']}"
            messages.warning(request, error_message)
    except ConnectionError:
        produits = []
        messages.error(request, "Connexion refusée au serveur distant (port 3001).")
    except RequestException as e:
        produits = []
        messages.error(request, f"Erreur lors du chargement des produits : {e}")

    return render(request, "magasins/seller/enregistrer_vente.html", {"produits": produits})


@login_required
@seller_required
def retour_vente(request):
    """Page de retour de vente"""
    headers = {
        'Authorization': request.session.get('token')
    }

    stores = request.session.get('stores', [])
    try:
        numero = stores[0].split()[-1] if stores else '?'
    except Exception:
        numero = '?'

    url = f"http://localhost:80/api/v1/sales/stores/{numero}"
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
        messages.error(request, "Connexion refusée au serveur distant (port 3001).")
    except RequestException as e:
        messages.error(request, f"Erreur de communication avec le serveur : {e}")
        return render(request, "magasins/seller/retour_vente.html", {
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
                messages.error(request, "Connexion refusée au serveur distant (port 3001).")
            except RequestException as e:
                messages.error(request, f"Erreur lors de la suppression : {e}")

    return render(request, "magasins/seller/retour_vente.html", {
        "ventes": ventes,
        "store_number": numero
    })

@login_required
@seller_required
def liste_produits(request):
    """Page pour lister l'inventaire"""
    headers = {
        'Authorization': request.session.get('token')
    }

    stores = request.session.get('stores', [])
    try:
        numero = stores[0].split()[-1] if stores else '?'
    except Exception:
        numero = '?'

    url = f"http://localhost:80/api/v1/stocks/stores/{numero}"
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
        messages.error(request, "Connexion refusée au serveur distant (port 3001).")
    except RequestException as e:
        messages.error(request, f"Erreur lors de la récupération des produits : {e}")

    return render(request, 'magasins/seller/liste_produits.html', {
        'produits': produits
    })

@login_required
@seller_required
def liste_produits_central(request):
    """Page pour lister l'inventaire du stock central"""
    headers = {
        'Authorization': request.session.get('token')
    }
    url = "http://localhost:80/api/v1/stocks/stores/warehouse"
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
        messages.error(request, "Connexion refusée au serveur distant (port 3001).")
    except RequestException as e:
        messages.error(request, f"Erreur lors du chargement des produits : {e}")

    return render(request, 'magasins/seller/liste_produits_central.html', {
        'produits': produits
    })

@login_required
@seller_required
def demande_reappro(request):
    """Page de demande de reapprovisionnement"""
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

    url_stock_magasin = f"http://localhost:80/api/v1/stocks/stores/{numero}"
    url_stock_central = "http://localhost:80/api/v1/stocks/stores/warehouse"

    try:
        stock_magasin = requests.get(url_stock_magasin, headers=headers).json()
        stock_mere = requests.get(url_stock_central, headers=headers).json()
    except requests.exceptions.RequestException as e:
        messages.error(request, f"Erreur de communication avec le serveur : {e}")
        return render(request, "magasins/seller/demande_reappro.html", {
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
            url_post = 'http://localhost:80/api/v1/supplies/stores/' + str(numero)
            try:
                response = requests.post(url_post, json=produits_demandes, headers=headers)
                response.raise_for_status()
                messages.success(request, "Demande d'approvisionnement envoyée avec succès.")
                return redirect("demande_reappro")
            except requests.exceptions.RequestException as e:
                messages.error(request, f"Erreur lors de l'envoi de la demande : {e}")

    return render(request, "magasins/seller/demande_reappro.html", {
        "stock_magasin": stock_magasin,
        "stock_mere": stock_mere
    })
