import time
import os
import requests
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from dotenv import load_dotenv

# --- CONFIGURATION ---
# Load environment variables from the backend folder
env_path = os.path.join(os.path.dirname(__file__), '..', 'backend', '.env')
load_dotenv(dotenv_path=env_path)

WATCH_FOLDER = os.getenv("WATCH_FOLDER", r"F:\antigravity_project\shetue os\Upload_Ready")
SORTED_FOLDER = os.path.join(os.path.dirname(WATCH_FOLDER), "Sorted")
N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL", "http://72.61.151.10:5678/webhook/shetue-upload")
NOTION_FILES_DB_ID = os.getenv("NOTION_FILES_DB_ID", "")

class FileHandler(FileSystemEventHandler):
    def on_created(self, event):
        if not event.is_directory:
            file_path = event.src_path
            file_name = os.path.basename(file_path)
            print(f"[*] New file detected: {file_name}")
            
            if not NOTION_FILES_DB_ID:
                print("[!] Error: NOTION_FILES_DB_ID not found in .env")
                return

            # Simple metadata extraction
            # In a real scenario, you'd upload to Google Drive here and get the link
            dummy_drive_link = f"https://drive.google.com/file/d/simulated_{int(time.time())}"
            
            payload = {
                "file_name": file_name,
                "category": "Document",
                "drive_link": dummy_drive_link,
                "database_id": NOTION_FILES_DB_ID,
                "notes": f"Automatically tracked from {WATCH_FOLDER}"
            }
            
            try:
                print(f"[*] Syncing {file_name} to n8n...")
                response = requests.post(N8N_WEBHOOK_URL, json=payload)
                if response.status_code == 200:
                    print(f"[+] Successfully synced to Notion via n8n")
                    # Move to Sorted folder after success
                    if not os.path.exists(SORTED_FOLDER):
                        os.makedirs(SORTED_FOLDER)
                    new_path = os.path.join(SORTED_FOLDER, file_name)
                    os.rename(file_path, new_path)
                    print(f"[*] Moved {file_name} to Sorted folder")
                else:
                    print(f"[-] Error from n8n: {response.status_code} {response.text}")
            except Exception as e:
                print(f"[!] Webhook failed: {e}")

if __name__ == "__main__":
    if not os.path.exists(WATCH_FOLDER):
        os.makedirs(WATCH_FOLDER)
        
    event_handler = FileHandler()
    observer = Observer()
    observer.schedule(event_handler, WATCH_FOLDER, recursive=False)
    
    print(f"[*] SHETUE SYSTEM: File Tracker Active")
    print(f"[*] Watching: {WATCH_FOLDER}")
    print(f"[*] n8n Webhook: {N8N_WEBHOOK_URL}")
    
    observer.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()

