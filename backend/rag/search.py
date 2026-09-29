from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from backend.rag.pdf_loader import load_drug_pdf
from backend.rag.chunker import chunk_pages


drug_chunks = {}
drug_vectorizers = {}
drug_matrices = {}


def prepare_drug(drug_name):

    if drug_name in drug_chunks:
        return

    pages = load_drug_pdf(drug_name)
    chunks = chunk_pages(pages)

    texts = [chunk["text"] for chunk in chunks]

    vectorizer = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2)
    )

    matrix = vectorizer.fit_transform(texts)

    drug_chunks[drug_name] = chunks
    drug_vectorizers[drug_name] = vectorizer
    drug_matrices[drug_name] = matrix


def search_drug(question, drug_name, top_k=3):

    prepare_drug(drug_name)

    vectorizer = drug_vectorizers[drug_name]
    matrix = drug_matrices[drug_name]
    chunks = drug_chunks[drug_name]

    question_vector = vectorizer.transform([question])

    similarities = cosine_similarity(
        question_vector,
        matrix
    )[0]

    ranked_indices = similarities.argsort()[::-1][:top_k]

    evidence = []

    for index in ranked_indices:

        chunk = chunks[index]

        evidence.append({
            "text": chunk["text"],
            "drug": chunk["drug"],
            "page": chunk["page"],
            "source": chunk["source"],
            "similarity": float(similarities[index])
        })

    return evidence


if __name__ == "__main__":

    question = "What should I know if I have kidney problems?"

    results = search_drug(
        question,
        "metformin",
        top_k=3
    )

    print("\n========== SEARCH RESULTS ==========\n")

    for i, result in enumerate(results, start=1):

        print(f"Result {i}")
        print("Page:", result["page"])
        print("Similarity:", result["similarity"])
        print("Text:", result["text"][:300])
        print("-----------------------------------")