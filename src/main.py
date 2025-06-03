# pylint: disable=missing-timeout
"""Module principal de gestion d'inventaire et de ventes pour un magasin."""
import sys
from src.store_functions import (
    display_inventory,
    display_main_inventory,
    display_store_performance,
    generate_sales_report,
    handle_return,
    register_sale,
    request_supplies,
    search_product,
    update_product_details
)

def main_loop(store_number, input_func=input, print_func=print):
    """Boucle principale d'interaction utilisateur."""
    while True:
        print_func("Options:")
        print_func("   'a': Rechercher un produit")
        print_func("   'b': Enregistrer une vente")
        print_func("   'c': Gestion des retours")
        print_func("   'd': Consulter état de stock du magasin")
        print_func("   'e': Consulter état de stock du magasin mère")
        print_func("   'f': Déclencher un réapprovisionnement")
        print_func("   'q': Quitter")

        choice = input_func("Entrez votre choix: ")

        if choice == 'a':
            product_name = input_func("Entrez le nom du produit recherché : ")
            search_product(store_number, product_name)

        elif choice == 'b':
            register_sale(store_number, input_func=input_func, print_func=print_func)

        elif choice == 'c':
            handle_return(store_number, input_func=input_func, print_func=print_func)

        elif choice == 'd':
            display_inventory(store_number, print_func=print_func)

        elif choice == 'e':
            display_main_inventory(print_func=print_func)

        elif choice == 'f':
            request_supplies(store_number, print_func=print_func)

        elif choice == 'q':
            print_func("Fin du programme...")
            break

        else:
            print_func("Commande inconnue")

        print_func("---------------------------")

def main_loop_admin(input_func=input, print_func=print):
    """Boucle principale d'interaction utilisateur."""
    while True:
        print_func("Options:")
        print_func("   'a': Rechercher un produit")
        print_func("   'b': Enregistrer une vente")
        print_func("   'c': Gestion des retours")
        print_func("   'd': Consulter état de stock")
        print_func("   'e': Consulter état de stock du magasin mère")
        print_func("   'f': Générer un rapport consolidé des ventes")
        print_func("   'g': Visualiser les performances des magasins")
        print_func("   'h': Mettre à jour les données d'un produit")
        print_func("   'q': Quitter")

        choice = input_func("Entrez votre choix: ")

        if choice == 'a':
            store_number = int(input_func("Entrez le numéro de magasin (1 à 5) : "))
            if 1 <= store_number <= 5:
                product_name = input_func("Entrez le nom du produit recherché : ")
                search_product(store_number, product_name)
            else :
                print_func("Numéro de magasin invalide")

        elif choice == 'b':
            store_number = int(input_func("Entrez le numéro de magasin (1 à 5) : "))
            if 1 <= store_number <= 5:
                register_sale(store_number, input_func=input_func, print_func=print_func)
            else :
                print_func("Numéro de magasin invalide")

        elif choice == 'c':
            store_number = int(input_func("Entrez le numéro de magasin (1 à 5) : "))
            if 1 <= store_number <= 5:
                handle_return(store_number, input_func=input_func, print_func=print_func)
            else :
                print_func("Numéro de magasin invalide")

        elif choice == 'd':
            store_number = int(input_func("Entrez le numéro de magasin (1 à 5) : "))
            if 1 <= store_number <= 5:
                display_inventory(store_number, print_func=print_func)
            else :
                print_func("Numéro de magasin invalide")

        elif choice == 'e':
            display_main_inventory(print_func=print_func)

        elif choice == 'f':
            generate_sales_report(print_func=print_func)

        elif choice == 'g':
            display_store_performance(print_func=print_func)

        elif choice == 'h':
            update_product_details(print_func=print_func)

        elif choice == 'q':
            print_func("Fin du programme...")
            break

        else:
            print_func("Commande inconnue")

        print_func("---------------------------")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Veuillez spécifier un numéro de magasin (1-5) ou 'admin'.")
        sys.exit(1)

    num_magasin_string = sys.argv[1]

    if num_magasin_string.isdigit():
        num_magasin_int = int(num_magasin_string)
        if num_magasin_int > 0 and num_magasin_int < 6:
            print("Numero de magasin:", sys.argv[1])
            main_loop(num_magasin_int)
        else:
            print("Magasin choisi n'existe pas")

    elif num_magasin_string == "admin" :
        print("Console maison mère")
        main_loop_admin()

    else:
        print("Option non supportée")
