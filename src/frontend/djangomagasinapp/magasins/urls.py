from django.urls import path, include

urlpatterns = [
    path('', include('magasins.urls.standard_urls')),       
    path('admin/', include('magasins.urls.admin_urls')),    
]