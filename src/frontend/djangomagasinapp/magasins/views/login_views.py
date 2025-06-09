import requests
from django import forms
from django.shortcuts import render, redirect
from django.contrib import messages

EXPRESS_AUTH_API_URL = 'http://localhost:3000/api/v1/auth'
EXPRESS_AUTH_API_URL_LOGIN = EXPRESS_AUTH_API_URL + '/users/login'
EXPRESS_AUTH_API_URL_LOGOUT = EXPRESS_AUTH_API_URL + '/users/logout'

def login(request):
    request.session.flush()
    class CustomLoginForm(forms.Form):
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
                    request.session['is_admin'] = json_data['is_admin']
                    request.session['stores'] = json_data['stores']
                    if request.session['is_admin']:
                        return redirect('magasin_admin')
                    else:
                        return redirect('magasin_standard')
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
                messages.error(request, "Erreur de connexion au serveur.")
    else:
        form = CustomLoginForm()
    return render(request, 'magasins/login/login.html', {'form': form})

def logout(request):
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
