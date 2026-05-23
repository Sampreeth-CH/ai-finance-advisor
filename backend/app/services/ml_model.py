import random
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.pipeline import make_pipeline

def generate_synthetic_data(num_samples=5000):
    """Generates a massive dataset of highly realistic transactions."""
    
    # Dictionaries mapping categories to real-world merchants/descriptions
    expense_data = {
        "Food": ["zomato order", "swiggy delivery", "zepto groceries", "blinkit", "dominos", "kfc", "starbucks coffee", "mcdonalds", "lunch at restaurant", "dinner bill", "chai point", "meghna foods", "tea", "cafe coffee day"],
        "Travel": ["uber ride", "ola cab", "rapido bike", "namma metro", "irctc train", "make my trip flight", "indigo airlines", "petrol pump", "indian oil", "shell petrol", "fastag", "bus ticket"],
        "Shopping": ["amazon shopping", "flipkart", "myntra clothes", "zara", "h&m", "dmart groceries", "reliance smart", "croma", "lulu mart", "shoes", "electronics"],
        "Bills": ["electricity bill", "bescom", "airtel recharge", "jio prepaid", "vi postpaid", "act fibernet", "water bill", "gas cylinder", "apartment maintenance"],
        "Entertainment": ["netflix subscription", "amazon prime", "hotstar vip", "spotify premium", "bookmyshow", "pvr cinemas", "gaming", "steam purchase"],
        "Health": ["apollo pharmacy", "pharmeasy", "1mg medicines", "hospital bill", "clinic consultation", "blood test", "gym membership", "curefit"]
    }

    income_data = {
        "Income": ["salary credit", "tcs salary", "infosys payroll", "wipro salary", "freelance payment", "upwork client", "fiverr payout", "consulting fee", "bonus", "annual bonus"],
        "Refund": ["amazon refund", "swiggy refund", "irctc cancellation refund", "zomato refund"],
        "Transfer": ["upi received from rahul", "upi credit from friend", "money sent by dad", "neft transfer inward", "imps received", "cashback received", "gpay reward"]
    }

    X = []
    y = []

    # Generate Expenses (Labeled as Category_OUT)
    for _ in range(int(num_samples * 0.7)): # 70% of transactions are expenses
        category = random.choice(list(expense_data.keys()))
        desc = random.choice(expense_data[category])
        
        # Add some random noise to make it realistic (like transaction IDs or dates)
        if random.random() > 0.5:
            desc += f" tx{random.randint(1000,9999)}"
            
        X.append(desc)
        y.append(f"{category}_OUT") # Label tells us it's an expense

    # Generate Incomes (Labeled as Category_IN)
    for _ in range(int(num_samples * 0.3)): # 30% are incomes
        category = random.choice(list(income_data.keys()))
        desc = random.choice(income_data[category])
        
        if random.random() > 0.5:
            desc += f" ref{random.randint(100,999)}"
            
        X.append(desc)
        y.append(f"{category}_IN") # Label tells us it's income

    # Shuffle the data
    combined = list(zip(X, y))
    random.shuffle(combined)
    X[:], y[:] = zip(*combined)

    return X, y

print("🧠 Booting AI Classifier... Generating 5,000 transaction samples...")
X_train, y_train = generate_synthetic_data(5000)

# We use TfidfVectorizer (analyzes word frequency/importance) and LinearSVC (powerful text classifier)
ml_pipeline = make_pipeline(TfidfVectorizer(ngram_range=(1, 2)), LinearSVC(dual="auto"))
ml_pipeline.fit(X_train, y_train)
print("✅ AI Model Trained Successfully!")


def predict_transaction(description, raw_amount):
    """
    Predicts the category and automatically assigns the correct + or - sign to the amount.
    """
    prediction = ml_pipeline.predict([description.lower()])[0]
    
    # Split the prediction label (e.g., "Food_OUT" -> ["Food", "OUT"])
    category, direction = prediction.split("_")
    
    # Ensure raw_amount is absolute (remove any existing negative signs)
    absolute_amount = abs(float(raw_amount))
    
    # If the ML model says it's an outgoing expense, force the amount to be negative
    if direction == "OUT":
        final_amount = -absolute_amount
    else:
        # If it's IN (Salary, Refund, Cashback), keep it positive
        final_amount = absolute_amount
        
    return category, final_amount

# You can keep this for legacy support in your CSV uploader if needed
def predict_category(text):
    prediction = ml_pipeline.predict([text.lower()])[0]
    category, _ = prediction.split("_")
    return category