import os
import shutil
import logging
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Query, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

# Import all processing modules
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

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ── Create FastAPI app ─────────────────────────────────────────────────────────
app = FastAPI(
    title="MedFinder AI API",
    version="1.0.0",
    description="Healthcare AI assistance for MedFinder Ethiopia"
)

# ── Add CORS middleware ────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://medfinder.com",
        "https://www.medfinder.com",
        # Add more origins as needed
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Health check endpoint ──────────────────────────────────────────────────────
@app.get("/health")
def health():
    """
    Health check endpoint for container orchestration and monitoring.
    
    Returns:
        dict: Status information
    """
    try:
        # Could add more checks here:
        # - Database connectivity
        # - API key validation
        # - Model availability
        return {
            "status": "ok",
            "version": "1.0.0",
        }
    except Exception as e:
        logger.exception("Health check failed")
        return {
            "status": "error",
            "details": str(e)
        }

# ── Triage endpoint ────────────────────────────────────────────────────────────
@app.post("/triage")
def triage_api(data: dict):
    """
    Classify symptom urgency (EMERGENCY/URGENT/NON_URGENT).
    
    Request body:
        {
            "symptoms": "chest pain, shortness of breath"
        }
        
    Returns:
        dict: Triage classification and recommendation
    """
    try:
        symptoms = data.get("symptoms", "").strip()
        
        if not symptoms:
            raise HTTPException(
                status_code=400,
                detail="Symptoms field is required"
            )
        
        if len(symptoms) > 1000:
            raise HTTPException(
                status_code=400,
                detail="Symptoms description too long (max 1000 characters)"
            )
        
        result = triage_assessment(symptoms)
        
        return {
            "success": True,
            "response": result,
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error in triage_api")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": "Failed to process symptoms",
                "suggestion": "Please try again or contact support"
            }
        )

# ── Condition information endpoint ─────────────────────────────────────────────
@app.post("/condition-info")
def condition_api(data: dict):
    """
    Provide educational information about condition associations with symptoms.
    
    Request body:
        {
            "symptoms": "fever, fatigue"
        }
        
    Returns:
        dict: Condition associations (educational only, not diagnostic)
    """
    try:
        symptoms = data.get("symptoms", "").strip()
        
        if not symptoms:
            raise HTTPException(
                status_code=400,
                detail="Symptoms field is required"
            )
        
        if len(symptoms) > 1000:
            raise HTTPException(
                status_code=400,
                detail="Symptoms description too long (max 1000 characters)"
            )
        
        result = safety_filter(condition_association(symptoms))
        
        return {
            "success": True,
            "response": result,
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error in condition_api")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": "Failed to retrieve condition information",
                "suggestion": "Please try again or contact support"
            }
        )

# ── Drug information endpoint ──────────────────────────────────────────────────
@app.post("/drug-info")
def drug_api(data: dict):
    """
    Provide general information about drugs/medications.
    
    Request body:
        {
            "question": "What is paracetamol used for?"
        }
        
    Returns:
        dict: Drug information (general, non-prescription)
    """
    try:
        question = data.get("question", "").strip()
        
        if not question:
            raise HTTPException(
                status_code=400,
                detail="Question field is required"
            )
        
        if len(question) > 500:
            raise HTTPException(
                status_code=400,
                detail="Question too long (max 500 characters)"
            )
        
        result = safety_filter(drug_information(question))
        
        return {
            "success": True,
            "response": result,
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error in drug_api")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": "Failed to retrieve drug information",
                "suggestion": "Please try again or contact support"
            }
        )

