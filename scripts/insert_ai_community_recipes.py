import os
from supabase import create_client

SUPABASE_URL = "https://klwbvnhobpdikxjjlvwy.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtsd2J2bmhvYnBkaWt4ampsdnd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MDI1NjcsImV4cCI6MjA2NjE3ODU2N30.sD9ZB76sv8v1jWMGcsC72wyyw6YdJtaDtQ7zKXmLbKE"
USER_ID = "8320993f-0c71-4c27-8c8c-e8fe7a28f62f"

AI_RECIPES = [
    {
        "title": "AI Sunrise Smoothie",
        "description": "A refreshing, vitamin-packed smoothie to start your day!",
        "ingredients": ["1 cup orange juice", "1 banana", "1/2 cup frozen mango", "1/2 cup Greek yogurt", "1 tsp honey"],
        "instructions": [
            "Add all ingredients to a blender.",
            "Blend until smooth.",
            "Pour into a glass and enjoy!"
        ]
    },
    {
        "title": "AI One-Pan Pasta Primavera",
        "description": "A quick, healthy pasta dish loaded with spring veggies.",
        "ingredients": ["200g spaghetti", "1 cup cherry tomatoes", "1 zucchini, sliced", "1/2 cup peas", "2 cloves garlic, minced", "2 tbsp olive oil", "Salt & pepper"],
        "instructions": [
            "Heat olive oil in a large pan.",
            "Add garlic, tomatoes, zucchini, and peas. Sauté 3-4 min.",
            "Add spaghetti and 2 cups water. Cook until pasta is al dente.",
            "Season with salt and pepper. Serve warm."
        ]
    },
    {
        "title": "AI No-Bake Choco Oat Bars",
        "description": "Easy, healthy snack bars with chocolate and oats.",
        "ingredients": ["2 cups rolled oats", "1/2 cup peanut butter", "1/3 cup honey", "1/2 cup dark chocolate chips"],
        "instructions": [
            "Mix oats, peanut butter, and honey in a bowl.",
            "Press into a lined pan.",
            "Melt chocolate chips and drizzle on top.",
            "Chill for 1 hour, then cut into bars."
        ]
    }
]

def main():
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    for recipe in AI_RECIPES:
        data = {
            "user_id": USER_ID,
            "title": recipe["title"],
            "description": recipe["description"],
            "ingredients": recipe["ingredients"],
            "instructions": recipe["instructions"],
        }
        res = supabase.table("community_recipes").insert(data).execute()
        print(f"Inserted: {recipe['title']} | Response: {res}")

if __name__ == "__main__":
    main()
