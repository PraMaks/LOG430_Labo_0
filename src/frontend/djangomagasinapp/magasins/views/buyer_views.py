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
from ..utils.decorators import login_required, buyer_required

@login_required
@buyer_required
def magasin_buyer(request):
    """Page Home"""
    return render(request, 'magasins/buyer/magasin_buyer.html')


@login_required
@buyer_required
def liste_produits(request):
    """Page pour lister tous les produits"""
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

    return render(request, 'magasins/buyer/liste_produits.html', {
        'produits': produits
    })

@login_required
@buyer_required
def ajouter_panier(request):
    """Fonction pour ajouter un produit au panier"""
    if request.method == "POST":
        name = request.POST.get("name")
        description = request.POST.get("description")
        price = float(request.POST.get("price"))
        qty = int(request.POST.get("qty"))

        user = request.session.get('username')
        token = request.session.get('token')

        produit = {
            "name": name,
            "description": description,
            "qty": qty,
            "price": price,
            "total_price": round(qty * price, 2) #pour arrondir à 2 decimales
        }

        # Construction du panier
        panier = {
            "user": user,
            "total_price": produit["total_price"],
            "contents": [produit]
        }

        try:
            response = requests.post(
                f"http://localhost:80/api/v1/stocks/{user}/cart",
                json=panier,
                headers={"Authorization": token},
                timeout=3
            )

            if response.status_code == 200:
                messages.success(request, f"{qty} x {name} ajouté au panier.")
            else:
                messages.error(request, f"Erreur lors de l'ajout au panier : {response.text}")
        except RequestException as e:
            messages.error(request, f"Erreur de communication avec le serveur du panier : {e}")

    return redirect('liste_produits')


@login_required
@buyer_required
def panier(request):
    """Affiche le panier actuel de l'utilisateur"""
    user = request.session.get("username")
    token = request.session.get("token")

    try:
        response = requests.get(
            f"http://localhost:80/api/v1/stocks/{user}/cart",
            headers={"Authorization": token},
            timeout=3
        )
        if response.status_code == 200:
            panier = response.json()
        else:
            panier = None
            messages.warning(request, "Impossible de récupérer le panier.")
    except RequestException as e:
        panier = None
        messages.error(request, f"Erreur de connexion : {e}")

    return render(request, "magasins/buyer/panier.html", {
        "panier": panier
    })

@login_required
@buyer_required
def modifier_article_panier(request):
    """Fonction pour modifier le contenu du panier"""
    if request.method == "POST":
        username = request.session.get("username")
        token = request.session.get("token")

        try:
            name = request.POST["name"]
            qty = int(request.POST["qty"])
        except (KeyError, ValueError):
            messages.error(request, "Champs invalides.")
            return redirect("panier")

        try:
            response = requests.patch(
                f"http://localhost:80/api/v1/stocks/{username}/cart",
                headers={"Authorization": token},
                json={
                    "name": name,
                    "qty": qty
                },
                timeout=3
            )
            if response.status_code == 200:
                messages.success(request, f"{name} mis à jour dans le panier.")
            else:
                messages.error(request, f"Erreur : {response.text}")
        except RequestException as e:
            messages.error(request, f"Connexion impossible au serveur : {e}")

    return redirect("panier")

@login_required
@buyer_required
def supprimer_article_panier(request):
    """Fonction pour supprimer un article du panier"""
    if request.method == "POST":
        username = request.session.get("username")
        token = request.session.get("token")
        name = request.POST.get("name")
        qty = request.POST.get("qty")

        if not name or not qty:
            messages.error(request, "Champs manquants pour la suppression.")
            return redirect("panier")

        try:
            response = requests.delete(
                f"http://localhost:80/api/v1/stocks/{username}/cart",
                headers={"Authorization": token},
                json={"name": name, "qty": int(qty)},
                timeout=3
            )
            if response.status_code == 200:
                messages.success(request, f"{name} a été retiré du panier.")
            else:
                messages.error(request, f"Erreur : {response.text}")
        except requests.RequestException as e:
            messages.error(request, f"Erreur de connexion : {e}")

    return redirect("panier")

@login_required
@buyer_required
def acheter_panier(request):
    """Soumet le panier comme une vente et vide le panier"""
    user = request.session.get("username")
    token = request.session.get("token")

    response_panier = None

    try:
        response_panier = requests.get(
            f"http://localhost:80/api/v1/stocks/{user}/cart",
            headers={"Authorization": token},
            timeout=3
        )
        if response_panier.status_code == 200:
            panier = response_panier.json() # pylint: disable=unused-variable
        else:
            panier = None # pylint: disable=unused-variable
            messages.warning(request, "Impossible de récupérer le panier.")
    except RequestException as e:
        panier = None
        messages.error(request, f"Erreur de connexion : {e}")

    print(f"{response_panier.json()['contents']}")

    try:
        response = requests.post(
            "http://localhost:80/api/v1/sales/stores/StockCentral",
            headers={
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            json=response_panier.json()['contents'],
            timeout=5
        )

        if response.status_code == 201:
            messages.success(request, "Achat effectué avec succès.")
        else:
            data = response.json()
            messages.error(request, f"Erreur lors de l’achat : {data.get('message', 'Erreur inconnue')}")

    except requests.RequestException as e:
        messages.error(request, f"Erreur réseau : {e}")

    try:
        response = requests.delete(
            f"http://localhost:80/api/v1/stocks/{user}/cart/all",
            headers={"Authorization": token},
            timeout=3
        )
        if response.status_code == 200:
            messages.success(request, "Panier vidé")
        else:
            messages.error(request, f"Erreur : {response.text}")
    except requests.RequestException as e:
        messages.error(request, f"Erreur de connexion : {e}")

    return redirect('panier')
