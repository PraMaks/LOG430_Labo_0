"""Module principal des tests unitaires de l'application."""
from unittest.mock import patch, MagicMock
import requests
from src.main import search_product,display_inventory,register_sale,handle_return,request_supplies

@patch("requests.get")
def test_search_product_found(mock_get):
    """Test pour trouver un produit existant"""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "name": "Prod", "description": "Desc", "price": 10, "qty": 5, "max_qty": 10
    }
    mock_get.return_value = mock_response

    output = []
    search_product(1, "Prod", print_func=output.append)
    assert any("Produit trouvé" in line for line in output)
    assert any("Prod" in line for line in output)

@patch("requests.get")
def test_search_product_not_found(mock_get):
    """Test pour un produit inexistant"""
    mock_response = MagicMock()
    mock_response.status_code = 404
    mock_get.return_value = mock_response

    output = []
    search_product(1, "Inexistant", print_func=output.append)
    assert any("introuvable" in line for line in output)

@patch("requests.get", side_effect=requests.exceptions.RequestException("fail"))
def test_search_product_request_exception(mock_get): # pylint: disable=unused-argument
    """Test pour lorsqu'une exception est lévée suite au call API"""
    output = []
    search_product(1, "Produit", print_func=output.append)
    assert any("Erreur lors de la requête" in line for line in output)

@patch("requests.get")
def test_display_inventory_success(mock_get):
    """Test pour afficher l'inventaire d'un magasin"""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = [
        {"name": "Prod1", "qty": 5, "max_qty": 10, "price": 20},
        {"name": "Prod2", "qty": 3, "max_qty": 8, "price": 15}
    ]
    mock_get.return_value = mock_response

    output = []
    data = display_inventory(1, print_func=output.append)
    assert isinstance(data, list)
    assert any("Inventaire du Magasin" in line for line in output)
    assert any("Prod1" in line for line in output)
    assert any("Prod2" in line for line in output)

@patch("requests.get", side_effect=requests.exceptions.RequestException("fail"))
def test_display_inventory_fail(mock_get): # pylint: disable=unused-argument
    """Test pour lorsqu'une erreur survient pour l'affichage d'inventaire"""
    output = []
    data = display_inventory(1, print_func=output.append)
    assert data == "error"
    assert any("Erreur lors de la requête" in line for line in output)

@patch("requests.post")
@patch("src.main.display_inventory")
def test_register_sale_success(mock_display_inventory, mock_post):
    """Test pour enregister une vente avec succès"""
    mock_display_inventory.return_value = [
        {"name": "ProdA", "description": "DescA", "qty": 5, "price": 10},
        {"name": "ProdB", "description": "DescB", "qty": 2, "price": 20},
    ]
    mock_response = MagicMock()
    mock_response.status_code = 201
    mock_post.return_value = mock_response

    inputs = iter([ # Étapes de selection de produits
        "ProdA",   
        "3",      
        "ProdB",  
        "2",      
        ""        
    ])
    output = []

    register_sale(1, input_func=lambda _: next(inputs), print_func=output.append)
    assert any("Vente envoyée avec succès." in line for line in output)
    assert any("3x ProdA" in line for line in output)
    assert any("2x ProdB" in line for line in output)

@patch("src.main.display_inventory")
def test_register_sale_no_products(mock_display_inventory):
    """Test pour enregistrer une vente mais sans produits"""
    mock_display_inventory.return_value = [
        {"name": "ProdA", "description": "DescA", "qty": 5, "price": 10},
    ]

    inputs = iter([""])  # On ne choisit aucun produit
    output = []

    register_sale(1, input_func=lambda _: next(inputs), print_func=output.append)
    assert any("vente annulée" in line.lower() for line in output)

@patch("requests.delete")
@patch("requests.get")
def test_handle_return_success(mock_get, mock_delete):
    """Test pour faire un retour de vente avec succès"""
    sales_data = [{
        "_id": "123",
        "date": "2025-05-01T10:00:00Z",
        "total_price": 50,
        "contents": [{"name": "Prod", "qty": 2, "price": 25, "total_price": 50}]
    }]
    mock_get.return_value = MagicMock(status_code=200, json=lambda: sales_data)
    mock_delete.return_value = MagicMock(status_code=200, json=lambda: {"message": "Retour réussi"})

    inputs = iter(["1"]) # On choisit la première vente
    output = []

    handle_return(1, input_func=lambda _: next(inputs), print_func=output.append)
    assert any("Retour réussi" in line for line in output)

