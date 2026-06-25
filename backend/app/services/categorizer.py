import json
import requests
from app.core.config import settings

def smart_categorize_transactions(raw_transactions: list) -> list:
    """
    Universal Categorization Engine: Relies purely on AI world knowledge, zero hardcoded lists.
    """
    api_key = settings.GROQ_API_KEY
    if not api_key:
        raise Exception("Groq API Key is missing from configuration.")

    prompt = f"""You are a Universal Financial Categorization AI. 
Your job is to analyze transactions from anywhere in the world, dynamically generate a highly accurate category, and determine the cash flow direction.

RULES:
1. UNIVERSAL CATEGORIES: Do NOT use a pre-set list. Use your vast global knowledge to generate the most accurate 1 to 3 word category for the transaction. 
   - Example A: "Steam Games" -> "Gaming"
   - Example B: "Pedigree" -> "Pet Supplies"
   - Example C: "Traffic Fine" -> "Government Dues"
   - Example D: "Freelance UI Design" -> "Freelance Income"
2. FLOW DIRECTION (CRITICAL): 
   - If money is RECEIVED by the user (Salary, Scholarship, Sold Items, Refunds, Grants), label flow as "INCOME".
   - If money is SPENT by the user (Food, Bills, Fines, Shopping, Subscriptions), label flow as "EXPENSE".

You MUST output a JSON object containing a single key "data". The value of "data" must be an array of the processed objects.

Example Output Format:
{{
  "data": [
    {{"description": "Veterinary Clinic", "amount": 1200, "category": "Pet Care", "flow": "EXPENSE", "split_with": ""}},
    {{"description": "University Scholarship", "amount": 5000, "category": "Education Grants", "flow": "INCOME", "split_with": ""}}
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
        "temperature": 0.2, # Slightly increased so it is creative enough to invent good category names
        "response_format": {"type": "json_object"}
    }

    try:
        response = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload, timeout=10)
        
        if response.status_code != 200:
            raise Exception(f"Groq API Error: {response.text}")

        ai_content = response.json()["choices"][0]["message"]["content"]
        
        # Safely parse the guaranteed JSON object
        parsed_json = json.loads(ai_content)
        return parsed_json.get("data", [])
        
    except Exception as e:
        raise Exception(f"Categorizer failed: {str(e)}")