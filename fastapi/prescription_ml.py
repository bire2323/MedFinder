import os
import json
import httpx
from PIL import Image
import pytesseract
from pathlib import Path
from transformers import pipeline

DISCLAIMER = (
    "⚠️ This information is for support and education only. "
    "It is not a medical diagnosis or treatment recommendation."
)
LARAVEL_API_URL = "https://medfinder.com/api"

import os
from transformers import AutoTokenizer, AutoModelForTokenClassification, pipeline

# Point directly to your local model folder inside the Docker app, fallback to local path if running outside Docker
DOCKER_MODEL_DIR = "/app/models/medfinder_multiclass_output/biobert_prescription_ner"
LOCAL_MODEL_DIR = os.path.join(os.path.dirname(__file__), "models", "medfinder_multiclass_output", "biobert_prescription_ner")
MODEL_DIR = DOCKER_MODEL_DIR if os.path.exists(DOCKER_MODEL_DIR) else LOCAL_MODEL_DIR

print(f"[ML Initializer] Loading BioBERT Parser from path: {MODEL_DIR}")
tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR, local_files_only=True)
model = AutoModelForTokenClassification.from_pretrained(MODEL_DIR, local_files_only=True)

ner_pipe = pipeline(
    "token-classification", 
    model=model, 
    tokenizer=tokenizer,
    aggregation_strategy="none",
)
print("[ML Initializer] Micro-inference architectures initialized successfully.")



def extract_prescription_text(image_path):
    # 'amh+eng' tells Tesseract to recognize both scripts simultaneously
    text = pytesseract.image_to_string(Image.open(image_path), lang='amh+eng')
    return text

def extract_structured_prescription_ml(text: str) -> list[dict]:
    if not text or not text.strip():
        return []
    
    entities = ner_pipe(text)
    valid_tokens = [e for e in entities if e["entity"] != "O" and e["score"] > 0.45]
    if not valid_tokens:
        return []
    
    valid_tokens = sorted(valid_tokens, key=lambda x: x["start"])
    structured_blocks = {}
    
    for token in valid_tokens:
        entity_class = token["entity"].split("-")[-1]
        start = token["start"]
        end = token["end"]
        
        if entity_class not in structured_blocks:
            structured_blocks[entity_class] = []
            
        if structured_blocks[entity_class] and start <= structured_blocks[entity_class][-1]["end"] + 1:
            structured_blocks[entity_class][-1]["end"] = max(structured_blocks[entity_class][-1]["end"], end)
        else:
            structured_blocks[entity_class].append({"start": start, "end": end})
            
    final_output = {}
    for cls_name, spans in structured_blocks.items():
        extracted_strings = [text[s["start"]:s["end"]].strip(",.-/: ") for s in spans]
        if cls_name == "MED":
            extracted_strings = [m.title() for m in extracted_strings]
        final_output[cls_name.lower()] = extracted_strings
        
    return [final_output]

def explain_prescription(text: str) -> str:
    parsed = extract_structured_prescription_ml(text)
    if not parsed or "med" not in parsed[0]:
        return "No specific medications detected. Please check image framing." + f"\n\n{DISCLAIMER}"
    
    blocks = parsed[0]
    meds = blocks.get("med", [])
    dosages = blocks.get("dosage", [])
    forms = blocks.get("form", [])
    frequencies = blocks.get("frequency", [])
    
    lines = ["## 📋 Parsed Structured Clinical Instructions:\n"]
    for i, med in enumerate(meds):
        d = dosages[i] if i < len(dosages) else "As specified"
        f = forms[i] if i < len(forms) else "Units"
        freq = frequencies[i] if i < len(frequencies) else "As instructed"
        lines.append(f"- *Medication*: {med} | *Form*: {f} | *Dosage*: {d} | *Frequency*: {freq}")
        
    return "\n".join(lines) + f"\n\n{DISCLAIMER}"

