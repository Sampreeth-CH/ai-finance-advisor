import json
import re
import requests
from pydantic import BaseModel
from app.core.config import settings

def smart_categorize_transactions(raw_transactions: list) -> list:
    """
    Leverages LLaMA 3.3 to dynamically categorize transactions, detect money flow (Inflow/Outflow),
    and assign an intelligent universal category based on world knowledge.
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
1. You are NOT restricted to a hardcoded list. Use your vast world knowledge to generate the most accurate, universally recognized category for the transaction.
2. Keep the category name concise (1 to 3 words, Title Case). 
   Examples of good categories: "Education", "Food & Dining", "Scholarships", "Health & Medical", "Utilities", "Transportation", "Freelance Income", "Personal Care", "Investment", "Entertainment".
3. Group similar items intelligently (e.g., "Zomato" and "Starbucks" should both be "Food & Dining").

OUTPUT FORMAT:
Return ONLY a valid JSON array of objects with keys: "description", "amount", "category", "split_with".
Do not wrap it in any dialogue, greeting, markdown tags, or summary text.

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
        "temperature": 0.1  # Low temperature for highly logical deduction
    }

    try:
        response = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload, timeout=10)
        if response.status_code != 200:
            raise Exception(f"Groq API responded with code {response.status_code}")

        ai_content = response.json()["choices"][0]["message"]["content"]
        
        # Strip code block decorators if present
        cleaned_json = re.sub(r"```json\n|\n```|```", "", ai_content).strip()
        return json.loads(cleaned_json)
        
    except Exception as e:
        print(f"Error during AI categorization: {str(e)}")
        raise e