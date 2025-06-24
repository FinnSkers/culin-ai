'use server';
/**
 * @fileOverview Generates a full recipe based on a title and a mood.
 *
 * - generateRecipeFromMood - A function that handles the recipe generation process.
 * - GenerateRecipeFromMoodInput - The input type for the generateRecipeFromMood function.
 * - GenerateRecipeOutput - The return type for the generateRecipeFromMood function.
 */

import { getLLMConfig, callLLM } from '@/ai/openrouter';
import { AIFlow } from '@/ai/model-mapping';
import { sanitizeLLMJson } from '@/ai/openrouter';
import { generateRecipeImage } from './generate-recipe-image';

export type GenerateRecipeFromMoodInput = {
  recipeTitle: string;
  mood: string;
  dietaryNeeds?: string;
  preferences?: string;
};
export type GenerateRecipeFromMoodOutput = {
  recipeName: string;
  ingredients: string;
  instructions: string;
  nutrition: {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
  };
  photoDataUri?: string;
};

/**
 * Generates a full recipe based on a title and mood using the OpenRouter LLM.
 * @param input - { recipeTitle, mood, dietaryNeeds?, preferences? }
 * @returns { recipeName, ingredients, instructions, nutrition, photoDataUri? }
 */
export async function generateRecipeFromMood(input: GenerateRecipeFromMoodInput): Promise<GenerateRecipeFromMoodOutput> {
  const prompt = `You are a world-class chef. Given the following information, generate a full, detailed recipe in the user's language.\n\nTitle: \"${input.recipeTitle}\"\nMood: \"${input.mood}\"\nDietary Needs: ${input.dietaryNeeds || 'None'}\nPreferences: ${input.preferences || 'None'}\n\nReturn ONLY a JSON object with the following fields:\n{\n  \"recipeName\": string,\n  \"ingredients\": string,\n  \"instructions\": string,\n  \"nutrition\": {\n    \"calories\": string,\n    \"protein\": string,\n    \"carbs\": string,\n    \"fat\": string\n  }\n}\nNo extra text.`;
  let output: GenerateRecipeFromMoodOutput = {
    recipeName: input.recipeTitle,
    ingredients: '',
    instructions: '',
    nutrition: { calories: '', protein: '', carbs: '', fat: '' },
  };
  function normalizeRecipeField(field: string | string[] | undefined): string {
    if (Array.isArray(field)) return field.join('\n');
    if (typeof field === 'string') return field.trim();
    return '';
  }
  try {
    const result = await callLLM({ prompt, flow: 'generateRecipeFromMood' });
    const content = result.choices?.[0]?.message?.content || '';
    const parsed = JSON.parse(sanitizeLLMJson(content));
    if (
      typeof parsed.recipeName === 'string' &&
      parsed.ingredients && parsed.instructions &&
      typeof parsed.nutrition === 'object'
    ) {
      output = {
        recipeName: parsed.recipeName,
        ingredients: normalizeRecipeField(parsed.ingredients),
        instructions: normalizeRecipeField(parsed.instructions),
        nutrition: parsed.nutrition,
      };
    } else {
      throw new Error('Invalid LLM output shape');
    }
  } catch (err) {
    // Optionally log error for debugging
    console.error('generateRecipeFromMood error:', err);
    // output remains as safe fallback
  }
  // Try to generate an image (optional)
  try {
    const image = await generateRecipeImage({ recipeTitle: input.recipeTitle });
    output.photoDataUri = image.photoDataUri;
  } catch (err) {
    // Optionally log error for debugging
    console.error('generateRecipeFromMood image error:', err);
  }
  return output;
}
