import os
import shutil
import logging
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Query, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from prescription1 import search_nearby_pharmacies as find_facilities

from prescription1 import handle_prescription_ocr

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("MedFinderApp")

app = FastAPI(
    title="MedFinder API Backend", 
    description="Production-grade clinical routing and bilingual extraction engine",
    version="2.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "status": "online",
        "system": "MedFinder Core Engine",
        "version": "2.0.0",
        "bilingual_ocr": "Tesseract (Amharic + English Enabled)"
    }

@app.post("/prescription")
async def process_prescription(
    file: UploadFile = File(...),
    latitude: Optional[float] = Query(None),
    longitude: Optional[float] = Query(None)
):
    logger.info(f"📥 Received prescription payload: {file.filename}")
    
    # 1. Securely stage file to temporary disk storage
    import time
    temp_path = f"temp_{int(time.time())}_{file.filename}"
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # 2. Execute Tesseract Bilingual OCR Extraction
        ocr_result = handle_prescription_ocr(temp_path)
        raw_text = ocr_result.get("raw_text", "").strip()
        
        if not raw_text:
            raise HTTPException(status_code=400, detail="OCR Phase Failed: Could not isolate legible text structures.")
            
        logger.info(f"🔍 OCR Extraction complete. Character count: {raw_text}")
        
        
        # 3. Process structured clinical extraction via ML layer
        ml_analysis = ocr_result.get("ml_analysis", "No detailed extraction map returned.")
        
        # 4. Handle nearby pharmacy and facility routing if location coordinates exist
        facilities = []
        if latitude is not None and longitude is not None:
            logger.info(f"📍 Location coordinates detected ({latitude}, {longitude}). Querying nearest nodes...")
            facilities = find_facilities(latitude, longitude)
            
        return {
            "status": "success",
            "filename": file.filename,
            "extracted_raw_text": raw_text,
            "clinical_analysis": ml_analysis,
            "nearby_facilities": facilities
        }
        
    except Exception as e:
        logger.error(f"❌ Internal Failure pipeline crash: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Pipeline Processing Error: {str(e)}")
        
    finally:
        # Clean up disk space
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.post("/parse-prescription-text")
async def parse_text(request: Request):
    payload = await request.json()
    text = payload.get("text", "")
    if not text:
        raise HTTPException(status_code=400, detail="Missing text parameter in raw payload.")
    return parse_prescription_ai(text)

@app.get("/facilities")
async def facilities(lat: float, lng: float):
    return find_facilities(lat, lng)

