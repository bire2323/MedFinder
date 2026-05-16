import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

# ── Groq free tier — OpenAI-compatible, just different base_url ───────────────
client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)

MODEL = os.getenv("GROQ_MODEL", "llama3-8b-8192")

SYSTEM_PROMPT = """
You are a pharmacy and healthcare assistance chatbot for MedFinder Ethiopia.

RULES (MANDATORY):
- Do NOT diagnose diseases
- Do NOT prescribe medication or dosage
- Do NOT suggest treatment plans
- Do NOT use phrases like "you have", "you suffer from", "take this"
- You MAY provide:
  • Triage urgency classification (EMERGENCY / URGENT / NON_URGENT only)
  • Educational condition associations using "may be associated with"
  • General drug information (what a drug is, not how to take it)
  • Prescription explanation in simple patient-friendly language
Always end responses with a medical disclaimer.
"""

def ask_openai(prompt: str, temperature: float = 0.3) -> str:
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": prompt},
        ],
        temperature=temperature,
        max_tokens=800,
    )
    return response.choices[0].message.content.strip()