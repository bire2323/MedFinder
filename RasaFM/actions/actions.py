
import requests
import re
from typing import Any, Text, Dict, List

from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet, UserUtteranceReverted
from thefuzz import process


# ─────────────────────────────────────────────
# SHARED QUICK-ACTION BUTTONS (reused everywhere)
# ─────────────────────────────────────────────
def quick_buttons(language: str) -> list:
    if language == "am":
        return [
            {"title": "💊 መድኃኒት ፈልግ",  "payload": "/search_drug"},
            {"title": "🏥 ሆስፒታል ፈልግ",  "payload": "/search_hospital"},
            {"title": "🔍 ፋርማሲ ፈልግ",   "payload": "/search_pharmacy"},
            {"title": "🗺️ ካርታ አጠቃቀም",  "payload": "/ask_how_to_use_map"},
        ]
    return [
        {"title": "💊 Search Drug",     "payload": "/search_drug"},
        {"title": "🏥 Search Hospital", "payload": "/search_hospital"},
        {"title": "🔍 Search Pharmacy", "payload": "/search_pharmacy"},
        {"title": "🗺️ Map Navigation",  "payload": "/ask_how_to_use_map"},
    ]


# ─────────────────────────────────────────────
# LANGUAGE DETECTOR
# ─────────────────────────────────────────────
class LanguageDetector:
    @staticmethod
    def detect_language(text: str) -> str:
        amharic_count = sum(1 for c in text if 0x1200 <= ord(c) <= 0x137F)
        english_count = sum(1 for c in text if c.isalpha() and ord(c) < 128)
        total = amharic_count + english_count
        if total == 0:
            return "en"
        ratio = amharic_count / total
        if ratio > 0.6:
            return "am"
        elif ratio < 0.2:
            return "en"
        return "mixed"


# ─────────────────────────────────────────────
# FIX: ActionDefaultFallback
# Replaces Rasa's built-in — returns a proper message instead of []
# ─────────────────────────────────────────────
class ActionDefaultFallback(Action):

    def name(self) -> Text:
        return "action_default_fallback"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        language = tracker.get_slot("language") or "en"

        if language == "am":
            text = (
                "ይቅርታ፣ ያልሆነዎትን ሊረዳ አልቻልኩም።\n"
                "ከሚከተሉት አንዱን ይምረጡ:"
            )
        else:
            text = (
                "Sorry, I didn't understand that.\n"
                "Please choose one of the options below:"
            )

        dispatcher.utter_message(text=text, buttons=quick_buttons(language))

        # Revert the user utterance so it doesn't pollute the story
        return [UserUtteranceReverted()]


# ─────────────────────────────────────────────
# ACTION: Initialize language on first message
# ─────────────────────────────────────────────
class ActionInitializeLanguage(Action):

    def name(self) -> Text:
        return "action_initialize_language"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        current_language = tracker.get_slot("language")
        if current_language:
            return []

        user_text = tracker.latest_message.get("text", "")
        detected = LanguageDetector.detect_language(user_text)
        if detected == "mixed":
            detected = "en"

        return [SlotSet("language", detected)]


# ─────────────────────────────────────────────
# ACTION: Set language explicitly
# ─────────────────────────────────────────────
class ActionSetLanguage(Action):

    def name(self) -> Text:
        return "action_set_language"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        language = None
        for entity in tracker.latest_message.get("entities", []):
            if entity.get("entity") == "language":
                val = str(entity.get("value", "")).lower().strip()
                if val in ["am", "amharic", "አማርኛ"]:
                    language = "am"
                elif val in ["en", "english", "ኢንግሊዝ"]:
                    language = "en"
                break

        if language not in ["en", "am"]:
            language = tracker.get_slot("language") or "en"

        previous_drug = tracker.get_slot("drug_name")
        previous_location = tracker.get_slot("location")

        if language == "am":
            msg = "✅ ወደ አማርኛ ቀይርን"
            if previous_drug:
                msg += f"\n(ስለ {previous_drug} ነበሩ መፈለግ)"
            elif previous_location:
                msg += f"\n(በ{previous_location} ውስጥ ነበሩ መፈለግ)"
        else:
            msg = "✅ Switched to English"
            if previous_drug:
                msg += f"\n(You were searching for {previous_drug})"
            elif previous_location:
                msg += f"\n(You were searching in {previous_location})"

        dispatcher.utter_message(text=msg)
        return [SlotSet("language", language)]


