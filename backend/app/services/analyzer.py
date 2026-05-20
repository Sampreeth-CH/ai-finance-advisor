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

    # 🔥 Convert all values inside dict
    category_spending = {
        k: int(v) for k, v in category_spending.items()
    }

    total_spent = abs(expenses)

    return {
        "total_income": income,
        "total_expense": total_spent,
        "category_spending": category_spending
    }