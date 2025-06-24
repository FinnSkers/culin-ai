import os
from supabase import create_client

# Credentials from .env.local
MAIN_URL = "https://klwbvnhobpdikxjjlvwy.supabase.co"
MAIN_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtsd2J2bmhvYnBkaWt4ampsdnd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MDI1NjcsImV4cCI6MjA2NjE3ODU2N30.sD9ZB76sv8v1jWMGcsC72wyyw6YdJtaDtQ7zKXmLbKE"
EXT_URL = "https://voyivxzixtmnvhpifgpe.supabase.co"
EXT_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZveWl2eHppeHRtbnZocGlmZ3BlIiwicm9zZSI6ImFub24iLCJpYXQiOjE3NTA2ODQ1NjcsImV4cCI6MjA2NjI2MDU2N30.Q5NDGrW4awnK8R8PZTJOqbXjXjsgCbbPUue8Wv0O8zU"

# Helper to get all user tables in public schema
def get_tables(supabase):
    res = supabase.table("pg_tables").select("tablename").eq("schemaname", "public").execute()
    if hasattr(res, 'data') and isinstance(res.data, list):
        return [row['tablename'] for row in res.data]
    return []

def get_columns(supabase, table):
    res = supabase.table("information_schema.columns").select("column_name,data_type,is_nullable,column_default").eq("table_schema", "public").eq("table_name", table).order("ordinal_position").execute()
    if hasattr(res, 'data') and isinstance(res.data, list):
        return res.data
    return []

def document_db(supabase, db_name):
    doc = f"\n# Database Structure: {db_name}\n"
    tables = get_tables(supabase)
    for table in tables:
        doc += f"\n## Table: `{table}`\n| Column | Type | Nullable | Default |\n|--------|------|----------|---------|\n"
        columns = get_columns(supabase, table)
        for col in columns:
            doc += f"| {col['column_name']} | {col['data_type']} | {col['is_nullable']} | {col['column_default'] or ''} |\n"
    return doc

def main():
    # Connect to main DB
    main_sb = create_client(MAIN_URL, MAIN_KEY)
    ext_sb = create_client(EXT_URL, EXT_KEY)
    print("Fetching structure for MAIN DB...")
    main_doc = document_db(main_sb, "Main DB")
    print("Fetching structure for EXTERNAL DB...")
    ext_doc = document_db(ext_sb, "External DB")
    with open("database_structure.md", "w", encoding="utf-8") as f:
        f.write(main_doc)
        f.write("\n---\n")
        f.write(ext_doc)
    print("Database structure written to database_structure.md")

if __name__ == "__main__":
    main()
