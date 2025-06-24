/**
 * @fileOverview Searches the web for recipes.
 *
 * - searchWebForRecipes - A function that handles the web search process.
 * - SearchWebForRecipesInput - The input type for the searchWebForRecipes function.
 * - SearchWebForRecipesOutput - The return type for the searchWebForRecipes function.
 */

import { getLLMConfig, callLLM } from '@/ai/openrouter';
import { AIFlow } from '@/ai/model-mapping';
import { sanitizeLLMJson } from '@/ai/openrouter';

export type SearchWebForRecipesInput = {
  ingredients: string;
  dietaryNeeds?: string;
  preferences?: string;
};
export type SearchWebForRecipesOutput = {
  results: string[];
};

/**
 * Suggests web recipes based on ingredients using the OpenRouter LLM.
 * @param input - { ingredients, dietaryNeeds?, preferences? }
 * @returns { results: string[] }
 */
export async function searchWebForRecipes(input: SearchWebForRecipesInput): Promise<SearchWebForRecipesOutput> {
  const prompt = `You are a culinary web search assistant. Based on the user's available ingredients, dietary needs, and preferences, suggest 3-5 relevant recipe ideas.\nReturn ONLY a JSON array of strings. No extra text.\n\nIngredients: ${input.ingredients}\nDietary Needs: ${input.dietaryNeeds || 'None'}\nPreferences: ${input.preferences || 'None'}\n\nRecipe Ideas (JSON array):`;
  let results: string[] = [];
  try {
    const result = await callLLM({ prompt, flow: 'searchWebForRecipes' });
    const content = result.choices?.[0]?.message?.content || '';
    if (content.trim().startsWith('[')) {
      results = JSON.parse(sanitizeLLMJson(content));
    } else {
      results = content.split(/\n|,/).map((s: string) => s.trim()).filter(Boolean);
    }
  } catch (err) {
    // Optionally log error for debugging
    console.error('searchWebForRecipes error:', err);
    results = [];
  }
  return { results };
}
