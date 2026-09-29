from backend.rag.pdf_loader import load_drug_pdf


def chunk_pages(pages, chunk_size=1000):
    chunks = []

    for page in pages:
        text = page["text"]

        for start in range(0, len(text), chunk_size):
            chunk_text = text[start:start + chunk_size]

            chunks.append({
                "text": chunk_text,
                "drug": page["drug"],
                "page": page["page"],
                "source": page["source"]
            })

    return chunks


if __name__ == "__main__":

    for drug in ["amoxicillin", "metformin", "cetirizine"]:

        pages = load_drug_pdf(drug)
        chunks = chunk_pages(pages)

        print(f"\n{drug.upper()}")
        print(f"Pages: {len(pages)}")
        print(f"Chunks: {len(chunks)}")
        print("First chunk:")
        print(chunks[0]["text"][:300])