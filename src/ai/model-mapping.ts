// src/ai/model-mapping.ts
// Centralized model mapping for each AI flow/task

export type AIFlow =
  | 'detectIngredients'
  | 'generateRecipeSuggestions'
  | 'generateRecipe'
  | 'generateRecipeFromMood'
  | 'generateRecipeImage'
  | 'filterRecipeSuggestions'
  | 'getSafetyAlert'
  | 'searchWebForRecipes'
  | 'searchWebForMoodRecipes'
  | 'suggestMoodRecipes'
  | 'voiceCommand';

// Best models for each flow (primary and fallbacks)
export const modelMapping: Record<AIFlow, { models: string[] }> = {
  detectIngredients: { models: [
    'meta-llama/llama-3.3-8b-instruct:free',
    'google/gemma-3n-e4b-it:free',
    'openai/gpt-3.5-turbo'
  ] },
  generateRecipeSuggestions: { models: [
    'meta-llama/llama-3.3-8b-instruct:free',
    'google/gemma-3n-e4b-it:free',
    'openai/gpt-3.5-turbo'
  ] },
  generateRecipe: { models: [
    'meta-llama/llama-3.3-8b-instruct:free',
    'google/gemma-3n-e4b-it:free',
    'meta-llama/llama-4-maverick:free'
  ] },
  generateRecipeFromMood: { models: [
    'meta-llama/llama-3.3-8b-instruct:free',
    'google/gemma-3n-e4b-it:free',
    'meta-llama/llama-4-maverick:free'
  ] },
  generateRecipeImage: { models: [
    'openai/dall-e-3',
    'stability-ai/sdxl',
    'meta-llama/llama-4-maverick:free'
  ] },
  filterRecipeSuggestions: { models: [
    'meta-llama/llama-3.3-8b-instruct:free',
    'google/gemma-3n-e4b-it:free',
    'openai/gpt-3.5-turbo'
  ] },
  getSafetyAlert: { models: [
    'meta-llama/llama-3.3-8b-instruct:free',
    'google/gemma-3n-e4b-it:free',
    'meta-llama/llama-4-maverick:free'
  ] },
  searchWebForRecipes: { models: [
    'meta-llama/llama-3.3-8b-instruct:free',
    'google/gemma-3n-e4b-it:free',
    'openai/gpt-3.5-turbo'
  ] },
  searchWebForMoodRecipes: { models: [
    'meta-llama/llama-3.3-8b-instruct:free',
    'google/gemma-3n-e4b-it:free',
    'openai/gpt-3.5-turbo'
  ] },
  suggestMoodRecipes: { models: [
    'meta-llama/llama-3.3-8b-instruct:free',
    'google/gemma-3n-e4b-it:free',
    'openai/gpt-3.5-turbo'
  ] },
  voiceCommand: { models: [
    'meta-llama/llama-3.3-8b-instruct:free',
    'google/gemma-3n-e4b-it:free',
    'meta-llama/llama-4-maverick:free'
  ] },
};
