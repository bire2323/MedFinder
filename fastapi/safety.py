# Phrase-level blocks — only trigger on full medical advice phrases,
# not on innocent words like "tablet" appearing in general drug info.
BLOCKED_PHRASES = [
    "you have been diagnosed",
    "you have diabetes",
    "you have cancer",
    "you suffer from",
    "you are suffering from",
    "take this medication",
    "take this tablet",
    "your dosage is",
    "take X mg",
    "treatment plan for you",
    "i prescribe",
    "i recommend you take",
    "you need to take",
    "you should take",
]

def safety_filter(text: str) -> str:
    text_lower = text.lower()
    for phrase in BLOCKED_PHRASES:
        if phrase in text_lower:
            return (
                "⚠️ I cannot provide diagnosis, dosage, or treatment advice. "
                "I can only give general information and triage support.\n\n"
                "Please consult a qualified doctor or pharmacist for personal medical advice."
            )
    return text