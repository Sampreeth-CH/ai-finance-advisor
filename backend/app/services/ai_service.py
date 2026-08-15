import requests
from app.core.config import settings

def generate_ai_insights_llm(analysis, history_data=None, language="English"): # <--- NEW: Added language parameter
    if not analysis:
        return "No financial data available to analyze yet. Add some transactions!"

    # 1. Build a clean summary of the financial data for the AI to read
    context = f"Total Income: ₹{analysis.get('total_income', 0)}\n"
    context += f"Total Expenses: ₹{analysis.get('total_expense', 0)}\n"
    context += f"Net Allocation: ₹{analysis.get('net_allocation', 0)}\n"
    
    if 'category_spending' in analysis:
        context += "Spending by Category:\n"
        for cat, amt in analysis['category_spending'].items():
            context += f"- {cat}: ₹{amt}\n"

    if history_data:
        context += "\nRecent Transactions:\n"
        for tx in history_data[:10]: # Limit to 10 so we don't overwhelm the prompt
            context += f"- {tx.get('date')}: {tx.get('description')} (₹{tx.get('amount')})\n"

    prompt = f"""You are an expert AI Personal Finance Advisor.
Analyze the user's current financial snapshot:

{context}

Provide a short, punchy, and actionable 3-paragraph summary:
1. A brief observation on their overall cash flow.
2. Identify their biggest spending category and offer a specific, realistic tip to optimize it.
3. An encouraging closing thought.

Keep it conversational, insightful, and concise. 
Format all currency in Indian Rupees (₹). 
Use Markdown formatting (like **bolding** key terms and numbers) so it looks beautiful on the dashboard.

IMPORTANT RULE: You MUST write your ENTIRE response natively in {language}. 
Do not use English unless the requested language is English. 
If {language} is Kannada, write strictly in Kannada script.
If {language} is Hindi, write strictly in Devanagari script.
"""

    # 3. Call Groq's Blazing Fast API
    try:
        api_key = settings.GROQ_API_KEY
        if not api_key:
            return "Groq API Key is missing. Please add it to your .env file."

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "openai/gpt-oss-120b", # Using the brand new, supported model!
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7
        }

        res = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=data)
        
        # Check if Groq accepted the request
        if res.status_code != 200:
            error_details = res.json().get("error", {}).get("message", res.text)
            return f"**Groq API Error ({res.status_code}):** {error_details}"

        return res.json()["choices"][0]["message"]["content"]
        
    except Exception as e:
        return f"**System Error connecting to AI:** {str(e)}"