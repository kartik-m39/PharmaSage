# PharmaSage RAG Agent

A serverless RAG (Retrieval-Augmented Generation) endpoint for querying medical and pharmaceutical information — built with Nomic embeddings, Qdrant vector search, Azure OpenAI, and deployed via Azure Functions.

---

## 🏗️ How It Works

```
User Query
    │
    ▼
Embed query via Nomic API
    │
    ▼
Semantic search in Qdrant (top-K relevant chunks)
    │
    ▼
Pass retrieved context → Azure OpenAI (GPT)
    │
    ▼
Response
```

**Components:**

| Component | Role |
|---|---|
| [Nomic Embed](https://www.nomic.ai/) | Converts queries into vector embeddings |
| [Qdrant Cloud](https://qdrant.tech/) | Stores and searches embedded medical data |
| [Azure OpenAI](https://azure.microsoft.com/en-us/products/ai-services/openai-service) | Generates grounded answers from retrieved context |
| [LangChain](https://www.langchain.com/) | RAG orchestration |
| [Azure Functions](https://azure.microsoft.com/en-us/products/functions) | Serverless deployment |

---

## 📁 Project Structure

```
Rag_Agent/
├── function_app.py      # Main Azure Function — RAG query handler (production)
├── host.json            # Azure Function configuration
├── requirements.txt     # Python dependencies
├── local.settings.json  # Local env variables (git-ignored)
├── .funcignore          # Deployment exclusions
├── .gitignore
├── test_function.py     # Local testing script
├── query.py             # Flask prototype (not deployed)
├── ingestion.py         # One-time data ingestion script (not deployed)
└── MedData.json         # Source dataset (not deployed)
```

---

## 🚀 Running Locally

### Prerequisites

- Python 3.10+
- [Azure Functions Core Tools](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local)
- Qdrant instance (local or cloud) with data already ingested
- Nomic API key
- Azure OpenAI deployment

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Set up environment variables

Create a `local.settings.json` in the root:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "",
    "FUNCTIONS_WORKER_RUNTIME": "python",
    "NOMIC_API_KEY": "your_nomic_api_key",
    "QDRANT_URL": "your_qdrant_url",
    "QDRANT_API_KEY": "your_qdrant_api_key",
    "QDRANT_COLLECTION_NAME": "med_data",
    "AZURE_OPENAI_API_KEY": "your_azure_openai_key",
    "AZURE_OPENAI_ENDPOINT": "your_azure_openai_endpoint",
    "AZURE_OPENAI_DEPLOYMENT": "your_deployment_name"
  }
}
```

### 3. (First time only) Ingest the data

```bash
python ingestion.py
```

Chunks and embeds `MedData.json`, then upserts everything into Qdrant. Only needs to be run once.

### 4. Start the function

```bash
func start
```

---

## 📋 API Reference

### `POST /api/query`

**Request body:**

```json
{
  "query": "What is aspirin used for?",
  "mode": "llm"
}
```

**Modes:**

| Mode | Description |
|---|---|
| `llm` | AI-generated answer using retrieved context (default) |
| `retriever` | Returns raw matched chunks from Qdrant |
| `clean` | Extracted relevant sentences, no LLM involved |

**Success response:**

```json
{
  "query": "What is aspirin used for?",
  "mode": "llm",
  "response": "Aspirin is used for pain relief, fever reduction, and as an anti-inflammatory..."
}
```

**Error response:**

```json
{
  "error": "Error description"
}
```

### Example — curl

```bash
curl -X POST https://<your-function-app>.azurewebsites.net/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What are the side effects of metformin?", "mode": "llm"}'
```

### Example — Python

```python
import requests

res = requests.post(
    "https://<your-function-app>.azurewebsites.net/api/query",
    json={"query": "What is the dosage for ibuprofen?", "mode": "llm"}
)
print(res.json()["response"])
```

---

## ☁️ Deploying to Azure

```bash
func azure functionapp publish <your-function-app-name>
```

Set your environment variables in Azure:

```bash
az functionapp config appsettings set \
  --name <your-function-app-name> \
  --resource-group <your-resource-group> \
  --settings \
    NOMIC_API_KEY="..." \
    QDRANT_URL="..." \
    QDRANT_API_KEY="..." \
    QDRANT_COLLECTION_NAME="med_data" \
    AZURE_OPENAI_API_KEY="..." \
    AZURE_OPENAI_ENDPOINT="..." \
    AZURE_OPENAI_DEPLOYMENT="..."
```

---

## 🔒 Notes

- `local.settings.json` is git-ignored — never commit it.
- `MedData.json` and `ingestion.py` are excluded from deployment via `.funcignore`.
- For production, manage secrets through Azure App Settings or Azure Key Vault.