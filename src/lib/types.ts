export interface ProfileSettings {
  id?: string;
  role?: 'user' | 'admin';
  dietaryNeeds: {
    vegan: boolean;
    vegetarian: boolean;
    glutenFree: boolean;
    dairyFree: boolean;
  };
  preferences: string;
}

export interface PantryItem {
  id: string;
  name: string;
  user_id?: string;
}

export interface Recipe {
  recipeName: string;
  ingredients: string;
  instructions: string;
  nutrition: {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
  };
  photoDataUri?: string;
  sourceUrl?: string; // Added to support scraped recipes
}

export interface AdminUser {
    id: string;
    email: string | null;
    role: 'user' | 'admin';
    created_at: string;
}

export interface AdminInviteCode {
    id: number;
    created_at: string;
    code: string;
    is_used: boolean;
    used_at: string | null;
    used_by: string | null;
}
