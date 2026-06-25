import json
import requests
from pydantic import BaseModel
from app.core.config import settings

def smart_categorize_transactions(raw_transactions: list) -> list:
    """
    Leverages LLaMA 3.3 to dynamically categorize transactions using Native JSON mode.
    """
    api_key = settings.GROQ_API_KEY
    if not api_key:
        raise Exception("Groq API Key is missing from configuration.")

    prompt = f"""You are a world-class AI Financial Analyst. 
Your task is to analyze a list of raw transactions, assign a precise, universal category to each, and fix the mathematical sign based on whether money is entering or leaving the user's account.

CRITICAL CASH FLOW RULES (Determine Positive vs Negative):
1. INFLOW (Positive Amount): Any transaction where money is RECEIVED by the user. 
   Examples: Salary, Scholarship, Pocket money, Grants, Refunds, Cashbacks, Selling items, Investment returns, Dividends, Gifts received, Loans received.
2. OUTFLOW (Negative Amount): Any transaction where money is SPENT or SENT by the user. 
   Examples: Food, Shopping, Subscriptions, Bills, Fees, Taxes, Loans paid, EMIs, sending money to friends.
   -> You MUST convert outflow amounts to negative numbers (e.g., if the user enters "Swiggy" with amount 500, you MUST output -500.0).

UNIVERSAL CATEGORIZATION RULES:
1. You are NOT restricted to a hardcoded list. Use your vast world knowledge to generate the most accurate, universally recognized category.
2. Keep the category name concise (1 to 3 words, Title Case). Examples: "Education", "Food & Dining", "Scholarships", "Health & Medical", "Utilities".

OUTPUT FORMAT:
You MUST respond in pure JSON format. Return a JSON object containing a single key called "transactions" which holds the array of processed transaction objects. Each object must have keys: "description", "amount", "category", "split_with".

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
        "response_format": {"type": "json_object"} # <--- THE FIX: Forces absolute pure JSON
    }

    try:
        response = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload, timeout=10)
        
        if response.status_code != 200:
            raise Exception(f"Groq API Error: {response.text}")

        ai_content = response.json()["choices"][0]["message"]["content"]
        
        # We can now safely parse the guaranteed JSON object
        parsed_data = json.loads(ai_content)
        
        # Return the array inside the "transactions" key
        return parsed_data.get("transactions", [])
        
    except Exception as e:
        print(f"Error during AI categorization: {str(e)}")
        raise e