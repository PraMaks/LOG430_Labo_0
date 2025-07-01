"""Classe pour afficher des données de manière dynamique"""

def store_name(request):
    """Affiche le nom du magasin entre sur les pages de manière dynamique"""
    stores = request.session.get('stores', ['Magasin'])

    if request.session.get('type') == 'buyer':
        return {'store_name': ''}
    else : 
        return {
            'store_name': stores[0]  # prend seulement le premier magasin
        }
