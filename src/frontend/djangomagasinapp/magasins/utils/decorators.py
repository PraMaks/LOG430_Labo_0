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
        is_admin = request.session.get('is_admin', False)
        if not token:
            return redirect('login')
        elif not is_admin:
            return redirect('magasin_standard')
        return view_func(request, *args, **kwargs)
    return wrapper

def standard_required(view_func):
    """Besoin d'être connecté et être un utilisateur standard"""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        token = request.session.get('token')
        is_admin = request.session.get('is_admin', False)
        if not token:
            return redirect('login')
        elif is_admin:
            return redirect('magasin_admin')
        return view_func(request, *args, **kwargs)
    return wrapper
