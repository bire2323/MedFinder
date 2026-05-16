import os                           # ← was missing, caused NameError
import json
import httpx
import easyocr

from openAi_client import ask_openai
from config import DISCLAIMER, LARAVEL_API_URL

# Load EasyOCR once at module import (slow to load, fast after that)
reader = easyocr.Reader(['en'], gpu=False)


def extract_prescription_text(image_path: str) -> str:
    """Extract text from a prescription image using EasyOCR."""
    results = reader.readtext(image_path, detail=0, paragraph=True)
    return " ".join(results).strip()


def extract_medicines(text: str) -> list[str]:
    """Use GPT to extract clean medicine names from OCR text."""
    prompt = f"""
    Extract ONLY the medicine names from this prescription text.
    Return a valid JSON array of strings like: ["Amoxicillin", "Paracetamol 500mg"]
    If no medicines are found, return an empty array: []
    Return ONLY the JSON array — no explanation, no markdown.

    Text: {text}
    """
    response = ask_openai(prompt, temperature=0)
    # Strip markdown code fences if GPT wraps with ```json
    response = response.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
    try:
        medicines = json.loads(response)
        return [m.strip() for m in medicines if isinstance(m, str) and m.strip()]
    except json.JSONDecodeError:
        return []


def explain_prescription(text: str) -> str:
    """Explain prescription medicines in simple patient language."""
    medicines = extract_medicines(text)

    if not medicines:
        prompt = (
            "Explain the following prescription text in very simple words "
            f"for a patient who has no medical background.\n\n{text}"
        )
    else:
        prompt = f"""
        The medicines on this prescription are: {', '.join(medicines)}

        Explain in simple, patient-friendly language what each medicine is generally used for.
        Rules:
        - Do NOT mention dosage or how to take it
        - Do NOT give medical advice
        - Keep each explanation to 1-2 sentences
        """

    response = ask_openai(prompt)
    return f"{response}\n\n{DISCLAIMER}"


async def search_nearby_pharmacies(
    medicines: list[str],
    lat: float = None,
    lng: float = None,
) -> list[dict]:
    """Query the Laravel backend for pharmacies stocking the given medicines."""
    if not medicines:
        return [{"message": "No medicines detected in prescription."}]

    payload = {
        "medicines":  medicines,
        "lat":        lat,
        "lng":        lng,
        "radius_km":  10,
    }
    headers = {
        "Authorization": f"Bearer {os.getenv('LARAVEL_API_TOKEN', '')}",
        "Accept":        "application/json",
    }

    try:
        async with httpx.AsyncClient() as http:
            response = await http.post(
                f"{LARAVEL_API_URL}/pharmacies/search",
                json=payload,
                headers=headers,
                timeout=15.0,
            )
            response.raise_for_status()
            data = response.json()
            return data.get("pharmacies", [])
    except httpx.HTTPStatusError as e:
        print(f"[pharmacy search] HTTP {e.response.status_code}: {e.response.text}")
        return [{"error": f"Pharmacy API returned {e.response.status_code}"}]
    except Exception as e:
        print(f"[pharmacy search] Failed: {e}")
        return [{"error": "Could not connect to pharmacy database"}]