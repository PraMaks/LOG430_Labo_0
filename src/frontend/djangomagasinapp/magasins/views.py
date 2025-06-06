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
    return HttpResponse("Page 2")

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
