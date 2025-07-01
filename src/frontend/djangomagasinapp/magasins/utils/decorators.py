# pylint: disable=no-else-return
"""Classe qui contient les décorateurs pour proteger l'accès à des URL"""
from functools import wraps
from django.shortcuts import redirect

def login_required(view_func):
    """Besoin d'être connecté"""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        token = request.session.get('token')
        if not token:
            return redirect('login')
        return view_func(request, *args, **kwargs)
    return wrapper

def admin_required(view_func):
    """Besoin d'être connecté et être admin"""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        token = request.session.get('token')
        type = request.session.get('type', "admin")
        if not token:
            return redirect('login')
        elif type == "seller" :
            return redirect('magasin_seller')
        elif type == "buyer" :
            return redirect('magasin_buyer')
        return view_func(request, *args, **kwargs)
    return wrapper

def seller_required(view_func):
    """Besoin d'être connecté et être un utilisateur seller"""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        token = request.session.get('token')
        type = request.session.get('type', "seller")
        if not token:
            return redirect('login')
        elif type == "admin":
            return redirect('magasin_admin')
        elif type == "buyer" :
            return redirect('magasin_buyer')
        return view_func(request, *args, **kwargs)
    return wrapper

def buyer_required(view_func):
    """Besoin d'être connecté et être un utilisateur buyer"""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        token = request.session.get('token')
        type = request.session.get('type', "buyer")
        if not token:
            return redirect('login')
        elif type == "admin":
            return redirect('magasin_admin')
        elif type == "seller" :
            return redirect('magasin_seller')
        return view_func(request, *args, **kwargs)
    return wrapper
