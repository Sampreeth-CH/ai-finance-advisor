from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB

# Training data (you can expand later)
descriptions = [
    "zomato order", "swiggy food", "restaurant dinner",
    "uber ride", "ola cab", "bus ticket",
    "amazon shopping", "flipkart order",
    "electricity bill", "mobile recharge",
    "salary credit", "bonus"
]

labels = [
    "Food", "Food", "Food",
    "Travel", "Travel", "Travel",
    "Shopping", "Shopping",
    "Bills", "Bills",
    "Income", "Income"
]

# Vectorize text
vectorizer = CountVectorizer()
X = vectorizer.fit_transform(descriptions)

# Train model
model = MultinomialNB()
model.fit(X, labels)


def predict_category(text):
    text_vec = vectorizer.transform([text.lower()])
    return model.predict(text_vec)[0]