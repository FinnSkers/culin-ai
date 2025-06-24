import os
from supabase import create_client, Client

# --- CONFIG ---
DBS = {
    "main": {
        "url": "https://klwbvnhobpdikxjjlvwy.supabase.co",
        "anon_key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtsd2J2bmhvYnBkaWt4ampsdnd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MDI1NjcsImV4cCI6MjA2NjE3ODU2N30.sD9ZB76sv8v1jWMGcsC72wyyw6YdJtaDtQ7zKXmLbKE"
    },
    "external": {
        "url": "https://voyivxzixtmnvhpifgpe.supabase.co",
        "anon_key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZveWl2eHppeHRtbnZocGlmZ3BlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2ODQ1NjcsImV4cCI6MjA2NjI2MDU2N30.Q5NDGrW4awnK8R8PZTJOqbXjXjsgCbbPUue8Wv0O8zU"
    }
}

# --- FUNCTIONS ---
def get_tables(supabase: Client):
    try:
        res = supabase.table("information_schema.tables").select("table_name").eq("table_schema", "public").execute()
        return [row["table_name"] for row in res.data]
    except Exception as e:
        print(f"Error fetching tables: {e}")
        return []

def sample_table_data(supabase: Client, table: str, limit: int = 3):
    try:
        res = supabase.table(table).select("*").limit(limit).execute()
        return res.data
    except Exception as e:
        return f"Error: {e}"

def main():
    for label, creds in DBS.items():
        print(f"\n===== {label.upper()} DATABASE =====")
        supabase = create_client(creds["url"], creds["anon_key"])
        tables = get_tables(supabase)
        print(f"Tables found: {tables}")
        for table in tables:
            print(f"\n--- Table: {table} ---")
            data = sample_table_data(supabase, table)
            print(data)

if __name__ == "__main__":
    main()
