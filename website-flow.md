# Website Flow & AI Flows Overview

## High-Level Website Structure

```mermaid
flowchart TD
    A[User (UI: React/Next.js)] -->|Input: Ingredients, Mood, Preferences| B[CulinAI Context (State, Profile, Search)]
    B -->|Triggers| C[AI Flows (src/ai/flows/*)]
    C -->|LLM Prompts & Parsing| D[OpenRouter LLM (src/ai/openrouter.ts)]
    C -->|DB Search/Write| E[Supabase (User, Pantry, Recipes, Auth)]
    D -->|AI Results| C
    E -->|Recipe Data, User Data| B
    C -->|Background: Scraping/Enrichment| F[Serverless Functions / Jobs]
    F -->|New Recipes| E
    E -->|Realtime Updates| B
```

---

## Chef's Secret: Seamless, Multi-Stage Recipe Search Flow

```mermaid
flowchart TD
    U[User: enters ingredients, mood, preferences, or URL] -->|Triggers| S1[Supabase Instant Search]
    U -->|(Optional) Submits URL| SCRAPE[Scraper/Enrichment Job]
    S1 -->|Instant Results| UI1[UI: Shows instant DB results]
    S1 -->|No match| SCRAPE
    SCRAPE -->|Scrape/Enrich| AI[AI Normalization, Tagging, Fuzzy Matching]
    AI -->|New/Enriched Recipe| DB[Supabase Recipes Table]
    DB -->|Realtime Update| UI2[UI: Live update with new/enriched recipe]
    UI1 -->|User selects recipe| DETAIL[Recipe Details: ingredients, steps, nutrition, image]
    UI2 -->|User selects recipe| DETAIL
    DETAIL -->|User feedback| FEEDBACK[Flag/Report, Rate, etc.]
    FEEDBACK -->|Stored| DB
    DB -->|Admin/Observability| ADMIN[Logs, Error Reporting]
```

**Key Features:**
- User enters simple query (no URLs required, but supported)
- Instant fuzzy/semantic search in Supabase
- Parallel background scraping/AI enrichment for new recipes
- Live UI updates as new recipes are found/enriched
- Personalized ranking, filters, and feedback
- All recipes unified in one index, with robust security and observability

---

## Main AI Flows (src/ai/flows/)

> **All flows are model-agnostic, use only the OpenRouter LLM abstraction, and are written with strict TypeScript types and robust error handling. All legacy Genkit/Gemini/zod code has been removed.**


### 1. detect-ingredients.ts

- **Purpose:** Detects ingredients from an image (data URI).
- **Input:** `{ photoDataUri: string }`
- **Output:** `{ ingredients: string[] }`
- **How:** Builds a prompt for the LLM, parses the response as a list of ingredients. Always returns a string array (empty on error), logs errors for maintainability.


### 2. filter-recipe-suggestions.ts

- **Purpose:** Filters a recipe for dietary needs.
- **Input:** `{ recipe: string, dietaryNeeds: string[] }`
- **Output:** `{ suitable: boolean, reason: string }`
- **How:** Builds a prompt for the LLM, parses the result for suitability and reason. Returns a valid object even on error, with a user-friendly message.


### 3. generate-recipe-from-mood.ts

- **Purpose:** Generates a full recipe based on a title and mood.
- **Input:** `{ recipeTitle: string, mood: string, dietaryNeeds?: string, preferences?: string }`
- **Output:** `{ recipeName, ingredients, instructions, nutrition, photoDataUri? }`
- **How:** Builds a detailed prompt for the LLM, parses the JSON result, and generates an image. Handles errors gracefully and always returns a valid object.


### 4. generate-recipe-image.ts

- **Purpose:** Generates an image for a recipe.
- **Input:** `{ recipeTitle: string }`
- **Output:** `{ photoDataUri: string }`
- **How:** Prompts the LLM for a food image, extracts a data URI from the response. Returns an empty string on error.


### 5. generate-recipe-suggestions.ts

- **Purpose:** Suggests creative recipe names based on ingredients.
- **Input:** `{ ingredients: string, dietaryNeeds?: string, preferences?: string }`
- **Output:** `{ suggestions: string[] }`
- **How:** Prompts the LLM for 3-5 creative recipe names, parses as JSON or splits by newlines. Always returns a string array (empty on error).