# ─────────────────────────────────────────────
# ACTION: Search drugs
# ─────────────────────────────────────────────
class ActionSearchDrugs(Action):

    def name(self) -> Text:
        return "action_search_drugs"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        language = tracker.get_slot("language") or "en"
        drug_name = tracker.get_slot("drug_name")

        if not drug_name:
            text = ("እባክዎ የመድሃኒቱን ስም ይንገሩኝ።"
                    if language == "am"
                    else "Please tell me the name of the drug you're looking for.")
            dispatcher.utter_message(text=text, buttons=quick_buttons(language))
            return []

        try:
            response = requests.get(
                f"http://backend/api/bot/search-drug?name={drug_name}",
                timeout=10
            )
            response.raise_for_status()
            data = response.json()
        except Exception:
            text = ("የመረጃ ቋቱን ማግኘት አልቻልኩም። ቆይተው እንደገና ይሞክሩ።"
                    if language == "am"
                    else "Sorry, I can't connect to the service right now.")
            dispatcher.utter_message(text=text, buttons=quick_buttons(language))
            return []

        if not data:
            text = (f"ይቅርታ፣ \"{drug_name}\" አልተገኘም።"
                    if language == "am"
                    else f"Sorry, I couldn't find \"{drug_name}\".")
            dispatcher.utter_message(text=text, buttons=quick_buttons(language))
            return []

        intro = (
            f"🔎 \"{drug_name}\" በ medfinder ዝርዝር ዉስጥ የሚገኝበት መረጃ:\n"
            if language == "am" else
            f"🔎 Here are results for \"{drug_name}\":\n"
        )

        messages = []
        for item in data[:3]:
            msg = (
                f"🏥 {item.get('pharmacy')}\n"
                f"📍 {item.get('location')}\n"
                f"💊 {item.get('drug')}\n"
                f"💰 {item.get('price')} {'ብር' if language == 'am' else 'ETB'}\n"
                f"📦 {item.get('stock')}\n"
                f"{'⚠️ ማዘዣ ያስፈልጋል' if item.get('requires_prescription') else '✅ ያለ ማዘዣ'}\n"
                f"⏳ {item.get('expiry')}"
            )
            messages.append(msg)

        dispatcher.utter_message(
            text=intro + "\n\n".join(messages),
            buttons=quick_buttons(language)
        )
        return []


# ─────────────────────────────────────────────
# ACTION: Search pharmacy
# ─────────────────────────────────────────────
class ActionSearchPharmacy(Action):

    def name(self) -> Text:
        return "action_search_pharmacy"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        language = tracker.get_slot("language") or "en"
        location = tracker.get_slot("location")
        pharmacy_name = tracker.get_slot("pharmacy_name")

        params = {"location": location} if location else {}

        try:
            response = requests.get("http://backend/api/pharmacies",
                                    params=params, timeout=20)
            response.raise_for_status()
            all_pharmacies = response.json()
        except Exception as e:
            print("ERROR:", str(e))
            text = ("የመረጃ ቋቱን ማግኘት አልቻልኩም።"
                    if language == "am"
                    else "I can't connect to the pharmacy service right now.")
            dispatcher.utter_message(text=text, buttons=quick_buttons(language))
            return []

        if not all_pharmacies:
            text = ("😔 ምንም ፋርማሲ አልተገኘም።"
                    if language == "am"
                    else "😔 No pharmacies found.")
            dispatcher.utter_message(text=text, buttons=quick_buttons(language))
            return []

        final_list = all_pharmacies
        if pharmacy_name:
            names = [p["pharmacy"] for p in all_pharmacies]
            match = process.extractOne(pharmacy_name, names)
            if match:
                best_match, score = match
                if score > 70:
                    final_list = [p for p in all_pharmacies
                                  if p["pharmacy"] == best_match]

        messages = []
        for item in final_list[:5]:
            msg = (
                f"🏥 {item.get('pharmacy')}\n"
                f"📍 {item.get('location')}\n"
                f"🕒 {item.get('working_hours')}\n"
                f"📞 {item.get('phone')}"
            )
            messages.append(msg)

        intro = ("ያገኘኋቸው ፋርማሲዎች:\n"
                 if language == "am"
                 else "Here are the pharmacies I found:\n")

        dispatcher.utter_message(
            text=intro + "\n\n".join(messages),
            buttons=quick_buttons(language)
        )
        return []