# ── Prescription processing endpoint ───────────────────────────────────────────
@app.post("/prescription")
async def prescription_api(
    file: UploadFile = File(...),
    lat: Optional[float] = Query(None, description="User latitude"),
    lng: Optional[float] = Query(None, description="User longitude"),
    request: Request = None,
):
    """
    Process prescription image: OCR → extract medicines → search pharmacies.
    
    This endpoint:
    1. Validates and saves the uploaded image
    2. Extracts text using OCR (EasyOCR)
    3. Extracts medicine names using AI
    4. Explains prescription in patient-friendly language
    5. Searches for nearby pharmacies with inventory
    
    Query Parameters:
        - file (UploadFile): Prescription image (JPEG/PNG)
        - lat (float, optional): User latitude
        - lng (float, optional): User longitude
        
    Returns:
        dict: OCR text, medicines, explanation, nearby pharmacies
        
    Error Responses:
        - 400: Invalid file or no text detected
        - 413: File too large
        - 500: Processing error
    """
    temp_path = None
    
    try:
        # ── Step 1: Validate file upload ───────────────────────────────────
        logger.info(f"[prescription_api] Processing file: {file.filename}")
        
        # Check file size (max 10MB)
        file_contents = await file.read()
        file_size_mb = len(file_contents) / (1024 * 1024)
        
        if file_size_mb > 10:
            logger.warning(f"[prescription_api] File too large: {file_size_mb:.2f}MB")
            raise HTTPException(
                status_code=413,
                detail=f"File too large ({file_size_mb:.2f}MB). Maximum 10MB allowed."
            )
        
        # Check file extension
        allowed_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp'}
        file_ext = os.path.splitext(file.filename)[1].lower()
        
        if file_ext not in allowed_extensions:
            logger.warning(f"[prescription_api] Invalid file type: {file_ext}")
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type ({file_ext}). Allowed: {', '.join(allowed_extensions)}"
            )
        
        # ── Step 2: Save file temporarily ──────────────────────────────────
        temp_path = f"temp_{int(time.time())}_{file.filename}"
        
        try:
            with open(temp_path, "wb") as f:
                f.write(file_contents)
            logger.info(f"[prescription_api] Saved temp file: {temp_path}")
        except IOError as e:
            logger.error(f"[prescription_api] Failed to save file: {e}")
            raise HTTPException(
                status_code=500,
                detail="Failed to save uploaded file"
            )
        
        # ── Step 3: Extract text from image ────────────────────────────────
        logger.info("[prescription_api] Starting OCR extraction")
        try:
            text = extract_prescription_text(temp_path)
        except Exception as e:
            logger.exception("[prescription_api] OCR extraction failed")
            raise HTTPException(
                status_code=500,
                detail="Failed to extract text from image"
            )
        
        # Check if any text was detected
        if not text or not text.strip():
            logger.warning("[prescription_api] No text detected in image")
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "error": "No text detected in image",
                    "suggestion": "Please upload a clear, well-lit prescription image"
                }
            )
        
        logger.info(f"[prescription_api] Extracted {len(text)} characters")
        
        # ── Step 4: Extract medicine names ─────────────────────────────────
        logger.info("[prescription_api] Extracting medicine names")
        medicines = extract_medicines(text)
        logger.info(f"[prescription_api] Found {len(medicines)} medicines")
        
        # ── Step 5: Explain prescription ───────────────────────────────────
        logger.info("[prescription_api] Generating explanation")
        explanation = explain_prescription(text)
        
        # ── Step 6: Search nearby pharmacies ────────────────────────────────
        logger.info("[prescription_api] Searching nearby pharmacies")
        try:
            pharmacies = await search_nearby_pharmacies(
                medicines,
                lat=lat,
                lng=lng,
                request_cookies=request.cookies if request else None,
            )
        except Exception as e:
            logger.exception("[prescription_api] Pharmacy search failed")
            # Pharmacy search is non-critical; don't fail the whole request
            pharmacies = [
                {"error": "Pharmacy search unavailable", "suggestion": "Try again later"}
            ]
        
        # ── Return success response ────────────────────────────────────────
        logger.info("[prescription_api] Successfully processed prescription")
        return {
            "success": True,
            "extracted_text": text,
            "detected_medicines": medicines,
            "response": explanation,
            "nearby_pharmacies": pharmacies,
        }
        
    # ── Handle validation errors ───────────────────────────────────────────
    except HTTPException:
        raise
    
    # ── Handle unexpected errors ───────────────────────────────────────────
    except Exception as e:
        logger.exception("[prescription_api] Unexpected error")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": "Failed to process prescription",
                "details": str(e),
                "suggestion": "Please try uploading a different image or contact support"
            }
        )
    
    # ── Cleanup ────────────────────────────────────────────────────────────
    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
                logger.debug(f"[prescription_api] Cleaned up temp file: {temp_path}")
            except OSError as e:
                logger.warning(f"[prescription_api] Failed to delete temp file: {e}")

# ── Facility intent detection endpoint ─────────────────────────────────────────
@app.post("/facility-intent")
def facility_api(data: dict):
    """
    Detect if user is asking to find a healthcare facility (hospital/clinic/pharmacy).
    
    Request body:
        {
            "message": "Find a hospital near me"
        }
        
    Returns:
        dict: Boolean indicating if location/facility search is needed
    """
    try:
        message = data.get("message", "").strip()
        
        if not message:
            raise HTTPException(
                status_code=400,
                detail="Message field is required"
            )
        
        if len(message) > 500:
            raise HTTPException(
                status_code=400,
                detail="Message too long (max 500 characters)"
            )
        
        needs_location = facility_intent(message)
        
        return {
            "success": True,
            "needs_location": needs_location,
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error in facility_api")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": "Failed to process request",
                "suggestion": "Please try again or contact support"
            }
        )

# ── Global exception handler ───────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """
    Catch-all exception handler for unhandled errors.
    Logs the error and returns a user-friendly response.
    """
    logger.exception(f"Unhandled exception: {type(exc).__name__}")
    
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "suggestion": "Please contact support if the problem persists"
        }
    )

# ── Import time module for temp file naming ────────────────────────────────────
import time