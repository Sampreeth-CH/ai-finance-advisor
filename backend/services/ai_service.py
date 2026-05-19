import requests
import os

def generate_ai_insights_llm(analysis):

    # 🔥 If running locally (Ollama)
    if os.getenv("USE_OLLAMA") == "true":
        try:
            response = requests.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": "mistral",
                    "prompt": f"""
                    You are a smart financial advisor.
                    Analyze:
                    {analysis}
                    """,
                    "stream": False
                }
            )
            return response.json()["response"]

        except Exception as e:
            return f"Ollama Error: {str(e)}"

    # 🌐 For deployment (fallback)
    else:
        return f"""
        AI Insight (Demo Mode):

        - You are spending heavily on food.
        - Try reducing unnecessary expenses.
        - Save at least 20% of income.
        """