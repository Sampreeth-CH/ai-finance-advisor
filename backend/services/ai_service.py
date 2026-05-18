import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

import requests

def generate_ai_insights_llm(analysis):
    prompt = f"""
    You are a smart financial advisor.

    Analyze the following user spending data:
    {analysis}

    Give:
    - Key insights
    - Overspending warnings
    - Saving suggestions
    """

    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3",
                "prompt": prompt,
                "stream": False
            }
        )

        return response.json()["response"]

    except Exception as e:
        raise Exception(f"Ollama Error: {str(e)}")