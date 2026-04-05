from flask import Flask, request, jsonify
from langchain_openai import AzureChatOpenAI
from langchain_nomic import NomicEmbeddings
from langchain_qdrant import QdrantVectorStore
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from qdrant_client import QdrantClient
import os
from dotenv import load_dotenv

load_dotenv()

# ── Qdrant client ──────────────────────────────────────────────────────────────
client = QdrantClient(
    url=os.getenv("QDRANT_URL"),
    api_key=os.getenv("QDRANT_API_KEY")
)

# ── Nomic embeddings (search_query mode at retrieval time) ─────────────────────
embeddings = NomicEmbeddings(
    model="nomic-embed-text-v1.5",
    nomic_api_key=os.getenv("NOMIC_API_KEY"),
)

# ── Vector store ───────────────────────────────────────────────────────────────
data_store = QdrantVectorStore(
    client=client,
    embedding=embeddings,
    collection_name="MedData",
    content_payload_key="page_content",   # matches what we stored in ingest.py
)

retriever = data_store.as_retriever(search_kwargs={"k": 3})

# ── LLM via OpenRouter ─────────────────────────────────────────────────────────
llm = AzureChatOpenAI(
    azure_endpoint=os.getenv("AZURE_ENDPOINT"),
    api_key=os.getenv("AZURE_API_KEY"),
    azure_deployment=os.getenv("AZURE_DEPLOYMENT"),
    api_version=os.getenv("AZURE_API_VERSION"),
    temperature=0
)

# ── Prompt ─────────────────────────────────────────────────────────────────────
prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a knowledgeable assistant for a medical database.
Only answer based on the provided context.
Keep your response concise, factual, and in Markdown format.
If the answer is not found in the context, say: 'I don't know based on the provided documents'."""),
    ("human", "Context:\n{context}\n\nQuestion: {question}")
])


# ── LCEL RAG chain (replaces deprecated RetrievalQA) ──────────────────────────
def format_docs(docs):
    return "\n\n---\n\n".join([d.page_content for d in docs])

rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)


# ── Naive sentence maker (no LLM) ─────────────────────────────────────────────
def make_clean_response(docs, max_sentences=3):
    text = " ".join([d.page_content for d in docs])
    sentences = [s.strip() for s in text.replace("\n", " ").split(". ") if s.strip()]
    return ". ".join(sentences[:max_sentences]) + "."


# ── Flask app ──────────────────────────────────────────────────────────────────
app = Flask(__name__)

@app.route("/query", methods=["POST"])
def query_endpoint():
    body = request.get_json()
    query = body.get("query")
    mode = body.get("mode", "llm").lower()

    if not query:
        return jsonify({"error": "Query is required"}), 400

    try:
        if mode == "llm":
            response = rag_chain.invoke(query)

        elif mode == "retriever":
            docs = retriever.invoke(query)
            response = "\n---\n".join([d.page_content for d in docs])

        elif mode == "clean":
            docs = retriever.invoke(query)
            response = make_clean_response(docs)

        else:
            return jsonify({"error": "Invalid mode. Choose from: llm / retriever / clean"}), 400

        return jsonify({
            "query": query,
            "mode": mode,
            "response": response
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)