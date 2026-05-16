import os
import shutil
from fastapi import FastAPI, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

from triage import triage_assessment
from condition_association import condition_association
from drug_info import drug_information
from prescription import (
    extract_prescription_text,
    explain_prescription,
    extract_medicines,
    search_nearby_pharmacies,
)
from facility_query import facility_intent
from safety import safety_filter

# ── Create app FIRST, then add middleware ─────────────────────────────────────
app = FastAPI(title="MedFinder AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://medfinder.com",   # add your production domain
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok"}

# ── Triage ────────────────────────────────────────────────────────────────────
@app.post("/triage")
def triage_api(data: dict):
    symptoms = data.get("symptoms", "")
    if not symptoms:
        return {"error": "symptoms field is required"}
    return {"response": triage_assessment(symptoms)}

# ── Condition association ─────────────────────────────────────────────────────
@app.post("/condition-info")
def condition_api(data: dict):
    symptoms = data.get("symptoms", "")
    if not symptoms:
        return {"error": "symptoms field is required"}
    return {"response": safety_filter(condition_association(symptoms))}

# ── Drug information ──────────────────────────────────────────────────────────
@app.post("/drug-info")
def drug_api(data: dict):
    question = data.get("question", "")
    if not question:
        return {"error": "question field is required"}
    return {"response": safety_filter(drug_information(question))}

# ── Prescription OCR + pharmacy search ───────────────────────────────────────
@app.post("/prescription")
async def prescription_api(
    file: UploadFile = File(...),
    lat: Optional[float] = Query(None, description="User latitude"),
    lng: Optional[float] = Query(None, description="User longitude"),
):
    # Save uploaded file temporarily
    temp_path = f"temp_{file.filename}"
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        text        = extract_prescription_text(temp_path)
        medicines   = extract_medicines(text)
        explanation = explain_prescription(text)
        pharmacies  = await search_nearby_pharmacies(medicines, lat=lat, lng=lng)

        return {
            "extracted_text":     text,
            "detected_medicines": medicines,
            "response":           safety_filter(explanation),
            "nearby_pharmacies":  pharmacies,
        }
    finally:
        # Always clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)

# ── Facility intent detection ─────────────────────────────────────────────────
@app.post("/facility-intent")
def facility_api(data: dict):
    message = data.get("message", "")
    if not message:
        return {"error": "message field is required"}
    return {"needs_location": facility_intent(message)}