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

# New Imports for Chat and Database Lifespan
import requests
from pydantic import BaseModel
from contextlib import asynccontextmanager
from app.core.database import Base, engine

print(settings.APP_NAME)

class ChatPayload(BaseModel):
    message: str
    history: list = []

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
            "insights": None
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

    return {
        "user": current_user.full_name or current_user.email,
        "total_transactions": len(raw_history),
        "analysis": analysis,
        "ai_advisor": insights
    }

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

    prompt = f"""You are a brilliant, helpful AI Personal Finance Advisor.
Here are the user's most recent transactions:
{tx_context}

Here is the recent conversation history:
{chat_context}

Please reply directly to the User's last message. Keep it conversational, helpful, and concise. Format any currency in Indian Rupees (₹).
"""

    try:
        api_key = settings.GROQ_API_KEY
        
        if not api_key:
            return {"reply": "API Key is missing. Please check your .env file and config.py."}

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7
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
        "name": current_user.full_name,
        "email": current_user.email
    }