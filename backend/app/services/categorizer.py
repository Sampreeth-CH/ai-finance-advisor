import json
import requests
from app.core.config import settings

def smart_categorize_transactions(raw_transactions: list) -> list:
    """
    Leverages LLaMA 3.3 to dynamically categorize transactions, detect type,
    and normalize mathematical signs using pure JSON mode.
    """
    api_key = settings.GROQ_API_KEY
    if not api_key:
        raise Exception("Groq API Key is missing from configuration.")

    # EXPANDED TAXONOMY with explicit Income/Expense mapping
    taxonomy_guide = {
        "Income (Positive)": ["Salary", "Freelance", "Scholarship", "Cashback", "Refund", "Pocket Money", "Government Grant", "Sold Items", "Dividend", "Interest"],
        "Food & Dining (Negative)": ["Restaurants", "Swiggy", "Zomato", "Cafes", "Groceries", "Supermarkets", "Snacks"],
        "Shopping (Negative)": ["Amazon", "Flipkart", "Apparel", "Electronics", "Fashion", "Home Decor"],
        "Utilities & Bills (Negative)": ["Rent", "Electricity", "Internet", "Recharge", "Subscriptions", "Netflix", "Water Bill", "Gas"],
        "Transport & Travel (Negative)": ["Cabs", "Uber", "Petrol", "Flights", "Metro", "Train Tickets", "Tolls"],
        "Health & Education (Negative)": ["Pharmacy", "Hospital", "School Fees", "Tuition", "Courses", "Gym", "Health Insurance"],
        "Personal & Family (Negative)": ["Pet Care", "Childcare", "Gifts", "Charity", "Personal Care", "Haircut"],
        "Finance & Taxes (Negative)": ["Taxes", "Credit Card Bill", "EMI", "Loan Repayment", "Bank Fees", "Insurance Premium"]
    }

    prompt = f"""You are an advanced financial data processing engine.
Analyze this list of raw transactions. Infer the category, determine if it is an INCOME or EXPENSE, and fix the math sign.

TAXONOMY GUIDE:
{json.dumps(taxonomy_guide, indent=2)}

STRICT RULES:
1. CATEGORY: Map to the closest category above. If it doesn't fit ANY of them, dynamically invent a highly accurate 1-3 word category.
2. MATH SIGNS (CRITICAL):
   - INCOME = POSITIVE amount (e.g., 5000). Money entering the pocket.
   - EXPENSE = NEGATIVE amount (e.g., -450). Money leaving the pocket.
3. SPLIT WITH: You MUST retain the exact "split_with" value provided in the input. Do not delete it.
4. FORMAT: You MUST return a pure JSON object containing a "transactions" array.

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
        "response_format": {"type": "json_object"} # FORCES BULLETPROOF JSON
    }

    try:
        response = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload, timeout=10)
        if response.status_code != 200:
            raise Exception(f"Groq API Error: {response.text}")

        ai_content = response.json()["choices"][0]["message"]["content"]
        
        parsed_json = json.loads(ai_content)
        return parsed_json.get("transactions", parsed_json.get("data", []))
        
    except Exception as e:
        print(f"Error during AI categorization: {str(e)}")
        raise e