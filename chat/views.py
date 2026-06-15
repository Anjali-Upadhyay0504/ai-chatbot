from django.contrib.auth.models import User

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import (
    IsAuthenticated,
    AllowAny
)
from chat.services.vector_store import search_pdf
from .models import ChatMessage
from .serializers import ChatSerializer

from .services.router import (
    get_ai_response,
    get_ai_vision_response
)
from .models import PDFDocument
from .services.pdf_processors import (
    extract_pdf_text,
    split_text
)
from .services.vector_store import create_vector_store

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

        message = request.data.get("message", "")
        image = request.FILES.get("image")

        print("FILES:", request.FILES)
        print("IMAGE:", image)

        # Message ya image me se kam se kam ek hona chahiye
        if not message and not image:
            return Response(
                {"error": "Message or image is required"},
                status=400
            )

        try:

            history = ChatMessage.objects.filter(
                user=request.user
            ).order_by("-created_at")[:5]

            context = ""

            for chat in reversed(history):
                context += (
                    f"User: {chat.user_message}\n"
                    f"Bot: {chat.bot_response}\n"
                )

            if message:

                pdf_docs = search_pdf(message) if message else []

                pdf_context = ""
                for doc in pdf_docs:
                    pdf_context += doc.page_content + "\n\n"

                context = f"""
                PDF CONTEXT:
                {pdf_context}

                CHAT HISTORY:
                {context}

                USER QUESTION:
                {message}
                ANSWER:
                """

            # Image hai to Vision AI
            if image:
                bot_reply = get_ai_vision_response(
                    message if message else "Describe this image",
                    image
                )
            else:
                bot_reply = get_ai_response(context)

        except Exception as e:
            bot_reply = f"Error: {str(e)}"

        chat = ChatMessage.objects.create(
            user=request.user,
            user_message=message,
            bot_response=bot_reply,
            image=image
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
class PDFUploadAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        pdf = request.FILES.get("pdf")

        if not pdf:
            return Response(
                {"error": "PDF file required"},
                status=400
            )

        document = PDFDocument.objects.create(
            user=request.user,
            file=pdf
        )

        pdf_path = document.file.path

        # STEP 1: Extract text
        text = extract_pdf_text(pdf_path)

        print("FILES RECEIVED:", request.FILES)
        print("POST DATA:", request.POST)
        print("TEXT LENGTH:", len(text))
        print("TEXT SAMPLE:", text[:300])

        if not text.strip():
            return Response(
                {"error": "PDF has no readable text (maybe scanned PDF)"},
                status=400
            )

        # STEP 2: Split into chunks
        chunks = split_text(text)

        print("CHUNKS:", len(chunks))

        if not chunks:
            return Response(
                {"error": "No chunks generated from PDF"},
                status=400
            )

        # STEP 3: Create vector store
        create_vector_store(chunks)

        return Response({
            "message": "PDF uploaded successfully"
        })


