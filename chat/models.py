from django.db import models
from django.contrib.auth.models import User
# Create your models here.
# chat/models.py


class ChatMessage(models.Model):
    

    user_message = models.TextField()
    bot_response = models.TextField()

    image = models.ImageField(
        upload_to='chat_images/',
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.user_message