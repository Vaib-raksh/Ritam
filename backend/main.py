from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from pathlib import Path

from backend.agents.ritam_agent import ask_ritam
from backend.rag.search import search_drug
from backend.services.gemini_services import check_drug_claim
from backend.services.journey_service import build_journey
from backend.agents.safety import evaluate_clinical_triage


app = FastAPI(title="Ritam API")


# --------------------------------------------------
# DRUG PDF FILES
# --------------------------------------------------

DRUGS_DIR = Path(__file__).resolve().parent / "data" / "drugs"

app.mount(
    "/drug-files",
    StaticFiles(directory=DRUGS_DIR),
    name="drug-files"
)


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://ritam-nine.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# REQUEST MODEL
# --------------------------------------------------

class ChatRequest(BaseModel):
    drug: str
    question: str
    mode: str = "patient"


# --------------------------------------------------
# ROOT
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "Ritam API is running"
    }


# --------------------------------------------------
# CHAT
# --------------------------------------------------
@app.post("/chat")
def chat(request: ChatRequest):

    # -----------------------------------------------------
    # DETERMINISTIC SAFETY TRIAGE
    # -----------------------------------------------------

    triage_alert = evaluate_clinical_triage(request.question)

    if triage_alert:
        return triage_alert

    # -----------------------------------------------------
    # NORMAL RITAM PIPELINE
    # -----------------------------------------------------

    result = ask_ritam(
        question=request.question,
        drug_name=request.drug,
        mode=request.mode
    )

    return result

# --------------------------------------------------
# CLAIM CHECK
# --------------------------------------------------

@app.post("/claim-check")
def claim_check(request: ChatRequest):

    evidence = search_drug(
        question=request.question,
        drug_name=request.drug,
        top_k=3
    )

    result = check_drug_claim(
        question=request.question,
        drug_name=request.drug,
        evidence=evidence
    )

    sources = []

    for index in result.get("source_indices", []):

        if isinstance(index, int) and 1 <= index <= len(evidence):

            item = evidence[index - 1]

            sources.append({
                "page": item["page"],
                "source": item["source"],
                "pdf_url": (
                    f"/drug-files/"
                    f"{request.drug.lower()}/"
                    f"{item['source']}"
                    f"#page={item['page']}"
                )
            })

    return {
        "status": result.get(
            "status",
            "UNCLEAR"
        ),

        "explanation": result.get(
            "explanation",
            "I couldn't determine this claim from the approved drug document."
        ),

        "sources": sources
    }


# --------------------------------------------------
# MEDICATION JOURNEY
# --------------------------------------------------

@app.get("/journey/{drug_name}")
def journey(drug_name: str):

    return {
        "drug": drug_name,
        "journey": build_journey(drug_name)
    }