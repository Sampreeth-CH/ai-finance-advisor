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


print(settings.APP_NAME)

app = FastAPI()

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

# Ensure upload folder exists
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

        # 1. Categorization
        df["Category"] = df["Description"].apply(predict_category)

        # 2. Save all file transactions to PostgreSQL (NEW!)
        for _, row in df.iterrows():
            new_tx = Transaction(
                amount=float(row["Amount"]), # Assuming your CSV/PDF has an 'Amount' column
                description=str(row["Description"]),
                category=str(row["Category"]),
                date=datetime.utcnow(), # We can parse real dates from CSV later
                user_id=current_user.id
            )
            db.add(new_tx)
        
        # Commit all rows from the file to the database
        await db.commit()

        # 3. Analysis
        analysis = analyze_finances(df)

        # 4. AI Insights (LLM)
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

    # 1. Categorization
    df["Category"] = df["Description"].apply(categorize_transaction)

    # 2. Save new transactions to PostgreSQL
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

    # 3. Analysis (Current batch)
    analysis = analyze_finances(df)

    # 4. FETCH AI MEMORY (NEW!)
    # Grab the last 30 transactions for this specific user
    raw_history = await get_user_transactions(db, current_user.id, limit=30)
    
    # Format it into a clean list of dictionaries so Llama 3 can read it easily
    history_data = [
        {
            "date": str(tx.date.date()), 
            "amount": tx.amount, 
            "category": tx.category, 
            "description": tx.description
        } 
        for tx in raw_history
    ]

    # 5. AI Insights (Now with memory!)
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
    """
    The main landing page for the user. 
    Fetches history, analyzes it, and provides daily AI advice.
    """
    # 1. Fetch user's entire history (e.g., last 100 transactions)
    raw_history = await get_user_transactions(db, current_user.id, limit=100)

    if not raw_history:
        return {
            "message": f"Welcome, {current_user.email}! You have no transactions yet. Upload a CSV/PDF to get started.",
            "analysis": None,
            "insights": None
        }

    # 2. Convert database history into a Pandas DataFrame for analysis
    import pandas as pd
    data = [{
        "Amount": tx.amount,
        "Category": tx.category,
        "Description": tx.description,
        "Date": tx.date
    } for tx in raw_history]
    
    df = pd.DataFrame(data)

    # 3. Run Pandas Analysis on historical data
    analysis = analyze_finances(df)

    # 4. Prepare history for AI (Limit to 30 so we don't overwhelm Llama 3's context window)
    history_data = [
        {
            "date": str(tx.date.date()), 
            "amount": tx.amount, 
            "category": tx.category, 
            "description": tx.description
        } 
        for tx in raw_history[:30]
    ]

    # 5. Generate fresh AI Insights
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

@app.get("/me")
async def get_me(
    current_user: User = Depends(get_current_user)
):

    return {
        "id": current_user.id,
        "name": current_user.full_name,
        "email": current_user.email
    }