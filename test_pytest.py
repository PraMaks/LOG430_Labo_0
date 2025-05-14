def addition(x, y):
    """Function qui fait l'addition de 2 nombres"""
    return x + y

def test_addition_positive():
    """Test d'addition de 2 nombres positives"""
    assert addition(4, 2) == 6

def test_addition_negative():
    """Test d'addition de 2 nombres negatives"""
    assert addition(-4, -2) == -6
