from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
import os

embedding_model = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

# ==========================
# CREATE VECTOR STORE
# ==========================
def create_vector_store(chunks, user_id):

    if not chunks:
        print("No chunks")
        return

    try:
        vector_db = FAISS.from_texts(
            chunks,
            embedding_model
        )

        db_path = f"faiss_index/user_{user_id}"

        os.makedirs(db_path, exist_ok=True)

        vector_db.save_local(db_path)

        print(f"Saved FAISS index: {db_path}")

    except Exception as e:
        print("FAISS ERROR:", str(e))


# ==========================
# SEARCH PDF
# ==========================
def search_pdf(question, user_id):

    db_path = f"faiss_index/user_{user_id}"

    if not os.path.exists(db_path):
        print("FAISS index not found")
        return []

    vector_db = FAISS.load_local(
        db_path,
        embedding_model,
        allow_dangerous_deserialization=True
    )

    docs = vector_db.similarity_search(
        question,
        k=3
    )

    return docs


# ==========================
# GET PDF CONTEXT
# ==========================
def get_pdf_context(question, user_id):

    docs = search_pdf(question, user_id)

    context = ""

    for doc in docs:
        context += doc.page_content + "\n\n"

    return context