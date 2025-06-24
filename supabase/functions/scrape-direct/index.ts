import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// This function directly scrapes a search engine results page.
// NOTE: This is unreliable and against the ToS of most search engines.
async function searchAndScrape(query: string): Promise<any> {
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query + ' recipe')}`;
  console.log(`Directly scraping search results from: ${searchUrl}`);

  // In a real implementation, you would need a headless browser (e.g., Puppeteer)
  // to properly handle this, as simple fetches are often blocked.
  // This is a simplified example.
  
  // Placeholder for scraped data
  return {
    title: 'Example Direct Scrape Recipe',
    description: 'A recipe scraped directly from search results.',
    source_url: searchUrl, // Using search URL as a placeholder
    // ... other fields
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    if (!query) {
      throw new Error('Query is required');
    }

    const supabaseClient = createClient(
      Deno.env.get('EXT_PUBLIC_SUPABASE_URL')!,
      Deno.env.get('EXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 1. Scrape the search results page directly
    const scrapedData = await searchAndScrape(query);

    // 2. Check if the recipe already exists (using source_url as a key)
    const { data: existingRecipe } = await supabaseClient
      .from('recipes')
      .select('id')
      .eq('source_url', scrapedData.source_url)
      .single();

    if (existingRecipe) {
      return new Response(JSON.stringify({ message: 'Recipe already exists.', recipe_id: existingRecipe.id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // 3. Insert the new recipe into the database
    const { data: newRecipe, error: insertError } = await supabaseClient
      .from('recipes')
      .insert(scrapedData)
      .select('id')
      .single();

    if (insertError) {
      throw insertError;
    }

    return new Response(JSON.stringify({ message: 'Recipe scraped and saved.', recipe_id: newRecipe.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
