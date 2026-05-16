from openAi_client import ask_openai

def facility_intent(user_input: str) -> bool:
    """Better intent detection using LLM - understands natural language"""
    prompt = f"""
    Does the user want to find a nearby hospital, clinic, or pharmacy?
    Answer ONLY with YES or NO. Do not explain.

    User message: {user_input}
    """

    answer = ask_openai(prompt, temperature=0).strip().upper()
    return "YES" in answer