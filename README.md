# 🚀 AI Finance Advisor: The Future of Personal Finance

An intelligent, AI-powered financial management ecosystem that doesn't just track your spending—it predicts your future, roasts your habits, and builds your wealth.

Built as a full-stack, enterprise-grade FinTech application, this project bridges the gap between passive financial tracking and active AI-driven financial coaching.

---

## 💡 The Problem

Personal finance apps are boring. Users enter data, see a static pie chart, and leave. There is no motivation, no actionable intelligence, and zero engagement.

## 🚀 The AI-Powered Solution

This platform transforms personal finance into an interactive, gamified, and intelligent experience.

### 🌟 Key "Wow" Features

- **AI Copilot (with Personas):** Powered by **LLaMA 3.3**, choose between _The Professional Banker_, _The Strict Parent_, or _The Savage Roaster_ to get personalized, character-driven financial advice.
- **Predictive Time Machine:** Machine learning trajectory forecasting that predicts your bank balance 90 days into the future.
- **Subscription Sniper:** Automatically detects recurring "Zombie" subscriptions and calculates your total "Yearly Drain."
- **Micro-Investing Engine:** Automatically rounds up daily expenses and projects 10-year wealth growth using 12% compound interest models.
- **OCR Receipt Scanner:** Native in-browser scanning to instantly convert physical receipts into categorized data.
- **Shared Wallets (Splitwise-style):** Automatically calculates debts when tagging friends in transactions.
- **Executive PDF Reporting:** Generate professional, enterprise-grade financial health reports in one click via a custom Python PDF engine.

---

## 🛠️ The Technology Stack

### Backend

- **Language:** Python 3.14
- **Framework:** FastAPI
- **Database:** PostgreSQL (via Supabase)
- **ORM:** SQLAlchemy (Async)
- **AI/LLM:** Groq API (LLaMA 3.3 70B)
- **Data Science:** Pandas & NumPy (for financial analysis & trajectory forecasting)

### Frontend

- **Framework:** React.js
- **Routing:** React Router DOM
- **Styling:** Tailwind CSS & Glassmorphism UI
- **Visualizations:** Recharts
- **Animations:** Framer Motion

---

## ⚙️ Technical Architecture Highlights

- **Dynamic System Prompting:** The AI persona engine dynamically injects system prompts based on user selection, changing the AI's entire tone and logic in real-time.
- **Binary PDF Streaming:** Direct server-side generation of executive reports using `fpdf2`, streamed as binary blobs to the frontend for instant download.
- **Complex Data Aggregation:** Pandas-based time-series forecasting algorithms calculate rolling daily averages to predict future account health.

---

## 📸 Project Showcase

![Dashboard Placeholder](Dashboard.png)
_(Note: Take a screenshot of your dashboard and place it in the root folder named `screenshot-dashboard.png` to display it here!)_

---

## 🚀 Getting Started

1. **Clone the repo**
   ```bash
   git clone [your-repo-url]
   ```
2. **Install Backend Dependencies**
   ```bash
    pip install -r requirements.txt
   ```
3. **Configure Environment**
   Set up your .env file with your DATABASE_URL and GROQ_API_KEY.
4. **Run the App**
   Start the FastAPI server and the React frontend, and you're ready to revolutionize your financial health.

---
