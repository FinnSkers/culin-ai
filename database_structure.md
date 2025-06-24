# 

## Table: `profiles`
| Column         | Type                  | Nullable | Default                   |
|---------------|-----------------------|----------|---------------------------|
| id            | uuid                  | NO       |                           |
| created_at    | timestamp with time zone | NO    | timezone('utc'::text, now()) |
| dietary_needs | jsonb                 | NO       | '{}'::jsonb               |
| preferences   | text                  | YES      |                           |
| role          | text                  | NO       | 'user'::text              |

## Table: `pantry_items`
| Column     | Type                  | Nullable | Default                   |
|------------|-----------------------|----------|---------------------------|
| id         | uuid                  | NO       | gen_random_uuid()         |
| user_id    | uuid                  | NO       | auth.uid()                |
| name       | text                  | NO       |                           |
| created_at | timestamp with time zone | NO    | timezone('utc'::text, now()) |

## Table: `invite_codes`
| Column   | Type                  | Nullable | Default |
|----------|-----------------------|----------|---------|
| id       | bigint                | NO       |         |
| code     | text                  | NO       |         |
| created_at| timestamp with time zone | NO   | now()   |
| is_used  | boolean               | NO       | false   |
| used_by  | uuid                  | YES      |         |
| used_at  | timestamp with time zone | YES  |         |

## Table: `saved_recipes`
| Column      | Type                  | Nullable | Default                   |
|-------------|-----------------------|----------|---------------------------|
| id          | uuid                  | NO       | gen_random_uuid()         |
| user_id     | uuid                  | NO       | auth.uid()                |
| created_at  | timestamp with time zone | NO    | timezone('utc'::text, now()) |
| recipe_name | text                  | NO       |                           |
| ingredients | text                  | NO       |                           |
| instructions| text                  | NO       |                           |
| nutrition   | jsonb                 | YES      |                           |
| image_url   | text                  | YES      |                           |

## Table: `shopping_list_items`
| Column     | Type                  | Nullable | Default                   |
|------------|-----------------------|----------|---------------------------|
| id         | uuid                  | NO       | gen_random_uuid()         |
| user_id    | uuid                  | NO       | auth.uid()                |
| item_name  | text                  | NO       |                           |
| is_checked | boolean               | NO       | false                     |
| created_at | timestamp with time zone | NO    | timezone('utc'::text, now()) |

## Table: `recipe_ratings`
| Column     | Type                  | Nullable | Default                   |
|------------|-----------------------|----------|---------------------------|
| id         | uuid                  | NO       | gen_random_uuid()         |
| user_id    | uuid                  | NO       | auth.uid()                |
| recipe_id  | uuid                  | NO       |                           |
| rating     | smallint              | NO       |                           |
| notes      | text                  | YES      |                           |
| photo_url  | text                  | YES      |                           |
| created_at | timestamp with time zone | NO    | timezone('utc'::text, now()) |

## Table: `conversations`
| Column     | Type                  | Nullable | Default                   |
|------------|-----------------------|----------|---------------------------|
| id         | uuid                  | NO       | gen_random_uuid()         |
| user_id    | uuid                  | NO       | auth.uid()                |
| created_at | timestamp with time zone | NO    | timezone('utc'::text, now()) |

## Table: `messages`
| Column         | Type                  | Nullable | Default                   |
|----------------|----------------------|----------|---------------------------|
| id             | uuid                  | NO       | gen_random_uuid()         |
| conversation_id| uuid                  | NO       |                           |
| speaker        | text                  | NO       |                           |
| text_content   | text                  | NO       |                           |
| created_at     | timestamp with time zone | NO    | timezone('utc'::text, now()) |

## Table: `community_recipes`
| Column       | Type        | Nullable | Default           |
|--------------|-------------|----------|-------------------|
| id           | uuid        | NO       | gen_random_uuid() |
| user_id      | uuid        | YES      |                   |
| title        | text        | NO       |                   |
| description  | text        | YES      |                   |
| cuisine      | text        | YES      |                   |
| servings     | int         | YES      |                   |
| prep_time    | int         | YES      |                   |
| cook_time    | int         | YES      |                   |
| total_time   | int         | YES      |                   |
| difficulty   | text        | YES      |                   |
| ingredients  | jsonb       | NO       |                   |
| instructions | jsonb       | NO       |                   |
| created_at   | timestamptz | YES      | now()             |
| updated_at   | timestamptz | YES      | now()             |
| source       | text        | YES      |                   |  <-- add this
| mood         | text        | YES      |                   |  <-- add this

## Table: `community_recipe_likes`
| Column     | Type      | Nullable | Default           |
|------------|-----------|----------|-------------------|
| id         | serial    | NO       |                   |
| recipe_id  | uuid      | YES      |                   |
| user_id    | uuid      | YES      |                   |
| created_at | timestamptz| YES     | now()             |

