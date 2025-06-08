def store_name(request):
    stores = request.session.get('stores', ['Magasin'])
    return {
        'store_name': stores[0]  # prend seulement le premier magasin
    }
