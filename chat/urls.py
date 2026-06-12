
from django.urls import path
from .views import (
    ChatAPIView,
    ChatHistoryAPIView,
    RegisterAPIView,
)

urlpatterns = [
    path("register/", RegisterAPIView.as_view()),
    path("chat/", ChatAPIView.as_view()),
    path("history/", ChatHistoryAPIView.as_view()),
]