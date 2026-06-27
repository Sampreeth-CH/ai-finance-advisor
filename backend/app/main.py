from app.services.ai_service import generate_ai_insights_llm
from app.services.analyzer import analyze_finances
from fastapi.middleware.cors import CORSMiddleware
from app.services.pdf_service import extract_pdf_data
from fastapi import FastAPI, UploadFile, File
from fastapi import Body
import pandas as pd
import shutil
import os
from app.core.config import settings
from app.routers.auth_router import router as auth_router
from fastapi import Depends
from app.models import user, transaction
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.transaction import Transaction
from datetime import datetime
from app.core.dependencies import get_current_user
from app.services.transaction_service import get_user_transactions
from app.models.user import User
from app.routers.transaction_router import router as transaction_router
from sqlalchemy import delete
# New Imports for Chat and Database Lifespan
import requests
from pydantic import BaseModel
from contextlib import asynccontextmanager
from app.core.database import Base, engine
import io
from fastapi.responses import StreamingResponse
from fpdf import FPDF
from datetime import timedelta
from app.services.ml_model import predict_transaction
from fastapi import Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from datetime import datetime
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.transaction import Transaction
from app.models.user import User
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
from pydantic import BaseModel

print(settings.APP_NAME)

# --- UPDATED: Added persona to the Chat Payload ---
class ChatPayload(BaseModel):
    message: str
    history: list = []
    persona: str = "professional"
    language: str = "English"

# --- NEW: Profile Update Schema ---
class ProfileUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    mobile_no: str | None = None
    place: str | None = None
    address: str | None = None
    profile_pic: str | None = None

# --- NEW: FinScore Calculation Algorithm ---
def calculate_finscore(transactions_list):
    """Calculates a proprietary FinScore (300 to 850) based on financial behavior."""
    base_score = 500
    total_income = 0.0
    total_expense = 0.0
    total_invested = 0.0
    junk_expense = 0.0
    
    # We rely on your AI Categorizer categories instead of brittle keywords!
    junk_categories = ['food & dining', 'shopping', 'entertainment & leisure']
    investment_categories = ['investment & savings', 'investments', 'stocks', 'mutual funds']
    
    for tx in transactions_list:
        amount = float(tx.amount)
        cat = str(tx.category).lower() if tx.category else "others"
        desc = str(tx.description).lower()
        
        if amount > 0:
            total_income += amount
        else:
            abs_amount = abs(amount)
            
            # --- FIX 1: Treat investments as a positive habit, not a draining expense ---
            if any(inv_cat in cat for inv_cat in investment_categories) or "invest" in desc or "mutual fund" in desc or "sip" in desc:
                total_invested += abs_amount
            else:
                total_expense += abs_amount
                
                # --- FIX 2: Track total MONEY spent on junk, rather than transaction count ---
                if any(j_cat in cat for j_cat in junk_categories) or "swiggy" in desc or "zomato" in desc:
                    junk_expense += abs_amount

    # --- 1. Savings & Investment Rate Bonus (Up to +250 points) ---
    if total_income > 0:
        # Good money = Money you kept in the bank + Money you invested
        good_money = (total_income - total_expense) + total_invested
        savings_rate = good_money / total_income
        
        if savings_rate > 0:
            # If they save/invest 20% of income, they get +50 points. 
            # Maxes out safely at +250 points.
            base_score += min(250, int(savings_rate * 250))
        else:
            # --- FIX 3: Proportional penalty for overspending! ---
            # If they overspend by 20% of their income, they lose 20 points. (Max -150)
            overspend_ratio = abs(savings_rate)
            base_score -= min(150, int(overspend_ratio * 100))
    elif total_expense > 0:
         # Earning 0 but spending money heavily penalizes the score
         base_score -= 100
         
    # --- 2. Junk Penalty (Based on % of expense, not count) ---
    if total_expense > 0:
        junk_ratio = junk_expense / total_expense
        # If 50% of your expenses are junk, you lose 75 points. (Max -100 points)
        base_score -= min(100, int(junk_ratio * 150))
        
    # --- 3. Consistency/Activity Bonus (+25 to +50 points) ---
    tx_count = len(transactions_list)
    if tx_count > 10:
        base_score += 25
    if tx_count > 30:
        base_score += 25
        
    # Clamp the score to strictly stay within the 300-850 range
    return max(300, min(850, base_score))



