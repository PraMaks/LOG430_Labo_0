from test_pytest import addition

def main():
    print(addition(4,5))

# Using the special variable 
# __name__
if __name__=="__main__":
    main()