@patch("requests.get")
def test_handle_return_no_sales(mock_get):
    """Test pour le retour de ventes lorsqu'aucune vente est dans le magasin"""
    mock_get.return_value = MagicMock(status_code=200, json=lambda: [])
    output = []
    inputs = iter(["1"]) # On choisit la première vente même s'il n'est pas là

    handle_return(1, input_func=lambda _: next(inputs), print_func=output.append)
    assert any("Aucune vente enregistrée" in line for line in output)

@patch("requests.get")
def test_handle_return_invalid_choice(mock_get):
    """Test pour le retour de ventes mais avec un mauvais choix de vente"""
    sales_data = [{
        "_id": "123",
        "date": "2025-05-01T10:00:00Z",
        "total_price": 50,
        "contents": [{"name": "Prod", "qty": 2, "price": 25, "total_price": 50}]
    }]
    mock_get.return_value = MagicMock(status_code=200, json=lambda: sales_data)
    output = []
    inputs = iter(["abc"])  # On rentre un mauvais choix

    handle_return(1, input_func=lambda _: next(inputs), print_func=output.append)
    assert any("Entrée invalide" in line for line in output)

@patch("requests.get")
def test_handle_return_out_of_range(mock_get):
    """Test pour le retour de ventes mais avec un index out of range du tableau"""
    sales_data = [{
        "_id": "123",
        "date": "2025-05-01T10:00:00Z",
        "total_price": 50,
        "contents": [{"name": "Prod", "qty": 2, "price": 25, "total_price": 50}]
    }]
    mock_get.return_value = MagicMock(status_code=200, json=lambda: sales_data)
    output = []
    inputs = iter(["5"])  # On cause une erreur de index out of range

    handle_return(1, input_func=lambda _: next(inputs), print_func=output.append)
    assert any("hors plage" in line.lower() for line in output)

@patch("requests.delete")
@patch("requests.get")
def test_handle_return_delete_fail(mock_get, mock_delete):
    """Test pour le retour de ventes lorsqu'une erreur arrive"""
    sales_data = [{
        "_id": "123",
        "date": "2025-05-01T10:00:00Z",
        "total_price": 50,
        "contents": [{"name": "Prod", "qty": 2, "price": 25, "total_price": 50}]
    }]
    mock_get.return_value = MagicMock(status_code=200, json=lambda: sales_data)
    mock_delete.side_effect = requests.exceptions.RequestException("fail")

    inputs = iter(["1"]) # On choisit la bonne vente mais on cause une erreur backend
    output = []

    handle_return(1, input_func=lambda _: next(inputs), print_func=output.append)
    assert any("Erreur lors de l'envoi" in line for line in output)

@patch("requests.post")
@patch("src.main.display_inventory")
@patch("src.main.display_main_inventory")
def test_request_supplies_success(mock_main_inv, mock_store_inv, mock_post):
    """Test pour la demande d'approvisionnement avec succès"""
    mock_store_inv.return_value = [
        {"name": "ProdA", "qty": 2, "max_qty": 10}
    ]
    mock_main_inv.return_value = [
        {"name": "ProdA", "qty": 5}
    ]
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_post.return_value = mock_response

    inputs = iter([
        "ProdA",
        "3",
        "" 
    ])
    output = []

    request_supplies(1, input_func=lambda _: next(inputs), print_func=output.append)
    assert any("envoyée avec succès" in line for line in output)
    assert any("3x ProdA" in line for line in output)

@patch("src.main.display_inventory")
@patch("src.main.display_main_inventory")
def test_request_supplies_no_products(mock_main_inv, mock_store_inv):
    """Test pour la demande d'approvisionnement mais la demande est vide"""
    mock_store_inv.return_value = [
        {"name": "ProdA", "qty": 2, "max_qty": 10},
    ]
    mock_main_inv.return_value = [
        {"name": "ProdA", "qty": 5},
    ]

    inputs = iter([""])  # On fait une demande d'approvisionnement vide
    output = []

    request_supplies(1, input_func=lambda _: next(inputs), print_func=output.append)

    assert any("annulée" in line.lower() for line in output)
