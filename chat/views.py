from django.contrib.auth.models import User
from django.conf import settings

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import ChatMessage, PDFDocument
from .serializers import ChatSerializer

from .services.router import (
    get_ai_response,
    get_ai_vision_response
)

from .services.pdf_processors import (
    extract_pdf_text,
    split_text
)
from .models import (
    ChatMessage,
    PDFDocument,
    ChatSession
)
from .services.vector_store import create_vector_store, search_pdf


# ==========================
# REGISTER
# ==========================
class RegisterAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response({"error": "Username and password required"}, status=400)

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists"}, status=400)

        User.objects.create_user(username=username, password=password)

        return Response({"message": "User created successfully"})


# ==========================
# CHAT API
# ==========================
# ==========================
# CHAT API
# ==========================
class ChatAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        message = request.data.get("message", "")
        image = request.FILES.get("image")
        session_id = request.data.get("session_id")

        if not session_id:
            return Response(
                {"error": "session_id required"},
                status=400
            )

        try:

            session = ChatSession.objects.get(
                id=session_id,
                user=request.user
            )

            # Last 5 messages of current session
            history = ChatMessage.objects.filter(
                session=session
            ).order_by("-created_at")[:5]

            context = ""

            for chat in reversed(history):
                context += (
                    f"User: {chat.user_message}\n"
                    f"Bot: {chat.bot_response}\n"
                )

            pdf_context = ""

            if message:

                pdf_docs = search_pdf(
                    message,
                    request.user.id
                )

                if pdf_docs:
                    for doc in pdf_docs:
                        pdf_context += (
                            doc.page_content + "\n\n"
                        )

            final_prompt = f"""
PDF CONTEXT:
{pdf_context}

CHAT HISTORY:
{context}

USER QUESTION:
{message}

ANSWER:
"""

            if image:

                bot_reply = get_ai_vision_response(
                    message if message else "Describe this image",
                    image
                )

            else:

                bot_reply = get_ai_response(
                    final_prompt
                )

        except ChatSession.DoesNotExist:

            return Response(
                {"error": "Invalid session"},
                status=404
            )

        except Exception as e:

            bot_reply = f"Error: {str(e)}"

        if session.title == "New Chat" and message:
            session.title = message[:30]
            session.save()

        chat = ChatMessage.objects.create(
            session=session,
            user=request.user,
            user_message=message,
            bot_response=bot_reply,
            image=image
        )

        serializer = ChatSerializer(chat)

        return Response(serializer.data)


# ==========================
# CHAT HISTORY
# ==========================
class ChatHistoryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        chats = ChatMessage.objects.filter(
            user=request.user
        ).order_by("created_at")

        serializer = ChatSerializer(chats, many=True)

        return Response(serializer.data)


# ==========================
# PDF UPLOAD API (FIXED)
# ==========================
class PDFUploadAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        pdf = request.FILES.get("pdf")
        session_id = request.data.get("session_id")

        if not session_id:
            return Response(
                {"error": "session_id required"},
                status=400
            )

        session = ChatSession.objects.get(
            id=session_id,
            user=request.user
        )

        if not pdf:
            return Response(
                {"error": "PDF file required"},
                status=400
            )

        document = PDFDocument.objects.create(
            user=request.user,
            file=pdf
        )

        ChatMessage.objects.create(
            session=session,
            user=request.user,
            user_message="",
            bot_response="PDF uploaded successfully",
            pdf=document.file
        )

        pdf_path = document.file.path

        try:
            text = extract_pdf_text(pdf_path)

        except Exception as e:
            return Response(
                {"error": f"Invalid PDF: {str(e)}"},
                status=400
            )

        if not text.strip():
            return Response(
                {"error": "No readable text in PDF"},
                status=400
            )

        chunks = split_text(text)

        if not chunks:
            return Response(
                {"error": "No chunks generated"},
                status=400
            )

        create_vector_store(
            chunks,
            user_id=request.user.id
        )

        file_url = request.build_absolute_uri(
            document.file.url
        )

        return Response({
            "message": "PDF uploaded successfully",
            "pdf": file_url
        })
    
class CreateSessionAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        session = ChatSession.objects.create(
            user=request.user,
            title="New Chat"
        )

        return Response({
            "session_id": session.id,
            "title": session.title
        })
    
class SessionListAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        sessions = ChatSession.objects.filter(
            user=request.user
        ).order_by("-created_at")

        data = []

        for session in sessions:
            data.append({
                "id": session.id,
                "title": session.title
            })

        return Response(data)

class SessionMessagesAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, session_id):

        chats = ChatMessage.objects.filter(
            session_id=session_id,
            user=request.user
        ).order_by("created_at")

        serializer = ChatSerializer(
            chats,
            many=True
        )

        return Response(serializer.data)