import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY")
)


def generate_rag_answer(question, drug_name, evidence, mode="patient"):

    # Build evidence text
    evidence_text = ""

    for i, item in enumerate(evidence):
        evidence_text += f"""
SOURCE {i + 1}
Drug: {item['drug']}
Page: {item['page']}
Source: {item['source']}

Content:
{item['text']}
-------------------------
"""

    # Mode-specific instructions
    if mode == "caregiver":

        mode_instruction = """
You are answering in CAREGIVER MODE.

The user is helping another person who takes this medication.

Explain the approved information in a practical,
easy-to-understand way for a caregiver.

Focus only on information supported by the evidence, such as:
- how the medicine should be taken
- documented warnings
- documented side effects or symptoms
- documented instructions about when to contact a healthcare provider

Do NOT invent caregiver responsibilities.
Do NOT give additional medical advice.
Do NOT diagnose anyone.
"""

    else:

        mode_instruction = """
You are answering in PATIENT MODE.

Explain the approved medication information directly
to the person taking the medicine.
"""

    prompt = f"""
You are Ritam, an AI medication information companion.

Your job is to explain information about a specific medication
using ONLY the approved evidence provided below.

MEDICATION:
{drug_name}

PATIENT QUESTION:
{question}

MODE:
{mode}

{mode_instruction}

APPROVED EVIDENCE:
{evidence_text}

STRICT RULES:

1. Use ONLY facts explicitly stated in the APPROVED EVIDENCE.

2. Do NOT use general medical knowledge, even if you believe
the information is medically correct.

3. Do NOT add recommendations, instructions, precautions,
or advice that are not explicitly present in the evidence.

4. Do NOT infer a medical conclusion from the evidence.
Only explain what the document states.

5. Do NOT combine separate facts into a new medical claim
that the document does not explicitly make.

6. If the evidence does not directly answer the question,
say exactly:

"I couldn't find that information in the approved drug
document, so I don't want to guess."

7. You may simplify medical terminology, but the meaning
must remain the same as the source.

8. Preserve important warnings and conditions exactly.

9. Do not diagnose the patient.

10. Do not prescribe, change, start, stop, or recommend
medication unless the approved evidence explicitly gives
that instruction.

11. Every factual statement in the answer must be supported
by one or more of the supplied SOURCE sections.

12. Mention the page number immediately after the relevant
information, for example:
"Metformin should not be taken by people with kidney
problems. (Page 22)"

13. Do not cite a page merely because it was retrieved.
Only cite pages that actually support the statement.

14. Do not mention information about other medications.

15. Do not add a concluding recommendation that is not
present in the approved evidence.

16. If only part of the question is supported, answer only
that part and clearly state that the remaining information
was not found."""

    response = client.chat.completions.create(
        model="openrouter/free",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are Ritam. "
                    "You must strictly follow the approved "
                    "evidence provided by the application."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response.choices[0].message.content


if __name__ == "__main__":
    print("Ritam OpenRouter service loaded successfully.")

import json


def check_drug_claim(question, drug_name, evidence):

    evidence_text = ""

    for i, item in enumerate(evidence):
        evidence_text += f"""
SOURCE {i + 1}
Page: {item['page']}
Drug: {item['drug']}

Content:
{item['text']}
-------------------------
"""

    prompt = f"""
You are Ritam, an AI medication information companion.

The user has made a claim about a specific medication.

Your job is ONLY to determine whether the approved drug
document supports, contradicts, or mentions the claim.

MEDICATION:
{drug_name}

USER CLAIM:
{question}

APPROVED EVIDENCE:
{evidence_text}

Use ONLY the approved evidence.

Classify the claim as exactly ONE of:

SUPPORTED
The evidence directly supports the claim.

CONTRADICTED
The evidence directly says something that conflicts with
the claim.

NOT_MENTIONED
The approved evidence does not contain enough information
to support or contradict the claim.

UNCLEAR
The evidence discusses the topic but is not clear enough
to determine whether the claim is supported or contradicted.

IMPORTANT:

- Do not use general medical knowledge.
- Do not guess.
- Do not treat missing information as false.
- Do not make medical recommendations.
- Do not add facts that are not in the evidence.
- Keep the explanation simple.
- Return only valid JSON.
- source_indices must contain only the source numbers that
  directly support your classification.

Return exactly this structure:

{{
    "status": "SUPPORTED",
    "explanation": "Simple explanation based only on the document.",
    "source_indices": [1]
}}
"""

    response = client.chat.completions.create(
        model="openrouter/free",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are Ritam. "
                    "You must classify claims only from the "
                    "approved evidence provided."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    raw_answer = response.choices[0].message.content.strip()

    try:
        result = json.loads(raw_answer)

    except json.JSONDecodeError:
        return {
            "status": "UNCLEAR",
            "explanation": (
                "I couldn't determine this claim from the "
                "approved drug document."
            ),
            "source_indices": []
        }

    return result    