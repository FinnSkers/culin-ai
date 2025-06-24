-- Function: public.create_recipe_with_details
-- Description: Inserts a scraped recipe and its details into the recipes, recipe_ingredients, and recipe_instructions tables.

create or replace function public.create_recipe_with_details(
  title text,
  description text,
  source_url text,
  image_url text default null,
  cuisine text default null,
  prep_time int default null,
  cook_time int default null,
  total_time int default null,
  servings int default null,
  difficulty text default null,
  video_url text default null,
  nutrition jsonb default null,
  nutrition_source text default null,
  ingredients_list jsonb default null,
  instructions_list jsonb default null
)
returns uuid
language plpgsql
as $$
declare
  new_recipe_id uuid;
  ing_obj jsonb;
  idx integer := 0;
begin
  insert into public.recipes (
    title, description, source_url, image_url, cuisine, prep_time, cook_time, total_time, servings, difficulty, video_url, nutrition, nutrition_source, created_at, updated_at, is_custom
  )
    values (
      title, description, source_url, image_url, cuisine, prep_time, cook_time, total_time, servings, difficulty, video_url, nutrition, nutrition_source, now(), now(), false
    )
    returning id into new_recipe_id;

  -- Insert ingredients
  for ing_obj in select * from jsonb_array_elements(ingredients_list) loop
    insert into public.recipe_ingredients (
      recipe_id, name, amount, unit, "order"
    ) values (
      new_recipe_id,
      ing_obj->>'name',
      ing_obj->>'quantity',
      ing_obj->>'unit',
      idx
    );
    idx := idx + 1;
  end loop;

  -- Insert instructions
  insert into public.recipe_instructions (recipe_id, step_number, text)
    select
      new_recipe_id,
      (step->>'step_number')::int,
      step->>'text'
    from jsonb_array_elements(instructions_list) as step;

  return new_recipe_id;
end;
$$;
