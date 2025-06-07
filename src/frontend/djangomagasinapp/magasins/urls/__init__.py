from django.urls import include, path
from magasins.urls import standard_urls, admin_urls

urlpatterns = [
    path('', include(standard_urls)),
    path('admin/', include(admin_urls)),
]

