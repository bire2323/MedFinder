import requests
from typing import Any, Text, Dict, List

from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
from thefuzz import process


class ActionSetLanguage(Action):

    def name(self) -> Text:
        return "action_set_language"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        # Get language from slot (auto-filled by Rasa from the entity you send)
        language = tracker.get_slot("language") or "en"

        # Extra safety: also check latest entities (in case auto-fill didn't trigger)
        for entity in tracker.latest_message.get("entities", []):
            if entity.get("entity") == "language":
                lang_value = str(entity.get("value", "")).lower().strip()
                if lang_value in ["am", "amharic", "አማርኛ"]:
                    language = "am"
                elif lang_value in ["en", "english"]:
                    language = "en"
                break

        if language not in ["en", "am"]:
            language = "en"

        # Send friendly confirmation in the chosen language
        if language == "am":
            dispatcher.utter_message(text="ቋንቋ ወደ አማርኛ ተቀይሯል ✅")
        else:
            dispatcher.utter_message(text="Language has been set to English ✅")

        return [SlotSet("language", language)]
class ActionSearchDrugs(Action):

    def name(self) -> Text:
        return "action_search_drugs"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        language = tracker.get_slot("language") or "en"   # Default to English
        drug_name = tracker.get_slot("drug_name")

        if not drug_name:
            if language == "am":
                dispatcher.utter_message(text="እባክዎ የመድሃኒቱን ስም ይንገሩኝ።")
            else:
                dispatcher.utter_message(text="Please tell me the name of the drug you're looking for.")
            return []

        # Call your backend API
        try:
            response = requests.get(f"http://localhost:8000/api/bot/search-drug?name={drug_name}")
            response.raise_for_status()
            data = response.json()
        except:
            if language == "am":
                dispatcher.utter_message(text="የመረጃ ቋቱን ማግኘት አልቻልኩም። ቆይተው እንደገና ይሞክሩ።")
            else:
                dispatcher.utter_message(text="Sorry, I can't connect to the service right now.")
            return []

        if not data:
            if language == "am":
                dispatcher.utter_message(text=f"ይቅርታ፣ \"{drug_name}\" አልተገኘም።")
            else:
                dispatcher.utter_message(text=f"Sorry, I couldn't find \"{drug_name}\".")
            return []

        data = data[:3]

        # Language-aware intro
        intro = (
            f"🔎 \"{drug_name}\"በ medfinder ዝርዝር ዉስጥ የሚገኝበት መረጃ:\n"
            if language == "am" else
            f"🔎 Here are results for \"{drug_name}\":\n"
        )

        messages = []
        for item in data:
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

        buttons = [
            {
                "title": "📍 ቅርብ ፋርማሲዎች" if language == "am" else "📍 Near me",
                "payload": { "intent": "find_nearby_pharmacies", "data": { "drug_name": drug_name } }
            },
            {
                "title": "💰 ዝቅተኛ ዋጋ" if language == "am" else "💰 Lowest price",
                "payload": { "intent": "find_lowest_price", "data": { "drug_name": drug_name } }
            }
        ]

        dispatcher.utter_message(
            text=intro + "\n\n".join(messages),
            buttons=buttons
        )

        return []


class ActionSearchPharmacy(Action):

    def name(self) -> Text:
        return "action_search_pharmacy"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any]
    ) -> List[Dict[Text, Any]]:

        language = tracker.get_slot("language") or "en"
        location = tracker.get_slot("location")
        pharmacy_name = tracker.get_slot("pharmacy_name")

        url = "http://127.0.0.1:8000/api/pharmacies"
        params = {"location": location} if location else {}

        # --- API CALL ---
        try:
            response = requests.get(url, params=params, timeout=20)
            response.raise_for_status()
            all_pharmacies = response.json()

        except Exception as e:
            print("ERROR:", str(e))

            text = (
                "የመረጃ ቋቱን ማግኘት አልቻልኩም።"
                if language == "am"
                else "I can't connect to the pharmacy service right now."
            )

            dispatcher.utter_message(text=text)
            return []

        # --- NO DATA CASE ---
        if not all_pharmacies:
            text = (
                "😔 ምንም ፋርማሲ አልተገኘም።"
                if language == "am"
                else "😔 No pharmacies found."
            )

            buttons = [
                {
                    "title": "📍 ቅርብ ፋርማሲዎች"
                    if language == "am"
                    else "📍 Find nearby pharmacies",
                    "payload": "/find_nearby_pharmacies"
                }
            ]

            dispatcher.utter_message(text=text, buttons=buttons)
            return []

        # --- FUZZY MATCHING ---
        final_list = all_pharmacies

        if pharmacy_name:
            names = [p["pharmacy"] for p in all_pharmacies]
            match = process.extractOne(pharmacy_name, names)

            if match:
                best_match, score = match
                if score > 70:
                    final_list = [
                        p for p in all_pharmacies
                        if p["pharmacy"] == best_match
                    ]

        # --- FORMAT RESPONSE ---
        messages = []
        for item in final_list[:5]:
            msg = (
                f"🏥 {item.get('pharmacy')}\n"
                f"📍 {item.get('location')}\n"
                f"🕒 {item.get('working_hours')}\n"
                f"📞 {item.get('phone')}"
            )
            messages.append(msg)

        intro = (
            "ያገኘኋቸው ፋርማሲዎች:\n"
            if language == "am"
            else "Here are the pharmacies I found:\n"
        )

        buttons = [
            {
                "title": "📍 ቅርብ ፋርማሲዎች"
                if language == "am"
                else "📍 Near me",
                "payload": "/find_nearby_pharmacies",
                
            }
        ]

        dispatcher.utter_message(
            text=intro + "\n\n".join(messages),
            buttons=buttons
        )

        return []

class ActionSearchHospital(Action):

    def name(self) -> Text:
        return "action_search_hospital"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        language = tracker.get_slot("language") or "en"
        hospital_name = tracker.get_slot("hospital_name")
        location = tracker.get_slot("location")

        url = "http://localhost:8000/api/hospitals"
        params = {"location": location} if location else {}

        try:
            response = requests.get(url, params=params, timeout=5)
            response.raise_for_status()
            results = response.json()
        except:
            text = "ሆስፒታል መረጃ ማግኘት አልቻልኩም።" if language == "am" else "I can't reach hospital data right now."
            dispatcher.utter_message(text=text)
            return []

        if not results:
            text = "ምንም ሆስፒታል አልተገኘም።" if language == "am" else "No hospitals found."
            dispatcher.utter_message(text=text)
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

        intro = "የተገኙ ሆስፒታሎች:\n" if language == "am" else "Here are the hospitals I found:\n"

        buttons = [
            {
                "title": "📍 ቅርብ ሆስፒታሎች" if language == "am" else "📍 Near me",
                "payload": "/find_nearby_hospitals"
            }
        ]

        dispatcher.utter_message(
            text=intro + "\n\n".join(messages),
            buttons=buttons
        )

        return []