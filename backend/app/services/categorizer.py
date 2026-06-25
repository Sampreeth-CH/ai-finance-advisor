import json
import re
import requests
from pydantic import BaseModel
from app.core.config import settings

def smart_categorize_transactions(raw_transactions: list) -> list:
    """
    Leverages LLaMA 3.3 to dynamically categorize transactions, detect type,
    and normalize mathematical signs based on merchant intent.
    """
    api_key = settings.GROQ_API_KEY
    if not api_key:
        raise Exception("Groq API Key is missing from configuration.")

    # Expanded Taxonomy as a guide, but the AI is allowed to auto-detect beyond this
    taxonomy_guide = {
        "Income": ["Salary", "Freelance", "Scholarship", "Cashback", "Refund", "Pocket Money", "Government Grant", "Sold Items", "Dividend", "Interest"],
        "Food & Dining": ["Restaurants", "Swiggy", "Zomato", "Cafes", "Groceries", "Supermarkets", "Snacks"],
        "Shopping": ["Amazon", "Flipkart", "Apparel", "Electronics", "Fashion"],
        "Utilities & Bills": ["Rent", "Electricity", "Internet", "Recharge", "Subscriptions", "Netflix", "Water Bill"],
        "Transport & Travel": ["Cabs", "Uber", "Petrol", "Flights", "Metro", "Train Tickets"],
        "Health & Education": ["Pharmacy", "Hospital", "School Fees", "Tuition", "Courses", "Gym"],
    }

    prompt = f"""You are an advanced financial data processing engine.
Analyze this list of raw transactions. You must infer the category, and explicitly determine if it is an INCOME or an EXPENSE to fix the math sign.

TAXONOMY GUIDE (For Reference):
{json.dumps(taxonomy_guide, indent=2)}

STRICT PROCESSING RULES:
1. CATEGORY DETECTION: Try to use the Taxonomy Guide above. IF the transaction does not fit any of those, AUTOMATICALLY DETECT and invent a highly accurate, short category name (e.g., "Taxes", "Charity", "Insurance").
2. INCOME vs EXPENSE (CRITICAL FOR MATH SIGNS):
   - INCOME: Money entering the user's pocket (e.g., Salary, Scholarship, Refund, Pocket Money, Grants). You MUST format the amount as a POSITIVE number (e.g., 5000).
   - EXPENSE: Money leaving the user's pocket (e.g., Swiggy, Rent, Shopping, Amazon, Fees, EMI). You MUST format the amount as a NEGATIVE number (e.g., -450).
3. You must return EXACTLY a raw JSON array of objects. Do not add any text before or after the array.

EXAMPLE OUTPUT FORMAT (Follow this exactly):
[
  {{"description": "Swiggy", "amount": -450, "category": "Food & Dining", "split_with": ""}},
  {{"description": "College Scholarship", "amount": 5000, "category": "Income", "split_with": ""}}
]

INPUT DATA:
{json.dumps(raw_transactions)}

Generate the perfectly structured JSON output now:"""

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.0  # Zero temperature forces absolute determinism
    }

    try:
        response = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload, timeout=10)
        if response.status_code != 200:
            raise Exception(f"Groq API responded with code {response.status_code}")

        ai_content = response.json()["choices"][0]["message"]["content"]
        
        # --- BULLETPROOF JSON EXTRACTION ---
        # This guarantees Python only reads the data inside the brackets, ignoring any chatty AI text!
        start_idx = ai_content.find('[')
        end_idx = ai_content.rfind(']')
        
        if start_idx != -1 and end_idx != -1:
            cleaned_json = ai_content[start_idx:end_idx+1]
        else:
            # Fallback cleanup just in case
            cleaned_json = re.sub(r"```json\n|\n```|```", "", ai_content).strip()
            
        return json.loads(cleaned_json)
        
    except Exception as e:
        print(f"Error during AI categorization: {str(e)}")
        print(f"Raw AI Output was: {ai_content if 'ai_content' in locals() else 'None'}")
        raise e