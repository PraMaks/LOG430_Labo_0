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

