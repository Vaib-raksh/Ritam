import os
import json

from dotenv import load_dotenv
from openai import OpenAI


load_dotenv()


client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY")
)


# =========================================================
# GENERATE RAG ANSWER
# =========================================================

def generate_rag_answer(
    question,
    drug_name,
    evidence,
    mode="patient"
):

    # -----------------------------------------------------
    # Build evidence text
    # -----------------------------------------------------

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


    # -----------------------------------------------------
    # Mode-specific instructions
    # -----------------------------------------------------

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


    # -----------------------------------------------------
    # Main prompt
    # -----------------------------------------------------

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

SAFETY GUARDRAIL:

If the user asks whether they should change, increase,
decrease, double, skip, start, stop, or otherwise alter
their medication dose or schedule:

1. Do not make the medication decision for the user.

2. Do not calculate or suggest a replacement dose.

3. Do not tell the user to double, skip, increase,
decrease, start, or stop a dose unless the approved
document explicitly gives that exact instruction.

4. Do not turn general dosage information into a
personalized dosing recommendation.

5. If the approved document does not directly answer
the user's specific situation, say:

"I couldn't find that information in the approved drug
document, so I don't want to guess. Please speak with
your doctor or pharmacist for guidance on what to do."

6. Do not use general medical knowledge to fill in
missing information.


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

7. Preserve important warnings and conditions exactly.

8. Do not diagnose the patient.

9. Do not prescribe, change, start, stop, or recommend
medication unless the approved evidence explicitly gives
that instruction.

10. Every factual statement in the answer must be supported
by one or more of the supplied SOURCE sections.

11. Mention the page number immediately after the relevant
information, for example:

"Metformin should not be taken by people with kidney
problems. (Page 22)"

12. Do not cite a page merely because it was retrieved.
Only cite pages that actually support the statement.

13. Do not mention information about other medications.

14. Do not add a concluding recommendation that is not
present in the approved evidence.

15. If only part of the question is supported, answer only
that part and clearly state that the remaining information
was not found.

16. FORMATTING RULES:

- Use plain text only.
- Do NOT use Markdown formatting.
- Do NOT use ** for bold text.
- Do NOT use * for italics.
- Do NOT use __ for bold text.
- Do NOT use Markdown headings such as # or ##.
- Do NOT use Markdown bullet syntax such as * or -.
- Do NOT wrap words or sentences in special formatting.
- Keep the answer clean and readable.
- You may use simple numbered lists when needed.

17. 6TH-GRADE READABILITY:

Explain the information at approximately a 6th-grade
reading level.

Use short, clear sentences.

Prefer familiar everyday words over complex medical
or technical words.

Keep one main idea per sentence whenever possible.

Avoid long or complicated sentence structures.

Do not assume the user understands medical terminology.

If a medical term is necessary, keep the medical term
but explain it immediately in simple language.

For example:

Instead of:
"Metformin may cause gastrointestinal adverse reactions."

Prefer:
"Metformin may cause stomach or digestive problems."

Do NOT change the medical meaning when simplifying.

Do NOT remove important medical terms, warnings,
conditions, numbers, instructions, or limitations.

Do NOT make the explanation childish or overly casual.

The goal is to make the approved information easier
to understand, not to change what the document says.

18. Every factual statement must still be supported by
the approved evidence.
"""
    # -----------------------------------------------------
    # Call OpenRouter
    # -----------------------------------------------------

    response = client.chat.completions.create(

        model="openrouter/free",

        messages=[
            {
                "role": "system",
                "content": (
                    "You are Ritam. "
                    "You must strictly follow the approved "
                    "evidence provided by the application. "
                    "Explain information at approximately a "
                    "6th-grade reading level while preserving "
                    "the original medical meaning. "
                    "Return answers in plain text without Markdown."
                )
            },

            {
                "role": "user",
                "content": prompt
            }
        ]
    )


    # -----------------------------------------------------
    # Get answer
    # -----------------------------------------------------

    answer = response.choices[0].message.content.strip()


    # -----------------------------------------------------
    # Remove accidental Markdown formatting
    # -----------------------------------------------------

    answer = answer.replace("**", "")
    answer = answer.replace("__", "")
    answer = answer.replace("*", "")


    return answer


# =========================================================
# CLAIM CHECKER
# =========================================================

def check_drug_claim(
    question,
    drug_name,
    evidence
):

    # -----------------------------------------------------
    # Build evidence text
    # -----------------------------------------------------

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


    # -----------------------------------------------------
    # Claim-check prompt
    # -----------------------------------------------------

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
- Do not use Markdown formatting.
- Do not use ** for bold text.
- Do not use * for italics.
- Use plain text only.

Return exactly this structure:

{{
    "status": "SUPPORTED",
    "explanation": "Simple explanation based only on the document.",
    "source_indices": [1]
}}
"""


    # -----------------------------------------------------
    # Call OpenRouter
    # -----------------------------------------------------

    response = client.chat.completions.create(

        model="openrouter/free",

        messages=[
            {
                "role": "system",
                "content": (
                    "You are Ritam. "
                    "You must classify claims only from the "
                    "approved evidence provided. "
                    "Return valid JSON only."
                )
            },

            {
                "role": "user",
                "content": prompt
            }
        ]
    )


    # -----------------------------------------------------
    # Read response
    # -----------------------------------------------------

    raw_answer = (
        response.choices[0]
        .message
        .content
        .strip()
    )


    # -----------------------------------------------------
    # Remove Markdown formatting if the explanation
    # accidentally contains it
    # -----------------------------------------------------

    raw_answer = raw_answer.replace("**", "")
    raw_answer = raw_answer.replace("__", "")


    # -----------------------------------------------------
    # Parse JSON
    # -----------------------------------------------------

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


# =========================================================
# TEST
# =========================================================

if __name__ == "__main__":

    print(
        "Ritam OpenRouter service loaded successfully."
    )