# ─────────────────────────────────────────────
# ACTION: Search hospital
# ─────────────────────────────────────────────
class ActionSearchHospital(Action):

    def name(self) -> Text:
        return "action_search_hospital"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        language = tracker.get_slot("language") or "en"
        hospital_name = tracker.get_slot("hospital_name")
        location = tracker.get_slot("location")

        params = {"location": location} if location else {}

        try:
            response = requests.get("http://backend/api/hospitals",
                                    params=params, timeout=10)
            response.raise_for_status()
            results = response.json()
        except Exception:
            text = ("ሆስፒታል መረጃ ማግኘት አልቻልኩም።"
                    if language == "am"
                    else "I can't reach hospital data right now.")
            dispatcher.utter_message(text=text, buttons=quick_buttons(language))
            return []

        if not results:
            text = ("ምንም ሆስፒታል አልተገኘም።"
                    if language == "am"
                    else "No hospitals found.")
            dispatcher.utter_message(text=text, buttons=quick_buttons(language))
            return []

        final_results = results
        if hospital_name:
            names = [h['name'] for h in results]
            best_match, score = process.extractOne(hospital_name, names)
            if score > 70:
                final_results = [h for h in results if h['name'] == best_match]

        messages = []
        for h in final_results[:3]:
            msg = (
                f"🏥 {h['name']}\n"
                f"📍 {h.get('location')}\n"
                f"📞 {h.get('phone')}"
            )
            messages.append(msg)

        intro = ("የተገኙ ሆስፒታሎች:\n"
                 if language == "am"
                 else "Here are the hospitals I found:\n")

        dispatcher.utter_message(
            text=intro + "\n\n".join(messages),
            buttons=quick_buttons(language)
        )
        return []

# import requests
# import re
# from typing import Any, Text, Dict, List

# from rasa_sdk import Action, Tracker
# from rasa_sdk.executor import CollectingDispatcher
# from rasa_sdk.events import SlotSet
# from thefuzz import process


# class LanguageDetector:
#     """Detect language from text using Ge'ez Unicode detection"""
    
#     AMHARIC_RANGE = (0x1200, 0x137F)  # Ge'ez script Unicode range
    
#     @staticmethod
#     def detect_language(text: str) -> str:
#         """
#         Detect language from text.
#         Returns: 'am' (Amharic), 'en' (English), or 'mixed'
#         """
#         amharic_count = sum(1 for c in text if ord(c) in range(0x1200, 0x137F))
#         english_count = sum(1 for c in text if c.isalpha() and ord(c) < 128)
        
#         total = amharic_count + english_count
#         if total == 0:
#             return "en"  # Default to English if no alpha chars
        
#         amharic_ratio = amharic_count / total
        
#         # Clear detection thresholds
#         if amharic_ratio > 0.6:
#             return "am"
#         elif amharic_ratio < 0.2:
#             return "en"
#         else:
#             return "mixed"


# class ActionInitializeLanguage(Action):
#     """Auto-detect and initialize language on first message"""
    
#     def name(self) -> Text:
#         return "action_initialize_language"
    
