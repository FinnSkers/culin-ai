// @ts-ignore: Deno global for Edge Functions
declare const Deno: any;
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as cheerio from 'https://esm.sh/cheerio';
import { corsHeaders } from '../_shared/cors.ts';

// --- 1. Search the Web using DuckDuckGo ---
async function searchWebForRecipe(query: string): Promise<string | null> {
  console.log(`Searching DuckDuckGo for: "${query}"`);
  try {
    // We use the HTML version of DuckDuckGo as it's simpler and less likely to be blocked.
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query + ' recipe')}`;
    const response = await fetch(searchUrl, {
      headers: {
        // Mimic a browser user agent to reduce chances of being blocked
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`DuckDuckGo search failed with status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Find the first search result link
    const firstResult = $('.result__a').first().attr('href');

    if (firstResult) {
      console.log(`Found recipe URL: ${firstResult}`);
      return firstResult;
    }

    console.log('No results found on DuckDuckGo.');
    return null;
  } catch (error) {
    console.error('Error searching DuckDuckGo:', error);
    // Don't throw, just return null so the main function can handle it gracefully
    return null;
  }
}

// --- 2. Scrape the Recipe from a URL ---
async function scrapeRecipe(url: string) {
  console.log(`Scraping recipe from: ${url}`);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch recipe page. Status: ${response.status}`);
    }
    const html = await response.text();
    const $ = cheerio.load(html);

    // --- Robust title extraction ---
    let title = '';
    let titleSource = '';
    if ($('#article-heading_1-0').text().trim()) {
      title = $('#article-heading_1-0').text().trim();
      titleSource = '#article-heading_1-0';
    } else if ($('h1').first().text().trim()) {
      title = $('h1').first().text().trim();
      titleSource = 'h1';
    } else if ($("meta[property='og:title']").attr('content')) {
      title = $("meta[property='og:title']").attr('content')!.trim();
      titleSource = 'og:title';
    } else if ($("meta[name='title']").attr('content')) {
      title = $("meta[name='title']").attr('content')!.trim();
      titleSource = 'meta[name=title]';
    } else if ($("[itemprop='name']").attr('content')) {
      title = $("[itemprop='name']").attr('content')!.trim();
      titleSource = 'itemprop=name';
    } else if ($('title').text().trim()) {
      title = $('title').text().trim();
      titleSource = 'title tag';
    }
    if (title) {
      console.log(`Extracted title from ${titleSource}: ${title}`);
    } else {
      console.warn('Could not extract title from any known selector.');
    }

    // --- Robust description extraction ---
    let description = '';
    let descSource = '';
    if ($('.about-article-header-dek p').text().trim()) {
      description = $('.about-article-header-dek p').text().trim();
      descSource = '.about-article-header-dek p';
    } else if ($("meta[name='description']").attr('content')) {
      description = $("meta[name='description']").attr('content')!.trim();
      descSource = 'meta[name=description]';
    } else if ($("meta[property='og:description']").attr('content')) {
      description = $("meta[property='og:description']").attr('content')!.trim();
      descSource = 'og:description';
    } else if ($("[itemprop='description']").attr('content')) {
      description = $("[itemprop='description']").attr('content')!.trim();
      descSource = 'itemprop=description';
    } else if ($('p').first().text().trim().length > 30) {
      description = $('p').first().text().trim();
      descSource = 'first <p>'; 
    }
    if (description) {
      console.log(`Extracted description from ${descSource}: ${description.substring(0, 80)}...`);
    } else {
      console.warn('Could not extract description from any known selector.');
    }

    // --- Additional fields extraction ---
    let image_url = null;
    if ($("meta[property='og:image']").attr('content')) {
      image_url = $("meta[property='og:image']").attr('content');
    } else if ($("img").first().attr('src')) {
      image_url = $("img").first().attr('src');
    }
    if (image_url) console.log('Extracted image_url:', image_url);

    let cuisine = null;
    if ($("[itemprop='recipeCuisine']").attr('content')) cuisine = $("[itemprop='recipeCuisine']").attr('content');
    else if ($("meta[property='recipeCuisine']").attr('content')) cuisine = $("meta[property='recipeCuisine']").attr('content');
    if (cuisine) console.log('Extracted cuisine:', cuisine);

    function parseTime(val: string | undefined): number | null {
      if (!val) return null;
      // Try to parse ISO 8601 durations (e.g., PT30M, PT1H20M)
      const match = val.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
      if (match) {
        const hours = match[1] ? parseInt(match[1]) : 0;
        const mins = match[2] ? parseInt(match[2]) : 0;
        return hours * 60 + mins;
      }
      // Try to parse as integer minutes
      const mins = parseInt(val);
      return isNaN(mins) ? null : mins;
    }

    let prep_time = parseTime($("[itemprop='prepTime']").attr('content'));
    if (!prep_time) prep_time = parseTime($("meta[itemprop='prepTime']").attr('content'));
    if (!prep_time) prep_time = parseTime($("meta[name='prepTime']").attr('content'));
    if (prep_time) console.log('Extracted prep_time:', prep_time);

    let cook_time = parseTime($("[itemprop='cookTime']").attr('content'));
    if (!cook_time) cook_time = parseTime($("meta[itemprop='cookTime']").attr('content'));
    if (!cook_time) cook_time = parseTime($("meta[name='cookTime']").attr('content'));
    if (cook_time) console.log('Extracted cook_time:', cook_time);

    let total_time = parseTime($("[itemprop='totalTime']").attr('content'));
    if (!total_time) total_time = parseTime($("meta[itemprop='totalTime']").attr('content'));
    if (!total_time) total_time = parseTime($("meta[name='totalTime']").attr('content'));
    if (total_time) console.log('Extracted total_time:', total_time);

    let servings = null;
    if ($("[itemprop='recipeYield']").attr('content')) {
      const val = $("[itemprop='recipeYield']").attr('content');
      if (val) {
        const num = parseInt(val);
        servings = isNaN(num) ? null : num;
      }
    }
    if (!servings && $("meta[itemprop='recipeYield']").attr('content')) {
      const val = $("meta[itemprop='recipeYield']").attr('content');
      if (val) {
        const num = parseInt(val);
        servings = isNaN(num) ? null : num;
      }
    }
    if (servings) console.log('Extracted servings:', servings);

    let difficulty = null;
    if ($("[itemprop='difficulty']").attr('content')) difficulty = $("[itemprop='difficulty']").attr('content');
    else if ($("meta[itemprop='difficulty']").attr('content')) difficulty = $("meta[itemprop='difficulty']").attr('content');
    if (difficulty) console.log('Extracted difficulty:', difficulty);

    let video_url = null;
    if ($("meta[property='og:video']").attr('content')) video_url = $("meta[property='og:video']").attr('content');
    else if ($("video").first().attr('src')) video_url = $("video").first().attr('src');
    if (video_url) console.log('Extracted video_url:', video_url);

    let nutrition = null;
    let nutrition_source = null;
    // Try to extract nutrition as JSON-LD
    const jsonLd = $("script[type='application/ld+json']").html();
    if (jsonLd) {
      try {
        const data = JSON.parse(jsonLd);
        if (data && data.nutrition) {
          nutrition = data.nutrition;
          nutrition_source = 'json-ld';
        }
      } catch {}
    }
    // Fallback: try meta tags
    if (!nutrition) {
      const calories = $("meta[itemprop='calories']").attr('content');
      if (calories) nutrition = { calories };
      if (nutrition) nutrition_source = 'meta';
    }
    if (nutrition) console.log('Extracted nutrition:', nutrition);

    // Try multiple strategies for ingredients and instructions
    let ingredients = $('.mntl-structured-ingredients__list-item')
      .map((_: any, el: any) => $(el).text().trim().replace(/\s\s+/g, ' '))
      .get();
    if (!ingredients.length) {
      ingredients = $("li.ingredient, .ingredients-item, .recipe-ingredients li, [itemprop='recipeIngredient']")
        .map((_: any, el: any) => $(el).text().trim())
        .get();
    }
    // Remove empty strings
    ingredients = ingredients.filter((i: any) => Boolean(i));

    let instructions = $('.comp-recipe-instructions__list-item')
      .map((_: any, el: any) => $(el).find('p').text().trim())
      .get();
    if (!instructions.length) {
      instructions = $("li.instruction, .instructions-section-item, .recipe-instructions li, [itemprop='recipeInstructions']")
        .map((_: any, el: any) => $(el).text().trim())
        .get();
    }
    // Remove empty strings
    instructions = instructions.filter((i: any) => Boolean(i));
    // Fallback: try to extract instructions from paragraphs if still empty
    if (!instructions.length) {
      instructions = $("p").map((_: any, el: any) => $(el).text().trim()).get().filter((t: any) => t.length > 40 && t.match(/\b(add|mix|cook|bake|stir|serve|heat|combine|pour|chop|slice|boil|simmer|fry|grill|roast|preheat|let|reduce|remove|place|transfer|season|garnish|repeat|finish|enjoy)\b/i));
    }

    // Validate required fields
    if (!title || !ingredients.length || !instructions.length) {
      throw new Error(`Failed to extract required fields. title: '${title}', ingredients: ${ingredients.length}, instructions: ${instructions.length}`);
    }

    const scrapedData = {
      title,
      description,
      source_url: url,
      image_url,
      cuisine,
      prep_time,
      cook_time,
      total_time,
      servings,
      difficulty,
      video_url,
      nutrition,
      nutrition_source,
      ingredients,
      instructions,
    };

    console.log('Successfully scraped data for:', title);
    return scrapedData;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error scraping ${url}:`, error.message);
      throw new Error(`Failed to scrape the recipe from ${url}: ${error.message}`);
    } else {
      console.error(`Unknown error scraping ${url}:`, error);
      throw new Error(`Failed to scrape the recipe from ${url}: Unknown error`);
    }
  }
}

