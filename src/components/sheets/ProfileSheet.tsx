"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { useCulinAI } from "@/hooks/useCulinAI";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { signOut } from "@/app/auth/actions";
import { Loader2, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { type ProfileSettings } from "@/lib/types";

export function ProfileSheet() {
  const { isProfileOpen, setProfileOpen, profile: initialProfile, updateProfile, user, loading } = useCulinAI();
  const [profile, setProfile] = useState<ProfileSettings | null>(initialProfile);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
    }
  }, [initialProfile, isProfileOpen]);

  useEffect(() => {
    if (!user) {
        setProfileOpen(false); // Close sheet if user logs out
    }
  }, [user, setProfileOpen]);
  
  if (loading || !profile || !user) return null;

  const handleDietaryChange = (key: keyof ProfileSettings['dietaryNeeds'], checked: boolean) => {
    if (!profile) return;
    setProfile({
        ...profile,
        dietaryNeeds: {
            ...profile.dietaryNeeds,
            [key]: checked,
        },
    });
  };

  const handlePreferencesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!profile) return;
    setProfile({
        ...profile,
        preferences: e.target.value
    });
  };

  const handleSave = async () => {
      if (!profile) return;
      setIsSaving(true);
      await updateProfile({
          dietaryNeeds: profile.dietaryNeeds,
          preferences: profile.preferences,
      });
      setIsSaving(false);
      setProfileOpen(false);
  }
  
  return (
    <Sheet open={isProfileOpen} onOpenChange={(open) => {
        if (!open && initialProfile) { setProfile(initialProfile) } // Reset changes if closed without saving
        setProfileOpen(open)
    }}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Your Vibe</SheetTitle>
          <SheetDescription>
            Hello, {user?.email}! Tune your culinary radar.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-6 py-4">
          <div>
            <h4 className="text-lg font-semibold mb-2">Food Rules</h4>
            <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                    <Checkbox id="vegan" checked={profile.dietaryNeeds.vegan} onCheckedChange={(c) => handleDietaryChange("vegan", !!c)} />
                    <Label htmlFor="vegan">Vegan</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox id="vegetarian" checked={profile.dietaryNeeds.vegetarian} onCheckedChange={(c) => handleDietaryChange("vegetarian", !!c)} />
                    <Label htmlFor="vegetarian">Vegetarian</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox id="glutenFree" checked={profile.dietaryNeeds.glutenFree} onCheckedChange={(c) => handleDietaryChange("glutenFree", !!c)} />
                    <Label htmlFor="glutenFree">Gluten-Free</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox id="dairyFree" checked={profile.dietaryNeeds.dairyFree} onCheckedChange={(c) => handleDietaryChange("dairyFree", !!c)} />
                    <Label htmlFor="dairyFree">Dairy-Free</Label>
                </div>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-2">Flavor Profile</h4>
            <Textarea 
                placeholder="e.g., bring the heat, cilantro is the devil, give me all the pasta"
                value={profile.preferences}
                onChange={handlePreferencesChange}
            />
          </div>
        </div>
        <SheetFooter className="grid grid-cols-2 gap-2 pt-4">
          <form action={signOut}>
              <Button variant="outline" className="w-full">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
          </form>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lock it In
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
