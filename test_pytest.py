"""Module principal des tests unitaires de l'application."""
import pytest
from mongoengine import connect, disconnect
from main import StoreInventory, StoreSale, search_product

TEST_DB_NAME = "test_labo1"

@pytest.fixture(scope="function", autouse=True)
def setup_and_teardown_db():
    """Fonction lancée avant chaque test pour raser la bd de test"""
    disconnect()  # Déconnecte toute connexion existante avant d'en créer une nouvelle
    connect(TEST_DB_NAME, host="localhost", port=27017, alias="default")
    StoreInventory.drop_collection()
    StoreSale.drop_collection()
    yield
    StoreInventory.drop_collection()
    StoreSale.drop_collection()
    disconnect()

def test_search_product_found():
    """Test pour chercher un produit"""
    StoreInventory(name="TestProduct", price=10, qty=5).save()
    product = search_product("TestProduct")
    assert product is not None
    assert product["name"] == "TestProduct"
    assert product["price"] == 10
    assert product["qty"] == 5
