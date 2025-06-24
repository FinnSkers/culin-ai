import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const supabase = createServerComponentClient({ cookies });
  const searchParams = req.nextUrl?.searchParams;
  const source = searchParams?.get('source');
  const mood = searchParams?.get('mood');

  let query = supabase.from("community_recipes").select("*").order("created_at", { ascending: false });

  if (source === 'AI' && mood) {
    query = query.eq("source", "AI").eq("mood", mood);
  } else {
    // Only show community/user recipes (not AI)
    query = query.or("source.is.null,source.neq.AI");
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ recipes: data });
}
