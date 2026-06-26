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

    # --- THE SHARED WALLETS FIX ---
    splits_summary = {}
    
    # Check if the split column exists in your DataFrame (it might be 'split_with' or 'SplitWith')
    split_col = None
    if "split_with" in df.columns:
        split_col = "split_with"
    elif "SplitWith" in df.columns:
        split_col = "SplitWith"

    if split_col:
        # 1. Filter out all transactions that DO NOT have a split name
        split_df = df[df[split_col].notna() & (df[split_col] != "") & (df[split_col].str.strip() != "")]
        
        # 2. Calculate who owes you what (assuming 50/50 split on expenses)
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
        "splits": splits_summary  # <--- THIS IS WHAT WAKES UP YOUR SHARED WALLETS PAGE!
    }