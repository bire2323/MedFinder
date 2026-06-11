import os
import shutil
import logging
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Query, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from prescription1 import search_nearby_pharmacies as find_facilities

from prescription1 import handle_prescription_ocr
import httpx
from dotenv import load_dotenv

load_dotenv()

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
        
        # Extract medicines list from ml_analysis for pharmacy search
        medicines = ml_analysis.get("medicines", []) if isinstance(ml_analysis, dict) else []
        logger.info(f"💊 Extracted medicines for pharmacy search: {medicines}")
        
        # 4. Handle nearby pharmacy and facility routing if location coordinates exist
        facilities = []
        if latitude is not None and longitude is not None:
            logger.info(f"📍 Location coordinates detected ({latitude}, {longitude}). Querying nearest nodes...")
            facilities = find_facilities(medicines, latitude, longitude)
            
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

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
LARAVEL_API_URL = os.getenv("LARAVEL_API_URL", "http://backend/api")

SYSTEM_PROMPT = """You are MedFinder AI, a premium clinical helper and medical routing assistant.
Your goal is to help users find the nearest pharmacies, hospitals, and medical details.
Always respond in a professional, polite, and helpful tone.
If the user asks to find a pharmacy or hospital, and we have location coordinates, we will provide them with the nearest choices from our database (which will be supplied in the system context below).
If no location is detected but they want to find nearby facilities, ask them to enable location permissions or select their location on the map.
When lists of hospitals or pharmacies are provided in the context, format them nicely (e.g. as markdown lists, bullet points, showing names, distances, phone numbers, and working hours).
Keep responses concise, clear, and actionable. Add appropriate emojis for readability.

At the end of your response, always append a disclaimer:
"⚠️ Disclaimer: This information is for support only. It is not a medical diagnosis or treatment recommendation."
"""

@app.post("/chat")
async def chat_endpoint(request: Request):
    try:
        payload = await request.json()
        message = payload.get("message", "").strip()
        lat = payload.get("lat")
        lng = payload.get("lng")
        
        facilities_context = ""
        pharmacies_list = []
        hospitals_list = []
        
        if lat is not None and lng is not None:
            async with httpx.AsyncClient() as client:
                try:
                    ph_resp = await client.get(
                        f"{LARAVEL_API_URL}/search/pharmacies",
                        params={"lat": lat, "lng": lng},
                        timeout=5.0
                    )
                    if ph_resp.status_code == 200:
                        pharmacies_list = ph_resp.json().get("data", [])
                except Exception as e:
                    logger.error(f"Error fetching pharmacies: {e}")
                    
                try:
                    hosp_resp = await client.get(
                        f"{LARAVEL_API_URL}/search/hospitals",
                        params={"lat": lat, "lng": lng},
                        timeout=5.0
                    )
                    if hosp_resp.status_code == 200:
                        hospitals_list = hosp_resp.json().get("data", [])
                except Exception as e:
                    logger.error(f"Error fetching hospitals: {e}")
            
            facilities_context = "\n[DATABASE CONTEXT: NEARBY FACILITIES]\n"
            if pharmacies_list:
                facilities_context += "Nearby Pharmacies:\n"
                for p in pharmacies_list[:5]:
                    name = p.get("pharmacy_name_en") or p.get("pharmacy_name_am") or "Unnamed Pharmacy"
                    phone = p.get("contact_phone") or "N/A"
                    hours = p.get("working_hour") or "N/A"
                    addr = p.get("addresses", [])
                    addr_str = ""
                    if addr:
                        region = addr[0].get("region", {}).get("name_en", "") or ""
                        city = addr[0].get("city", {}).get("name_en", "") or ""
                        kebele = addr[0].get("kebele", "") or ""
                        addr_str = f", Address: {region} {city} {kebele}".strip()
                    facilities_context += f"- Name: {name}, Phone: {phone}, Hours: {hours}{addr_str}\n"
            else:
                facilities_context += "No nearby pharmacies found.\n"
                
            if hospitals_list:
                facilities_context += "Nearby Hospitals:\n"
                for h in hospitals_list[:5]:
                    name = h.get("hospital_name_en") or h.get("hospital_name_am") or "Unnamed Hospital"
                    phone = h.get("emergency_contact") or h.get("contact_phone") or "N/A"
                    hours = h.get("working_hour") or "N/A"
                    addr = h.get("addresses", [])
                    addr_str = ""
                    if addr:
                        region = addr[0].get("region", {}).get("name_en", "") or ""
                        city = addr[0].get("city", {}).get("name_en", "") or ""
                        kebele = addr[0].get("kebele", "") or ""
                        addr_str = f", Address: {region} {city} {kebele}".strip()
                    facilities_context += f"- Name: {name}, Phone: {phone}, Hours: {hours}{addr_str}\n"
            else:
                facilities_context += "No nearby hospitals found.\n"
        
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT}
        ]
        if facilities_context:
            messages.append({"role": "system", "content": facilities_context})
            
        messages.append({"role": "user", "content": message})
        
        async with httpx.AsyncClient() as client:
            groq_response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": GROQ_MODEL,
                    "messages": messages,
                    "temperature": 0.3,
                    "max_tokens": 1024
                },
                timeout=15.0
            )
            
            if groq_response.status_code != 200:
                logger.error(f"Groq API error: {groq_response.status_code} - {groq_response.text}")
                raise HTTPException(status_code=500, detail="Groq API request failed.")
                
            completion = groq_response.json()
            reply_text = completion["choices"][0]["message"]["content"]
            
        buttons = []
        lower_msg = message.lower()
        if "pharmacy" in lower_msg or "pharmacies" in lower_msg or "drug" in lower_msg or "medicine" in lower_msg:
            buttons.append({"title": "🔍 Find nearest Pharmacy", "payload": "/nearest_pharmacy"})
        elif "hospital" in lower_msg or "hospitals" in lower_msg or "clinic" in lower_msg:
            buttons.append({"title": "🏥 Find nearest Hospital", "payload": "/nearest_hospital"})
        else:
            buttons.append({"title": "🔍 Search Pharmacy", "payload": "/nearest_pharmacy"})
            buttons.append({"title": "🏥 Search Hospital", "payload": "/nearest_hospital"})
            
        return [
            {
                "text": reply_text,
                "buttons": buttons
            }
        ]
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        return [
            {
                "text": "I'm sorry, I encountered an issue processing your request. Please try again.",
                "buttons": []
            }
        ]


