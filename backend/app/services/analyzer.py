import pandas as pd

def analyze_finances(df):
    # Convert to normal Python int using int()
    income = int(df[df["Amount"] > 0]["Amount"].sum())
    expenses = int(df[df["Amount"] < 0]["Amount"].sum())

    category_spending = (
        df[df["Amount"] < 0]
        .groupby("Category")["Amount"]
        .sum()
        .abs()
        .to_dict()
    )

    # Convert all values inside dict
    category_spending = {
        k: int(v) for k, v in category_spending.items()
    }

    total_spent = abs(expenses)

    # --- THE BULLETPROOF SHARED WALLETS FIX ---
    splits_summary = {}
    
    # Safely find the exact column name
    split_col = "split_with" if "split_with" in df.columns else "SplitWith" if "SplitWith" in df.columns else None

    if split_col:
        # 1. THE CRITICAL FIX: Force the column to be strings and replace NaN/Nulls with ""
        # This prevents Pandas from crashing when it reads empty database cells!
        df[split_col] = df[split_col].fillna("").astype(str)
        
        # 2. Filter out all transactions that DO NOT have a split name
        split_df = df[df[split_col].str.strip() != ""]
        
        # 3. Calculate who owes you what (assuming 50/50 split on expenses)
        for _, row in split_df.iterrows():
            person = str(row[split_col]).strip().title() # .title() makes "rahul" into "Rahul"
            amount = float(row["Amount"])
            
            # If it is an expense (negative), they owe you half!
            if amount < 0:
                owed_to_you = abs(amount) / 2
                splits_summary[person] = splits_summary.get(person, 0) + owed_to_you

    # Convert split amounts to clean integers for the frontend
    splits_summary = {k: int(v) for k, v in splits_summary.items()}

    return {
        "total_income": income,
        "total_expense": total_spent,
        "category_spending": category_spending,
        "splits": splits_summary
    }