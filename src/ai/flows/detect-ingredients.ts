'use server';

/**
 * @fileOverview Detect ingredients from an image.
 *
 * - detectIngredients - A function that handles the ingredient detection process.
 * - DetectIngredientsInput - The input type for the detectIngredients function.
 * - DetectIngredientsOutput - The return type for the detectIngredients function.
 */

import { getLLMConfig, callLLM } from '@/ai/openrouter';
import { AIFlow } from '@/ai/model-mapping';
import { sanitizeLLMJson } from '@/ai/openrouter';

// Replace zod schemas with TypeScript types for model-agnostic use
export type DetectIngredientsInput = {
  photoDataUri: string;
};
export type DetectIngredientsOutput = {
  ingredients: string[];
};

/**
 * Detects ingredients from a food image using the OpenRouter LLM.
 * @param input - { photoDataUri: string }
 * @returns { ingredients: string[] } - List of detected ingredients (empty if none or on error)
 */
export async function detectIngredients(input: DetectIngredientsInput): Promise<DetectIngredientsOutput> {
  const prompt = `You are a food ingredient detection expert. Given the following image (as a data URI), return ONLY a JSON array of the most likely ingredients visible. Do not include any explanation or extra text.\n\nImage: ${input.photoDataUri}\n\nIngredients (as JSON array):`;
  let ingredients: string[] = [];
  try {
    const result = await callLLM({ prompt, flow: 'detectIngredients' });
    const content = result.choices?.[0]?.message?.content || '';
    if (content.trim().startsWith('[')) {
      ingredients = JSON.parse(sanitizeLLMJson(content));
    } else {
      // Fallback: split by comma or newline, filter out empty strings
      ingredients = content.split(/,|\n/).map((s: string) => s.trim()).filter(Boolean);
    }
  } catch (err) {
    // Optionally log error for debugging
    console.error('detectIngredients error:', err);
    ingredients = [];
  }
  // Always return a string array, even if empty
  return { ingredients };
}
