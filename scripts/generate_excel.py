import pandas as pd

# Define headers
headers = [
    "Sl. No.", "Type", "JAN", "FEB", "MAR", "APR", "MAY", "JUNE", 
    "JULY", "AUG", "SPET", "OCT", "NOV", "DEC", "TOTAL"
]

# Define line items for the 'Type' column
line_items = [
    "AT&T - Internet",
    "AT&T - Phone",
    "Jea - Power",
    "Teco - Utility",
    "Suresh - Education",
    "Anu - Education",
    "Namasvi - Childcare",
    "Sahishnu - Pre-K",
    "Home Insurance",
    "Auto Insurance",
    "Property Tax",
    "Electronics",
    "NInspire Expenses",
    "HELOC",
    "Stocks Losses",
    "HOA",
    "Car Lease",
    "Mortgage",
    "Immigration Expenses",
    "Travel",
    "Health",
    "Donation"
]

# Create data for the DataFrame
data = []
for i, item in enumerate(line_items, 1):
    row = {
        "Sl. No.": i,
        "Type": item
    }
    # Add empty values for all other columns
    for header in headers[2:]:
        row[header] = ""
    data.append(row)

# Create DataFrame
df = pd.DataFrame(data, columns=headers)

# Define file path
file_path = "Expense_Template.xlsx"

# Write to Excel
try:
    df.to_excel(file_path, index=False)
    print(f"Excel file created successfully at: {file_path}")
except Exception as e:
    print(f"Error creating Excel file: {e}")
