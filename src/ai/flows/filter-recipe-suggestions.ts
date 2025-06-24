'use server';

/**
 * @fileOverview Recipe filter AI agent.
 *
 * - filterRecipeSuggestions - A function that handles the recipe filtering process.
 * - FilterRecipeSuggestionsInput - The input type for the filterRecipeSuggestions function.
 * - FilterRecipeSuggestionsOutput - The return type for the filterRecipeSuggestions function.
 */

import { callLLM } from '@/ai/openrouter';
import { AIFlow } from '@/ai/model-mapping';
import { sanitizeLLMJson } from '@/ai/openrouter';

// Strict TypeScript types for model-agnostic use
export type FilterRecipeSuggestionsInput = {
  recipe: string;
  dietaryNeeds: string[];
};
export type FilterRecipeSuggestionsOutput = {
  suitable: boolean;
  reason: string;
};

/**
 * Filters a recipe suggestion based on dietary needs using the OpenRouter LLM.
 * @param input - { recipe: string, dietaryNeeds: string[] }
 * @returns { suitable: boolean, reason: string }
 */
export async function filterRecipeSuggestions(
  input: FilterRecipeSuggestionsInput
): Promise<FilterRecipeSuggestionsOutput> {
  const prompt = `You are a recipe dietary filter. Given the following recipe and a list of dietary needs, respond ONLY with a JSON object: {\n  \"suitable\": boolean,\n  \"reason\": string\n}\nDo not include any extra text.\n\nRecipe: ${input.recipe}\nDietary Needs: ${input.dietaryNeeds.join(', ') || 'None'}\n\nJSON:`;
  let output: FilterRecipeSuggestionsOutput = { suitable: false, reason: '' };
  try {
    const result = await callLLM({ prompt, flow: 'filterRecipeSuggestions' });
    const content = result.choices?.[0]?.message?.content || '';
    const parsed = JSON.parse(sanitizeLLMJson(content));
    if (typeof parsed.suitable === 'boolean' && typeof parsed.reason === 'string') {
      output = parsed;
    } else {
      throw new Error('Invalid LLM output shape');
    }
  } catch (err) {
    // Optionally log error for debugging
    console.error('filterRecipeSuggestions error:', err);
    output = {
      suitable: false,
      reason: 'Could not determine suitability. AI response was not valid JSON.'
    };
  }
  return output;
}
