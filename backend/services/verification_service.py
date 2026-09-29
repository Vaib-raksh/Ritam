def verify_evidence(evidence):

    if not evidence:
        return {
            "supported": False,
            "reason": "No approved evidence was retrieved."
        }

    valid_evidence = [
        item for item in evidence
        if item.get("text", "").strip()
    ]

    if not valid_evidence:
        return {
            "supported": False,
            "reason": "Retrieved evidence contains no usable text."
        }

    return {
        "supported": True,
        "reason": "Approved evidence retrieved.",
        "evidence_count": len(valid_evidence)
    }