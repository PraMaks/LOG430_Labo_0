# pylint: disable=line-too-long
# pylint: disable=missing-timeout
# pylint: disable=no-else-return
# pylint: disable=redefined-builtin
# pylint: disable=too-many-nested-blocks
"""Classe qui contient le logique des vues administratives"""
from datetime import datetime, timedelta
import requests
from django.shortcuts import render, redirect
from django.contrib import messages
from requests.exceptions import ConnectionError, RequestException
from ..utils.decorators import login_required, admin_required


@login_required
@admin_required
def magasin_admin(request):
    """Page Home"""
    return render(request, 'magasins/admin/magasin_admin.html')

@login_required
@admin_required
def rechercher_produit(request):
    """Page de recherche d'un produit"""
    produit = None
    query = None
    selected_store = None
    headers = {
                'Authorization': request.session.get('token')
            }

    if request.method == "POST":
        query = request.POST.get("nom_produit")
        selected_store = request.POST.get("store")

        if query and selected_store:
            store_param = selected_store if selected_store == "Central" else int(selected_store)
            url = 'http://localhost:80/api/v1/stocks/stores/' + str(store_param) + '/' + query
            response = requests.get(url, headers=headers)
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

    return render(request, 'magasins/admin/rechercher_produit.html', {
        'produit': produit,
        'query': query,
        'selected_store': selected_store
    })