// --- 3. The Main Edge Function ---
serve(async (req: any) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    let query: string;
    try {
      const body = await req.json();
      query = body.query;
    } catch (e: unknown) {
      let msg = 'Invalid JSON body or missing query field.';
      if (e instanceof Error) msg += ' ' + e.message;
      throw new Error(msg);
    }
    if (!query) throw new Error('Query is required');

    // Step 1: Search for a recipe URL
    const recipeUrl = await searchWebForRecipe(query);

    if (!recipeUrl) {
      return new Response(JSON.stringify({ message: 'Could not find a suitable recipe online.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    let supabaseClient;
    try {
      const supabaseUrl = Deno.env.get('EXT_PUBLIC_SUPABASE_URL');
      const supabaseKey = Deno.env.get('EXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY');
      if (!supabaseUrl || !supabaseKey) throw new Error('Supabase environment variables are not set.');
      supabaseClient = createClient(supabaseUrl, supabaseKey);
    } catch (e: unknown) {
      let msg = 'Failed to initialize Supabase client.';
      if (e instanceof Error) msg += ' ' + e.message;
      console.error('Supabase client init error:', msg);
      throw new Error(msg);
    }

    // Step 2: Check if the recipe (by source_url) already exists
    let existingRecipe;
    try {
      const { data } = await supabaseClient
        .from('recipes')
        .select('id')
        .eq('source_url', recipeUrl)
        .single();
      existingRecipe = data;
    } catch (e: unknown) {
      if (e instanceof Error) {
        if (!e.message?.includes('No rows')) {
          console.error('DB check error:', e.message);
          throw new Error('Database error while checking for existing recipe.');
        }
      } else {
        console.error('Unknown DB check error:', e);
        throw new Error('Database error while checking for existing recipe.');
      }
    }

    if (existingRecipe) {
      console.log('Recipe already exists in DB. Skipping scrape.');
      return new Response(JSON.stringify({ message: 'Recipe already exists.', recipe_id: existingRecipe.id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Step 3: Scrape the recipe content
    let scraped;
    try {
      scraped = await scrapeRecipe(recipeUrl);
    } catch (e: unknown) {
      let msg = 'Unknown error';
      if (e instanceof Error) msg = e.message;
      return new Response(JSON.stringify({ error: msg }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 422,
      });
    }
    const { title, description, source_url, image_url, cuisine, prep_time, cook_time, total_time, servings, difficulty, video_url, nutrition, nutrition_source, ingredients, instructions } = scraped;

    // Step 4: Insert the new recipe and its relations into the database
    let newRecipeId;
    try {
      const { data, error } = await supabaseClient.rpc('create_recipe_with_details', {
        title,
        description,
        source_url,
        image_url,
        cuisine,
        prep_time,
        cook_time,
        total_time,
        servings,
        difficulty,
        video_url,
        nutrition,
        nutrition_source,
        ingredients_list: ingredients,
        instructions_list: instructions.map((text: string, i: number) => ({ step_number: i + 1, text }))
      });
      if (error) throw error;
      newRecipeId = data;
    } catch (e: unknown) {
      let msg = 'Failed to save recipe to database.';
      if (e instanceof Error) msg += ' ' + e.message;
      console.error('DB insert error:', msg);
      return new Response(JSON.stringify({ error: msg }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    console.log('Recipe saved with ID:', newRecipeId);
    return new Response(JSON.stringify({ message: 'Recipe scraped and saved.', recipe_id: newRecipeId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: unknown) {
    let msg = 'Unknown error';
    if (error instanceof Error) msg = error.message;
    // Log only summary in production, but full error for debugging
    console.error('FULL ERROR:', msg);
    return new Response(
      JSON.stringify({ error: msg }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
