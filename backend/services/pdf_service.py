import pdfplumber
import pandas as pd

def extract_pdf_data(file_path):
    data = []

    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()

            if text:
                lines = text.split("\n")

                for line in lines:
                    parts = line.split()

                    # ⚠️ Basic parsing (we will improve later)
                    if len(parts) >= 3:
                        try:
                            date = parts[0]
                            amount = float(parts[-1])
                            description = " ".join(parts[1:-1])

                            data.append([date, description, amount])
                        except:
                            continue

    df = pd.DataFrame(data, columns=["Date", "Description", "Amount"])
    return df