import azure.functions as func
import json
import os
from dotenv import load_dotenv
from langchain_nomic import NomicEmbeddings
from langchain_openai import AzureChatOpenAI
from langchain_qdrant import QdrantVectorStore
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from qdrant_client import QdrantClient

load_dotenv()

# ── Setup (runs once on cold start) ───────────────────────────────────────────
client = QdrantClient(
    url=os.getenv("QDRANT_URL"),
    api_key=os.getenv("QDRANT_API_KEY")
)

embeddings = NomicEmbeddings(
    model="nomic-embed-text-v1.5",
    nomic_api_key=os.getenv("NOMIC_API_KEY"),
)

data_store = QdrantVectorStore(
    client=client,
    embedding=embeddings,
    collection_name="MedData",
    content_payload_key="page_content",
)

retriever = data_store.as_retriever(search_kwargs={"k": 3})

llm = AzureChatOpenAI(
    azure_endpoint=os.getenv("AZURE_ENDPOINT"),
    api_key=os.getenv("AZURE_API_KEY"),
    azure_deployment=os.getenv("AZURE_DEPLOYMENT"),
    api_version=os.getenv("AZURE_API_VERSION"),
    temperature=0
)

prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a knowledgeable assistant for a medical database.
Only answer based on the provided context.
Keep your response concise, factual, and in Markdown format.
If the answer is not found in the context, say: 'I don't know based on the provided documents'."""),
    ("human", "Context:\n{context}\n\nQuestion: {question}")
])

def format_docs(docs):
    return "\n\n---\n\n".join([d.page_content for d in docs])

rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

def make_clean_response(docs, max_sentences=3):
    text = " ".join([d.page_content for d in docs])
    sentences = [s.strip() for s in text.replace("\n", " ").split(". ") if s.strip()]
    return ". ".join(sentences[:max_sentences]) + "."


# ── Azure Function ─────────────────────────────────────────────────────────────
app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

@app.route(route="query", methods=["POST"])
def query_endpoint(req: func.HttpRequest) -> func.HttpResponse:
    try:
        body = req.get_json()
    except ValueError:
        return func.HttpResponse(
            json.dumps({"error": "Invalid JSON body"}),
            status_code=400,
            mimetype="application/json"
        )

    query = body.get("query")
    mode = body.get("mode", "llm").lower()

    if not query:
        return func.HttpResponse(
            json.dumps({"error": "Query is required"}),
            status_code=400,
            mimetype="application/json"
        )

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
            return func.HttpResponse(
                json.dumps({"error": "Invalid mode. Choose from: llm / retriever / clean"}),
                status_code=400,
                mimetype="application/json"
            )

        return func.HttpResponse(
            json.dumps({"query": query, "mode": mode, "response": response}),
            status_code=200,
            mimetype="application/json"
        )

    except Exception as e:
        return func.HttpResponse(
            json.dumps({"error": str(e)}),
            status_code=500,
            mimetype="application/json"
        )