## Table: `community_recipe_comments`
| Column     | Type      | Nullable | Default           |
|------------|-----------|----------|-------------------|
| id         | serial    | NO       |                   |
| recipe_id  | uuid      | YES      |                   |
| user_id    | uuid      | YES      |                   |
| comment    | text      | NO       |                   |
| created_at | timestamptz| YES     | now()             |

---



## Table: `categories`
| Column | Type | Nullable | Default           |
|--------|------|----------|-------------------|
| id     | uuid | NO       | gen_random_uuid() |
| name   | text | NO       |                   |

## Table: `recipe_categories`
| Column      | Type | Nullable | Default |
|-------------|------|----------|---------|
| recipe_id   | uuid | NO       |         |
| category_id | uuid | NO       |         |

## Table: `recipe_comments`
| Column     | Type                  | Nullable | Default           |
|------------|-----------------------|----------|-------------------|
| id         | uuid                  | NO       | gen_random_uuid() |
| recipe_id  | uuid                  | YES      |                   |
| user_id    | uuid                  | YES      |                   |
| comment    | text                  | NO       |                   |
| created_at | timestamp with time zone | YES   | now()             |

## Table: `recipe_favorites`
| Column     | Type                  | Nullable | Default           |
|------------|-----------------------|----------|-------------------|
| id         | uuid                  | NO       | gen_random_uuid() |
| recipe_id  | uuid                  | YES      |                   |
| user_id    | uuid                  | YES      |                   |
| created_at | timestamp with time zone | YES   | now()             |

## Table: `recipe_ingredients`
| Column   | Type   | Nullable | Default           |
|----------|--------|----------|-------------------|
| id       | uuid   | NO       | gen_random_uuid() |
| recipe_id| uuid   | YES      |                   |
| name     | text   | NO       |                   |
| amount   | text   | YES      |                   |
| unit     | text   | YES      |                   |
| order    | integer| YES      |                   |

## Table: `recipe_instructions`
| Column      | Type   | Nullable | Default           |
|-------------|--------|----------|-------------------|
| id          | uuid   | NO       | gen_random_uuid() |
| recipe_id   | uuid   | YES      |                   |
| step_number | integer| YES      |                   |
| text        | text   | YES      |                   |
| image_url   | text   | YES      |                   |

## Table: `recipe_media`
| Column      | Type   | Nullable | Default           |
|-------------|--------|----------|-------------------|
| id          | uuid   | NO       | gen_random_uuid() |
| recipe_id   | uuid   | YES      |                   |
| step_number | integer| YES      |                   |
| media_type  | text   | YES      |                   |
| url         | text   | NO       |                   |

## Table: `recipe_ratings`
| Column     | Type                  | Nullable | Default           |
|------------|-----------------------|----------|-------------------|
| id         | uuid                  | NO       | gen_random_uuid() |
| recipe_id  | uuid                  | YES      |                   |
| user_id    | uuid                  | YES      |                   |
| rating     | integer               | YES      |                   |
| comment    | text                  | YES      |                   |
| created_at | timestamp with time zone | YES   | now()             |

## Table: `recipe_shares`
| Column          | Type                  | Nullable | Default           |
|-----------------|-----------------------|----------|-------------------|
| id              | uuid                  | NO       | gen_random_uuid() |
| recipe_id       | uuid                  | YES      |                   |
| shared_with_user| uuid                  | YES      |                   |
| shared_at       | timestamp with time zone | YES   | now()             |

## Table: `recipe_tags`
| Column    | Type   | Nullable | Default           |
|-----------|--------|----------|-------------------|
| id        | uuid   | NO       | gen_random_uuid() |
| recipe_id | uuid   | YES      |                   |
| tag       | text   | NO       |                   |

## Table: `recipe_versions`
| Column        | Type                  | Nullable | Default           |
|---------------|-----------------------|----------|-------------------|
| id            | uuid                  | NO       | gen_random_uuid() |
| recipe_id     | uuid                  | YES      |                   |
| version_number| integer               | NO       |                   |
| data          | jsonb                 | NO       |                   |
| created_at    | timestamp with time zone | YES   | now()             |

## Table: `recipes`
| Column           | Type                  | Nullable | Default           |
|------------------|-----------------------|----------|-------------------|
| id               | uuid                  | NO       | gen_random_uuid() |
| user_id          | uuid                  | YES      |                   |
| title            | text                  | NO       |                   |
| description      | text                  | YES      |                   |
| image_url        | text                  | YES      |                   |
| cuisine          | text                  | YES      |                   |
| prep_time        | integer               | YES      |                   |
| cook_time        | integer               | YES      |                   |
| total_time       | integer               | YES      |                   |
| servings         | integer               | YES      |                   |
| difficulty       | text                  | YES      |                   |
| source_url       | text                  | YES      |                   |
| video_url        | text                  | YES      |                   |
| nutrition        | jsonb                 | YES      |                   |
| nutrition_source | text                  | YES      |                   |
| is_custom        | boolean               | YES      | false             |
| created_at       | timestamp with time zone | YES   | now()             |
| updated_at       | timestamp with time zone | YES   | now()             |
| search_vector    | tsvector              | YES      |                   |
