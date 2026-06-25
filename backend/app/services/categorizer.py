import json
import requests
from pydantic import BaseModel
from app.core.config import settings

def smart_categorize_transactions(raw_transactions: list) -> list:
    api_key = settings.GROQ_API_KEY
    if not api_key:
        raise Exception("Groq API Key is missing from configuration.")

    prompt = f"""You are an elite AI Financial Categorizer.
Read the transactions, assign a category, and determine if it is "income" or "expense".

RULES:
1. "income": Money RECEIVED (Salary, Scholarship, Pocket Money, Refund, Selling items).
2. "expense": Money SPENT (Food, Shopping, Bills, Swiggy, Netflix).
3. "category": Generate a concise 1-3 word category (e.g., "Education", "Food & Dining", "Income").

Return pure JSON matching this EXACT format:
{{
  "transactions": [
    {{
      "description": "Scholarship",
      "amount": 5000.0,
      "category": "Education",
      "type": "income",
      "split_with": ""
    }},
    {{
      "description": "Swiggy",
      "amount": 450.0,
      "category": "Food & Dining",
      "type": "expense",
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
        "temperature": 0.0, 
        "response_format": {"type": "json_object"} 
    }

    try:
        response = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload, timeout=15)
        
        if response.status_code != 200:
            raise Exception(f"Groq API Error: {response.text}")

        ai_content = response.json()["choices"][0]["message"]["content"]
        print("--- AI RAW OUTPUT ---")
        print(ai_content) # You can see this in your Render logs!
        print("---------------------")

        parsed_data = json.loads(ai_content)
        
        if isinstance(parsed_data, dict):
            return parsed_data.get("transactions", parsed_data.get("data", []))
        elif isinstance(parsed_data, list):
            return parsed_data
        else:
            return []
        
    except Exception as e:
        print(f"Error during AI categorization: {str(e)}")
        raise e