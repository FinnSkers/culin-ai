import {z} from 'genkit';

export const GenerateRecipeOutputSchema = z.object({
  recipeName: z.string().describe('The name of the generated recipe (should match the input recipeTitle if provided).'),
  ingredients: z.string().describe('A list of ingredients needed for the recipe and their quantities, formatted as a newline-separated list.'),
  instructions: z.string().describe('Step-by-step instructions for preparing the recipe, formatted as a newline-separated list.'),
  nutrition: z.object({
      calories: z.string().describe('Estimated calories for one serving (e.g., "450 kcal").'),
      protein: z.string().describe('Estimated grams of protein for one serving (e.g., "30g").'),
      carbs: z.string().describe('Estimated grams of carbohydrates for one serving (e.g., "40g").'),
      fat: z.string().describe('Estimated grams of fat for one serving (e.g., "15g").'),
  }).describe('Estimated nutritional information per serving.'),
  photoDataUri: z.string().optional().describe("A data URI of a generated image for the recipe. Format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type GenerateRecipeOutput = z.infer<typeof GenerateRecipeOutputSchema>;


export const RecipeSearchResultSchema = z.object({
    title: z.string().describe('The title of the recipe.'),
    source: z.string().describe("The source website of the recipe (e.g., 'allrecipes.com')."),
    snippet: z.string().describe('A short, descriptive snippet of the recipe.'),
});
export type RecipeSearchResult = z.infer<typeof RecipeSearchResultSchema>;


// Schemas for Voice Interaction Flow
export const VoiceCommandInputSchema = z.object({
  command: z.string().describe('The voice command to process.'),
  recipeInstructions: z.string().optional().describe('The full instructions for the current recipe, separated by newlines.'),
  currentStep: z.number().optional().describe('The index of the current recipe step (0-indexed).'),
  voiceName: z.string().optional().describe('The name of the prebuilt TTS voice to use.'),
  generateAudio: z.boolean().optional().describe('Whether to generate an audio response.'),
});
export type VoiceCommandInput = z.infer<typeof VoiceCommandInputSchema>;

export const VoiceCommandOutputSchema = z.object({
  response: z.string().describe('The final, user-facing text response.'),
  audioResponse: z.string().optional().describe('The audio version of the response, as a data URI.'),
  action: z.enum(['next', 'previous', 'repeat', 'scanIngredients', 'safetyAlert', 'createRecipe', 'startCooking', 'none']).default('none').describe('The action to take in the UI.'),
  recipe: GenerateRecipeOutputSchema.optional().describe('A fully generated recipe object, if the action is createRecipe.'),
});
export type VoiceCommandOutput = z.infer<typeof VoiceCommandOutputSchema>;
