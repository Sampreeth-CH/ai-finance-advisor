import json
import requests
from pydantic import BaseModel
from app.core.config import settings

def smart_categorize_transactions(raw_transactions: list) -> list:
    """
    Leverages LLaMA 3.3 with strict 1-shot prompting and bulletproof parsing.
    """
    api_key = settings.GROQ_API_KEY
    if not api_key:
        raise Exception("Groq API Key is missing from configuration.")

    prompt = f"""You are a world-class AI Financial Analyst. 
Analyze the raw transactions, assign a universal category, and fix the mathematical sign.

CRITICAL RULES:
1. INFLOW (Positive): Money RECEIVED by the user (Salary, Scholarship, Refunds, Pocket Money). You MUST output a positive number (e.g., 5000.0).
2. OUTFLOW (Negative): Money SPENT by the user (Food, Bills, Shopping). You MUST output a negative number (e.g., -500.0).
3. Category: Use universally recognized 1-3 word categories (e.g., "Food & Dining", "Education", "Shopping", "Income").

You MUST return pure JSON matching this EXACT structure:
{{
  "transactions": [
    {{
      "description": "Scholarship",
      "amount": 5000.0,
      "category": "Education",
      "split_with": ""
    }},
    {{
      "description": "Swiggy",
      "amount": -450.0,
      "category": "Food & Dining",
      "split_with": ""
    }}
  ]
}}

INPUT DATA:
{json.dumps(raw_transactions)}
"""

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.0,  # Zero temperature for strictly logical parsing
        "response_format": {"type": "json_object"} # Forces absolute pure JSON
    }

    try:
        response = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload, timeout=15)
        
        if response.status_code != 200:
            raise Exception(f"Groq API Error: {response.text}")

        ai_content = response.json()["choices"][0]["message"]["content"]
        
        # --- DEBUGGING: Print what the AI actually said to your Render terminal ---
        print("--- RAW AI RESPONSE ---")
        print(ai_content)
        print("-----------------------")
        
        parsed_data = json.loads(ai_content)
        
        # --- BULLETPROOF PARSING ---
        # If the AI ignored the wrapper and just returned a list [...]
        if isinstance(parsed_data, list):
            return parsed_data
            
        # If the AI returned a dictionary {...}
        elif isinstance(parsed_data, dict):
            # Safely try to grab "transactions", or fallback to the raw dict if it structured it weirdly
            return parsed_data.get("transactions", parsed_data.get("data", []))
            
        else:
            raise Exception("AI returned unparseable JSON structure.")
        
    except Exception as e:
        print(f"Error during AI categorization: {str(e)}")
        raise e