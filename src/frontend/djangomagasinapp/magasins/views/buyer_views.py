# pylint: disable=line-too-long
# pylint: disable=missing-timeout
# pylint: disable=no-else-return
# pylint: disable=redefined-builtin
# pylint: disable=too-many-nested-blocks
"""Classe qui contient le logique des vues sans les besoins administratifs"""
import requests
from django.shortcuts import render, redirect
from django.contrib import messages
from requests.exceptions import RequestException, ConnectionError
from ..utils.decorators import login_required, buyer_required

@login_required
@buyer_required
def magasin_buyer(request):
    """Page Home"""
    return render(request, 'magasins/buyer/magasin_buyer.html')

