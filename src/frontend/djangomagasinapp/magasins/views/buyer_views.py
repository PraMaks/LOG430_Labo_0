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

    return render(request, 'magasins/buyer/liste_produits.html', {
        'produits': produits
    })

@login_required
@buyer_required
def ajouter_panier(request):
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

        # Construction du panier (ici simplifié à un seul produit, mais on peut l'étendre plus tard)
        panier = {
            "user": user,
            "total_price": produit["total_price"],
            "contents": [produit]
        }

        try:
            response = requests.post(
                f"http://localhost:80/api/v1/stocks/{user}/cart",  # À adapter selon ton Express.js
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
    """Page Panier"""
    return render(request, 'magasins/buyer/panier.html')
