from openAi_client import ask_openai
from config import TRIAGE_RESPONSES

def triage_assessment(symptoms: str) -> str:
    prompt = f"""
    Classify the urgency level of the following symptoms.

    Symptoms:
    {symptoms}

    Instructions:
    - Do NOT diagnose
    - Do NOT mention diseases
    - Output ONLY one word:
      EMERGENCY, URGENT, or NON_URGENT
    """

    label = ask_openai(prompt, temperature=0).upper()

    return TRIAGE_RESPONSES.get(label, TRIAGE_RESPONSES["URGENT"])
