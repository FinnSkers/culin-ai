import os
from supabase import create_client, Client

# Credentials for both databases
DBS = {
    "main": {
        "url": os.getenv("NEXT_PUBLIC_SUPABASE_URL"),
        "anon_key": os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    },
    "external": {
        "url": os.getenv("EXT_PUBLIC_SUPABASE_URL"),
        "anon_key": os.getenv("EXT_PUBLIC_SUPABASE_ANON_KEY"),
    },
}

def get_tables(supabase: Client):
    # Query the information_schema to get all table names
    res = supabase.table("information_schema.tables").select("table_name").eq("table_schema", "public").execute()
    return [row["table_name"] for row in res.data]

def sample_table_data(supabase: Client, table: str, limit: int = 3):
    try:
        res = supabase.table(table).select("*").limit(limit).execute()
        return res.data
    except Exception as e:
        return f"Error: {e}"

def main():
    for label, creds in DBS.items():
        print(f"\n--- {label.upper()} DATABASE ---")
        supabase = create_client(creds["url"], creds["anon_key"])
        tables = get_tables(supabase)
        print(f"Tables: {tables}")
        for table in tables:
            print(f"\nSample data from {table}:")
            data = sample_table_data(supabase, table)
            print(data)

if __name__ == "__main__":
    main()
