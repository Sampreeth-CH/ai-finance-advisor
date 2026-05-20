import requests
from app.core.config import settings

def generate_ai_insights_llm(analysis, history_data: list = None):
    # 1. Format the history into a readable string for the AI
    history_context = "No previous history available."
    if history_data:
        # We pass the raw data directly to the LLM to analyze past trends
        history_context = f"User has {len(history_data)} past transactions on record. Here is their historical data: {history_data}"

    # 2. Build the context-aware prompt
    prompt = f"""
    You are a smart financial advisor.

    CURRENT UPLOAD ANALYSIS:
    {analysis}
    
    USER'S HISTORICAL CONTEXT (Past Transactions):
    {history_context}

    Based on BOTH their past history and their current upload, give:
    - Key insights (Compare current spending to their past habits)
    - Overspending warnings
    - Saving suggestions
    """

    try:
        # 3. Keep your exact same API request logic
        response = requests.post(
            f"{settings.OLLAMA_URL}/api/generate",
            json={
                "model": settings.OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False
            }
        )

        return response.json()["response"]

    except Exception as e:
        raise Exception(f"Ollama Error: {str(e)}")