@login_required
@admin_required
def enregistrer_vente(request):
    """Page d'enregistrement d'une vente"""
    selected_store = request.POST.get("store", "1")
    store_param = selected_store if selected_store == "Central" else int(selected_store)

    url_stock = f"http://localhost:80/api/v1/stocks/stores/{store_param}"
    url_vente = f"http://localhost:80/api/v1/sales/stores/{store_param}"
    headers = {
        'Authorization': request.session.get('token')
    }

    if request.method == "POST":
        action = request.POST.get("action", "submit")

        # Si changement de magasin
        if action == "change_store":
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
                messages.error(request, "Connexion refusée au serveur distant (port 3001).")
            except RequestException as e:
                produits = []
                messages.error(request, f"Erreur lors du chargement des produits : {e}")

            return render(request, "magasins/admin/enregistrer_vente.html", {
                "produits": produits,
                "selected_store": selected_store
            })

        # Soumission d'une vente
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
                produits_disponibles = response.json() if response.status_code == 200 else []
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
                produits_disponibles = []
                messages.error(request, "Connexion refusée au serveur distant (port 3001).")
            except RequestException as e:
                produits_disponibles = []
                messages.error(request, f"Erreur lors de la récupération des stocks : {e}")

            return render(request, "magasins/admin/enregistrer_vente.html", {
                "produits": produits_disponibles,
                "selected_store": selected_store,
                "message": "Aucun produit sélectionné."
            })

        # Envoi de la vente
        try:
            response = requests.post(url_vente, json=produits, headers=headers, timeout=3)
            if response.status_code == 201:
                return render(request, "magasins/admin/vente_success.html", {
                    "produits": produits,
                    "total": total,
                    "selected_store": selected_store
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
            error_message = "Connexion refusée au serveur distant (port 3001)."
        except RequestException as e:
            error_message = f"Erreur lors de l'envoi de la vente : {e}"

        # En cas d’erreur : recharger les produits pour le formulaire
        try:
            produits_disponibles = requests.get(url_stock, headers=headers, timeout=3)
            produits_disponibles = produits_disponibles.json() if produits_disponibles.status_code == 200 else []
        except Exception:
            produits_disponibles = []

        return render(request, "magasins/admin/enregistrer_vente.html", {
            "produits": produits_disponibles,
            "selected_store": selected_store,
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
        messages.error(request, "Connexion refusée au serveur distant (port 3001).")
    except RequestException as e:
        produits = []
        messages.error(request, f"Erreur lors du chargement des produits : {e}")

    return render(request, "magasins/admin/enregistrer_vente.html", {
        "produits": produits,
        "selected_store": selected_store
    })

@login_required
@admin_required
def retour_vente(request):
    """Page de retour de vente"""
    headers = {
        'Authorization': request.session.get('token')
    }

    # Gestion sélection magasin
    if request.method == "POST" and request.POST.get("store"):
        selected_store = request.POST["store"]
        request.session["selected_store"] = selected_store  # on le garde en session
    else:
        selected_store = request.session.get("selected_store", "1")

    store_param = selected_store if (selected_store == "Central" or selected_store == "StockCentral") else int(selected_store)
    url = f"http://localhost:80/api/v1/sales/stores/{store_param}"

    # Suppression d'une vente
    if request.method == "POST" and request.POST.get("sale_id"):
        sale_id = request.POST["sale_id"]
        delete_url = f"{url}/{sale_id}"
        try:
            delete_response = requests.delete(delete_url, headers=headers, timeout=3)
            if delete_response.status_code == 200:
                result = delete_response.json()
                messages.success(request, result.get("message", "Vente retournée avec succès."))
            else:
                try:
                    json_data = delete_response.json()
                    timestamp = json_data['timestamp']
                    status = json_data['status']
                    error = json_data['error']
                    message = json_data['message']
                    path = json_data['path']
                    error_message = f"Erreur {status} ({error}): {message} à {timestamp} sur {path}"
                    messages.warning(request, error_message)
                except Exception:
                    messages.error(request, f"Erreur inattendue : {delete_response.text}")
        except ConnectionError:
            messages.error(request, "Connexion refusée au serveur distant (port 3001).")
        except RequestException as e:
            messages.error(request, f"Erreur lors de la suppression : {e}")
        return redirect("admin_retour_vente")

    # Récupération des ventes
    ventes = []
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

    return render(request, "magasins/admin/retour_vente.html", {
        "ventes": ventes,
        "store_number": selected_store,
        "selected_store": selected_store,
    })

@login_required
@admin_required
def liste_produits(request):
    """Page pour lister tous les produits"""
    selected_store = "1"  # Valeur par défaut
    headers = {
        'Authorization': request.session.get('token')
    }
    produits = []

    if request.method == "POST":
        selected_store = request.POST.get("store", "1")
        action = request.POST.get("action", "submit")

        if action == "change_store":
            store_param = selected_store if selected_store == "Central" else int(selected_store)
            url = f"http://localhost:80/api/v1/stocks/stores/{store_param}"

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

            return render(request, 'magasins/admin/liste_produits.html', {
                'produits': produits,
                'selected_store': selected_store,
            })

    # Cas GET ou soumission standard
    store_param = selected_store if selected_store == "Central" else int(selected_store)
    url = f"http://localhost:80/api/v1/stocks/stores/{store_param}"

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

    return render(request, 'magasins/admin/liste_produits.html', {
        'produits': produits,
        'selected_store': selected_store,
    })

@login_required
@admin_required
def liste_produits_central(request):
    """Page pour lister tous les produits du stock central"""
    headers = {
        'Authorization': request.session.get('token')
    }
    url = f"http://localhost:80/api/v1/stocks/stores/warehouse"
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

    return render(request, 'magasins/admin/liste_produits_central.html', {
        'produits': produits
    })

@login_required
@admin_required
def demande_reappro(request):
    """Page pour de demande de reappovisionnement"""
    selected_store = request.POST.get("store", "1")

    store_param = selected_store if selected_store == "Central" else int(selected_store)
    headers = {
                'Authorization': request.session.get('token')
            }

    # URLs dynamiques selon magasin choisi
    url_stock_magasin = f"http://localhost:80/api/v1/stocks/stores/{store_param}"
    url_stock_central = f"http://localhost:80/api/v1/stocks/stores/warehouse"

    try:
        stock_magasin = requests.get(url_stock_magasin, headers=headers).json()
        stock_mere = requests.get(url_stock_central, headers=headers).json()
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
            url_post = 'http://localhost:80/api/v1/supplies/stores/' + str(store_param)
            try:
                response = requests.post(url_post, json=produits_demandes, headers=headers)
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

@login_required
@admin_required
def rapport_ventes(request):
    """Page de rapport de ventes"""
    report_sales_dict = {i: [] for i in range(1,7)}
    report_products_dict = {}
    headers = {
                'Authorization': request.session.get('token')
            }

    # Récupérer les produits pour magasins 1 à 5
    for i in range(1, 6):
        url = f"http://localhost:80/api/v1/stocks/stores/{i}"
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            report_products_dict[i] = response.json()
        except requests.exceptions.RequestException as e:
            messages.error(request, f"Erreur lors de la récupération des produits magasin #{i} : {e}")
            report_products_dict[i] = []

    # Récupérer les produits du magasin Central (6)
    try:
        url = f"http://localhost:80/api/v1/stocks/stores/Central"
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        report_products_dict[6] = response.json()
    except requests.exceptions.RequestException as e:
        messages.error(request, f"Erreur lors de la récupération des produits magasin Central : {e}")
        report_products_dict[6] = []
    
    # Récupérer les produits du magasin Central (6)
    try:
        url = f"http://localhost:80/api/v1/stocks/stores/warehouse"
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        report_products_dict[7] = response.json()
    except requests.exceptions.RequestException as e:
        messages.error(request, f"Erreur lors de la récupération des produits magasin Central : {e}")
        report_products_dict[7] = []

    # Récupérer les ventes pour magasins 1 à 5
    for i in range(1, 6):
        url = f"http://localhost:80/api/v1/sales/stores/{str(i)}"
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            sales = response.json()
            report_sales_dict[i] = sales if sales else []
        except requests.exceptions.RequestException as e:
            messages.error(request, f"Erreur lors de la récupération des ventes magasin #{i} : {e}")
            report_sales_dict[i] = []

    # Récupérer les ventes du magasin Central (6)
    try:
        url = url = f"http://localhost:80/api/v1/sales/stores/Central"
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        sales = response.json()
        report_sales_dict[6] = sales if sales else []
    except requests.exceptions.RequestException as e:
        messages.error(request, f"Erreur lors de la récupération des ventes magasin Central : {e}")
        report_sales_dict[6] = []

    # Récupérer les ventes d'achat en ligne (7)
    try:
        url = url = f"http://localhost:80/api/v1/sales/stores/StockCentral"
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        sales = response.json()
        report_sales_dict[7] = sales if sales else []
    except requests.exceptions.RequestException as e:
        messages.error(request, f"Erreur lors de la récupération des ventes magasin StockCentral : {e}")
        report_sales_dict[7] = []

    # Préparer les données pour le template
    magasins = []
    for i in range(1, 8):
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
            'name': 'Magasin Central' if i == 6 else 'Achats en ligne' if i == 7 else f'Magasin #{i}',
            'products': products,
            'sales': sales,
            'most_sold_products': most_sold_products,
        })

    return render(request, "magasins/admin/rapport_ventes.html", {
        'magasins': magasins,
    })

@login_required
@admin_required
def tableau_de_bord(request):
    """Page avec le tableau de bord"""
    magasins = []

    report_sales_dict = {}
    report_products_dict = {}
    report_stores_dict = {}

    headers = {
                'Authorization': request.session.get('token')
            }

    for i in range(1, 6):
        try:
            url = f"http://localhost:80/api/v1/stocks/stores/{i}"
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            report_products_dict[i] = response.json()
        except requests.exceptions.RequestException as e:
            messages.error(request, f"Erreur de récupération des produits du magasin {i}: {e}")
            return render(request, "magasins/admin/tableau_de_bord.html", {"magasins": []})

    try:
        url = f"http://localhost:80/api/v1/stocks/stores/Central"
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        report_products_dict[6] = response.json()
    except requests.exceptions.RequestException as e:
        messages.error(request, f"Erreur de récupération des produits du magasin Central: {e}")
        return render(request, "magasins/admin/tableau_de_bord.html", {"magasins": []})

    try:
        url = f"http://localhost:80/api/v1/stocks/stores/warehouse"
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        report_products_dict[7] = response.json()
    except requests.exceptions.RequestException as e:
        messages.error(request, f"Erreur de récupération des produits du magasin warehouse: {e}")
        return render(request, "magasins/admin/tableau_de_bord.html", {"magasins": []})

    for i in range(1, 6):
        try:
            url = f"http://localhost:80/api/v1/sales/stores/{str(i)}"
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            report_sales_dict[i] = response.json()
        except requests.exceptions.RequestException as e:
            messages.error(request, f"Erreur de récupération des ventes du magasin {i}: {e}")
            return render(request, "magasins/admin/tableau_de_bord.html", {"magasins": []})

    try:
        url = f"http://localhost:80/api/v1/sales/stores/Central"
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        report_sales_dict[6] = response.json()
    except requests.exceptions.RequestException as e:
        messages.error(request, f"Erreur de récupération des ventes du magasin Central: {e}")
        return render(request, "magasins/admin/tableau_de_bord.html", {"magasins": []})

    try:
        url = f"http://localhost:80/api/v1/sales/stores/StockCentral"
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        report_sales_dict[7] = response.json()
    except requests.exceptions.RequestException as e:
        messages.error(request, f"Erreur de récupération des ventes du magasin Central: {e}")
        return render(request, "magasins/admin/tableau_de_bord.html", {"magasins": []})

    try:
        response = requests.get('http://localhost:80/api/v1/stocks/storesAll', headers=headers)
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

    for i in range(1, 8):
        ventes = report_sales_dict.get(i, [])
        produits = report_products_dict.get(i, [])
        magasin = report_stores_dict.get(i, {
            "name": f"Achats en ligne",
            "address": "Adresse 1235",
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

@login_required
@admin_required
def mise_a_jour_produit(request):
    """Page de mise à jour de produits"""
    products_url = f"http://localhost:80/api/v1/stocks/stores/warehouse"
    headers = {
                'Authorization': request.session.get('token')
            }
    try:
        response = requests.get(products_url, headers=headers)
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
                update_url = 'http://localhost:80/api/v1/stocks/storesAll/' + product_name
                update_response = requests.put(update_url, json=update_data, headers=headers)
                update_response.raise_for_status()
                result = update_response.json()
                messages.success(request, result.get("message", "Produit mis à jour avec succès."))
                return redirect("admin_mise_a_jour_produit")
            except requests.exceptions.RequestException as e:
                messages.error(request, f"Erreur lors de la mise à jour : {e}")
        else:
            messages.info(request, "Aucune modification apportée.")

    return render(request, "magasins/admin/mise_a_jour_produit.html", {"products": products})