#     def run(self, dispatcher: CollectingDispatcher, tracker: Tracker,
#             domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
#         # Only initialize if language slot not already set
#         current_language = tracker.get_slot("language")
#         if current_language:
#             return []  # Already initialized, skip
        
#         # Detect language from user message
#         user_text = tracker.latest_message.get("text", "")
#         detected_language = LanguageDetector.detect_language(user_text)
        
#         # For mixed language, default to English
#         if detected_language == "mixed":
#             detected_language = "en"
        
#         return [SlotSet("language", detected_language)]


# class ActionSetLanguage(Action):

#     def name(self) -> Text:
#         return "action_set_language"

#     def run(self, dispatcher: CollectingDispatcher,
#             tracker: Tracker,
#             domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

#         # Get language from entity (explicit user choice)
#         language = None
#         for entity in tracker.latest_message.get("entities", []):
#             if entity.get("entity") == "language":
#                 lang_value = str(entity.get("value", "")).lower().strip()
#                 if lang_value in ["am", "amharic", "አማርኛ"]:
#                     language = "am"
#                 elif lang_value in ["en", "english", "ኢንግሊዝ"]:
#                     language = "en"
#                 break

#         if language not in ["en", "am"]:
#             language = tracker.get_slot("language") or "en"

#         # Get previous context to preserve during switch
#         previous_drug = tracker.get_slot("drug_name")
#         previous_location = tracker.get_slot("location")
#         previous_hospital = tracker.get_slot("hospital_name")
#         previous_pharmacy = tracker.get_slot("pharmacy_name")

#         # Send confirmation with context preservation message
#         if language == "am":
#             msg = "✅ ወደ አማርኛ ቀይርን"
#             if previous_drug:
#                 msg += f"\n(ስለ {previous_drug} ነበሩ መፈለግ)"
#             elif previous_location:
#                 msg += f"\n(በ{previous_location} ውስጥ ነበሩ መፈለግ)"
#         else:
#             msg = "✅ Switched to English"
#             if previous_drug:
#                 msg += f"\n(You were searching for {previous_drug})"
#             elif previous_location:
#                 msg += f"\n(You were searching in {previous_location})"

#         dispatcher.utter_message(text=msg)

#         # IMPORTANT: Return only language slot change, preserve all other slots
#         return [SlotSet("language", language)]
# class ActionSearchDrugs(Action):

#     def name(self) -> Text:
#         return "action_search_drugs"

#     def run(self, dispatcher: CollectingDispatcher,
#             tracker: Tracker,
#             domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

#         language = tracker.get_slot("language") or "en"   # Default to English
#         drug_name = tracker.get_slot("drug_name")

#         if not drug_name:
#             if language == "am":
#                 dispatcher.utter_message(text="እባክዎ የመድሃኒቱን ስም ይንገሩኝ።")
#             else:
#                 dispatcher.utter_message(text="Please tell me the name of the drug you're looking for.")
#             return []

#         # Call your backend API
#         try:
#             response = requests.get(f"http://backend/api/bot/search-drug?name={drug_name}")
#             response.raise_for_status()
#             data = response.json()
#         except:
#             if language == "am":
#                 dispatcher.utter_message(text="የመረጃ ቋቱን ማግኘት አልቻልኩም። ቆይተው እንደገና ይሞክሩ።")
#             else:
#                 dispatcher.utter_message(text="Sorry, I can't connect to the service right now.")
#             return []

#         if not data:
#             if language == "am":
#                 dispatcher.utter_message(text=f"ይቅርታ፣ \"{drug_name}\" አልተገኘም።")
#             else:
#                 dispatcher.utter_message(text=f"Sorry, I couldn't find \"{drug_name}\".")
#             return []

#         data = data[:3]

#         # Language-aware intro
#         intro = (
#             f"🔎 \"{drug_name}\"በ medfinder ዝርዝር ዉስጥ የሚገኝበት መረጃ:\n"
#             if language == "am" else
#             f"🔎 Here are results for \"{drug_name}\":\n"
#         )

