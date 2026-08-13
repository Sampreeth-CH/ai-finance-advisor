# 🚀 Finova: AI-Powered Autonomous Finance Advisor

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Generative AI](https://img.shields.io/badge/Gen_AI-Llama_3.3_&_4-000000?style=for-the-badge&logo=meta&logoColor=blue)
![Pandas](https://img.shields.io/badge/Pandas-150458?style=for-the-badge&logo=pandas&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

Finova is a full-stack, autonomous wealth-management platform designed to replace manual budgeting with intelligent, LLM-driven automation. Built collaboratively by a team of passionate developers, Finova integrates cutting-edge Generative AI (Meta's Llama models via Groq) with high-speed Pandas data processing. It acts as a personalized Chief Financial Officer (CFO)—tracking expenses, forecasting bills, and actively advising on wealth generation.

---

## 🌐 Live Demo & Deployment

* **Frontend Application (Vercel):** [https://ai-finance-advisor-finova.vercel.app/](https://ai-finance-advisor-finova.vercel.app/)
* **Backend API (Render):** [https://ai-finance-advisor-zaoc.onrender.com/docs](https://ai-finance-advisor-zaoc.onrender.com/docs)

*(Note: The backend is hosted on Render's free tier. If the API is asleep, it may take ~50 seconds to spin up from a cold start).*

---

## 👥 Meet the Team

This project was built collaboratively, utilizing Agile development methodologies, modular system design, and rigorous code reviews to ensure a seamless integration between the frontend UI, Python analytical engine, and AI microservices.

* **Sampreeth CH** - [GitHub Profile](https://github.com/Sampreeth-CH)
* **Raghav G K** - [GitHub Profile](https://github.com/Raghavgk07)
* **Rakesh S** - [GitHub Profile](https://github.com/srakesh24)
* **Vishnu Priya** - [GitHub Profile](https://github.com/Vishnu033)

---

## ✨ Core Features & Algorithms

Finova goes beyond standard expense tracking by offering autonomous, AI-driven insights:

### 🤖 Voice-Enabled AI Copilot
A conversational financial assistant built directly into the dashboard. 
* Powered by the browser's native **Web Speech API** for local, low-latency Speech-to-Text and Text-to-Speech translation.
* Uses **Llama 3.3 (70B)** to process natural language queries (e.g., *"How much did I spend on food this month?"*) and returns context-aware financial advice through customizable personas (The Banker, Strict Parent, The Roaster).

### 📸 Vision AI Receipt Scanner
Replaces brittle, legacy OCR libraries (like Tesseract) with state-of-the-art Large Multimodal Models (LMMs).
* Uses **Llama 4 Vision** to visually comprehend receipt layouts. 
* The React frontend safely encodes images into Base64 strings. The AI bypasses tax lines and noise, returning a strictly formatted JSON object containing the exact merchant name and final total.

### 🎯 The Subscription Sniper
An automated pipeline that cleanses raw banking data.
* Uses Python's **Regex** engine to strip banking gateway noise (e.g., translating "UPI/Netflix/123/XYZ" into simply "Netflix").
* Employs **Pandas** to vectorize and group data, applying heuristic filters to ignore daily habits (like coffee) and identify true recurring subscriptions based on payment frequency.

### 🔮 "Time-Travel" Bill Predictor
An algorithmic forecaster designed to prevent missed payments and overdrafts.
* Utilizes a `while` loop algorithm that takes a historical payment date (e.g., an annual gym membership paid 8 months ago) and continuously fast-forwards it by its billing cycle.
* Checks if the impending date falls within a 30-day window and visually alerts the user on the dashboard.

### 🏆 Proprietary FinScore Engine
A gamified behavioral grading model that grades financial habits on a 300–850 scale (similar to a credit score).
* Calculates financial health based on a dynamic Savings Ratio formula: `((Income - Expenses) + Investments) / Income`.
* Actively masks investments so they are treated as asset generation rather than bank-draining expenses, ensuring a fair score across all income brackets.

### 📈 Micro-Investments & Wealth Simulator
Encourages passive wealth generation through daily habits.
* Utilizes a mathematical ceiling function (Modulo logic) to round up non-essential transactions to the nearest ₹50 or ₹100.
* Aggregates this "spare change" via Pandas and applies the Future Value of an Ordinary Annuity formula.
* Projects 10-year compound growth at a 12% rate (Nifty 50 benchmark) to visually demonstrate the opportunity cost of uninvested cash.

### 🤝 NLP Shared Wallets
Simplifies splitting bills with friends.
* Users can input natural text (e.g., "Dinner with Rahul for 500"). 
* The backend extracts human entities, splits the expense automatically by 50%, logs ₹250 as a personal expense, and registers ₹250 as a receivable debt in the Shared Wallets database.

---

## 🏗️ System Architecture 

Finova operates on a highly decoupled Client-Server architecture, ensuring enterprise-grade scalability and separation of concerns.

### 1. Frontend (Client Tier)
* **Framework:** React.js initialized via Vite for lightning-fast HMR and optimized builds.
* **State Management:** Zustand for global memory management, eliminating prop-drilling.
* **Styling:** Tailwind CSS for responsive, utility-first UI design.
* **Animations:** Framer Motion for fluid, interactive component rendering.
* **Routing:** React Router DOM with Protected Routes for JWT verification.

### 2. Backend (API & Logic Tier)
* **Framework:** FastAPI (Python 3.12) designed for high concurrency.
* **Server:** Uvicorn (ASGI) handling asynchronous web traffic.
* **Data Engine:** Pandas for C-based, vectorized operations on financial datasets.
* **Security:** Bcrypt for password hashing and JWT for stateless session management.

### 3. Database (Storage Tier)
* **Database:** PostgreSQL (Hosted dynamically).
* **ORM:** SQLAlchemy utilizing `asyncpg` and Greenlet for asynchronous, non-blocking database queries.
* **Data Integrity:** Implements `cascade="all, delete-orphan"` to prevent data leaks and maintain relational integrity when users delete accounts.

### 4. AI Microservices
* **Infrastructure:** Groq API Cloud for ultra-low latency inference.
* **Models:** Meta Llama-3.3-70b-versatile (Text) & Llama-4-scout-17b-16e-instruct (Vision).

---

## 🚀 Local Installation & Setup

To run this project locally, ensure you have **Node.js**, **Python 3.12+**, and **PostgreSQL** installed on your machine.

### 1. Clone the Repository
```bash
git clone [https://github.com/YourUsername/finova.git](https://github.com/YourUsername/finova.git)
cd finova
```
### 2. Backend Setup
Navigate to the backend directory and set up the Python environment:

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv

# On macOS/Linux:
source venv/bin/activate  
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

**Environment Variables:** Create a `.env` file in the `backend/` root directory and add the following:

```env
# Ensure you use postgresql+asyncpg for SQLAlchemy compatibility
DATABASE_URL=postgresql+asyncpg://your_db_user:your_db_password@localhost:5432/finova_db
SECRET_KEY=your_super_secret_jwt_key
GROQ_API_KEY=your_groq_api_key
```

Initialize Database & Run:

```bash
# Run the one-time database migration script to build the SQL tables
python app/utils/init_db.py

# Start the FastAPI server (Runs on port 10000)
uvicorn app.main:app --host 0.0.0.0 --port 10000 --reload
```

### 3. Frontend Setup

Open a new terminal instance, navigate to the frontend directory:

```bash
cd frontend

# Install Node modules
npm install
```

**Environment Variables:** Create a `.env` file in the `frontend/` root directory and add:

```env
VITE_API_URL=http://localhost:10000/api
```

Run the Application:

```bash
# Start the Vite development server
npm run dev
```

Navigate to http://localhost:5173 in your browser to view the app!

---

## 🛡️ Security & Performance Optimizations

* **Zero-BLOB Database Storage:** To keep the PostgreSQL database fast and lightweight, profile images and scanned receipts are encoded into Base64 strings by the frontend and stored as text, rather than utilizing heavy binary BLOBs.
* **Asynchronous Database Connections:** By combining FastAPI with SQLAlchemy's asyncpg, the server can handle thousands of concurrent requests without blocking the main event loop.
* **Component-Level Re-rendering:** Zustand state management ensures that only specific UI components (like the FinScore visualizer) re-render when the Python backend completes complex Pandas calculations, preventing UI lag.

## 🔮 Future Roadmap

* **Banking API Integration:** Implementation of the Account Aggregator framework to pull live transaction data directly from bank APIs, bypassing manual uploads.
* **Autonomous Execution:** Integration with broker APIs (like Zerodha or Upstox) to allow the app to automatically invest the aggregated "Spare Change" into Nifty 50 Index funds without user intervention.
* **Mobile Port:** Transitioning the React UI into a React Native mobile application for native iOS/Android camera access and push notifications.

---
*Built with ❤️ by the Finova Team.*
