from backend.rag.pdf_loader import load_drug_pdf


JOURNEY_SECTIONS = {
    "why": {
        "title": "Why is this medicine used?",
        "starts": [
            "INDICATIONS AND USAGE"
        ],
        "stops": [
            "DOSAGE AND ADMINISTRATION"
        ]
    },

    "how": {
        "title": "How should I take it?",
        "starts": [
            "DOSAGE AND ADMINISTRATION"
        ],
        "stops": [
            "DOSAGE FORMS AND STRENGTHS",
            "CONTRAINDICATIONS",
            "WARNINGS AND PRECAUTIONS",
            "RENAL IMPAIRMENT"
        ]
    },

    "watch": {
        "title": "What might I experience?",
        "starts": [
            "ADVERSE REACTIONS"
        ],
        "stops": [
            "DRUG INTERACTIONS",
            "USE IN SPECIFIC POPULATIONS"
        ]
    },

    "warn": {
        "title": "What should I watch for?",
        "starts": [
            "WARNING: LACTIC ACIDOSIS",
            "WARNINGS AND PRECAUTIONS"
        ],
        "stops": [
            "RECENT MAJOR CHANGES",
            "INDICATIONS AND USAGE",
            "ADVERSE REACTIONS"
        ]
    },

    "food": {
        "title": "Food and daily life",
        "starts": [
            "What should I avoid while taking Metformin Hydrochloride Tablets?",
            "Do not drink a lot of alcoholic drinks while taking Metformin Hydrochloride Tablets."
        ],
        "stops": [
            "What are the side effects of Metformin Hydrochloride Tablets?",
            "If you miss a dose",
            "If you take too much"
        ]
    },

    "missed_dose": {
        "title": "What if I miss a dose?",
        "starts": [
            "If you miss a dose of Metformin Hydrochloride Tablets"
        ],
        "stops": [
            "If you take too much Metformin Hydrochloride Tablets"
        ]
    }
}


def extract_section(text, starts, stops):

    lower_text = text.lower()

    best_start = None

    # Find the first matching start heading
    for start_keyword in starts:

        position = lower_text.find(
            start_keyword.lower()
        )

        if position != -1:

            if best_start is None or position < best_start:
                best_start = position

    if best_start is None:
        return None

    # Find the nearest stopping heading after start
    best_end = len(text)

    for stop_keyword in stops:

        position = lower_text.find(
            stop_keyword.lower(),
            best_start + 1
        )

        if position != -1 and position < best_end:
            best_end = position

    snippet = text[best_start:best_end].strip()

    return snippet


def find_section(pages, starts, stops):

    for page in pages:

        snippet = extract_section(
            page["text"],
            starts,
            stops
        )

        if snippet:

            return {
                "content": snippet,
                "page": page["page"],
                "source": page["source"]
            }

    return None


def build_journey(drug_name):

    pages = load_drug_pdf(drug_name)

    journey = []

    for section_id, section in JOURNEY_SECTIONS.items():

        result = find_section(
            pages,
            section["starts"],
            section["stops"]
        )

        if result:

            journey.append({
                "id": section_id,
                "title": section["title"],
                "content": result["content"],
                "sources": [
                    {
                        "page": result["page"],
                        "source": result["source"]
                    }
                ]
            })

        else:

            journey.append({
                "id": section_id,
                "title": section["title"],
                "content": (
                    "I couldn't find this information in "
                    "the approved drug document."
                ),
                "sources": []
            })

    return journey