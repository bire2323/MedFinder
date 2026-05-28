# Rasa Chatbot - Laravel Backend Debug Report

## 🔍 FINDINGS

### 1. **ROUTE LOCATION (Line 392 in api.php)**
```php
Route::get('/bot/search-drug', [\App\Http\Controllers\PharmacyDrugInventoryController::class, "botSearchMedicine"]);
```
✅ Route IS defined, BUT **placed OUTSIDE auth middleware** (line 382 closes middleware group)
- **Location**: Line 392, AFTER all auth middleware groups
- **Access**: PUBLIC (no authentication required)
- **Expected URL**: `http://localhost:8000/api/bot/search-drug?name=aspirin`

---

### 2. **RASA ACTION CALLING WRONG URL (actions.py line 63)**
```python
response = requests.get(f"https://medfinder.com/api/bot/search-drug?name={drug_name}")
```

❌ **ISSUES:**
- Hardcoded `https://medfinder.com` (production domain)
- Should be `http://localhost:8000` or configurable via env vars
- Will FAIL in Docker/dev environments without proper DNS

**Why it's failing:**
- If Rasa is in Docker, it can't resolve `medfinder.com` easily
- Even if it does, SSL certificate may not be trusted
- If medfinder.com is not deployed yet, it's unreachable

---

### 3. **BACKEND RESPONSE FORMAT (PharmacyDrugInventoryController.php lines 284-342)**

**Method**: `botSearchMedicine(Request $request)`

**Request Parameter**:
```
GET ?name=aspirin
```

**Logic**:
1. Line 286: Gets `name` parameter
2. Line 288-290: Returns 400 if name is empty ✅
3. Line 292-295: Searches Drug table by `brand_name_en`, `generic_name`, or `brand_name_am`
4. Line 297-299: **PROBLEM HERE** - Returns `{'opps': 'opps'}` if no drugs found ❌
5. Line 301-309: Searches pharmacies with those drugs (status='APPROVED', stock > 0)
6. Line 313-337: Builds response array

**Response Format** (lines 325-335):
```json
[
  {
    "pharmacy": "Pharmacy Name (pharmacy_name_en)",
    "location": "Sub City, Region",
    "drug": "Generic Name",
    "price": 50.00,
    "stock": 25,
    "availability": "available",
    "requires_prescription": false,
    "expiry": "2025-12-31",
    "batch_number": "BATCH001"
  }
]
```

✅ **Format MATCHES Rasa expectations** (lines 91-98 in actions.py)

---

### 4. **CRITICAL BUG - Empty Result Handling**

**File**: `backend/app/Http/Controllers/PharmacyDrugInventoryController.php`
**Line**: 297-299

```php
if ($medicines->isEmpty()) {
    return response()->json(['opps' => 'opps']);  // ❌ WRONG!
}
```

**Rasa expects** (actions.py line 73):
```python
if not data:  # Expects empty array [] or null
```

**Rasa receives**:
```json
{"opps": "opps"}  # This is a NON-EMPTY object!
```

**Result**: Rasa treats it as valid data and tries to access `data[0]` → **CRASHES**

---

### 5. **RELATED ROUTES FOR CONTEXT**

Line 130 - Similar endpoint (may also be used):
```php
Route::get('pharmacy/inventory/medicines/search', [\App\Http\Controllers\PharmacyDrugInventoryController::class, 'searchMedicine']);
```
- This uses `searchMedicine()` method (different from `botSearchMedicine()`)

---

## 🎯 ROOT CAUSE SUMMARY

| Issue | File | Line | Severity | Impact |
|-------|------|------|----------|--------|
| Wrong URL (hardcoded domain) | `RasaFM/actions/actions.py` | 63 | 🔴 CRITICAL | Connection fails in local/Docker |
| Wrong error response format | `backend/PharmacyDrugInventoryController.php` | 298 | 🔴 CRITICAL | Rasa crashes when no results |
| Missing timeout/error handling | `RasaFM/actions/actions.py` | 62-71 | 🟠 HIGH | Silent failures, no logging |
| No query parameter validation | `backend/PharmacyDrugInventoryController.php` | 286 | 🟡 MEDIUM | Accepts empty searches |

---

## ✅ REQUIRED FIXES

### **FIX 1: Update Backend Error Response** (PRIORITY 1)
**File**: `backend/app/Http/Controllers/PharmacyDrugInventoryController.php`
**Line**: 297-298

Change:
```php
if ($medicines->isEmpty()) {
    return response()->json(['opps' => 'opps']);
}
```

To:
```php
if ($medicines->isEmpty()) {
    return response()->json([]);
}
```

---

### **FIX 2: Make Rasa URL Configurable** (PRIORITY 1)
**File**: `RasaFM/actions/actions.py`
**Line**: 63

Current:
```python
response = requests.get(f"https://medfinder.com/api/bot/search-drug?name={drug_name}")
```

Change to:
```python
import os
backend_url = os.getenv('BACKEND_URL', 'http://localhost:8000')
response = requests.get(f"{backend_url}/api/bot/search-drug?name={drug_name}", timeout=10)
```

Then in `RasaFM/actions/.env` or Docker env:
```
BACKEND_URL=http://localhost:8000
# or for production:
BACKEND_URL=https://medfinder.com
```

---

### **FIX 3: Add Error Logging** (PRIORITY 2)
**File**: `RasaFM/actions/actions.py`
**Line**: 62-71

```python
try:
    backend_url = os.getenv('BACKEND_URL', 'http://localhost:8000')
    response = requests.get(
        f"{backend_url}/api/bot/search-drug?name={drug_name}",
        timeout=10
    )
    response.raise_for_status()
    data = response.json()
    print(f"[ACTION_SEARCH_DRUGS] Success: {len(data)} results for '{drug_name}'")
except requests.exceptions.Timeout:
    print(f"[ACTION_SEARCH_DRUGS] TIMEOUT: Backend took too long to respond")
    if language == "am":
        dispatcher.utter_message(text="ጊዜው ያልቋለ። እንደገና ይሞክሩ።")
    else:
        dispatcher.utter_message(text="Request timed out. Please try again.")
    return []
except requests.exceptions.ConnectionError as e:
    print(f"[ACTION_SEARCH_DRUGS] CONNECTION ERROR: {str(e)}")
    if language == "am":
        dispatcher.utter_message(text="ሰርভሩን ማግኘት አልቻልኩም።")
    else:
        dispatcher.utter_message(text="Cannot reach the backend service.")
    return []
except Exception as e:
    print(f"[ACTION_SEARCH_DRUGS] ERROR: {str(e)}")
    if language == "am":
        dispatcher.utter_message(text="ስህተት ተከስቷል።")
    else:
        dispatcher.utter_message(text="An error occurred. Please try again.")
    return []
```

---

## 🧪 TESTING STEPS (To run later)

1. **Test Backend Directly**:
   ```bash
   curl "http://localhost:8000/api/bot/search-drug?name=aspirin"
   curl "http://localhost:8000/api/bot/search-drug?name=nonexistentdrug123"
   ```

2. **Expected Responses**:
   - Found: `[{...}, {...}]`
   - Not found: `[]` (empty array, NOT `{"opps":"opps"}`)

3. **Test Rasa Action**:
   - Set `BACKEND_URL=http://localhost:8000` in Rasa environment
   - Trigger chatbot with: "Search for aspirin"
   - Check logs for `[ACTION_SEARCH_DRUGS]` messages

4. **Docker Environment**:
   - In `docker-compose.yml`, ensure Rasa service has `BACKEND_URL=http://backend:8000`
   - Network alias should allow cross-container communication

---
