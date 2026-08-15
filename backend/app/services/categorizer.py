import json
import requests
from app.core.config import settings

def smart_categorize_transactions(descriptions: list) -> dict:
    """
    Acts purely as a Category Dictionary. Takes a list of strings and returns their categories, flow, and extracted names.
    """
    api_key = settings.GROQ_API_KEY
    if not api_key:
        raise Exception("Groq API Key is missing from configuration.")

    prompt = f"""You are a Universal Financial Categorization Dictionary.
I will give you a list of transaction descriptions. 
You must return a JSON dictionary where the KEY is the exact description I gave you, and the VALUE is an object with 'category', 'flow', and 'extracted_name'.

RULES:
1. FLOW: "INCOME" (Money received, e.g., Salary, Refund) or "EXPENSE" (Money spent, e.g., Food, Shopping).
2. CATEGORY: Invent a highly accurate 1-3 word category.
3. EXTRACTED NAME (CRITICAL): If the description implies a shared expense or mentions a person (e.g., "party Rahul", "Dinner with Sarah"), extract the person's name (e.g., "Rahul", "Sarah"). If no person is mentioned, leave it as "".

EXAMPLE OUTPUT FORMAT:
{{
  "party Rahul": {{"category": "Entertainment", "flow": "EXPENSE", "extracted_name": "Rahul"}},
  "Swiggy": {{"category": "Food & Dining", "flow": "EXPENSE", "extracted_name": ""}},
  "Dad sent money": {{"category": "Family Allowance", "flow": "INCOME", "extracted_name": "Dad"}}
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
        "model": "openai/gpt-oss-120b",
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