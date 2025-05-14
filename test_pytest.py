def addition(x, y):
    return x + y

def test_addition_positive():
    assert addition(4, 2) == 6

def test_addition_negative():
    assert addition(-4, -2) == -6