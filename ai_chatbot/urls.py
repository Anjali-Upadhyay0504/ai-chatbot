
from django.contrib import admin
from django.urls import path,include
from django.views.generic import TemplateView
from django.conf import settings 
from django.conf.urls.static import static 
from rest_framework_simplejwt.views import ( TokenObtainPairView, TokenRefreshView, )

urlpatterns = [

    path('admin/', admin.site.urls),
    path('', TemplateView.as_view(template_name='signup.html'), name='signup'),

    path('login/', TemplateView.as_view(template_name='login.html'), name='login'),

    path('chat/', TemplateView.as_view(template_name='index.html'), name='chat'),

    path('api/token/', TokenObtainPairView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view()),
    path('api/', include('chat.urls')),
]

if settings.DEBUG:

    urlpatterns += static(

        settings.MEDIA_URL,

        document_root=settings.MEDIA_ROOT

    )