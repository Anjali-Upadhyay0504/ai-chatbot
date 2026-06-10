import requests
from django.conf import settings

def gemini_call(prompt):

    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": settings.GEMINI_API_KEY
    }

    data = {
        "contents": [{
            "parts": [{"text": prompt}]
        }]
    }

    response = requests.post(url, json=data, headers=headers)

    # 🔥 IMPORTANT: status check
    if response.status_code != 200:
        raise Exception(f"Gemini Error: {response.text}")

    result = response.json()

    return result["candidates"][0]["content"]["parts"][0]["text"]