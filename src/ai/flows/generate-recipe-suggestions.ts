'use server';
/**
 * @fileOverview Generates recipe suggestions based on ingredients.
 *
 * - generateRecipeSuggestions - A function that handles the recipe suggestion process.
 * - GenerateRecipeSuggestionsInput - The input type for the generateRecipeSuggestions function.
 * - GenerateRecipeSuggestionsOutput - The return type for the generateRecipeSuggestions function.
 */

import { getLLMConfig, callLLM } from '@/ai/openrouter';
import { AIFlow } from '@/ai/model-mapping';
import { sanitizeLLMJson } from '@/ai/openrouter';

export type GenerateRecipeSuggestionsInput = {
  ingredients: string;
  dietaryNeeds?: string;
  preferences?: string;
};
export type GenerateRecipeSuggestionsOutput = {
  suggestions: string[];
};

/**
 * Generates creative recipe name suggestions based on ingredients using the OpenRouter LLM.
 * @param input - { ingredients, dietaryNeeds?, preferences? }
 * @returns { suggestions: string[] }
 */
export async function generateRecipeSuggestions(input: GenerateRecipeSuggestionsInput): Promise<GenerateRecipeSuggestionsOutput> {
  const prompt = `You are a world-class chef. Given the following ingredients and preferences, suggest 3-5 creative recipe names.\nReturn ONLY a JSON array of strings. No extra text.\n\nIngredients: ${input.ingredients}\nDietary Needs: ${input.dietaryNeeds || 'None'}\nPreferences: ${input.preferences || 'None'}\n\nSuggestions (JSON array):`;
  let suggestions: string[] = [];
  try {
    const result = await callLLM({ prompt, flow: 'generateRecipeSuggestions' });
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
    console.error('generateRecipeSuggestions error:', err);
    suggestions = [];
  }
  return { suggestions };
}
