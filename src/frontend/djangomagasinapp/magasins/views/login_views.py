# pylint: disable=line-too-long
# pylint: disable=missing-timeout
# pylint: disable=no-else-return
# pylint: disable=redefined-builtin
"""Classe qui contient le logique des vues pour la connection"""
import requests
from django import forms
from django.shortcuts import render, redirect
from django.contrib import messages

EXPRESS_AUTH_API_URL = 'http://localhost:80/api/v1/auth'
EXPRESS_AUTH_API_URL_LOGIN = EXPRESS_AUTH_API_URL + '/users/login'
EXPRESS_AUTH_API_URL_LOGOUT = EXPRESS_AUTH_API_URL + '/users/logout'
EXPRESS_AUTH_API_URL_REGISTER = EXPRESS_AUTH_API_URL + '/users/register'

def login(request):
    """Page login"""
    request.session.flush()
    class CustomLoginForm(forms.Form):
        """Pour faire un fichier de connexion"""
        username = forms.CharField(label="Nom d'utilisateur", max_length=150)
        password = forms.CharField(label="Mot de passe", widget=forms.PasswordInput)

    if request.method == 'POST':
        form = CustomLoginForm(request.POST)
        if form.is_valid():
            data = {
                'username': form.cleaned_data['username'],
                'password': form.cleaned_data['password'],
            }

            try:
                response = requests.post(EXPRESS_AUTH_API_URL_LOGIN, json=data)
                if response.status_code == 200:
                    json_data = response.json()
                    request.session['token'] = json_data['token']
                    request.session['username'] = json_data['username']
                    request.session['type'] = json_data['type']
                    request.session['stores'] = json_data['stores']
                    if request.session.get('type') == "admin" :
                        return redirect('magasin_admin')
                    elif request.session.get('type') == "seller" :
                        return redirect('magasin_standard')
                    else :
                        return redirect('login')
                else:
                    json_data = response.json()
                    timestamp = json_data['timestamp']
                    status = json_data['status']
                    error = json_data['error']
                    message = json_data['message']
                    path = json_data['path']
                    error_message = f"Erreur {status} ({error}): {message} à {timestamp} sur {path}"
                    messages.error(request, error_message)
            except Exception as e:
                messages.error(request, f"Erreur de connexion au serveur: {e}")
    else:
        form = CustomLoginForm()
    return render(request, 'magasins/login/login.html', {'form': form})


def register(request):
    """Page création de compte"""
    request.session.flush()
    class CustomRegisterForm(forms.Form):
        """Pour faire un fichier de creation"""
        username = forms.CharField(label="Nom d'utilisateur", max_length=150)
        password = forms.CharField(label="Mot de passe", widget=forms.PasswordInput)

    if request.method == 'POST':
        form = CustomRegisterForm(request.POST)
        if form.is_valid():
            data = {
                'username': form.cleaned_data['username'],
                'password': form.cleaned_data['password'],
            }

            try:
                response = requests.post(EXPRESS_AUTH_API_URL_REGISTER, json=data)
                if response.status_code == 200:
                    json_data = response.json()
                    messages.success(request, "Compte créé avec succès.")
                    return redirect('login')
                else:
                    json_data = response.json()
                    timestamp = json_data['timestamp']
                    status = json_data['status']
                    error = json_data['error']
                    message = json_data['message']
                    path = json_data['path']
                    error_message = f"Erreur {status} ({error}): {message} à {timestamp} sur {path}"
                    messages.error(request, error_message)
            except Exception as e:
                messages.error(request, f"Erreur de connexion au serveur: {e}")
    else:
        form = CustomRegisterForm()
    return render(request, 'magasins/login/register.html', {'form': form})


def logout(request):
    """Pour se deconncter"""
    token = request.session.get('token')
    request.session.flush()
    if token:
        try:
            headers = {'Authorization': token}
            response = requests.delete(EXPRESS_AUTH_API_URL_LOGOUT, headers=headers)

            if response.status_code == 200:
                messages.success(request, "Déconnexion réussie.")
            else:
                json_data = response.json()
                timestamp = json_data['timestamp']
                status = json_data['status']
                error = json_data['error']
                message = json_data['message']
                path = json_data['path']
                error_message = f"Erreur {status} ({error}): {message} à {timestamp} sur {path}"
                messages.warning(request, error_message)
        except Exception as e:
            print("Erreur Express logout:", e)
            messages.error(request, "Impossible de contacter le serveur Express.")

    # Nettoyer la session Django
    request.session.flush()
    return redirect('login')
