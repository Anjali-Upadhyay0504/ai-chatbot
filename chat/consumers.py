import json

from channels.generic.websocket import AsyncWebsocketConsumer



class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):

        print("Connected")

        await self.accept()

    async def disconnect(self, close_code):

        print("Disconnected")

    async def receive(self, text_data):

        data = json.loads(text_data)

        user_message = data.get("message")

        bot_response = f"You said: {user_message}"

        await self.send(
            text_data=json.dumps({
                "response": bot_response
            })
        )