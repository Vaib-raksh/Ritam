import pymupdf
from pathlib import Path


DRUGS_DIR = Path(__file__).resolve().parent.parent / "data" / "drugs"


def load_drug_pdf(drug_name):

    pdf_path = DRUGS_DIR / drug_name / f"{drug_name.upper()}.pdf"

    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    document = pymupdf.open(pdf_path)

    pages = []

    for page_number, page in enumerate(document, start=1):

        text = page.get_text("text").strip()

        if text:
            pages.append({
                "drug": drug_name,
                "page": page_number,
                "text": text,
                "source": pdf_path.name
            })

    document.close()

    return pages