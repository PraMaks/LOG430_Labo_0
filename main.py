"""Import de la fonction d'addition"""
from test_pytest import addition

def main():
    """Function main qui lance la fonction d'addition"""
    print(addition(4,5))

# Using the special variable
# __name__
if __name__=="__main__":
    main()
