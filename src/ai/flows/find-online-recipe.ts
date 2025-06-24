'use server';

import { createClient } from '@supabase/supabase-js';

// Define the input type for the flow
export type FindOnlineRecipeInput = {
  query: string;
};

// Define the output type for the flow
export type FindOnlineRecipeOutput = {
  recipeId: string | null;
  title: string | null;
  message: string;
};

// Initialize the Supabase client for the "Chef's Secret" database
const supabaseUrl = process.env.EXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.EXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * This flow finds a recipe online by first searching the local database,
 * then attempting to scrape it from the web using deployed Edge Functions.
 */
export async function findOnlineRecipe(input: FindOnlineRecipeInput): Promise<FindOnlineRecipeOutput> {
  const { query } = input;

  // 1. Search the local "Chef's Secret" database first
  try {
    const { data: existingRecipes, error: searchError } = await supabase
      .from('recipes')
      .select('id, title')
      .textSearch('search_vector', query, { type: 'websearch' });

    if (searchError) {
      console.error('Error searching local recipes:', searchError);
    } else if (existingRecipes && existingRecipes.length > 0) {
      console.log('Found recipe in local DB:', existingRecipes[0].title);
      return {
        recipeId: existingRecipes[0].id,
        title: existingRecipes[0].title,
        message: 'Recipe found in your collection.',
      };
    }
  } catch (e) {
    console.error('An unexpected error occurred during local search:', e);
  }

  // 2. If not found locally, try to scrape it using the primary Edge Function
  console.log('Recipe not found locally. Trying to scrape from the web...');
  try {
    const { data, error } = await supabase.functions.invoke('scrape-with-api', {
      body: { query },
    });

    if (error) throw new Error(`Primary scraper failed: ${error.message}`);

    const recipeId = data?.recipe_id;
    if (recipeId) {
      const { data: recipe } = await supabase.from('recipes').select('id, title').eq('id', recipeId).single();
      return {
        recipeId: recipe?.id || null,
        title: recipe?.title || 'Newly Scraped Recipe',
        message: 'Found and saved a new recipe from the web!',
      };
    }
  } catch (primaryError) {
    console.error('Primary scraper failed:', primaryError.message);
    console.log('Trying fallback scraper...');

    // 3. If primary scraper fails, use the fallback scraper
    try {
      const { data: fallbackData, error: fallbackError } = await supabase.functions.invoke('scrape-direct', {
        body: { query },
      });

      if (fallbackError) throw new Error(`Fallback scraper also failed: ${fallbackError.message}`);

      const recipeId = fallbackData?.recipe_id;
      if (recipeId) {
        const { data: recipe } = await supabase.from('recipes').select('id, title').eq('id', recipeId).single();
        return {
          recipeId: recipe?.id || null,
          title: recipe?.title || 'Newly Scraped Recipe (Fallback)',
          message: 'Found and saved a new recipe from the web using the fallback method.',
        };
      }
    } catch (fallbackError) {
      console.error('Fallback scraper failed:', fallbackError.message);
    }
  }

  // 4. If all attempts fail
  return {
    recipeId: null,
    title: null,
    message: 'Could not find or create a recipe for your query.',
  };
}
