import os
import pandas as pd
import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# --- CONFIGURATION ---
# Updated paths to reflect new project structure
WATCH_FOLDER = r"F:\antigravity_project\shetue os\archive\Upload_Ready"
OUTPUT_FOLDER = r"F:\antigravity_project\shetue os\finance\Ready_For_Zoho"

# Mapping Logic (Keywords -> Division)
DIVISION_MAP = {
    "Filling Station": ["FUEL", "DIESEL", "OCTANE", "PETROL", "FILLING STATION", "PADMA", "MEGHNA"],
    "CNG Refuelling": ["CNG", "REFUELLING", "COMPRESSOR"],
    "LPG Auto Gas": ["LPG", "AUTO GAS", "CONVERSION"],
    "Feed Mills": ["FEED", "MILL", "FISH", "POULTRY"],
    "Pharmacy": ["PHARMACY", "MEDICINE", "PHARMA", "DRUG"],
    "Shetue Tech": ["TECH", "SOFTWARE", "INTERNET", "IT", "CLOUD"],
    "Huq Bricks": ["BRICK", "BRK", "COAL", "CLAY"]
}

ACCOUNT_CODES = {
    "UCB Bank": "1100",
    "Cash on Hand": "1000",
    "Inventory Asset": "1300",
    "Sales Revenue": "4000",
    "Cost of Goods Sold": "5000",
    "Operating Expense": "6000"
}

def process_activity_template(df):
    """Processes the MASTER_BUSINESS_ACTIVITY_TEMPLATE format."""
    print("[*] Processing Master Activity Template format...")
    journals = []
    
    for _, row in df.iterrows():
        date = row['Date']
        activity = row['Activity Type']
        division = row['Division']
        desc = row['Description']
        amount = float(str(row['Total Amount']).replace(',', '')) if pd.notnull(row['Total Amount']) else 0
        payment = row['Payment Mode']
        
        if amount == 0: continue
        
        # Simple Journal Logic based on Activity Type
        if activity == "Sales":
            # Debit: Cash/Bank, Credit: Sales Revenue
            debit_acc = "1100 - UCB Bank" if payment == "Bank" else "1000 - Cash on Hand"
            credit_acc = "4000 - Sales Revenue"
            
            journals.append({'Date': date, 'Account': debit_acc, 'Debit': amount, 'Credit': 0, 'Description': desc, 'Division': division})
            journals.append({'Date': date, 'Account': credit_acc, 'Debit': 0, 'Credit': amount, 'Description': desc, 'Division': division})
            
        elif activity == "Purchase":
            # Debit: Inventory, Credit: Bank/Cash/Credit
            debit_acc = "1300 - Inventory Asset"
            credit_acc = "1100 - UCB Bank" if payment == "Bank" else "1000 - Cash on Hand" if payment == "Cash" else "2000 - Accounts Payable"
            
            journals.append({'Date': date, 'Account': debit_acc, 'Debit': amount, 'Credit': 0, 'Description': desc, 'Division': division})
            journals.append({'Date': date, 'Account': credit_acc, 'Debit': 0, 'Credit': amount, 'Description': desc, 'Division': division})
            
        elif activity == "Expense":
            # Debit: Expense, Credit: Bank/Cash
            debit_acc = "6000 - Operating Expense"
            credit_acc = "1100 - UCB Bank" if payment == "Bank" else "1000 - Cash on Hand"
            
            journals.append({'Date': date, 'Account': debit_acc, 'Debit': amount, 'Credit': 0, 'Description': desc, 'Division': division})
            journals.append({'Date': date, 'Account': credit_acc, 'Debit': 0, 'Credit': amount, 'Description': desc, 'Division': division})

        elif activity == "Bank Deposit":
            # Debit: Bank, Credit: Cash
            journals.append({'Date': date, 'Account': "1100 - UCB Bank", 'Debit': amount, 'Credit': 0, 'Description': desc, 'Division': division})
            journals.append({'Date': date, 'Account': "1000 - Cash on Hand", 'Debit': 0, 'Credit': amount, 'Description': desc, 'Division': division})
            
    return pd.DataFrame(journals)

def clean_statement(file_path):
    try:
        print(f"[*] Processing: {os.path.basename(file_path)}")
        df = pd.read_csv(file_path)
        
        # Check if it's the Master Activity Template
        if 'Activity Type' in df.columns and 'Total Amount' in df.columns:
            df_cleaned = process_activity_template(df)
        else:
            # Legacy Cleaning Logic
            for col in ['Debit', 'Credit', 'Balance']:
                if col in df.columns:
                    df[col] = df[col].astype(str).str.replace(',', '').replace('nan', '0')
                    df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

            if 'Division' not in df.columns:
                df['Division'] = 'Shetuemultibiz'
                if 'Description' in df.columns:
                    for idx, row in df.iterrows():
                        desc = str(row['Description']).upper()
                        for div, keywords in DIVISION_MAP.items():
                            if any(kw in desc for kw in keywords):
                                df.at[idx, 'Division'] = div
                                break
            df_cleaned = df

        # Save to Output Folder
        if not os.path.exists(OUTPUT_FOLDER):
            os.makedirs(OUTPUT_FOLDER)
            
        file_name = os.path.basename(file_path)
        new_file_name = f"ZOHO_READY_{file_name}"
        output_path = os.path.join(OUTPUT_FOLDER, new_file_name)
        
        df_cleaned.to_csv(output_path, index=False)
        print(f"[+] Success: Cleaned file saved to {output_path}")
        
    except Exception as e:
        print(f"[!] Error processing {file_path}: {e}")

class ZohoHandler(FileSystemEventHandler):
    def on_created(self, event):
        if not event.is_directory and event.src_path.endswith('.csv'):
            time.sleep(1)
            clean_statement(event.src_path)

if __name__ == "__main__":
    if not os.path.exists(WATCH_FOLDER):
        os.makedirs(WATCH_FOLDER)
        
    event_handler = ZohoHandler()
    observer = Observer()
    observer.schedule(event_handler, WATCH_FOLDER, recursive=False)
    
    print(f"[*] SHETUE ZOHO AUTOMATION: Active")
    print(f"[*] Watching: {WATCH_FOLDER}")
    print(f"[*] Output: {OUTPUT_FOLDER}")
    
    observer.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
