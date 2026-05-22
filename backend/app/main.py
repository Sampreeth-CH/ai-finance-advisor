from app.services.ai_service import generate_ai_insights_llm
from app.services.analyzer import analyze_finances
from fastapi.middleware.cors import CORSMiddleware
from app.services.categorizer import categorize_transaction
from app.services.pdf_service import extract_pdf_data
from fastapi import FastAPI, UploadFile, File
from fastapi import Body
from app.services.ml_model import predict_category
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

print(settings.APP_NAME)

# --- UPDATED: Added persona to the Chat Payload ---
class ChatPayload(BaseModel):
    message: str
    history: list = []
    persona: str = "professional"

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
    total_income = 0
    total_expense = 0
    junk_count = 0
    
    # Keywords that indicate unnecessary spending
    junk_keywords = ['swiggy', 'zomato', 'zepto', 'blinkit', 'starbucks', 'movie', 'zara', 'myntra', 'netflix', 'amazon', 'dining', 'food', 'shopping']
    
    for tx in transactions_list:
        amount = float(tx.amount)
        desc = str(tx.description).lower()
        category = str(tx.category).lower() if tx.category else ""
        
        if amount > 0:
            total_income += amount
        else:
            total_expense += abs(amount)
            # Penalize junk spending
            if any(keyword in desc for keyword in junk_keywords) or any(keyword in category for keyword in junk_keywords):
                junk_count += 1

    # 1. Savings Rate Bonus (Up to +250 points)
    if total_income > 0:
        savings_rate = (total_income - total_expense) / total_income
        if savings_rate > 0:
            base_score += int(savings_rate * 250)
        else:
            base_score -= 50  # Penalty for spending more than earning
            
    # 2. Junk Penalty (-15 points per junk transaction)
    base_score -= (junk_count * 15)
    
    # 3. Consistency/Activity Bonus (+25 to +50 points for tracking consistently)
    if len(transactions_list) > 10:
        base_score += 25
    if len(transactions_list) > 30:
        base_score += 25
        
    # Clamp the score to look like a real credit score (300 min, 850 max)
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
    return {"message": "AI Finance Advisor Backend Running 🚀"}

@app.post("/upload/")
async def upload_file(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
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

        df["Category"] = df["Description"].apply(predict_category)

        for _, row in df.iterrows():
            new_tx = Transaction(
                amount=float(row["Amount"]), 
                description=str(row["Description"]),
                category=str(row["Category"]),
                date=datetime.utcnow(), 
                user_id=current_user.id
            )
            db.add(new_tx)
        
        await db.commit()
        analysis = analyze_finances(df)
        insights = generate_ai_insights_llm(analysis)

    except Exception as e:
        return {"error": str(e)}

    return {
        "message": "File processed and transactions saved to database successfully!",
        "filename": file.filename,
        "analysis": analysis,
        "insights": insights
    }

@app.post("/manual/")
async def manual_entry(
    data: list = Body(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    import pandas as pd
    df = pd.DataFrame(data)

    df["Category"] = df["Description"].apply(categorize_transaction)

    for _, row in df.iterrows():
        # --- NEW: Split Calculation Logic ---
        original_amount = float(row["Amount"])
        
        # Safely extract 'SplitWith' (Handles missing keys or Pandas NaN values)
        raw_split = row.get("SplitWith", "")
        split_person = str(raw_split).strip() if pd.notna(raw_split) else ""
        
        final_expense = original_amount
        split_debt = 0.0
        
        # If the user tagged a friend, cut the expense in half and log the debt
        if split_person and split_person.lower() != "nan" and original_amount < 0: 
            final_expense = original_amount / 2.0
            split_debt = abs(final_expense) # The friend owes positive money back

        new_tx = Transaction(
            amount=final_expense, # Log only the user's portion
            description=str(row["Description"]),
            category=str(row["Category"]),
            date=datetime.utcnow(),
            user_id=current_user.id,
            split_with=split_person if split_person and split_person.lower() != "nan" else None,
            split_amount=split_debt if split_person and split_person.lower() != "nan" else None
        )
        db.add(new_tx)
    
    await db.commit()
    analysis = analyze_finances(df)

    raw_history = await get_user_transactions(db, current_user.id, limit=30)
    
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
        insights = generate_ai_insights_llm(analysis, history_data)
    except Exception as e:
        insights = f"AI could not generate insights: {str(e)}"

    return {
        "message": "Transactions saved to database successfully!",
        "analysis": analysis,
        "insights": insights
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
    raw_history = await get_user_transactions(db, current_user.id, limit=100)

    if not raw_history:
        return {
            "message": f"Welcome, {current_user.email}! You have no transactions yet. Upload a CSV/PDF to get started.",
            "analysis": None,
            "insights": None,
            "fin_score": 650, # Default score
            "receivables": [] # --- NEW: Empty list fallback
        }

    import pandas as pd
    data = [{
        "Amount": tx.amount,
        "Category": tx.category,
        "Description": tx.description,
        "Date": tx.date
    } for tx in raw_history]
    
    df = pd.DataFrame(data)
    analysis = analyze_finances(df)

    history_data = [
        {
            "date": str(tx.date.date()), 
            "amount": tx.amount, 
            "category": tx.category, 
            "description": tx.description
        } 
        for tx in raw_history[:30]
    ]

    try:
        insights = generate_ai_insights_llm(analysis, history_data)
    except Exception as e:
        insights = f"AI could not generate insights: {str(e)}"

    # Calculate the user's score based on their raw history
    calculated_score = calculate_finscore(raw_history)

    # --- NEW: Calculate Who Owes Me ---
    receivables = {}
    for tx in raw_history:
        if tx.split_with and tx.split_amount:
            # Group debts by person (e.g., if Rahul owes you for 3 different dinners)
            if tx.split_with in receivables:
                receivables[tx.split_with] += tx.split_amount
            else:
                receivables[tx.split_with] = tx.split_amount

    # Convert dictionary to a nice list for the frontend
    receivables_list = [{"name": k, "amount": v} for k, v in receivables.items() if v > 0]

    return {
        "user": current_user.full_name or current_user.email,
        "total_transactions": len(raw_history),
        "analysis": analysis,
        "ai_advisor": insights,
        "fin_score": calculated_score, 
        "receivables": receivables_list # --- NEW: Send debts to frontend ---
    }

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

    # --- NEW: Dynamic AI Personas ---
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

Respond directly to the User's last message: "{payload.message}". Keep it highly engaging, format any currency in Indian Rupees (₹), and stay perfectly in character!"""

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