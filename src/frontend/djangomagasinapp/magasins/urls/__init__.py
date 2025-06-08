from django.urls import include, path
from magasins.urls import standard_urls, admin_urls, login_urls

urlpatterns = [
    path('standard/', include(standard_urls)),
    path('admin/', include(admin_urls)),
    path('', include(login_urls))
]

