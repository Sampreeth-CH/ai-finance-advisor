def categorize_transaction(description):
    desc = description.lower()

    if "zomato" in desc or "swiggy" in desc or "restaurant" in desc:
        return "Food"
    
    elif "uber" in desc or "ola" in desc or "bus" in desc or "train" in desc:
        return "Travel"
    
    elif "amazon" in desc or "flipkart" in desc or "shopping" in desc:
        return "Shopping"
    
    elif "electricity" in desc or "bill" in desc or "recharge" in desc:
        return "Bills"
    
    elif "salary" in desc:
        return "Income"
    
    else:
        return "Others"