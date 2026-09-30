# Ritam

Ritam is an evidence-grounded AI medication companion that transforms complex official drug documentation into simple, conversational, and traceable information for patients and caregivers.

The project combines Generative AI, Retrieval-Augmented Generation (RAG), document retrieval, evidence verification, deterministic safety guardrails, and an agent-based architecture to build a safer medication information experience.

## Overview

Ritam currently focuses on five core capabilities:

### 1. Evidence-Grounded Medication Assistant
- Answers natural-language questions about a selected medication.
- Uses only information retrieved from the approved drug document.
- Explains complex medical information at approximately a 6th-grade reading level.
- Provides page-level source references for factual answers.

### 2. Drug Knowledge Retrieval
- Extracts information from approved medication PDFs using PyMuPDF.
- Splits documents into smaller text chunks.
- Uses TF-IDF and cosine similarity to retrieve relevant information.
- Passes retrieved evidence to the LLM for answer generation.

### 3. Medication Safety Guardrails
- Uses deterministic safety triage before the RAG pipeline.
- Detects potentially risky medication-alteration questions.
- Intercepts emergency-like queries.
- Prevents general dosage information from being automatically turned into personalized dosing instructions.
- Uses additional prompt-level safety rules as a second layer of protection.

### 4. Claim Verification
- Allows users to check claims about a medication against the approved document.
- Classifies claims as:
  - SUPPORTED
  - CONTRADICTED
  - NOT_MENTIONED
  - UNCLEAR
- Provides the relevant source pages when available.

### 5. Medication Journey
- Organizes important medication information into a structured journey.
- Includes sections such as:
  - Why is this medicine used?
  - How should I take it?
  - What might I experience?
  - What should I watch for?
  - Food and daily life
  - What if I miss a dose?
- Uses deterministic document section extraction instead of generating unsupported information.

## System Architecture

```text
User
 |
 v
Ritam AI Assistant
 |
 +-------------------------+
 |                         |
 v                         v
Safety Triage          Drug Document
 |                         |
 |                    PyMuPDF
 |                         |
 |                    Text Chunks
 |                         |
 |                    TF-IDF Search
 |                         |
 |                    Cosine Similarity
 |                         |
 +------------+------------+
              |
              v
       Evidence Verification
              |
              v
        OpenRouter LLM
              |
              v
   Evidence-Grounded Response
              |
              v
       Page-Level Sources
````

The project also includes an agent-based workflow that coordinates safety triage, drug-specific retrieval, evidence verification, answer generation, claim checking, and medication journey generation.

## Technology Stack

| Category        | Technology                                         |
| --------------- | -------------------------------------------------- |
| Programming     | Python                                             |
| Generative AI   | OpenRouter                                         |
| AI Agents       | Agent-based orchestration                          |
| RAG             | TF-IDF, Cosine Similarity                          |
| PDF Processing  | PyMuPDF                                            |
| Backend         | FastAPI                                            |
| Frontend        | React, Vite                                        |
| Safety          | Deterministic rule-based triage, Prompt Guardrails |
| Deployment      | Vercel, Render                                     |
| Environment     | python-dotenv                                      |
| Version Control | Git, GitHub                                        |

## Approved Drug Documents

Ritam currently works with approved drug documentation for:

```text
Metformin
Amoxicillin
Cetirizine
```

The documents are organized by medication:

```text
drugs
 |
 +-- amoxicillin
 |     |
 |     +-- AMOXICILLIN.pdf
 |
 +-- metformin
 |     |
 |     +-- METFORMIN.pdf
 |
 +-- cetirizine
       |
       +-- CETIRIZINE.pdf
```

The system uses the selected medication's document as the approved knowledge source for the conversation.

## Safety Architecture

Ritam follows a layered safety approach.

```text
User Question
      |
      v
Safety Triage
      |
      +------ Risky ------> Safe Redirect
      |
      +------ Normal -----> RAG Retrieval
                                  |
                                  v
                           Evidence Verification
                                  |
                                  v
                                 LLM
                                  |
                                  v
                         Source-Grounded Answer
```

The core principle is:

```text
No evidence → No answer
```

If the approved drug document does not directly answer a question, Ritam does not attempt to fill the missing information using general medical knowledge.

For example, a question such as:

```text
Can I increase my metformin dose?
```

is intercepted by the safety layer instead of allowing the LLM to interpret general dosage information as personalized medical advice.

## Project Structure

```text
Ritam/
|
├── backend/
│   ├── agents/
│   │   ├── ritam_agent.py
│   │   └── safety.py
│   │
│   ├── data/
│   │   └── drugs/
│   │       ├── amoxicillin/
│   │       │   └── AMOXICILLIN.pdf
│   │       ├── metformin/
│   │       │   └── METFORMIN.pdf
│   │       └── cetirizine/
│   │           └── CETIRIZINE.pdf
│   │
│   ├── rag/
│   │   ├── pdf_loader.py
│   │   ├── chunker.py
│   │   └── search.py
│   │
│   ├── services/
│   │   ├── gemini_services.py
│   │   ├── verification_service.py
│   │   └── journey_service.py
│   │
│   ├── main.py
│   └── __init__.py
│
├── frontend/
│
├── tests/
│
├── requirements.txt
├── .gitignore
└── README.md
```

## Example

**Input**

```text
What is metformin used for?
```

**Output**

```text
Metformin Hydrochloride Tablets are used with diet and
exercise to help control high blood sugar (hyperglycemia)
in adults with type 2 diabetes. (Page 22)
```

The response is generated from the approved medication document and includes a source page for traceability.

## Safety Example

**Input**

```text
Can I increase my metformin dose?
```

**Output**

```text
I couldn't find that information in the approved drug
document, so I don't want to guess. Please speak with
your doctor or pharmacist for guidance on what to do.
```

This prevents general dosage information in the source document from being interpreted as a personalized dosing recommendation.

## Setup

Clone the repository:

```bash
git clone https://github.com/Vaib-raksh/Ritam.git
cd Ritam
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```powershell
venv\Scripts\activate
```

Install the required dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file and add the required API key:

```env
OPENROUTER_API_KEY=your_api_key_here
```

Run the backend:

```bash
uvicorn backend.main:app --reload
```

Run the frontend:

```bash
cd frontend
npm install
npm run dev
```

Never commit API keys or `.env` files to the repository.

## Live Demo

**Frontend**

[https://ritam-nine.vercel.app](https://ritam-nine.vercel.app)

**Backend API**

[https://ritam-uf3b.onrender.com](https://ritam-uf3b.onrender.com)

**GitHub Repository**

[https://github.com/Vaib-raksh/Ritam](https://github.com/Vaib-raksh/Ritam)

## Disclaimer

Ritam is an educational and informational AI project designed to explain approved medication documentation.

It is not intended to diagnose medical conditions, prescribe medication, recommend personalized dosage changes, replace professional medical advice, or replace treatment provided by healthcare professionals.

For urgent or emergency medical situations, seek appropriate professional medical assistance.


This version is much closer to your **AaharWise README style**: concise, professional, project-focused, and easy for a recruiter/judge to scan.
```
