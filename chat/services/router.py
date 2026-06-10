from .gemini import gemini_call
from .groq import groq_call
from .openrouter import openrouter_call


def get_ai_response(prompt):

    # 🧠 1. Gemini (Primary - can fail quota)
    try:
        print("🔵 Trying Gemini...")
        response = gemini_call(prompt)

        if response and not str(response).startswith("Error"):
            return response

    except Exception as e:
        print("❌ Gemini failed:", e)


    # ⚡ 2. Groq (Fast fallback)
    try:
        print("🟢 Trying Groq...")
        response = groq_call(prompt)

        if response:
            return response

    except Exception as e:
        print("❌ Groq failed:", e)


    # 🌐 3. OpenRouter (Final backup - DeepSeek etc.)
    try:
        print("🟣 Trying OpenRouter...")
        response = openrouter_call(prompt)

        if response:
            return response

    except Exception as e:
        print("❌ OpenRouter failed:", e)


    # 🚨 If everything fails
    return "⚠️ Service temporarily unavailable. Please try again later."