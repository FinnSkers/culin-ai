/**
 * @fileOverview Searches the web for recipes based on a mood.
 *
 * - searchWebForMoodRecipes - A function that handles the web search process.
 * - SearchWebForMoodRecipesInput - The input type for the searchWebForMoodRecipes function.
 * - SearchWebForRecipesOutput - The return type from the original search flow, which we can reuse.
 */

import { getLLMConfig, callLLM } from '@/ai/openrouter';
import { AIFlow } from '@/ai/model-mapping';
import { sanitizeLLMJson } from '@/ai/openrouter';

export type SearchWebForMoodRecipesInput = {
  mood: string;
  dietaryNeeds?: string;
  preferences?: string;
};
export type SearchWebForMoodRecipesOutput = {
  results: string[];
};

/**
 * Suggests web recipes based on mood using the OpenRouter LLM.
 * @param input - { mood, dietaryNeeds?, preferences? }
 * @returns { results: string[] }
 */
export async function searchWebForMoodRecipes(input: SearchWebForMoodRecipesInput): Promise<SearchWebForMoodRecipesOutput> {
  const prompt = `You are a culinary web search assistant. Based on the user's mood, dietary needs, and preferences, suggest 3-5 relevant recipe ideas.\nReturn ONLY a JSON array of strings. No extra text.\n\nMood: ${input.mood}\nDietary Needs: ${input.dietaryNeeds || 'None'}\nPreferences: ${input.preferences || 'None'}\n\nRecipe Ideas (JSON array):`;
  let results: string[] = [];
  try {
    const result = await callLLM({ prompt, flow: 'searchWebForMoodRecipes' });
    const content = result.choices?.[0]?.message?.content || '';
    if (content.trim().startsWith('[')) {
      results = JSON.parse(sanitizeLLMJson(content));
    } else {
      results = content.split(/\n|,/).map((s: string) => s.trim()).filter(Boolean);
    }
  } catch (err) {
    // Optionally log error for debugging
    console.error('searchWebForMoodRecipes error:', err);
    results = [];
  }
  return { results };
}