### 6. generate-recipe.ts

- **Purpose:** Generates a full recipe from a selected recipe name and ingredients.
- **Input:** `{ recipeTitle: string, ingredients: string, dietaryNeeds?: string, preferences?: string }`
- **Output:** `{ recipeName, ingredients, instructions, nutrition, photoDataUri? }`
- **How:** Prompts the LLM for a full recipe, parses JSON, and generates an image. Handles errors gracefully and always returns a valid object.


### 7. recommend-recipe.ts

- **Purpose:** (Removed/Deprecated)


### 8. safety-alerts.ts

- **Purpose:** Detects kitchen safety hazards from an image.
- **Input:** `{ photoDataUri: string }`
- **Output:** `{ alertType: string, severity: string, instructions: string }`
- **How:** Prompts the LLM to analyze the image and return alert details as a JSON object. Returns safe defaults on error.


### 9. search-web-for-mood-recipes.ts

- **Purpose:** Suggests web recipes based on mood.
- **Input:** `{ mood: string, dietaryNeeds?: string, preferences?: string }`
- **Output:** `{ results: string[] }`
- **How:** Prompts the LLM for 3-5 recipe ideas matching the mood. Always returns a string array (empty on error).


### 10. search-web-for-recipes.ts

- **Purpose:** Suggests web recipes based on ingredients.
- **Input:** `{ ingredients: string, dietaryNeeds?: string, preferences?: string }`
- **Output:** `{ results: string[] }`
- **How:** Prompts the LLM for 3-5 recipe ideas matching the ingredients. Always returns a string array (empty on error).


### 11. suggest-recipe-for-mood.ts

- **Purpose:** Suggests recipe names based on mood.
- **Input:** `{ mood: string, dietaryNeeds?: string, preferences?: string }`
- **Output:** `{ suggestions: string[] }`
- **How:** Prompts the LLM for 3-5 creative recipe names matching the mood. Always returns a string array (empty on error).


### 12. voice-first-interaction.ts

- **Purpose:** Handles all voice-based user interaction, intent classification, and recipe parsing.
- **Input:** `VoiceCommandInput` (plain TypeScript type)
- **Output:** `VoiceCommandOutput` (plain TypeScript type)
- **How:**
  - Classifies user intent (e.g., next, previous, createRecipe, etc.)
  - Answers general cooking questions
  - Parses dictated recipes
  - Calls other flows as needed (e.g., generateRecipeImage)
  - All flows use robust error handling and return safe defaults

---

## Example Flow: Recipe Suggestion to Full Recipe

1. **User enters mood or pantry items** (UI: `RecipeGenerator.tsx`)
2. **App calls `generateRecipeSuggestions`**
   - Returns a list of creative recipe names
3. **User selects a recipe name**
4. **App calls `generateRecipe`** with the selected name
   - Returns full recipe details (ingredients, nutrition, overview)
5. **UI displays the full recipe**

---

## Where Flows Are Called

- **UI Components** (e.g., `RecipeGenerator.tsx`, `VoiceInteraction.tsx`) call the flows in response to user actions.
- **Flows** call `callLLM` in `openrouter.ts` to interact with the LLM.
- **Some flows** (like `generate-recipe.ts`) call other flows (like `generate-recipe-image.ts`) for additional features.

---

## Best Practices & Maintainer Notes

- All flows must use only the OpenRouter LLM abstraction (`callLLM` in `openrouter.ts`).
- Use strict TypeScript types for all inputs/outputs.
- Always handle errors gracefully and return safe, user-friendly defaults.
- Avoid any model-specific or legacy code (e.g., Genkit, Gemini, zod).
- Keep prompts explicit about required output format (e.g., JSON, array).
- Log errors for maintainability, but never expose raw errors to users.
- When extending, follow the suggest-then-generate pattern for new flows.

---

## What Is Working

- All AI flows use OpenRouter LLM (no Genkit/Gemini).
- Recipe suggestion and selection flow is correct.
- Voice and image-based flows are modular and can be extended.
- The app is model-agnostic, robust, and easy to maintain.
