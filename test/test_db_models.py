"""Module principal des tests unitaires de l'application."""
import pytest
from mongoengine import connect, disconnect
from src.db_models import StoreInventory, StoreSale
from src.main import search_product

TEST_DB_NAME = "test_labo1"

@pytest.fixture(scope="function", autouse=True)
def setup_and_teardown_db():
    """Fonction lancée avant chaque test pour raser la bd de test"""
    disconnect()
    connect(
        db=TEST_DB_NAME,
        host="localhost",
        port=27017,
        alias="testdb",
        uuidRepresentation="standard" # Pour enlever un warning avec pytest
    )

    StoreInventory._meta['db_alias'] = 'testdb' # pylint: disable=protected-access
    StoreSale._meta['db_alias'] = 'testdb' # pylint: disable=protected-access

    StoreInventory.drop_collection()
    StoreSale.drop_collection()
    yield # séparation entre avant et après le test
    StoreInventory.drop_collection()
    StoreSale.drop_collection()
    disconnect()

    StoreInventory._meta['db_alias'] = 'default' # pylint: disable=protected-access
    StoreSale._meta['db_alias'] = 'default' # pylint: disable=protected-access


def test_search_product_found():
    """Test pour la recherche d'un produit existant."""
    StoreInventory(name="TestProduct", price=10, qty=5).save()
    product = search_product("TestProduct")
    assert product is not None
    assert product["name"] == "TestProduct"
    assert product["price"] == 10
    assert product["qty"] == 5
