import os
import pandas as pd

SOURCE_DIR = r"F:\02_SHETUE_BUSINESS_SYSTEMS\01_FINAL_READY_FOR_IMPORT\FIXED_JOURNALS_FOR_UPLOAD"
DEST_DIR = r"F:\antigravity_project\shetue os\finance\Ready_For_Zoho"

def consolidate_journals():
    if not os.path.exists(DEST_DIR):
        os.makedirs(DEST_DIR)
        
    all_journals = []
    
    print(f"[*] Scanning {SOURCE_DIR} for recovery journals...")
    for file in os.listdir(SOURCE_DIR):
        if file.endswith(".csv") and "Recovery_Journal" in file:
            print(f"[*] Processing: {file}")
            df = pd.read_csv(os.path.join(SOURCE_DIR, file))
            all_journals.append(df)
            
    if all_journals:
        combined_df = pd.concat(all_journals, ignore_index=True)
        output_path = os.path.join(DEST_DIR, "MASTER_RECOVERY_JOURNALS_COMBINED.csv")
        combined_df.to_csv(output_path, index=False)
        print(f"[+] Success: Consolidated journal saved to {output_path}")
    else:
        print("[!] No recovery journals found.")

if __name__ == "__main__":
    consolidate_journals()
