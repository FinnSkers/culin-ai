"use client";

import { type PantryItem, type ProfileSettings, type Recipe } from "@/lib/types";
import React, { createContext, useState, ReactNode, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const GUEST_PROFILE: ProfileSettings = {
  role: 'user',
  dietaryNeeds: { vegan: false, vegetarian: false, glutenFree: false, dairyFree: false },
  preferences: '',
};

interface CulinAIContextType {
  /** The user's profile (null if loading or guest) */
  profile: ProfileSettings | null;
  /** Update the user's profile settings */
  updateProfile: (newProfile: Partial<ProfileSettings>) => Promise<void>;
  /** The user's pantry items */
  pantryItems: PantryItem[];
  /** Add a pantry item */
  addPantryItem: (name: string) => Promise<void>;
  /** Remove a pantry item by id */
  removePantryItem: (id: string) => Promise<void>;
  /** The currently open recipe (null if none) */
  recipe: Recipe | null;
  /** Set the current recipe (and reset step/cooking mode) */
  setRecipe: (recipe: Recipe | null) => void;
  /** The current step in the recipe */
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  /** The authenticated user (null if guest) */
  user: User | null;
  /** Loading state for initial data */
  loading: boolean;
  /** Error state for async actions (null if no error) */
  error: string | null;
  /** The user's shopping list */
  shoppingList: string[];
  setShoppingList: React.Dispatch<React.SetStateAction<string[]>>;
  /** Whether the app is in cooking mode */
  isCookingMode: boolean;
  setIsCookingMode: React.Dispatch<React.SetStateAction<boolean>>;

  // UI State
  isPantryOpen: boolean;
  setPantryOpen: (open: boolean) => void;
  isChatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  isRecipeOpen: boolean;
  setRecipeOpen: (open: boolean) => void;
  isAuthOpen: boolean;
  setAuthOpen: (open: boolean) => void;
  isCameraOpen: boolean;
  setCameraOpen: (open: boolean) => void;
  cameraMode: 'ingredients' | 'safety';
  setCameraMode: React.Dispatch<React.SetStateAction<'ingredients' | 'safety'>>;
}

export const CulinAIContext = createContext<CulinAIContextType | null>(null);

export const CulinAIProvider = ({ children }: { children: ReactNode }) => {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<ProfileSettings | null>(null);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [shoppingList, setShoppingList] = useState<string[]>([]);
  
  const [recipe, setRecipeInternal] = useState<Recipe | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCookingMode, setIsCookingMode] = useState(false);

  const [isPantryOpen, setPantryOpen] = useState(false);
  const [isChatOpen, setChatOpen] = useState(false);
  const [isRecipeOpen, setRecipeOpen] = useState(false);
  const [isAuthOpen, setAuthOpen] = useState(false);
  const [isCameraOpen, setCameraOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState<'ingredients' | 'safety'>('ingredients');

  const fetchInitialData = useCallback(async (user: User) => {
    setLoading(true);
    setError(null);
    try {
      // Fetch profile
      let { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, role, dietary_needs, preferences')
        .eq('id', user.id)
        .single();
      
      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({ id: user.id, dietary_needs: GUEST_PROFILE.dietaryNeeds, preferences: GUEST_PROFILE.preferences, role: 'user' })
          .select('id, role, dietary_needs, preferences')
          .single();
        if (insertError) throw insertError;
        profileData = newProfile;
      } else if (profileError) {
        throw profileError;
      }

      if (!profileData) {
        setError('Failed to load profile data.');
        setProfile(null);
      } else {
        setProfile({
          id: user.id,
          role: profileData.role,
          dietaryNeeds: profileData.dietary_needs,
          preferences: profileData.preferences,
        });
      }

      // Fetch pantry items
      const { data: pantryData, error: pantryError } = await supabase
        .from('pantry_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      if (pantryError) throw pantryError;
      setPantryItems(pantryData as PantryItem[]);

    } catch (error) {
      console.error("Error fetching initial data:", error);
      setError('Failed to load user data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          fetchInitialData(currentUser);
          setAuthOpen(false); // Close auth dialog on successful login
        } else {
          setLoading(false);
          setProfile(GUEST_PROFILE);
          setPantryItems([]);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [supabase, fetchInitialData, setAuthOpen]);

  const updateProfile = async (newProfile: Partial<ProfileSettings>) => {
    if (!user || !profile) return;
    setError(null);
    const updatedProfile = { ...profile, ...newProfile, id: user.id };
    
    const { error } = await supabase
      .from('profiles')
      .update({ dietary_needs: updatedProfile.dietaryNeeds, preferences: updatedProfile.preferences })
      .eq('id', user.id);
    
    if (error) {
      console.error("Error updating profile:", error);
      setError('Failed to update profile.');
    } else {
       setProfile(updatedProfile);
    }
  };

  const addPantryItem = async (name: string) => {
    if (!name.trim()) return;
    setError(null);

    if (!user) {
      // Guest user, add to local state only
      const newItem: PantryItem = { id: new Date().toISOString(), name: name.trim() };
      setPantryItems((prev) => [...prev, newItem]);
      return;
    }
    
    const { data, error } = await supabase
      .from('pantry_items')
      .insert({ user_id: user.id, name: name.trim() })
      .select()
      .single();

    if (error) {
      console.error("Error adding pantry item:", error);
      setError('Failed to add pantry item.');
    } else if (data) {
      setPantryItems((prev) => [...prev, data as PantryItem]);
    }
  };

  const removePantryItem = async (id: string) => {
    if (!user) {
      setPantryItems((prev) => prev.filter((item) => item.id !== id));
      return;
    }
    setError(null);

    const originalItems = pantryItems;
    setPantryItems((prev) => prev.filter((item) => item.id !== id)); // Optimistic update

    const { error } = await supabase
      .from('pantry_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error removing pantry item:", error);
      setError('Failed to remove pantry item.');
      setPantryItems(originalItems); // Revert on error
    }
  };
  
  const setRecipe = (recipe: Recipe | null) => {
    setRecipeInternal(recipe);
    setCurrentStep(0);
    setIsCookingMode(false);
  }

  const value = {
    user,
    loading,
    error,
    profile,
    updateProfile,
    pantryItems,
    addPantryItem,
    removePantryItem,
    recipe,
    setRecipe,
    currentStep,
    setCurrentStep,
    shoppingList,
    setShoppingList,
    isCookingMode,
    setIsCookingMode,
    isPantryOpen,
    setPantryOpen,
    isChatOpen,
    setChatOpen,
    isRecipeOpen,
    setRecipeOpen,
    isAuthOpen,
    setAuthOpen,
    isCameraOpen,
    setCameraOpen,
    cameraMode,
    setCameraMode,
  };

  return (
    <CulinAIContext.Provider value={value}>
      {children}
    </CulinAIContext.Provider>
  );
};

export type { CulinAIContextType };
