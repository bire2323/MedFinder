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
    try:
        response = ask_openai(prompt, temperature=0)
        # Strip markdown code fences if GPT wraps with ```json
        response = response.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
        medicines = json.loads(response)
        return [m.strip() for m in medicines if isinstance(m, str) and m.strip()]
    except Exception as e:
        print(f"[AI API Error in extract_medicines] {e}")
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

    try:
        response = ask_openai(prompt)
        return f"{response}\n\n{DISCLAIMER}"
    except Exception as e:
        print(f"[AI API Error in explain_prescription] {e}")
        return f"We are currently experiencing issues connecting to our AI service. Please try again later.\n\n{DISCLAIMER}"


async def search_nearby_pharmacies(
    medicines: list[str],
    lat: float = None,
    lng: float = None,
    request_cookies: dict = None,
) -> list[dict]:
    """Query the Laravel backend for pharmacies stocking the given medicines."""
    if not medicines:
        return [{"message": "No medicines detected in prescription."}]

    headers = {
        "Accept": "application/json",
    }

    pharmacies = []
    seen = set()

    try:
        async with httpx.AsyncClient() as http:
            for medicine in medicines[:3]:
                if not medicine:
                    continue

                response = await http.get(
                    f"{LARAVEL_API_URL}/bot/search-drug",
                    params={"name": medicine},
                    headers=headers,
                    cookies=request_cookies,
                    timeout=15.0,
                )
                response.raise_for_status()
                data = response.json()

                if not isinstance(data, list):
                    continue

                for item in data:
                    key = (
                        f"{item.get('pharmacy', '')}|"
                        f"{item.get('drug', '')}|"
                        f"{item.get('location', '')}"
                    )
                    if key in seen:
                        continue
                    seen.add(key)
                    pharmacies.append(item)

        if not pharmacies:
            return [{"message": "No nearby pharmacies found for the requested medicines."}]

        return pharmacies
    except httpx.HTTPStatusError as e:
        print(f"[pharmacy search] HTTP {e.response.status_code}: {e.response.text}")
        return [{"error": f"Pharmacy API returned {e.response.status_code}"}]
    except Exception as e:
        print(f"[pharmacy search] Failed: {e}")
        return [{"error": "Could not connect to pharmacy database"}]