from .gemini import (
    gemini_call,
    gemini_vision_call
)
from .vector_store import get_pdf_context
from .groq import groq_call
from .openrouter import openrouter_call


# ==========================
# TEXT CHAT
# ==========================
def get_ai_response(prompt):

    # 1. Gemini
    try:

        print("🔵 Trying Gemini...")

        response = gemini_call(prompt)

        if response and not str(response).startswith("Error"):
            return response

    except Exception as e:

        print("❌ Gemini failed:", e)

    # 2. Groq
    try:

        print("🟢 Trying Groq...")

        response = groq_call(prompt)

        if response:
            return response

    except Exception as e:

        print("❌ Groq failed:", e)

    # 3. OpenRouter
    try:

        print("🟣 Trying OpenRouter...")

        response = openrouter_call(prompt)

        if response:
            return response

    except Exception as e:

        print("❌ OpenRouter failed:", e)

    return "⚠️ Service temporarily unavailable. Please try again later."


# ==========================
# IMAGE + TEXT CHAT
# ==========================
def get_ai_vision_response(
    prompt,
    image_file
):

    try:

        print("🖼️ Gemini Vision...")

        response = gemini_vision_call(
            prompt,
            image_file
        )

        if response:
            return response

    except Exception as e:

        print("❌ Gemini Vision failed:", e)

        return f"Vision Error: {str(e)}"

    return "⚠️ Unable to analyze image."

def get_pdf_response(question):

    try:

        context = get_pdf_context(question)

        prompt = f"""
You are a PDF assistant.

Answer ONLY from the provided PDF context.

If the answer is not present in the PDF context,
reply:

"I could not find this information in the uploaded PDF."

PDF Context:
{context}

Question:
{question}
"""

        return get_ai_response(prompt)

    except Exception as e:

        return f"PDF Error: {str(e)}"