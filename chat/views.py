from django.contrib.auth.models import User

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import (
    IsAuthenticated,
    AllowAny
)

from .models import ChatMessage
from .serializers import ChatSerializer

from .services.router import (
    get_ai_response,
    get_ai_vision_response
)


class RegisterAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):

        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response(
                {"error": "Username and password are required"},
                status=400
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {"error": "Username already exists"},
                status=400
            )

        User.objects.create_user(
            username=username,
            password=password
        )

        return Response({
            "message": "User created successfully"
        })


class ChatAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        message = request.data.get("message")
        image = request.FILES.get("image")

        if not message:
            return Response(
                {"error": "Message is required"},
                status=400
            )

        try:

            # Last 5 chats of current user only
            history = ChatMessage.objects.filter(
                user=request.user
            ).order_by("-created_at")[:5]

            context = ""

            for chat in reversed(history):
                context += (
                    f"User: {chat.user_message}\n"
                    f"Bot: {chat.bot_response}\n"
                )

            context += f"User: {message}\nBot:"

            if image:

                bot_reply = get_ai_vision_response(
                    message,
                    image
                )

            else:

                bot_reply = get_ai_response(
                    context
                )

        except Exception as e:
            bot_reply = f"Error: {str(e)}"

        # Save chat with logged-in user
        chat = ChatMessage.objects.create(
            user=request.user,
            user_message=message,
            bot_response=bot_reply,
            image=image if image else None
        )

        serializer = ChatSerializer(chat)

        return Response(serializer.data)


class ChatHistoryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        chats = ChatMessage.objects.filter(
            user=request.user
        ).order_by("created_at")

        serializer = ChatSerializer(
            chats,
            many=True
        )

        return Response(serializer.data)