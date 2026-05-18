from services.ai_service import generate_ai_insights_llm
from services.analyzer import analyze_finances
from fastapi.middleware.cors import CORSMiddleware
from services.categorizer import categorize_transaction
from services.pdf_service import extract_pdf_data
from fastapi import FastAPI, UploadFile, File
from fastapi import Body
from services.ml_model import predict_category
import pandas as pd
import shutil
import os

app = FastAPI()

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
def upload_file(file: UploadFile = File(...)):
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

        # Categorization
        df["Category"] = df["Description"].apply(predict_category)

        # 🔥 Analysis
        analysis = analyze_finances(df)

        # 🔥 AI Insights (LLM)
        insights = generate_ai_insights_llm(analysis)

    except Exception as e:
        return {"error": str(e)}

    return {
    "filename": file.filename,
    "analysis": analysis,
    "insights": insights
    }

@app.post("/manual/")
def manual_entry(data: list = Body(...)):
    import pandas as pd

    df = pd.DataFrame(data)

    # Categorization
    df["Category"] = df["Description"].apply(categorize_transaction)

    # Analysis
    analysis = analyze_finances(df)

    # AI Insights
    try:
        insights = generate_ai_insights_llm(analysis)
    except:
        insights = generate_ai_insights_llm(analysis)

    return {
        "analysis": analysis,
        "insights": insights
    }