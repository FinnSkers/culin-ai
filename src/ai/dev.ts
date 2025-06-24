'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/filter-recipe-suggestions.ts';
import '@/ai/flows/safety-alerts.ts';
import '@/ai/flows/generate-recipe.ts';
import '@/ai/flows/generate-recipe-suggestions.ts';
import '@/ai/flows/voice-first-interaction.ts';
import '@/ai/flows/detect-ingredients.ts';
import '@/ai/flows/suggest-recipe-for-mood.ts';
import '@/ai/flows/search-web-for-recipes.ts';
import '@/ai/flows/search-web-for-mood-recipes.ts';
import '@/ai/flows/generate-recipe-from-mood.ts';
import '@/ai/flows/generate-recipe-image.ts';
