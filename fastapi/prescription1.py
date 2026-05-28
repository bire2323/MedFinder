import os
import json
import httpx
from PIL import Image
import pytesseract
from PIL import Image

# Import your local ML functions
from prescription_ml import extract_structured_prescription_ml, explain_prescription
from config import DISCLAIMER, LARAVEL_API_URL


def handle_prescription_ocr(image_path: str) -> dict:
    """
    Orchestrates OCR extraction and local BioBERT parsing 
    safely returning matching dictionary payloads to app.py
    """
    try:
        # 1. Run bilingual Tesseract OCR
        raw_text = extract_prescription_text(image_path)
        
        # 2. Extract medicine list array for Laravel database querying
        medicines_list = extract_medicines(raw_text)
        
        # 3. Generate patient-friendly explanation string via local templates
        explanation_text = explain_prescription(raw_text)
        
        # Build structured data maps matching app.py expectations
        return {
            "raw_text": raw_text,
            "ml_analysis": {
                "medicines": medicines_list,
                "explanation": explanation_text
            }
        }
    except Exception as e:
        print(f"[OCR Pipeline Wrapper Error]: {e}")
        return {
            "raw_text": "",
            "ml_analysis": {
                "medicines": [],
                "explanation": f"Failed to analyze prescription: {str(e)}"
            }
        }
def extract_prescription_text(image_path):
    # 'amh+eng' tells Tesseract to recognize both scripts simultaneously
    text = pytesseract.image_to_string(Image.open(image_path), lang='amh+eng')
    return text



def extract_medicines(text: str) -> list[str]:
    """Uses fine-tuned local BioBERT instead of making external cloud API requests."""
    try:
        parsed_blocks = extract_structured_prescription_ml(text)
        if not parsed_blocks:
            return []
            
        blocks = parsed_blocks[0]
        medications = blocks.get("med", [])
        dosages = blocks.get("dosage", [])
        
        # Format the medicines array back into strings for the Laravel DB query
        combined_results = []
        for i, med in enumerate(medications):
            if i < len(dosages):
                combined_results.append(f"{med} {dosages[i]}")
            else:
                combined_results.append(med)
                
        return combined_results
    except Exception as e:
        print(f"[BioBERT Extraction Error]: {e}")
        return []


def process_and_compress_image(file, target_path: str):
    """Downsamples high-resolution smartphone images to optimize OCR computational tracking."""
    with Image.open(file) as img:
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        img.thumbnail((800, 800))  # Scales the matrix down cleanly while preserving drug name readability
        img.save(target_path, "JPEG", quality=85)

def search_nearby_pharmacies(medicines: list[str], lat: float, lon: float) -> list[dict]:
    """
    Searches MedFinder Laravel database for matching medicines near coordinate rings.
    (This remains completely untouched and safe!)
    """
    if not medicines:
        return [{"message": "No medicines provided for search."}]

    try:
        seen = set()
        pharmacies = []
        print("[ML Initializer] Micruccessfully.")
        async_client = httpx.Client()
        with async_client as client:
            for medicine in medicines:
                print("sfully.")
                response = client.get(
                    f"{LARAVEL_API_URL}/pharmacies",
                    params={"medicine": medicine, "latitude": lat, "longitude": lon},
                    timeout=15.0,
                )
                response.raise_for_status()
                data = response.json()

                if not isinstance(data, list):
                    continue

                for item in data:
                    key = f"{item.get('pharmacy', '')}|{item.get('drug', '')}|{item.get('location', '')}"
                    if key in seen:
                        continue
                    seen.add(key)

                    normalized = {
                        **item,
                        "name": item.get("name") or item.get("pharmacy"),
                        "address": item.get("address") or item.get("location"),
                        "note": item.get("note") or (item.get("drug") and f"Drug: {item.get('drug')}") or None,
                    }
                    pharmacies.append(normalized)

        if not pharmacies:
            return [{"message": "No nearby pharmacies found for the requested medicines."}]

        return pharmacies
    except httpx.HTTPStatusError as e:
        print(f"[pharmacy search] HTTP {e.response.status_code}: {e.response.text}")
        return [{"error": f"Pharmacy API returned {e.response.status_code}"}]
    except Exception as e:
        print(f"[pharmacy search] Failed: {e}")
        return [{"error": "Could not connect to pharmacy database"}]