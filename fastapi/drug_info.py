from openAi_client import ask_openai
from config import DISCLAIMER

def drug_information(question: str) -> str:
    prompt = f"""
    Answer the following drug-related question.

    Rules:
    - General information only
    - No dosage
    - No treatment advice

    Question:
    {question}
    """

    response = ask_openai(prompt)
    return f"{response}\n\n{DISCLAIMER}"
