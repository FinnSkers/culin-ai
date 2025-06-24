'use server';
/**
 * @fileOverview Suggests recipe names based on the user's mood.
 *
 * - suggestMoodRecipes - A function that suggests recipes for a given mood.
 * - SuggestMoodRecipesInput - The input type for the suggestMoodRecipes function.
 * - SuggestMoodRecipesOutput - The return type for the suggestMoodRecipes function.
 */

import { getLLMConfig, callLLM } from '@/ai/openrouter';
import { AIFlow } from '@/ai/model-mapping';
import { sanitizeLLMJson } from '@/ai/openrouter';

export type SuggestMoodRecipesInput = {
  mood: string;
  dietaryNeeds?: string;
  preferences?: string;
};
export type SuggestMoodRecipesOutput = {
  suggestions: string[];
};

/**
 * Suggests recipe names based on mood using the OpenRouter LLM.
 * @param input - { mood, dietaryNeeds?, preferences? }
 * @returns { suggestions: string[] }
 */
export async function suggestMoodRecipes(input: SuggestMoodRecipesInput): Promise<SuggestMoodRecipesOutput> {
  const prompt = `You are a creative chef. Based on the user's mood, dietary needs, and preferences, suggest 3-5 unique recipe ideas.\nReturn ONLY a JSON array of strings. No extra text.\n\nMood: ${input.mood}\nDietary Needs: ${input.dietaryNeeds || 'None'}\nPreferences: ${input.preferences || 'None'}\n\nRecipe Suggestions (JSON array):`;
  let suggestions: string[] = [];
  try {
    const result = await callLLM({ prompt, flow: 'suggestMoodRecipes' });
    let content = result.choices?.[0]?.message?.content || '';
    // Remove code block markers if present
    content = content.replace(/```json|```/g, '').trim();
    if (content.startsWith('[')) {
      suggestions = JSON.parse(sanitizeLLMJson(content));
    } else {
      suggestions = content.split(/\n|,/).map((s: string) => s.trim()).filter(Boolean);
    }
    // Filter out any items that look like brackets or code block remnants
    suggestions = suggestions.filter(s => s && !/^\[|\]$|^\s*```/.test(s));
  } catch (err) {
    // Optionally log error for debugging
    console.error('suggestMoodRecipes error:', err);
    suggestions = [];
  }
  return { suggestions };
}