# ==========================================
# MODERN LIFESPAN: AUTO-CREATES TABLES IN SUPABASE
# ==========================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    # This automatically syncs your Python models with the cloud database on boot
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(lifespan=lifespan)

app.include_router(transaction_router)
app.include_router(auth_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/")
def home():
    return {"message": "AI Finance Advisor Backend Running"}

@app.post("/upload/")
async def upload_file(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    import pandas as pd
    import os
    import shutil
    from datetime import datetime
    from app.services.categorizer import smart_categorize_transactions 
    
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        if file.filename.endswith(".csv"):
            df = pd.read_csv(file_path)
        elif file.filename.endswith(".pdf"):
            df = extract_pdf_data(file_path)
        else:
            return {"error": "Unsupported file format"}

        # --- 1. DICTIONARY ARCHITECTURE SETUP ---
        # Extract ONLY the text descriptions from the file to send to the AI
        raw_descriptions = df["Description"].astype(str).tolist()

        try:
            # 2. Get the AI "Dictionary" mapping back
            # Example: {"swiggy onl-line bangalore": {"category": "Food & Dining", "flow": "EXPENSE"}}
            ai_dictionary = smart_categorize_transactions(raw_descriptions)
        except Exception as ai_e:
            print(f"AI Batch Categorization Failed: {ai_e}")
            ai_dictionary = {} # Fallback to an empty dictionary so it doesn't crash

        # 3. Process every row in the PDF/CSV using Python for the math
        for index, row in df.iterrows():
            original_desc = str(row.get("Description", "Unknown"))
            original_amount = float(row.get("Amount", 0))
            
            # Look up the AI's answer in the dictionary
            desc_lower = original_desc.lower()
            ai_answer = ai_dictionary.get(desc_lower, {"category": "Others", "flow": "EXPENSE"})
            
            cat = ai_answer.get("category", "Others")
            flow = str(ai_answer.get("flow", "EXPENSE")).upper()

            # Python strictly enforces the math signs!
            if flow == "INCOME":
                final_amt = abs(original_amount)
            else:
                final_amt = -abs(original_amount)

            # Save to Database
            new_tx = Transaction(
                amount=final_amt, 
                description=original_desc,
                category=cat, 
                split_with="",  # Statements usually don't have split names
                date=datetime.utcnow(), 
                user_id=current_user.id
            )
            db.add(new_tx)
            
            # Update the DataFrame live so the dashboard charts get the corrected AI data
            df.at[index, "Amount"] = final_amt
            df.at[index, "Category"] = cat
        
        await db.commit()
        
        # --- 4. Analyze using the perfectly categorized and signed data ---
        analysis = analyze_finances(df)
        total_income = analysis.get("total_income", 0)
        total_expense = analysis.get("total_expense", 0)
        analysis["net_allocation"] = total_income - total_expense
        
        # Generate the insights for the AI Copilot page
        insights = generate_ai_insights_llm(analysis)

    except Exception as e:
        print(f"Upload API crashed: {str(e)}")
        return {"error": str(e)}

    return {
        "message": "File processed and transactions saved dynamically and perfectly!",
        "filename": file.filename,
        "analysis": analysis,
        "insights": insights
    }

# Make sure your ManualTransaction class is right above the endpoint like we fixed earlier:
class ManualTransaction(BaseModel):
    Description: str
    Amount: float
    SplitWith: str = ""

@app.post("/manual/")
async def add_manual_transactions(
    transactions: list[ManualTransaction],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        from app.services.categorizer import smart_categorize_transactions
        
        # 1. Extract ONLY the text descriptions to send to the AI
        descriptions = [tx.Description for tx in transactions]
        
        # 2. Get the AI "Dictionary" mapping back
        ai_dictionary = smart_categorize_transactions(descriptions)
        
        # 3. Python safely builds the database objects one by one
        for tx in transactions:
            desc_lower = tx.Description.lower()
            
            # Look up the AI's answer, default to "Others" if the AI missed it
            ai_answer = ai_dictionary.get(desc_lower, {"category": "Others", "flow": "EXPENSE", "extracted_name": ""})
            
            cat = ai_answer.get("category", "Others")
            flow = str(ai_answer.get("flow", "EXPENSE")).upper()
            
            # Capitalizes the extracted name (e.g., "rahul" -> "Rahul")
            ai_extracted_name = str(ai_answer.get("extracted_name", "")).title()
            
            # --- THE MAGIC NAME LOGIC ---
            # If the user typed a name in the Split With box, use it. 
            # Otherwise, use the name the AI extracted from the description!
            final_split_name = tx.SplitWith if tx.SplitWith.strip() != "" else ai_extracted_name
            
            # Python enforces the math!
            if flow == "INCOME":
                final_amt = abs(tx.Amount)
            else:
                final_amt = -abs(tx.Amount)
                
            new_tx = Transaction(
                user_id=current_user.id,
                description=tx.Description,
                amount=final_amt,
                category=cat,
                split_with=final_split_name,  # <--- SAVES THE SMART NAME!
                date=datetime.utcnow()
            )
            db.add(new_tx)
            
        await db.commit()
        return {"status": "success", "message": "Transactions saved dynamically and perfectly!"}
        
    except Exception as e:
        print(f"CRITICAL ERROR: {str(e)}")
        
        # Fallback layer protects workflow continuity
        for tx in transactions:
            desc_lower = tx.Description.lower()
            
            if "swiggy" in desc_lower or "zomato" in desc_lower:
                category = "Food & Dining"
                amount = -abs(tx.Amount)
            elif "scholarship" in desc_lower or "salary" in desc_lower or "refund" in desc_lower:
                category = "Income"
                amount = abs(tx.Amount)
            else:
                category = "Others"
                amount = -abs(tx.Amount)
                
            fallback_tx = Transaction(
                user_id=current_user.id,
                description=tx.Description,
                amount=amount,
                category=category,
                split_with=tx.SplitWith, # Guaranteed fallback save!
                date=datetime.utcnow()
            )
            db.add(fallback_tx)

        await db.commit()
        return {
            "status": "fallback",
            "message": f"Transactions saved using fallback due to error: {str(e)}"
        }


@app.delete("/clear/")
async def clear_all_transactions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # This safely deletes ONLY the logged-in user's transactions
        stmt = delete(Transaction).where(Transaction.user_id == current_user.id)
        await db.execute(stmt)
        await db.commit()
        return {"message": "History cleared successfully"}
    except Exception as e:
        await db.rollback()
        return {"error": str(e)}

@app.get("/dashboard/")
async def get_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Fetch DB data instantly
    raw_history = await get_user_transactions(db, current_user.id, limit=100)

    if not raw_history:
        return {
            "message": f"Welcome, {current_user.email}! You have no transactions yet. Upload a CSV/PDF to get started.",
            "analysis": None,
            "fin_score": 650, # Default score
            "receivables": [] 
        }

    import pandas as pd
    
    # --- FIX 1: Add split_with so Pandas can see the names! ---
    data = [{
        "Amount": tx.amount,
        "Category": tx.category,
        "Description": tx.description,
        "Date": tx.date,
        "split_with": tx.split_with  # <--- CRITICAL BRIDGE
    } for tx in raw_history]
    
    df = pd.DataFrame(data)
    
    # 2. Run blazing-fast Pandas math (This now calculates your splits perfectly!)
    analysis = analyze_finances(df)
    calculated_score = calculate_finscore(raw_history)

    # --- FIX 2: Connect Pandas Math to React Frontend ---
    # Grab the splits dictionary we generated in analyzer.py
    analyzer_splits = analysis.get("splits", {})
    
    # Format it exactly how SplitsPage.jsx and ReceivablesWidget expect it
    receivables_list = [
        {"name": person, "amount": amount} 
        for person, amount in analyzer_splits.items() 
        if amount > 0
    ]

    # 3. Return the data
    return {
        "user": current_user.full_name or current_user.email,
        "total_transactions": len(raw_history),
        "analysis": analysis,
        "fin_score": calculated_score, 
        "receivables": receivables_list  # <--- WAKES UP YOUR FRONTEND!
    }

# --- NEW: Dedicated endpoint just for the slow AI generation ---
@app.get("/dashboard/insights/")
async def get_dashboard_insights(
    language: str = "English", # <--- NEW: Accept language from query params
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    raw_history = await get_user_transactions(db, current_user.id, limit=30)
    
    if not raw_history:
        return {"ai_advisor": None}
        
    import pandas as pd
    data = [{"Amount": tx.amount, "Category": tx.category, "Description": tx.description, "Date": tx.date} for tx in raw_history]
    df = pd.DataFrame(data)
    
    analysis = analyze_finances(df)

    # --- THE FIX: Force the backend to calculate Net Allocation so the AI can see it ---
    total_income = analysis.get("total_income", 0)
    total_expense = analysis.get("total_expense", 0)
    analysis["net_allocation"] = total_income - total_expense

    history_data = [
        {
            "date": str(tx.date.date()), 
            "amount": tx.amount, 
            "category": tx.category, 
            "description": tx.description
        } 
        for tx in raw_history
    ]

    try:
        # Now the AI will read the exact correct net_allocation AND Language!
        insights = generate_ai_insights_llm(analysis, history_data, language) # <--- NEW: Pass language to LLM
    except Exception as e:
        insights = f"AI could not generate insights: {str(e)}"

    return {"ai_advisor": insights}



# --- UPDATED: Dynamic AI Personas Chat Endpoint ---
@app.post("/chat")
async def chat_with_ai(
    payload: ChatPayload,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    raw_history = await get_user_transactions(db, current_user.id, limit=15)
    
    if raw_history:
        tx_context = "\n".join([f"{tx.date.date()}: {tx.description} (₹{tx.amount})" for tx in raw_history])
    else:
        tx_context = "No transactions found yet."

    chat_context = "\n".join([f"{msg.get('role', 'user').capitalize()}: {msg.get('content', '')}" for msg in payload.history])

    # Dynamic AI Personas
    personas = {
        "professional": "You are an elite, highly professional wealth manager. Give concise, actionable, and polite financial advice.",
        "parent": "You are a very strict, easily disappointed Indian parent. You are shocked by how much money the user wastes. Scold them for their unnecessary expenses (especially food and shopping) and demand they save money for the future. Use classic parent guilt-trips.",
        "roaster": "You are a savage, sarcastic Gen-Z comedian. Your job is to brutally roast the user's terrible spending habits. Aggressively make fun of their Swiggy, Zomato, and shopping addictions. Be highly entertaining, use modern slang, and do not hold back."
    }
    
    selected_persona = personas.get(payload.persona, personas["professional"])

    prompt = f"""{selected_persona}

Here are the user's most recent transactions:
{tx_context}

Here is the recent conversation history:
{chat_context}

Respond directly to the User's last message: "{payload.message}". Keep it highly engaging, format any currency in Indian Rupees (₹), and stay perfectly in character!

IMPORTANT RULE: You MUST write your ENTIRE response natively in {payload.language}. 
Do not use English unless the requested language is English.
If {payload.language} is Kannada, write strictly in Kannada script.
If {payload.language} is Hindi, write strictly in Devanagari script.
"""

    try:
        api_key = settings.GROQ_API_KEY
        
        if not api_key:
            return {"reply": "API Key is missing. Please check your .env file and config.py."}

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        # Turn up the temperature if it's the roaster so it gets more creative/funny
        ai_temperature = 0.8 if payload.persona == "roaster" else 0.5

        data = {
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "temperature": ai_temperature
        }
        
        res = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=data)
        
        if res.status_code != 200:
            error_details = res.json().get("error", {}).get("message", res.text)
            return {"reply": f"Groq Error ({res.status_code}): {error_details}"}

        res_data = res.json()
        reply_text = res_data["choices"][0]["message"]["content"]
        
    except Exception as e:
        reply_text = f"System Error: {str(e)}"

    return {"reply": reply_text}




import base64
import json
import requests
from fastapi import UploadFile, File

@app.post("/scan-receipt/")
async def scan_receipt(file: UploadFile = File(...)):
    """
    Takes an image, sends it to LLaMA Vision, and extracts Merchant + Amount.
    """
    api_key = settings.GROQ_API_KEY
    if not api_key:
        return {"error": "Groq API key missing"}

    try:
        # 1. Read and encode the image so the AI can "see" it
        contents = await file.read()
        base64_image = base64.b64encode(contents).decode('utf-8')
        image_url = f"data:{file.content_type};base64,{base64_image}"

        # 2. Ask LLaMA Vision to read the receipt
        prompt = """You are an elite Receipt Scanner AI. 
Look at this image and extract two things:
1. The merchant/store name.
2. The final total amount paid (as a number).

You MUST return ONLY a valid JSON object exactly like this:
{"merchant": "Starbucks", "amount": 450.50}

Do not include any markdown, backticks, or conversational text."""

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        # We use the specific Vision model here!
        payload = {
            "model": "llama-3.2-11b-vision-preview",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": image_url}}
                    ]
                }
            ],
            "temperature": 0.0
        }

        response = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload, timeout=15)
        
        if response.status_code != 200:
            raise Exception(f"Vision API Error: {response.text}")

        # 3. Clean and parse the AI's answer
        ai_content = response.json()["choices"][0]["message"]["content"]
        
        # Safely extract JSON in case the AI added backticks
        start_idx = ai_content.find('{')
        end_idx = ai_content.rfind('}')
        if start_idx != -1 and end_idx != -1:
            clean_json = ai_content[start_idx:end_idx+1]
        else:
            clean_json = ai_content
            
        data = json.loads(clean_json)
        
        return {
            "merchant": data.get("merchant", "Unknown Merchant"),
            "amount": data.get("amount", 0)
        }

    except Exception as e:
        print(f"Receipt scan failed: {str(e)}")
        return {"error": "Failed to read receipt"}



