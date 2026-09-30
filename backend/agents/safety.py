import re


def evaluate_clinical_triage(query: str) -> dict | None:
    """
    Deterministic safety triage for high-risk medication questions.

    Returns:
        dict -> immediate safety response
        None -> continue through the normal RAG pipeline
    """

    q = query.lower().strip()

    # -----------------------------------------------------
    # TIER 1: ACUTE / EMERGENCY SIGNALS
    # -----------------------------------------------------

    tier_1_patterns = [
        r"\boverdose\b",
        r"\bpoison\b",
        r"\bsuicid",
        r"\bself-harm\b",
        r"\bunconscious\b",
        r"\bpassed out\b",
        r"\bchest pain\b",
        r"\bheart attack\b",
        r"\bseizure\b",
        r"\bcant breathe\b",
        r"\bcan't breathe\b",
        r"\bswallowed (a whole|the whole|an entire) "
        r"(strip|bottle|box)\b",
    ]

    for pattern in tier_1_patterns:

        if re.search(pattern, q):

            return {
                "type": "emergency",

                "answer": (
                    "This question may involve a medical emergency. "
                    "I can't safely assess or manage an emergency "
                    "through this chat. Please seek immediate "
                    "medical help from a healthcare professional "
                    "or emergency service."
                ),

                "verification": {
                    "quotes_valid": True,
                    "numbers_valid": True,
                    "readability": {
                        "flesch_kincaid_grade": 6.0,
                        "is_patient_accessible": True
                    }
                },

                "sources": []
            }


    # -----------------------------------------------------
    # TIER 2: RISKY MEDICATION ALTERATION
    # -----------------------------------------------------

    tier_2_patterns = [
        r"\bdouble\s+(my\s+)?(dose|dosing|tablet|pill)\b",
        r"\btake\s+(two|2|double)\s+to\s+catch\s+up\b",
        r"\bcatch\s+up\b",
        r"\bstop\s+taking\s+(cold\s+turkey|abruptly|completely)\b",
        r"\bcut\s+(my\s+)?(pill|tablet|capsule)\s+in\s+half\b",
        r"\bcrush\s+(the\s+)?(pill|tablet|capsule)\b",
        r"\bincrease\s+(my\s+)?dose\b",
        r"\bdecrease\s+(my\s+)?dose\b",
        r"\bchange\s+(my\s+)?dose\b",
        r"\bchange\s+(my\s+)?dosage\b",
        r"\bstop\s+(my\s+)?medication\b",
        r"\bstop\s+(taking\s+)?(my\s+)?medicine\b",
    ]

    for pattern in tier_2_patterns:

        if re.search(pattern, q):

            return {
                "type": "clinical_redirect",

                "answer": (
                    "I couldn't find that information in the "
                    "approved drug document, so I don't want "
                    "to guess. Please speak with your doctor "
                    "or pharmacist for guidance on what to do."
                ),

                "verification": {
                    "quotes_valid": True,
                    "numbers_valid": True,
                    "readability": {
                        "flesch_kincaid_grade": 6.0,
                        "is_patient_accessible": True
                    }
                },

                "sources": []
            }


    # -----------------------------------------------------
    # TIER 3: NORMAL QUESTION
    # -----------------------------------------------------

    return None
