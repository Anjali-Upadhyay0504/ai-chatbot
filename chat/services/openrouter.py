import requests
from django.conf import settings

def openrouter_call(prompt):
    url = "https://openrouter.ai/api/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    data = {
        "model": "deepseek/deepseek-r1",
        "messages": [{"role": "user", "content": prompt}]
    }

    r = requests.post(url, json=data, headers=headers)

    return r.json()["choices"][0]["message"]["content"]