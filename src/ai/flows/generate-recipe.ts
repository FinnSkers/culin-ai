'use server';
/**
 * @fileOverview Generates a recipe based on the ingredients the user has available and a chosen title.
 *
 * - generateRecipe - A function that handles the recipe generation process.
 * - GenerateRecipeInput - The input type for the generateRecipe function.
 * - GenerateRecipeOutput - The return type for the generateRecipe function.
 */

import { getLLMConfig, callLLM } from '@/ai/openrouter';
import { AIFlow } from '@/ai/model-mapping';
import { sanitizeLLMJson } from '@/ai/openrouter';
import { generateRecipeImage } from './generate-recipe-image';

export type GenerateRecipeInput = {
  recipeTitle: string;
  ingredients: string;
  dietaryNeeds?: string;
  preferences?: string;
};
export type GenerateRecipeOutput = {
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
 * Generates a full recipe from a selected recipe name and ingredients using the OpenRouter LLM.
 * @param input - { recipeTitle, ingredients, dietaryNeeds?, preferences? }
 * @returns { recipeName, ingredients, instructions, nutrition, photoDataUri? }
 */
export async function generateRecipe(input: GenerateRecipeInput): Promise<GenerateRecipeOutput> {
  const prompt = `You are a world-class chef. Given the following information, generate a full, detailed recipe in the user's language.\n\nTitle: \"${input.recipeTitle}\"\nAvailable Ingredients: ${input.ingredients}\nDietary Needs: ${input.dietaryNeeds || 'None'}\nPreferences: ${input.preferences || 'None'}\n\nReturn ONLY a JSON object with the following fields:\n{\n  \"recipeName\": string,\n  \"ingredients\": string,\n  \"instructions\": string,\n  \"nutrition\": {\n    \"calories\": string,\n    \"protein\": string,\n    \"carbs\": string,\n    \"fat\": string\n  }\n}\nNo extra text.`;
  let output: GenerateRecipeOutput = {
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
    const result = await callLLM({ prompt, flow: 'generateRecipe' });
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
    console.error('generateRecipe error:', err);
    // output remains as safe fallback
  }
  // Try to generate an image (optional)
  try {
    const image = await generateRecipeImage({ recipeTitle: input.recipeTitle });
    output.photoDataUri = image.photoDataUri;
  } catch (err) {
    // Optionally log error for debugging
    console.error('generateRecipe image error:', err);
  }
  return output;
}
