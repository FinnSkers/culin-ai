'use server';
/**
 * @fileOverview Generates an image for a recipe.
 *
 * - generateRecipeImage - A function that handles the recipe image generation.
 * - GenerateRecipeImageInput - The input type for the generateRecipeImage function.
 * - GenerateRecipeImageOutput - The return type for the generateRecipeImage function.
 */

import { getLLMConfig, callLLM } from '@/ai/openrouter';
import { AIFlow } from '@/ai/model-mapping';

export type GenerateRecipeImageInput = {
  recipeTitle: string;
};
export type GenerateRecipeImageOutput = {
  photoDataUri: string;
};

/**
 * Generates a food image for a recipe using the OpenRouter LLM.
 * @param input - { recipeTitle: string }
 * @returns { photoDataUri: string } - Base64 data URI of the image (empty if not found)
 */
export async function generateRecipeImage(input: GenerateRecipeImageInput): Promise<GenerateRecipeImageOutput> {
  const prompt = `Generate a vibrant, appetizing, professional food photograph of \"${input.recipeTitle}\".\nReturn ONLY a base64 data URI string (data:image/...). No extra text.`;
  let photoDataUri = '';
  try {
    const result = await callLLM({ prompt, flow: 'generateRecipeImage' });
    const content = result.choices?.[0]?.message?.content || '';
    // Simple heuristic: look for a data URI in the response
    const match = content.match(/data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/=]+/);
    if (match) photoDataUri = match[0];
  } catch (err) {
    // Optionally log error for debugging
    console.error('generateRecipeImage error:', err);
    photoDataUri = '';
  }
  return { photoDataUri };
}
