import google.generativeai as genai
from django.conf import settings
from PIL import Image

# Configure Gemini
genai.configure(
    api_key=settings.GEMINI_API_KEY
)

# Load Model
model = genai.GenerativeModel(
    "gemini-2.5-flash"
)


# ==========================
# TEXT CHAT
# ==========================
def gemini_call(prompt):

    response = model.generate_content(
        prompt
    )

    return response.text


# ==========================
# IMAGE + TEXT CHAT
# ==========================
def gemini_vision_call(
    prompt,
    image_file
):

    image = Image.open(
        image_file
    )

    response = model.generate_content(
        [
            prompt,
            image
        ]
    )

    return response.text