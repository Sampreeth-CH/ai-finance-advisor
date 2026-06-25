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

    # A comprehensive, clear financial taxonomy for accurate parsing
    taxonomy = {
        "Income": ["Salary", "Freelance", "Cashback", "Refund", "Investment Return", "Dividend", "Interest", "Transfer In"],
        "Food & Dining": ["Restaurants", "Food Delivery (Swiggy, Zomato)", "Cafes", "Fast Food", "Pubs & Bars"],
        "Groceries": ["Supermarkets", "Instamart", "Blinkit", "Zepto", "BigBasket", "Local Vendors"],
        "Shopping": ["E-commerce (Amazon, Flipkart, Myntra)", "Apparel", "Electronics", "Home Decor"],
        "Utilities & Bills": ["Rent", "Electricity", "Water", "Gas", "Internet", "Mobile Recharge", "Subscriptions (Netflix, OTT)"],
        "Transport & Travel": ["Cabs (Uber, Ola, Rapido)", "Fuel (Petrol/Diesel)", "Metro", "Trains", "Flights", "Tolls"],
        "Entertainment & Leisure": ["Movies", "Concerts", "Gaming", "Hobbies"],
        "Health & Wellness": ["Medical", "Pharmacy", "Hospitals", "Gym", "Health Insurance"],
        "Investment & Savings": ["Stocks", "Mutual Funds", "Gold", "Fixed Deposits"],
        "Others": ["Miscellaneous", "Cash Withdrawals", "Unclassified Outflow"]
    }

    prompt = f"""You are an advanced financial data processing engine running in India.
Your task is to analyze a list of raw transaction items, infer the transaction category based on contextual intent, and determine if it is an Income or Expense.

COMPREHENSIVE TAXONOMY & EXAMPLES:
- Food & Dining: Swiggy, Zomato, Starbucks, McDonald's, Dineout, local restaurants.
- Groceries: Zepto, Blinkit, Instamart, BigBasket, DMart, local provision stores.
- Shopping: Amazon, Flipkart, Myntra, Ajio, Nykaa, Zara, Nike.
- Transport & Travel: Uber, Ola, Rapido, Makemytrip, Indigo, IRCTC, HPCL/BPCL petrol pumps.
- Utilities & Bills: Airtel, Jio, BESCOM, Tata Play, Netflix, Spotify, Rent payments.
- Health & Wellness: Apollo Pharmacy, 1mg, hospital bills, Cult.fit, insurance premiums.
- Income: Salary, salary credits, dividends, bank interest, cashback payouts, customer refunds.
- Investment & Savings: Zerodha, Groww, AngelOne, mutual fund SIPs.
- Others: Generic UPI transfers to individuals, ATM cash withdrawals, or ambiguous descriptions.

STRICT PROCESSING RULES:
1. Deduce the most contextually relevant category from the taxonomy. Do not invent categories outside of: {list(taxonomy.keys())}.
2. Fix the numerical sign: Expenses MUST be negative numbers. Income MUST be positive numbers. (e.g., if a user manually adds "Swiggy" with an amount of 450, output -450.0).
3. If the description explicitly mentions "Refund" or "Received", treat it as Income (Positive amount).
4. Return ONLY a valid JSON array of objects. Do not wrap it in any dialogue, greeting, or summary text.

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
        "temperature": 0.0  # Zero temperature forces absolute determinism and consistency
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

