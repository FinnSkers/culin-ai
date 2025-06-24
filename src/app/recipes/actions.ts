'use server';

import { createClient } from '@supabase/supabase-js';
import { Recipe } from '@/lib/types';

// This action fetches a single, complete recipe from the \'Chef\'s Secret\' database.
// It\'s designed to be called from the client-side after a user selects
// a recipe that was found or scraped by our \'findOnlineRecipe\' flow.

// The client for the external \'Chef\'s Secret\' database
const supabaseUrl = process.env.EXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.EXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase credentials for external database.");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Type definition for an ingredient from the database
interface DbIngredient {
  name: string;
  quantity: string;
  unit: string;
}

// Type definition for an instruction step from the database
interface DbInstruction {
  step: number;
  text: string;
}

export async function getRecipeById(recipeId: string): Promise<Recipe | null> {
    const { data, error } = await supabase
        .from('recipes')
        .select(`
            title,
            ingredients,
            instructions,
            servings,
            prep_time,
            cook_time,
            total_time,
            source_url
        `)
        .eq('id', recipeId)
        .single();

    if (error) {
        console.error('Error fetching recipe by ID from external DB:', error);
        return null;
    }

    if (!data) {
        return null;
    }

    // Format the structured data from the database into simple strings
    // that the existing \'Recipe\' type and \'RecipeDialog\' component expect.
    const ingredientsString = (data.ingredients as DbIngredient[] || [])
        .map(ing => `${ing.quantity || ''} ${ing.unit || ''} ${ing.name}`.trim())
        .join('\n');

    const instructionsString = (data.instructions as DbInstruction[] || [])
        .map(inst => inst.text)
        .join('\n\n');

    // Map the database record to the frontend \'Recipe\' type.
    const formattedRecipe: Recipe = {
        recipeName: data.title,
        ingredients: ingredientsString,
        instructions: instructionsString,
        nutrition: { // Nutrition data is not part of the scraping process yet.
            calories: 'N/A',
            protein: 'N/A',
            carbs: 'N/A',
            fat: 'N/A',
        },
        sourceUrl: data.source_url,
    };

    return formattedRecipe;
}