# import os
# import shutil
# import logging
# from typing import Optional
# from fastapi import FastAPI, UploadFile, File, Query, HTTPException, Request
# from fastapi.middleware.cors import CORSMiddleware
# from prescription1 import search_nearby_pharmacies as find_facilities

# from prescription1 import handle_prescription_ocr

# # Configure logging
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger("MedFinderApp")

# app = FastAPI(
#     title="MedFinder API Backend", 
#     description="Production-grade clinical routing and bilingual extraction engine",
#     version="2.0.0"
# )

# # CORS Configuration
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# @app.get("/")
# async def root():
#     return {
#         "status": "online",
#         "system": "MedFinder Core Engine",
#         "version": "2.0.0",
#         "bilingual_ocr": "Tesseract (Amharic + English Enabled)"
#     }

# @app.post("/prescription")
# async def process_prescription(
#     file: UploadFile = File(...),
#     latitude: Optional[float] = Query(None),
#     longitude: Optional[float] = Query(None)
# ):
#     logger.info(f"📥 Received prescription payload: {file.filename}")
    
#     # 1. Securely stage file to temporary disk storage
#     import time
#     temp_path = f"temp_{int(time.time())}_{file.filename}"
#     try:
#         with open(temp_path, "wb") as buffer:
#             shutil.copyfileobj(file.file, buffer)
            
#         # 2. Execute Tesseract Bilingual OCR Extraction
#         ocr_result = handle_prescription_ocr(temp_path)
#         raw_text = ocr_result.get("raw_text", "").strip()
        
#         if not raw_text:
#             raise HTTPException(status_code=400, detail="OCR Phase Failed: Could not isolate legible text structures.")
            
#         logger.info(f"🔍 OCR Extraction complete. Character count: {raw_text}")
        
        
#         # 3. Process structured clinical extraction via ML layer
#         ml_analysis = ocr_result.get("ml_analysis", "No detailed extraction map returned.")
        
#         # 4. Handle nearby pharmacy and facility routing if location coordinates exist
#         facilities = []
#         if latitude is not None and longitude is not None:
#             logger.info(f"📍 Location coordinates detected ({latitude}, {longitude}). Querying nearest nodes...")
#             facilities = find_facilities(latitude, longitude)
            
#         return {
#             "status": "success",
#             "filename": file.filename,
#             "extracted_raw_text": raw_text,
#             "clinical_analysis": ml_analysis,
#             "nearby_facilities": facilities
#         }
        
#     except Exception as e:
#         logger.error(f"❌ Internal Failure pipeline crash: {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Pipeline Processing Error: {str(e)}")
        
#     finally:
#         # Clean up disk space
#         if os.path.exists(temp_path):
#             os.remove(temp_path)

# @app.post("/parse-prescription-text")
# async def parse_text(request: Request):
#     payload = await request.json()
#     text = payload.get("text", "")
#     if not text:
#         raise HTTPException(status_code=400, detail="Missing text parameter in raw payload.")
#     return parse_prescription_ai(text)

# @app.get("/facilities")
# async def facilities(lat: float, lng: float):
#     return find_facilities(lat, lng)

