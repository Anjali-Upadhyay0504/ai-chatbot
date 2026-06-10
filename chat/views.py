from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import ChatMessage
from .serializers import ChatSerializer

from .services.router import get_ai_response
import PIL.Image
from rest_framework.permissions import AllowAny



class ChatAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    def post(self, request):

        message = request.data.get("message")
        image = request.FILES.get("image")

        if not message:
            return Response(
                {"error": "Message is required"},
                status=400
            )

        try:

            # 🧠 Last 5 chat memory (lightweight)
            history = ChatMessage.objects.order_by("-created_at")[:5]

            context = ""

            for chat in reversed(history):
                context += (
                    f"User: {chat.user_message}\n"
                    f"Bot: {chat.bot_response}\n"
                )

            context += f"User: {message}\nBot:"

            # 🧠 MULTI-LLM ROUTER CALL (Gemini + Groq + OpenRouter)
            bot_reply = get_ai_response(context)

        except Exception as e:
            bot_reply = f"Error: {str(e)}"

        # 💾 Save chat
        chat = ChatMessage.objects.create(
            user_message=message,
            bot_response=bot_reply,
            image=image if image else None
        )

        serializer = ChatSerializer(chat)

        return Response(serializer.data)


class ChatHistoryAPIView(APIView):

    def get(self, request):

        chats = ChatMessage.objects.order_by("created_at")

        serializer = ChatSerializer(chats, many=True)

        return Response(serializer.data)
    # print("TRY GEMINI")
    # print("TRY GROQ")
    # print("TRY OPENROUTER")