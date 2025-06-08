from django.shortcuts import redirect

def login_required(view_func):
    def wrapper(request, *args, **kwargs):
        token = request.session.get('token')
        if not token:
            return redirect('login')
        return view_func(request, *args, **kwargs)
    return wrapper

def admin_required(view_func):
    def wrapper(request, *args, **kwargs):
        token = request.session.get('token')
        is_admin = request.session.get('is_admin', False)
        if not token :
            return redirect('login')
        elif not is_admin:
            return redirect('magasin_standard')
        return view_func(request, *args, **kwargs)
    return wrapper

def standard_required(view_func):
    def wrapper(request, *args, **kwargs):
        token = request.session.get('token')
        is_admin = request.session.get('is_admin', True)
        if not token :
            return redirect('login')
        elif is_admin:
            return redirect('magasin_admin')
        return view_func(request, *args, **kwargs)
    return wrapper