#         messages = []
#         for item in data:
#             msg = (
#                 f"🏥 {item.get('pharmacy')}\n"
#                 f"📍 {item.get('location')}\n"
#                 f"💊 {item.get('drug')}\n"
#                 f"💰 {item.get('price')} {'ብር' if language == 'am' else 'ETB'}\n"
#                 f"📦 {item.get('stock')}\n"
#                 f"{'⚠️ ማዘዣ ያስፈልጋል' if item.get('requires_prescription') else '✅ ያለ ማዘዣ'}\n"
#                 f"⏳ {item.get('expiry')}"
#             )
#             messages.append(msg)

#         buttons = [
#             {
#                 "title": "💊 መድኃኒት ፈልግ" if language == "am" else "💊 Search Drug",
#                 "payload": "/search_drug"
#             },
#             {
#                 "title": "🏥 ሆስፒታል ፈልግ" if language == "am" else "🏥 Search Hospital",
#                 "payload": "/search_hospital"
#             },
#             {
#                 "title": "🔍 ፋርማሲ ፈልግ" if language == "am" else "🔍 Search Pharmacy",
#                 "payload": "/search_pharmacy"
#             },
#             {
#                 "title": "🗺️ ካርታ አጠቃቀም" if language == "am" else "🗺️ Map Navigation",
#                 "payload": "/ask_how_to_use_map"
#             }
#         ]

#         dispatcher.utter_message(
#             text=intro + "\n\n".join(messages),
#             buttons=buttons
#         )

#         return []


# class ActionSearchPharmacy(Action):

#     def name(self) -> Text:
#         return "action_search_pharmacy"

#     def run(
#         self,
#         dispatcher: CollectingDispatcher,
#         tracker: Tracker,
#         domain: Dict[Text, Any]
#     ) -> List[Dict[Text, Any]]:

#         language = tracker.get_slot("language") or "en"
#         location = tracker.get_slot("location")
#         pharmacy_name = tracker.get_slot("pharmacy_name")

#         url = "http://backend/api/pharmacies"
#         params = {"location": location} if location else {}

#         # --- API CALL ---
#         try:
#             response = requests.get(url, params=params, timeout=20)
#             response.raise_for_status()
#             all_pharmacies = response.json()

#         except Exception as e:
#             print("ERROR:", str(e))

#             text = (
#                 "የመረጃ ቋቱን ማግኘት አልቻልኩም።"
#                 if language == "am"
#                 else "I can't connect to the pharmacy service right now."
#             )

#             dispatcher.utter_message(text=text)
#             return []

#         # --- NO DATA CASE ---
#         if not all_pharmacies:
#             text = (
#                 "😔 ምንም ፋርማሲ አልተገኘም።"
#                 if language == "am"
#                 else "😔 No pharmacies found."
#             )

#             buttons = [
#                 {
#                     "title": "💊 መድኃኒት ፈልግ" if language == "am" else "💊 Search Drug",
#                     "payload": "/search_drug"
#                 },
#                 {
#                     "title": "🏥 ሆስፒታል ፈልግ" if language == "am" else "🏥 Search Hospital",
#                     "payload": "/search_hospital"
#                 },
#                 {
#                     "title": "🔍 ፋርማሲ ፈልግ" if language == "am" else "🔍 Search Pharmacy",
#                     "payload": "/search_pharmacy"
#                 },
#                 {
#                     "title": "🗺️ ካርታ አጠቃቀም" if language == "am" else "🗺️ Map Navigation",
#                     "payload": "/ask_how_to_use_map"
#                 }
#             ]

#             dispatcher.utter_message(text=text, buttons=buttons)
#             return []

#         # --- FUZZY MATCHING ---
#         final_list = all_pharmacies

#         if pharmacy_name:
#             names = [p["pharmacy"] for p in all_pharmacies]
#             match = process.extractOne(pharmacy_name, names)

