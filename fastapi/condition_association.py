from openAi_client import ask_openai
from config import DISCLAIMER

def condition_association(symptoms: str) -> str:
    prompt = f"""
    Based on the symptoms below, list possible condition categories
    they are commonly associated with.

    Rules:
    - Do NOT diagnose
    - Use phrases like "may be associated with"
    - Do NOT say the user has a disease

    Symptoms:
    {symptoms}
    """

    response = ask_openai(prompt)
    return f"{response}\n\n{DISCLAIMER}"
