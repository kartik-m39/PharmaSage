import json
import re
import os
import uuid
from langchain_core.documents import Document
from langchain_nomic import NomicEmbeddings
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from dotenv import load_dotenv

load_dotenv()


def clean_html(text):
    """Strip HTML tags from section content."""
    return re.sub(r'<[^>]+>', '', text).strip()


# ── Load JSON ──────────────────────────────────────────────────────────────────
with open("MedData.json", "r", encoding="utf-8") as f:
    data = json.load(f)


# ── Build documents ────────────────────────────────────────────────────────────
docs = []
for item in data:
    medname = item["medicine"]
    sections = item.get("sections", {})
    meta_url = item.get("meta", {}).get("url", "")
    date_modified = item.get("meta", {}).get("dateModified", "")

    combined_content = f"Medicine: {medname}\n\n"
    for section_title, section_content in sections.items():
        cleaned = clean_html(section_content)
        if cleaned:
            combined_content += f"### {section_title}\n{cleaned}\n\n"

    docs.append(
        Document(
            page_content=combined_content.strip(),
            metadata={
                "medicine": medname,
                "url": meta_url,
                "date_modified": date_modified,
            }
        )
    )

print(f"Total documents (1 per medicine): {len(docs)}")


# ── Embed ──────────────────────────────────────────────────────────────────────
embeddings = NomicEmbeddings(
    model="nomic-embed-text-v1.5",
    nomic_api_key=os.getenv("NOMIC_API_KEY"),
)

texts = [doc.page_content for doc in docs]
vectors = embeddings.embed_documents(texts)
print(f"Generated {len(vectors)} embeddings (dim={len(vectors[0])})")


# ── Qdrant — create collection + upload ────────────────────────────────────────
COLLECTION_NAME = "MedData"
VECTOR_DIM = len(vectors[0])   # 768 for nomic-embed-text-v1.5

client = QdrantClient(
    url=os.getenv("QDRANT_URL"),
    api_key=os.getenv("QDRANT_API_KEY"),
)

# Recreate collection (drops existing one if present)
if client.collection_exists(COLLECTION_NAME):
    client.delete_collection(COLLECTION_NAME)
    print(f"Deleted existing collection '{COLLECTION_NAME}'")

client.create_collection(
    collection_name=COLLECTION_NAME,
    vectors_config=VectorParams(size=VECTOR_DIM, distance=Distance.COSINE),
)
print(f"Created collection '{COLLECTION_NAME}'")

# Build points
points = [
    PointStruct(
        id=str(uuid.uuid4()),
        vector=vector,
        payload={
            "page_content": doc.page_content,
            **doc.metadata,
        }
    )
    for doc, vector in zip(docs, vectors)
]

# Upload in batches of 100
BATCH_SIZE = 100
for i in range(0, len(points), BATCH_SIZE):
    batch = points[i: i + BATCH_SIZE]
    client.upsert(collection_name=COLLECTION_NAME, points=batch)
    print(f"Uploaded batch {i // BATCH_SIZE + 1} ({len(batch)} docs)")

print(f"\nDone! Uploaded {len(docs)} documents to Qdrant collection '{COLLECTION_NAME}'")