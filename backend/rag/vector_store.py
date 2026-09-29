from sentence_transformers import SentenceTransformer
import chromadb

from backend.rag.pdf_loader import load_drug_pdf
from backend.rag.chunker import chunk_pages


# Embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

# ChromaDB
client = chromadb.PersistentClient(path="backend/rag/chroma_db")

collection = client.get_or_create_collection(
    name="ritam_drugs"
)


def add_drug_to_database(drug_name):

    pages = load_drug_pdf(drug_name)
    chunks = chunk_pages(pages)

    for index, chunk in enumerate(chunks):

        embedding = model.encode(chunk["text"]).tolist()

        collection.add(
            ids=[f"{drug_name}_{index}"],
            embeddings=[embedding],
            documents=[chunk["text"]],
            metadatas=[{
                "drug": chunk["drug"],
                "page": chunk["page"],
                "source": chunk["source"]
            }]
        )

    print(f"{drug_name}: {len(chunks)} chunks added")


if __name__ == "__main__":

    for drug in ["amoxicillin", "metformin", "cetirizine"]:
        add_drug_to_database(drug)

    print("\nTotal chunks in ChromaDB:", collection.count())