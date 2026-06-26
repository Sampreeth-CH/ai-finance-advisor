import json
import requests
from app.core.config import settings

def smart_categorize_transactions(descriptions: list) -> dict:
    """
    Acts purely as a Category Dictionary. Takes a list of strings and returns their categories.
    """
    api_key = settings.GROQ_API_KEY
    if not api_key:
        raise Exception("Groq API Key is missing from configuration.")

    prompt = f"""You are a Universal Financial Categorization Dictionary.
I will give you a list of transaction descriptions. 
You must return a JSON dictionary where the KEY is the exact description I gave you, and the VALUE is an object with 'category' and 'flow'.

RULES:
1. FLOW: "INCOME" (Money received, e.g., Salary, Refund) or "EXPENSE" (Money spent, e.g., Food, Shopping).
2. CATEGORY: Invent a highly accurate 1-3 word category.

EXAMPLE OUTPUT FORMAT:
{{
  "Swiggy": {{"category": "Food & Dining", "flow": "EXPENSE"}},
  "University Scholarship": {{"category": "Education Grants", "flow": "INCOME"}},
  "Dad sent money": {{"category": "Family Allowance", "flow": "INCOME"}}
}}

INPUT DESCRIPTIONS:
{json.dumps(descriptions)}

Return ONLY the JSON dictionary object.
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
        response = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload, timeout=10)
        
        if response.status_code != 200:
            raise Exception(f"Groq API Error: {response.text}")

        ai_content = response.json()["choices"][0]["message"]["content"]
        parsed_json = json.loads(ai_content)
        
        # Convert all keys to lowercase so Python can match them perfectly later
        lowercase_dict = {str(k).lower(): v for k, v in parsed_json.items()}
        return lowercase_dict
        
    except Exception as e:
        print(f"Categorizer failed: {str(e)}")
        raise e