#             if match:
#                 best_match, score = match
#                 if score > 70:
#                     final_list = [
#                         p for p in all_pharmacies
#                         if p["pharmacy"] == best_match
#                     ]

#         # --- FORMAT RESPONSE ---
#         messages = []
#         for item in final_list[:5]:
#             msg = (
#                 f"🏥 {item.get('pharmacy')}\n"
#                 f"📍 {item.get('location')}\n"
#                 f"🕒 {item.get('working_hours')}\n"
#                 f"📞 {item.get('phone')}"
#             )
#             messages.append(msg)

#         intro = (
#             "ያገኘኋቸው ፋርማሲዎች:\n"
#             if language == "am"
#             else "Here are the pharmacies I found:\n"
#         )

#         buttons = [
#             {
#                 "title": "💊 መድኃኒት ፈልግ" if language == "am" else "💊 Search Drug",
#                 "payload": "/search_drug"
#             },
#             {
#                 "title": "🏥 ሆስፒታል ፈልግ" if language == "am" else "🏥 Search Hospital",
#                 "payload": "/search_hospital"
#             },
#             {
#                 "title": "🔍 ፋርማሲ ፈልግ" if language == "am" else "🔍 Search Pharmacy",
#                 "payload": "/search_pharmacy"
#             },
#             {
#                 "title": "🗺️ ካርታ አጠቃቀም" if language == "am" else "🗺️ Map Navigation",
#                 "payload": "/ask_how_to_use_map"
#             }
#         ]

#         dispatcher.utter_message(
#             text=intro + "\n\n".join(messages),
#             buttons=buttons
#         )

#         return []

# class ActionSearchHospital(Action):

#     def name(self) -> Text:
#         return "action_search_hospital"

#     def run(self, dispatcher: CollectingDispatcher,
#             tracker: Tracker,
#             domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

#         language = tracker.get_slot("language") or "en"
#         hospital_name = tracker.get_slot("hospital_name")
#         location = tracker.get_slot("location")

#         url = "http://backend/api/hospitals"
#         params = {"location": location} if location else {}

#         try:
#             response = requests.get(url, params=params, timeout=5)
#             response.raise_for_status()
#             results = response.json()
#         except:
#             text = "ሆስፒታል መረጃ ማግኘት አልቻልኩም።" if language == "am" else "I can't reach hospital data right now."
#             dispatcher.utter_message(text=text)
#             return []

#         if not results:
#             text = "ምንም ሆስፒታል አልተገኘም።" if language == "am" else "No hospitals found."
#             dispatcher.utter_message(text=text)
#             return []

#         final_results = results
#         if hospital_name:
#             names = [h['name'] for h in results]
#             best_match, score = process.extractOne(hospital_name, names)
#             if score > 70:
#                 final_results = [h for h in results if h['name'] == best_match]

#         messages = []
#         for h in final_results[:3]:
#             msg = (
#                 f"🏥 {h['name']}\n"
#                 f"📍 {h.get('location')}\n"
#                 f"📞 {h.get('phone')}"
#             )
#             messages.append(msg)

#         intro = "የተገኙ ሆስፒታሎች:\n" if language == "am" else "Here are the hospitals I found:\n"

#         buttons = [
#             {
#                 "title": "💊 መድኃኒት ፈልግ" if language == "am" else "💊 Search Drug",
#                 "payload": "/search_drug"
#             },
#             {
#                 "title": "🏥 ሆስፒታል ፈልግ" if language == "am" else "🏥 Search Hospital",
#                 "payload": "/search_hospital"
#             },
#             {
#                 "title": "🔍 ፋርማሲ ፈልግ" if language == "am" else "🔍 Search Pharmacy",
#                 "payload": "/search_pharmacy"
#             },
#             {
#                 "title": "🗺️ ካርታ አጠቃቀም" if language == "am" else "🗺️ Map Navigation",
#                 "payload": "/ask_how_to_use_map"
#             }
#         ]

#         dispatcher.utter_message(
#             text=intro + "\n\n".join(messages),
#             buttons=buttons
#         )

#         return []