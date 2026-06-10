
from django.urls import path
from .views import ChatAPIView, ChatHistoryAPIView

urlpatterns = [
    path('chat/', ChatAPIView.as_view()),
    path('history/', ChatHistoryAPIView.as_view()),
]