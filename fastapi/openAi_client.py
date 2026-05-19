import os
import time
import logging
from dotenv import load_dotenv
from openai import OpenAI, APIConnectionError, APIError, RateLimitError, APITimeoutError

load_dotenv()
logger = logging.getLogger(__name__)

# ── Groq API Configuration ─────────────────────────────────────────────────────
client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
    timeout=30.0,  # ← Add explicit timeout (prevents hanging)
)

MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

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


def ask_openai(
    prompt: str,
    temperature: float = 0.3,
    max_retries: int = 3,
    timeout: float = 30.0,
) -> str:
    """
    Query Groq API with exponential backoff retry logic and comprehensive error handling.
    
    This function gracefully handles network errors, rate limits, and API failures
    without crashing the endpoint. Returns a user-friendly error message instead
    of raising exceptions.
    
    Args:
        prompt (str): User prompt to send to the AI
        temperature (float): Sampling temperature (0.0-2.0). Default: 0.3
        max_retries (int): Number of retry attempts. Default: 3
        timeout (float): Request timeout in seconds. Default: 30.0
        
    Returns:
        str: AI response or graceful error message
        
    Raises:
        None - Always returns a response, even on error
        
    Examples:
        >>> response = ask_openai("What is diabetes?")
        >>> print(response)
        # Returns AI response or friendly error message
    """
    
    for attempt in range(max_retries):
        try:
            logger.info(f"[ask_openai] Attempt {attempt + 1}/{max_retries}")
            
            # Create the API request with explicit timeout
            response = client.chat.completions.create(
                model=MODEL,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                temperature=temperature,
                max_tokens=800,
                timeout=timeout,
            )
            
            result = response.choices[0].message.content.strip()
            logger.info(f"[ask_openai] Success on attempt {attempt + 1}")
            return result
            
        # ── Handle Rate Limiting ────────────────────────────────────────────
        except RateLimitError as e:
            logger.warning(
                f"[ask_openai] Rate limit hit (attempt {attempt + 1}/{max_retries}): {e}"
            )
            
            if attempt < max_retries - 1:
                # Exponential backoff: 1s, 2s, 4s
                wait_time = 2 ** attempt
                logger.info(f"[ask_openai] Waiting {wait_time}s before retry...")
                time.sleep(wait_time)
            else:
                logger.error("[ask_openai] Max retries exceeded for rate limit")
                return (
                    "⚠️ The AI service is temporarily busy. "
                    "Please try again in a few moments."
                )
        
        # ── Handle Network/Connection Errors ────────────────────────────────
        except (APIConnectionError, APITimeoutError) as e:
            logger.error(
                f"[ask_openai] Connection error (attempt {attempt + 1}/{max_retries}): {type(e).__name__}: {e}"
            )
            
            if attempt < max_retries - 1:
                wait_time = 2 ** attempt
                logger.info(f"[ask_openai] Waiting {wait_time}s before retry...")
                time.sleep(wait_time)
            else:
                logger.error("[ask_openai] Failed to connect after all retries")
                return (
                    "⚠️ Unable to connect to the AI service. "
                    "This may be a network issue or the service is temporarily unavailable. "
                    "Please check your internet connection and try again."
                )
        
        # ── Handle Generic API Errors ───────────────────────────────────────
        except APIError as e:
            logger.error(f"[ask_openai] API error: {type(e).__name__}: {e}")
            return (
                "⚠️ The AI service encountered an error. "
                "Please try again later. If the problem persists, contact support."
            )
        
        # ── Handle Unexpected Errors ────────────────────────────────────────
        except Exception as e:
            logger.exception(f"[ask_openai] Unexpected error: {type(e).__name__}: {e}")
            return (
                "⚠️ An unexpected error occurred while processing your request. "
                "Please try again or contact support."
            )
    
    # Fallback (should not reach here with retry logic)
    logger.error("[ask_openai] Exhausted all retries - returning fallback error")
    return (
        "⚠️ Unable to process your request after multiple attempts. "
        "Please try again later."
    )