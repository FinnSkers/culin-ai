// generate-ai-recipes.js
// Usage: node generate-ai-recipes.js
// Requires: node-fetch, fs (built-in)

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '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';
const MODEL = 'meta-llama/llama-4-maverick:free'; // Best for creative recipe generation

const moods = [
  'Comforting', 'Adventurous', 'Quick & Easy', 'Healthy', 'Celebratory', 'Romantic', 'Spicy', 'Lazy Sunday',
  'Workout Fuel', 'Kid-Friendly', 'Fancy Dinner', 'Budget', 'Hangover Cure', 'Impress a Date', 'Potluck Dish',
  'Grilling Time', 'Baking Day', 'Late Night', 'Breakfast', 'Gloomy Day', 'Post-Breakup', 'Movie Night',
  'Study Session', 'Light & Fresh'
];

const RECIPES_PER_MOOD = 10;
const OUTPUT_FILE = 'ai_recipes_by_mood.md';

async function generateRecipe(mood) {
  const prompt = `Generate a unique, creative recipe for the mood: "${mood}". Respond in JSON with the following fields: title, description, cuisine, servings, prep_time, cook_time, total_time, difficulty, ingredients (array of strings), instructions (array of strings).`;
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1024,
      temperature: 1.0
    })
  });
  const data = await response.json();
  let recipe;
  try {
    recipe = JSON.parse(data.choices[0].message.content);
  } catch (e) {
    // fallback: try to extract JSON from text
    const match = data.choices[0].message.content.match(/\{[\s\S]*\}/);
    recipe = match ? JSON.parse(match[0]) : { error: 'Could not parse recipe' };
  }
  return recipe;
}

(async () => {
  let md = '# AI Recipes by Mood\n\n';
  for (const mood of moods) {
    md += `## Mood: ${mood}\n\n`;
    for (let i = 0; i < RECIPES_PER_MOOD; i++) {
      const recipe = await generateRecipe(mood);
      if (recipe && !recipe.error) {
        md += `### Recipe: ${recipe.title || 'Untitled'}\n`;
        md += `- Description: ${recipe.description || ''}\n`;
        md += `- Cuisine: ${recipe.cuisine || ''}\n`;
        md += `- Servings: ${recipe.servings || ''}\n`;
        md += `- Prep Time: ${recipe.prep_time || ''}\n`;
        md += `- Cook Time: ${recipe.cook_time || ''}\n`;
        md += `- Total Time: ${recipe.total_time || ''}\n`;
        md += `- Difficulty: ${recipe.difficulty || ''}\n`;
        md += `- Ingredients:\n`;
        if (Array.isArray(recipe.ingredients)) {
          for (const ing of recipe.ingredients) md += `  - ${ing}\n`;
        }
        md += `- Instructions:\n`;
        if (Array.isArray(recipe.instructions)) {
          for (const step of recipe.instructions) md += `  1. ${step}\n`;
        }
        md += '\n';
      } else {
        md += `### Recipe: [Generation Failed]\n`;
      }
    }
  }
  fs.writeFileSync(OUTPUT_FILE, md);
  console.log(`Recipes exported to ${OUTPUT_FILE}`);
})();
