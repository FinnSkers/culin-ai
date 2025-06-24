import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const supabase = createServerComponentClient({ cookies });
  const {
    title,
    description,
    ingredients,
    instructions,
    source,
    mood,
    cuisine,
    servings,
    prep_time,
    cook_time,
    total_time,
    difficulty,
  } = await req.json();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user && (!source || source !== "AI"))
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const insertData = {
    user_id: user ? user.id : null,
    title,
    description,
    ingredients,
    instructions,
    source: source || null,
    mood: mood || null,
    cuisine: cuisine || null,
    servings: servings || null,
    prep_time: prep_time || null,
    cook_time: cook_time || null,
    total_time: total_time || null,
    difficulty: difficulty || null,
  };

  const { error } = await supabase.from("community_recipes").insert(insertData);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
