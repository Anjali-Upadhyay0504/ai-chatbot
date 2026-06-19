
from django.db import models
from django.contrib.auth.models import User

class ChatSession(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="chat_sessions"
    )

    title = models.CharField(
        max_length=255,
        default="New Chat"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )
class ChatMessage(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="chat_messages"
    )

    user_message = models.TextField()

    bot_response = models.TextField()



    image = models.ImageField(
        upload_to='chat_images/',
        blank=True,
        null=True
    )

    pdf = models.FileField(
    upload_to="chat_pdfs/",
    blank=True,
    null=True
)
    session = models.ForeignKey(
    ChatSession,
    on_delete=models.CASCADE,
    related_name="messages",
    null=True,
    blank=True
)
    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.user.username}: {self.user_message[:30]}"

    

 

class PDFDocument(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    file = models.FileField(upload_to="pdfs/")
    uploaded_at = models.DateTimeField(auto_now_add=True)
