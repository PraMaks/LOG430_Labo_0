"""Module principal des tests unitaires de l'application."""
import pytest
from mongoengine import connect, disconnect
from src.db_models import ProductSold, StoreInventory, StoreSale
from src.main import display_inventory, handle_return, register_sale, search_product

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

def test_search_product_not_found():
    """Test pour la recherche d'un produit non-existant."""
    product = search_product("NonExisting")
    assert product is None

def test_register_sale(monkeypatch): # monkeypatch permet de simuler les inputs
    """Test pour enregistrer une vente."""
    StoreInventory(name="Bread", price=4, qty=10).save()

    # Simule la selection de 2 breads
    inputs = iter(["Bread", "2", ""])
    monkeypatch.setattr("builtins.input", lambda _: next(inputs))

    outputs = []
    register_sale(input_func=input, print_func=outputs.append)

    # Vérifie que la vente est sauvegardée
    assert any("Vente enregistrée pour 'Bread', 2 unités." in line for line in outputs)

    # Vérifie que la qty de bread a diminué
    remaining = StoreInventory.objects(name="Bread").first().qty
    assert remaining == 8

    # Vérifie qu'une vente a été créée
    assert StoreSale.objects.count() == 1

def test_handle_return(monkeypatch):
    """Test pour faire un retour de vente."""
    StoreInventory(name="Candy", price=2, qty=5).save()
    sold = ProductSold(name="Candy", price=2, qty=2, total_price=4)
    StoreSale(total_price=4, contents=[sold]).save()

    outputs = []

    # Simule le retour de vente
    monkeypatch.setattr("builtins.input", lambda _: "Vente #1")
    vente_id = handle_return(input_func=input, print_func=outputs.append)

    # Vérifie que la vente a été retournée et supprimée
    assert vente_id is not None
    assert any("retournée et supprimée de la base" in line for line in outputs)

    # Vérifie que la qty de candy a monté
    candy = StoreInventory.objects(name="Candy").first()
    assert candy.qty == 7

    # Vérifie que la vente n'existe plus
    assert StoreSale.objects.count() == 0

def test_display_inventory():
    """Test pour afficher l'inventaire"""
    StoreInventory(name="Bread", price=4, qty=10).save()
    StoreInventory(name="Candy", price=2, qty=5).save()

    outputs = []
    display_inventory(print_func=outputs.append)

    # Vérifier que l'inventaire est bien affiché
    assert any("Produit: Bread" in line for line in outputs)
    assert any("Produit: Candy" in line for line in outputs)
