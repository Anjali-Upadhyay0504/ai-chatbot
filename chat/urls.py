
from django.urls import path
from .views import (
    ChatAPIView,
    ChatHistoryAPIView,
    RegisterAPIView,
    PDFUploadAPIView
)


urlpatterns = [
    path("upload-pdf/", PDFUploadAPIView.as_view()),
    path("register/", RegisterAPIView.as_view()),
    path("chat/", ChatAPIView.as_view()),
    path("history/", ChatHistoryAPIView.as_view()),
]