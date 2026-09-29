from backend.rag.search import search_drug
from backend.services.gemini_services import generate_rag_answer
from backend.services.verification_service import verify_evidence


def ask_ritam(question, drug_name, mode="patient"):

    # 1. Retrieve approved evidence
    evidence = search_drug(
        question,
        drug_name,
        top_k=3
    )

    # 2. Check whether useful evidence exists
    verification = verify_evidence(evidence)

    if not verification["supported"]:
        return {
            "answer": (
                "I couldn't find that information in the approved "
                "drug document, so I don't want to guess."
            ),
            "sources": []
        }

    # 3. Generate answer using the selected mode
    answer = generate_rag_answer(
        question=question,
        drug_name=drug_name,
        evidence=evidence,
        mode=mode
    )

    # 4. Prepare evidence sources
    sources = []

    for item in evidence:

        pdf_url = (
            f"/drug-files/"
            f"{drug_name.lower()}/"
            f"{item['source']}"
            f"#page={item['page']}"
        )

        sources.append({
            "page": item["page"],
            "source": item["source"],
            "pdf_url": pdf_url
        })

    return {
        "answer": answer,
        "sources": sources,
        "mode": mode
    }


if __name__ == "__main__":

    question = (
        "What should I know while helping someone take "
        "this medicine?"
    )

    result = ask_ritam(
        question,
        "metformin",
        mode="caregiver"
    )

    print("\n========== RITAM ==========\n")
    print(result["answer"])

    print("\n========== SOURCES ==========\n")

    for source in result["sources"]:
        print(
            f"Page {source['page']} - "
            f"{source['source']}"
        )

        print(
            f"PDF: {source['pdf_url']}"
        )