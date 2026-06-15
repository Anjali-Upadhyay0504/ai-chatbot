from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings

embedding_model = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)


def create_vector_store(chunks):

    if not chunks:
        raise ValueError("❌ No chunks found. PDF text extraction failed.")

    vector_db = FAISS.from_texts(
        chunks,
        embedding_model
    )

    vector_db.save_local("faiss_index")
def search_pdf(question):

    vector_db = FAISS.load_local(
        "faiss_index",
        embedding_model,
        allow_dangerous_deserialization=True
    )

    docs = vector_db.similarity_search(
        question,
        k=3
    )

    return docs
def get_pdf_context(question):

    docs = search_pdf(question)

    context = ""

    for doc in docs:
        context += doc.page_content + "\n\n"

    return context