
import os
import re
import json
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables from .env.local
# Make sure your .env.local file has the correct Supabase URL and Service Role Key
load_dotenv(dotenv_path=\'.env.local\')

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
MARKDOWN_FILE = "ai_recipes_by_mood_gemini.md"

def parse_recipes_from_markdown(file_path):
    """
    Parses a markdown file to extract recipe details.
    """
    try:
        with open(file_path, \'r\', encoding=\'utf-8\') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"Error: The file {file_path} was not found.")
        return []

    recipes = []
    # Split by mood sections first
    mood_sections = re.split(r\'## Mood: \', content)
    
    current_mood = None
    for section in mood_sections:
        if not section.strip():
            continue

        lines = section.strip().split(\'\\n\')
        current_mood = lines[0].strip()
        
        # Join the rest of the section back and split by recipe titles
        recipe_content = \'\\n\'.join(lines[1:])
        recipe_sections = re.split(r\'### \', recipe_content)

        for recipe_text in recipe_sections:
            if not recipe_text.strip():
                continue
            
            recipe_lines = recipe_text.strip().split(\'\\n\')
            title = recipe_lines[0].strip()

            recipe = {
                "title": title,
                "mood": current_mood,
                "source": "AI",
                "description": None,
                "cuisine": None,
                "servings": None,
                "prep_time": None,
                "cook_time": None,
                "total_time": None,
                "difficulty": None,
                "ingredients": [],
                "instructions": []
            }

            # Use flags to parse multi-line ingredients and instructions
            parsing_ingredients = False
            parsing_instructions = False

            for line in recipe_lines[1:]:
                line = line.strip()
                if not line:
                    continue

                if line.startswith(\'**Description:**\'):
                    parsing_ingredients = parsing_instructions = False
                    recipe[\'description\'] = line.replace(\'**Description:**\', \'\').strip()
                elif line.startswith(\'**Cuisine:**\'):
                    parsing_ingredients = parsing_instructions = False
                    recipe[\'cuisine\'] = line.replace(\'**Cuisine:**\', \'\').strip()
                elif line.startswith(\'**Servings:**\'):
                    parsing_ingredients = parsing_instructions = False
                    servings_text = line.replace(\'**Servings:**\', \'\').strip()
                    match = re.search(r\'\\d+\', servings_text)
                    if match:
                        recipe[\'servings\'] = int(match.group(0))
                elif line.startswith(\'**Prep Time:**\'):
                    parsing_ingredients = parsing_instructions = False
                    time_text = line.replace(\'**Prep Time:**\', \'\').strip()
                    match = re.search(r\'\\d+\', time_text)
                    if match:
                        recipe[\'prep_time\'] = int(match.group(0))
                elif line.startswith(\'**Cook Time:**\'):
                    parsing_ingredients = parsing_instructions = False
                    time_text = line.replace(\'**Cook Time:**\', \'\').strip()
                    match = re.search(r\'\\d+\', time_text)
                    if match:
                        recipe[\'cook_time\'] = int(match.group(0))
                elif line.startswith(\'**Total Time:**\'):
                    parsing_ingredients = parsing_instructions = False
                    time_text = line.replace(\'**Total Time:**\', \'\').strip()
                    match = re.search(r\'\\d+\', time_text)
                    if match:
                        recipe[\'total_time\'] = int(match.group(0))
                elif line.startswith(\'**Difficulty:**\'):
                    parsing_ingredients = parsing_instructions = False
                    recipe[\'difficulty\'] = line.replace(\'**Difficulty:**\', \'\').strip()
                elif line.startswith(\'**Ingredients:**\'):
                    parsing_instructions = False
                    parsing_ingredients = True
                elif line.startswith(\'**Instructions:**\'):
                    parsing_ingredients = False
                    parsing_instructions = True
                elif parsing_ingredients:
                    # Handles "- Ingredient"
                    recipe[\'ingredients\'].append(re.sub(r\'^-\s*\', \'\', line))
                elif parsing_instructions:
                    # Handles "1. Instruction"
                    recipe[\'instructions\'].append(re.sub(r\'^\\d+\.\\s*\', \'\', line))
            
            recipes.append(recipe)
            
    return recipes

def main():
    """
    Main function to parse and upload recipes.
    """
    if not all([SUPABASE_URL, SUPABASE_KEY]):
        print("Error: Supabase URL or Service Role Key is not configured.")
        print("Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are in your .env.local file.")
        return

    print(f"Parsing recipes from {MARKDOWN_FILE}...")
    recipes_to_insert = parse_recipes_from_markdown(MARKDOWN_FILE)

    if not recipes_to_insert:
        print("No recipes found to insert.")
        return

    print(f"Found {len(recipes_to_insert)} recipes to insert.")
    
    # Convert lists to JSON strings for Supabase jsonb type
    for recipe in recipes_to_insert:
        recipe[\'ingredients\'] = json.dumps(recipe[\'ingredients\'])
        recipe[\'instructions\'] = json.dumps(recipe[\'instructions\'])

    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("Connecting to Supabase and inserting recipes...")
        
        # Bulk insert
        data, error = supabase.table(\'community_recipes\').insert(recipes_to_insert).execute()

        if error and error[1]:
             print(f"Error inserting data: {error[1]}")
        else:
            print("Successfully inserted all AI recipes into the \'community_recipes\' table!")

    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    main()
