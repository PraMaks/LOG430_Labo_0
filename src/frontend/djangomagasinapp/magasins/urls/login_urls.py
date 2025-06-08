from django.urls import path
from magasins.views import login_views

urlpatterns = [
    path('', login_views.login, name='login'),
]