from fastapi import HTTPException
from sqlalchemy import select
# Ensure your Transaction model is imported at the top of your file, e.g.:
# from models import Transaction 

@app.delete("/transactions/{transaction_id}")
async def delete_single_transaction(
    transaction_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Deletes a single transaction based on its ID, ensuring it belongs to the current user.
    """
    # 1. Find the transaction belonging to the current user
    query = select(Transaction).where(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    )
    result = await db.execute(query)
    transaction = result.scalar_one_or_none()
    
    # 2. If it doesn't exist (or belongs to someone else), throw an error
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found or unauthorized")
        
    # 3. Delete from the database and commit
    await db.delete(transaction)
    await db.commit()
    
    return {"message": "Transaction deleted successfully"}

# --- NEW: Time-Travel Predictive Forecasting Engine ---
@app.get("/forecast/")
async def get_forecast(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from datetime import timedelta
    
    raw_history = await get_user_transactions(db, current_user.id, limit=1000)
    
    if not raw_history:
        return {"historical": [], "forecast": [], "warning": None, "current_balance": 0}

    # Sort transactions chronologically
    history_asc = sorted(raw_history, key=lambda x: x.date)
    
    historical_data = []
    current_balance = 0.0
    
    # Calculate balance over time
    for tx in history_asc:
        current_balance += tx.amount
        historical_data.append({
            "date": tx.date.strftime("%b %d"), # e.g., "Oct 12"
            "balance": round(current_balance, 2)
        })
        
    # Predictive Math: Calculate daily burn/save rate
    if len(history_asc) > 1:
        days_active = (history_asc[-1].date - history_asc[0].date).days
        days_active = max(1, days_active) # Prevent division by zero
    else:
        days_active = 1
        
    daily_drift = current_balance / days_active
    
    forecast_data = []
    future_balance = current_balance
    last_date = history_asc[-1].date
    warning = None
    
    # Predict the next 90 days
    for i in range(1, 91):
        future_date = last_date + timedelta(days=i)
        future_balance += daily_drift
        
        forecast_data.append({
            "date": future_date.strftime("%b %d"),
            "projected_balance": round(future_balance, 2)
        })
        
        # Trigger an AI warning if they are going to hit ₹0
        if future_balance < 0 and not warning:
            warning = f"⚠️ Critical: At your current burn rate, you will run out of funds in {i} days."

    # Return the last 30 days of history + 90 days of the future
    return {
        "historical": historical_data[-30:], 
        "forecast": forecast_data,
        "current_balance": round(current_balance, 2),
        "daily_drift": round(daily_drift, 2),
        "warning": warning
    }

from datetime import datetime, timedelta

# ==========================================
# 1. SUBSCRIPTION SNIPER ENGINE
# ==========================================
@app.get("/subscriptions/")
async def get_subscriptions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    import pandas as pd
    import re
    
    raw_history = await get_user_transactions(db, current_user.id, limit=500)
    
    if not raw_history:
        return {"subscriptions": [], "total_monthly": 0, "yearly_drain": 0}

    data = [{"Description": tx.description, "Amount": tx.amount, "Date": tx.date, "Category": tx.category} for tx in raw_history]
    df = pd.DataFrame(data)
    
    # Filter only expenses
    expenses = df[df['Amount'] < 0].copy()
    if expenses.empty:
        return {"subscriptions": [], "total_monthly": 0, "yearly_drain": 0}
    
    # --- SMART NORMALIZATION ---
    def normalize_name(desc):
        name = str(desc).lower()
        # 1. Keep only letters
        name = re.sub(r'[^a-z\s]', ' ', name) 
        
        # 2. Filter out Indian banking noise words
        noise = ['upi', 'pos', 'neft', 'rtgs', 'nach', 'ach', 'razorpay', 'payu', 'payment', 'to', 'from', 'via', 'card', 'txn']
        words = name.split()
        clean_words = [w for w in words if w not in noise and len(w) > 2]
        
        # 3. Return the first two meaningful words (e.g., "amazon prime")
        return " ".join(clean_words[:2]) if clean_words else "unknown"

    expenses['Normalized'] = expenses['Description'].apply(normalize_name)
    
    grouped = expenses.groupby('Normalized').agg(
        Count=('Amount', 'size'),
        AvgAmount=('Amount', 'mean'),
        LastDate=('Date', 'max'),
        OriginalName=('Description', 'first'),
        Category=('Category', 'first')
    ).reset_index()
    
    # --- SUBSCRIPTION LOGIC ---
    # It must happen 2+ times OR be explicitly categorized by the AI as a Bill/Subscription
    subs_df = grouped[
        (grouped['Count'] >= 2) & 
        (~grouped['Category'].isin(['Food & Dining', 'Groceries', 'Shopping'])) # Ignore daily food/shopping habits
    ].copy()
    
    subs_df['AvgAmount'] = subs_df['AvgAmount'].abs()
    
    total_monthly = float(subs_df['AvgAmount'].sum())
    yearly_drain = total_monthly * 12

    subs_list = []
    for _, row in subs_df.iterrows():
        subs_list.append({
            "id": row['Normalized'],
            "name": row['OriginalName'].title(),
            "monthly_cost": round(float(row['AvgAmount']), 2),
            "yearly_cost": round(float(row['AvgAmount']) * 12, 2),
            "last_paid": row['LastDate'].strftime("%b %d, %Y"),
            "frequency": f"Detected {row['Count']} times"
        })

    subs_list = sorted(subs_list, key=lambda x: x['monthly_cost'], reverse=True)

    return {
        "subscriptions": subs_list,
        "total_monthly": round(total_monthly, 2),
        "yearly_drain": round(yearly_drain, 2)
    }


# ==========================================
# 2. UPCOMING BILLS PREDICTOR ENGINE
# ==========================================
@app.get("/upcoming-bills/")
async def get_upcoming_bills(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    import pandas as pd
    import re
    
    raw_history = await get_user_transactions(db, current_user.id, limit=1000)
    if not raw_history:
        return {"upcoming": [], "total_due": 0}

    data = [{"Description": tx.description, "Amount": tx.amount, "Date": tx.date, "Category": tx.category} for tx in raw_history]
    df = pd.DataFrame(data)
    expenses = df[df['Amount'] < 0].copy()
    
    if expenses.empty:
        return {"upcoming": [], "total_due": 0}

    # Use the exact same smart normalizer
    def normalize_name(desc):
        name = str(desc).lower()
        name = re.sub(r'[^a-z\s]', ' ', name)
        noise = ['upi', 'pos', 'neft', 'rtgs', 'nach', 'ach', 'razorpay', 'payu', 'payment', 'to', 'from', 'via', 'card', 'txn']
        words = name.split()
        clean_words = [w for w in words if w not in noise and len(w) > 2]
        return " ".join(clean_words[:2]) if clean_words else "unknown"

    expenses['Normalized'] = expenses['Description'].apply(normalize_name)
    
    grouped = expenses.groupby('Normalized').agg(
        Count=('Amount', 'size'),
        AvgAmount=('Amount', 'mean'),
        LastDate=('Date', 'max'),
        OriginalName=('Description', 'first'),
        Category=('Category', 'first')
    ).reset_index()
    
    subs_df = grouped[
        (grouped['Count'] >= 2) & 
        (~grouped['Category'].isin(['Food & Dining', 'Groceries', 'Shopping']))
    ].copy()
    
    upcoming_list = []
    total_due = 0.0
    today = datetime.utcnow()
    
    for _, row in subs_df.iterrows():
        # --- SMART TIME TRAVEL CALCULATION ---
        # Starts at the last payment date, and fast-forwards 30 days at a time until it hits the FUTURE
        next_due_date = row['LastDate']
        
        while next_due_date.date() <= today.date():
            next_due_date += timedelta(days=30)
            
        days_until_due = (next_due_date - today).days
        
        # Now we accurately check if it falls within the NEXT 30 days
        if 0 <= days_until_due <= 30:
            amt = round(abs(float(row['AvgAmount'])), 2)
            upcoming_list.append({
                "id": row['Normalized'],
                "name": row['OriginalName'].title(),
                "estimated_amount": amt,
                "due_date": next_due_date.strftime("%b %d, %Y"),
                "days_left": days_until_due
            })
            total_due += amt

    # Sort by closest due date
    upcoming_list = sorted(upcoming_list, key=lambda x: x['days_left'])

    return {
        "upcoming": upcoming_list,
        "total_due": round(total_due, 2)
    }




@app.get("/me")
async def get_me(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "first_name": getattr(current_user, 'first_name', ''),
        "last_name": getattr(current_user, 'last_name', ''),
        "mobile_no": getattr(current_user, 'mobile_no', ''),
        "place": getattr(current_user, 'place', ''),
        "address": getattr(current_user, 'address', ''),
        "profile_pic": getattr(current_user, 'profile_pic', '')
    }


# ==========================================
# 2. PDF REPORT GENERATOR ENGINE
# ==========================================
class PDFReport(FPDF):
    def header(self):
        self.set_font("helvetica", "B", 18)
        self.set_text_color(0, 51, 102)
        self.cell(0, 10, "Executive Financial Report", border=False, align="C", new_x="LMARGIN", new_y="NEXT")
        self.set_font("helvetica", "I", 10)
        self.set_text_color(100, 100, 100)
        self.cell(0, 10, f"Generated automatically by AI Finance on {datetime.utcnow().strftime('%B %d, %Y')}", align="C", new_x="LMARGIN", new_y="NEXT")
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font("helvetica", "I", 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 10, f"Page {self.page_no()}", align="C")

@app.get("/export/dashboard/")
async def export_dashboard_pdf(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Gather data
    raw_history = await get_user_transactions(db, current_user.id, limit=100)
    score = calculate_finscore(raw_history)
    
    total_income = sum([tx.amount for tx in raw_history if tx.amount > 0])
    total_expense = sum([abs(tx.amount) for tx in raw_history if tx.amount < 0])
    net = total_income - total_expense

    # Create PDF
    pdf = PDFReport()
    pdf.add_page()
    
    # User Info
    pdf.set_font("helvetica", "B", 12)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(0, 10, f"Account Holder: {current_user.full_name or current_user.email}", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 10, f"FinScore (Health Metric): {score} / 850", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(5)

    # Financial Summary
    pdf.set_font("helvetica", "B", 14)
    pdf.set_fill_color(240, 240, 240)
    pdf.cell(0, 10, " 30-Day Financial Overview", border=True, fill=True, new_x="LMARGIN", new_y="NEXT")
    
    pdf.set_font("helvetica", "", 12)
    pdf.cell(100, 10, "Total Income:", border=1)
    pdf.cell(0, 10, f"Rs. {round(total_income, 2)}", border=1, new_x="LMARGIN", new_y="NEXT")
    pdf.cell(100, 10, "Total Expenses:", border=1)
    pdf.cell(0, 10, f"Rs. {round(total_expense, 2)}", border=1, new_x="LMARGIN", new_y="NEXT")
    pdf.cell(100, 10, "Net Allocation:", border=1)
    pdf.cell(0, 10, f"Rs. {round(net, 2)}", border=1, new_x="LMARGIN", new_y="NEXT")
    pdf.ln(10)

    # Recent Transactions Table
    pdf.set_font("helvetica", "B", 14)
    pdf.cell(0, 10, " Recent Transactions Ledger", border=True, fill=True, new_x="LMARGIN", new_y="NEXT")
    
    pdf.set_font("helvetica", "B", 10)
    pdf.cell(40, 8, "Date", border=1)
    pdf.cell(100, 8, "Description", border=1)
    pdf.cell(0, 8, "Amount", border=1, new_x="LMARGIN", new_y="NEXT")
    
    pdf.set_font("helvetica", "", 10)
    for tx in raw_history[:15]: # Show last 15
        pdf.cell(40, 8, tx.date.strftime("%Y-%m-%d"), border=1)
        # Handle long descriptions safely
        desc = (tx.description[:45] + '..') if len(tx.description) > 45 else tx.description
        pdf.cell(100, 8, desc, border=1)
        
        amt_str = f"{'+' if tx.amount > 0 else '-'} Rs. {abs(tx.amount)}"
        pdf.cell(0, 8, amt_str, border=1, new_x="LMARGIN", new_y="NEXT")

    # Output to stream
    pdf_bytes = pdf.output()
    return StreamingResponse(
        io.BytesIO(pdf_bytes), 
        media_type="application/pdf", 
        headers={"Content-Disposition": "attachment; filename=Master_Report.pdf"}
    )

# ==========================================
# 3. ROUND-UP MICRO-INVESTING ENGINE
# ==========================================
@app.get("/roundups/")
async def get_roundups(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    import math
    
    raw_history = await get_user_transactions(db, current_user.id, limit=1000)
    expenses = [tx for tx in raw_history if tx.amount < 0]
    
    roundups_list = []
    total_invested = 0.0
    
    # Calculate spare change for every expense
    for tx in expenses:
        amt = abs(float(tx.amount))
        # Find the next multiple of 100
        if amt % 100 != 0:
            next_hundred = math.ceil(amt / 100.0) * 100
            spare_change = next_hundred - amt
            total_invested += spare_change
            
            roundups_list.append({
                "date": tx.date.strftime("%b %d"),
                "name": tx.description,
                "original": amt,
                "invested": round(spare_change, 2)
            })

    # Sort chronological for frontend
    roundups_list = sorted(roundups_list, key=lambda x: x["date"], reverse=True)

    # Calculate average monthly spare change
    if len(expenses) > 1:
        sorted_exp = sorted(expenses, key=lambda x: x.date)
        days_active = (sorted_exp[-1].date - sorted_exp[0].date).days
        days_active = max(1, days_active)
        monthly_average = (total_invested / days_active) * 30
    else:
        monthly_average = total_invested

    # Calculate 10-Year Compound Interest Projection (Assuming 12% Nifty 50 Return)
    monthly_rate = 0.12 / 12
    projection = []
    
    # Year 0 is today
    projection.append({"year": "Today", "projected_wealth": round(total_invested, 2)})
    
    for year in range(1, 11):
        months = year * 12
        # Future Value of a Series formula
        if monthly_average > 0:
            fv = monthly_average * (((1 + monthly_rate)**months - 1) / monthly_rate) * (1 + monthly_rate)
        else:
            fv = 0
            
        projection.append({
            "year": f"Year {year}",
            "projected_wealth": round(fv, 2)
        })

    return {
        "total_invested": round(total_invested, 2),
        "monthly_average": round(monthly_average, 2),
        "transactions": roundups_list,
        "projection": projection
    }

@app.put("/me")
async def update_profile(
    profile_data: ProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # Update the user record with the new data safely
        if profile_data.first_name is not None: current_user.first_name = profile_data.first_name
        if profile_data.last_name is not None: current_user.last_name = profile_data.last_name
        if profile_data.mobile_no is not None: current_user.mobile_no = profile_data.mobile_no
        if profile_data.place is not None: current_user.place = profile_data.place
        if profile_data.address is not None: current_user.address = profile_data.address
        if profile_data.profile_pic is not None: current_user.profile_pic = profile_data.profile_pic

        db.add(current_user)
        await db.commit()
        await db.refresh(current_user)

        return {"message": "Profile updated successfully"}
    except Exception as e:
        await db.rollback()
        return {"error": str(e)}