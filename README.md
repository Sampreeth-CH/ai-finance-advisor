# 💰 AI-Powered Personal Finance Advisor

An intelligent web application that analyzes user financial data and provides personalized financial insights using Generative AI and Cloud technologies.

---

## 🧾 Problem Statement

In today’s digital world, individuals generate large volumes of financial data through bank transactions, online payments, and subscriptions. However, most users:

- Do not track their expenses properly  
- Lack financial awareness and budgeting skills  
- Struggle to analyze bank statements manually  
- Fail to identify unnecessary spending patterns  

Existing solutions:
- Provide only basic summaries  
- Lack intelligent insights  
- Do not offer personalized financial guidance  

👉 This project solves these problems by building an AI-powered financial advisor system.

---

## 🎯 Objectives

### 🎯 Primary Objective
To develop a web application that analyzes financial data and provides intelligent, personalized financial advice using AI.

### 🔹 Specific Objectives
- 📂 Upload and process bank statements (CSV/PDF)
- 🧠 Automatically categorize expenses
- 📊 Perform financial analysis
- 🤖 Generate AI-based insights
- ☁️ Integrate cloud storage
- 📈 Visualize financial data

---

## 🏗️ System Architecture


Frontend (React)
↓
Backend (FastAPI)
↓
Data Processing (Pandas)
↓
Gen AI (OpenAI API)
↓
Database + Cloud Storage


---

## 🧩 Modules

### 1. User Interface (Frontend)
- React-based UI
- Login/Signup
- File upload
- Dashboard with charts and insights

### 2. File Upload & Storage
- Upload CSV/PDF bank statements
- Store locally or on cloud (AWS S3)

### 3. Data Processing
- Extract transaction details
- Clean and normalize data

### 4. Expense Categorization
- Rule-based classification (initial)
- ML-based classification (advanced)

### 5. Financial Analysis
- Total spending
- Category-wise breakdown
- Monthly trends

### 6. AI Insights (Core Feature)
- Uses LLM to generate:
  - Spending insights
  - Savings suggestions
  - Personalized advice

### 7. Backend API
- Built using FastAPI
- Handles data processing and AI integration

### 8. Database
- SQLite / MongoDB
- Stores user and transaction data

### 9. Visualization
- Charts using Chart.js / Recharts
- Pie charts, bar graphs, trends

### 10. Cloud Integration
- AWS S3 for storage
- Deployment via AWS / Render

---

## 🔄 Workflow

1. User logs in  
2. Uploads bank statement  
3. Data is extracted and cleaned  
4. Expenses are categorized  
5. Financial analysis is performed  
6. Data sent to AI model  
7. AI generates insights  
8. Results displayed on dashboard  

---

## 🧠 Technologies Used

| Component        | Technology        |
|-----------------|------------------|
| Frontend        | React.js         |
| Backend         | FastAPI          |
| Data Processing | Python (Pandas)  |
| AI              | OpenAI API       |
| Database        | SQLite / MongoDB |
| Cloud           | AWS S3           |
| Charts          | Chart.js         |

---

## 🔥 Key Features

- 📂 Upload bank statements (CSV/PDF)
- 🧠 Automatic expense categorization
- 📊 Smart financial analysis
- 🤖 AI-powered insights and recommendations
- 📈 Interactive dashboard with charts
- ☁️ Cloud-enabled storage

---

## 🚀 Future Enhancements

- ML-based expense classification
- Real-time bank API integration
- Mobile application
- Advanced budgeting system
- Multi-user analytics dashboard

---
