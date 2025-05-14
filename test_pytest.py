"""Fichier avec 2 tests unitaires"""
from main import addition

def test_addition_positive():
    """Test d'addition de 2 nombres positives"""
    assert addition(4, 2) == 6

def test_addition_negative():
    """Test d'addition de 2 nombres negatives"""
    assert addition(-4, -2) == -6
