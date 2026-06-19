from django.urls import path

from .views import (
    ChatAPIView,
    ChatHistoryAPIView,
    RegisterAPIView,
    PDFUploadAPIView,
    CreateSessionAPIView,
    SessionListAPIView,
    SessionMessagesAPIView
)

urlpatterns = [

    path(
        "register/",
        RegisterAPIView.as_view()
    ),

    path(
        "chat/",
        ChatAPIView.as_view()
    ),

    path(
        "history/",
        ChatHistoryAPIView.as_view()
    ),

    path(
        "upload-pdf/",
        PDFUploadAPIView.as_view()
    ),

    path(
        "create-session/",
        CreateSessionAPIView.as_view()
    ),

    path(
        "sessions/",
        SessionListAPIView.as_view()
    ),

    path(
        "session/<int:session_id>/",
        SessionMessagesAPIView.as_view()
    ),

]
  