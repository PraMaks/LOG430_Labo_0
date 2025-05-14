"""Fichier main"""
def addition(x, y):
    """Function qui fait l'addition de 2 nombres"""
    return x + y

def main():
    """Function main qui lance la fonction d'addition"""
    print(addition(4,5))

# Using the special variable
# __name__
if __name__=="__main__":
    main()
