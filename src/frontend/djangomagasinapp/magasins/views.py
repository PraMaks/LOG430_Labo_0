from django.http import HttpResponse
import requests
from django.shortcuts import render

def magasin_standard(request):
    return render(request, 'magasins/magasin_standard.html')

def rechercher_produit(request):
    produit = None
    query = None

    if request.method == "POST":
        query = request.POST.get("nom_produit")
        response = requests.get(f"http://localhost:3000/1/productSearch/{query}") 
        if response.status_code == 200:
            produit = response.json()

    return render(request, 'magasins/rechercher_produit.html', {
        'produit': produit,
        'query': query,
    })


def enregistrer_vente(request):
    store_number = 1  
    url_stock = f"http://127.0.0.1:3000/{store_number}/products"

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
            return render(request, "magasins/enregistrer_vente.html", {
                "produits": requests.get(url_stock).json(),
                "message": "Aucun produit sélectionné."
            })

        url_vente = f"http://127.0.0.1:3000/{store_number}/registerSale"
        try:
            response = requests.post(url_vente, json=produits)
            response.raise_for_status()
            return render(request, "magasins/vente_success.html", {
                "produits": produits,
                "total": total
            })
        except requests.exceptions.RequestException as e:
            return render(request, "magasins/enregistrer_vente.html", {
                "produits": requests.get(url_stock).json(),
                "message": f"Erreur lors de l'envoi de la vente : {e}"
            })

    else:  
        response = requests.get(url_stock)
        produits = response.json()
        return render(request, "magasins/enregistrer_vente.html", {"produits": produits})

def gestion_retours(request):
    return HttpResponse("Page 3")

def liste_produits(request):
    response = requests.get("http://localhost:3000/1/products")
    produits = response.json()
    return render(request, 'magasins/liste_produits.html', {'produits': produits})

def liste_produits_mere(request):
    response = requests.get("http://localhost:3000/mainStore/products")
    produits = response.json()
    return render(request, 'magasins/liste_produits_mere.html', {'produits': produits})

def declencher_reappro(request):
    return HttpResponse("Page 6")
