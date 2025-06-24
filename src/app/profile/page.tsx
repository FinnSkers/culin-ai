'use client';

import { useCulinAI } from '@/hooks/useCulinAI';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Trash2, LogOut, Utensils, Heart, Shield } from 'lucide-react';
import { signOut } from '@/app/auth/actions';
import { type ProfileSettings } from '@/lib/types';
import { BottomNav } from '@/components/layout/BottomNav';
import { Header } from '@/components/layout/Header';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

function ProfilePageSkeleton() {
  return (
    <div className="relative flex flex-col min-h-screen text-foreground bg-background">
      <Header />
      <main className="flex-1 container py-8 pb-24">
        <div className="max-w-2xl mx-auto space-y-8 animate-pulse">
          <header className="text-center space-y-3">
            <Skeleton className="h-8 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
          </header>

          {/* Profile Settings Card Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Skeleton className="h-5 w-24 mb-4" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                   <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </div>
              <div>
                <Skeleton className="h-5 w-48 mb-3" />
                <Skeleton className="h-20 w-full" />
              </div>
              <Skeleton className="h-9 w-32" />
            </CardContent>
          </Card>

          {/* Pantry Management Card Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex w-full items-center space-x-2">
                <Skeleton className="h-9 flex-grow" />
                <Skeleton className="h-9 w-24" />
              </div>
              <Skeleton className="min-h-[6rem] w-full" />
            </CardContent>
          </Card>

          {/* Danger Zone Skeleton */}
          <Card>
             <CardHeader>
                <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-9 w-full" />
            </CardContent>
          </Card>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}


export default function ProfilePage() {
  const { user, profile: initialProfile, updateProfile, pantryItems, addPantryItem, removePantryItem, loading, setAuthOpen } = useCulinAI();
  const router = useRouter();
  
  const [profile, setProfile] = useState<ProfileSettings | null>(initialProfile);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [newPantryItem, setNewPantryItem] = useState('');
  const [isAddingPantryItem, setIsAddingPantryItem] = useState(false);
  const [isSigningOut, startSignOut] = useTransition();

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to home and open auth dialog if not logged in
      router.push('/');
      setAuthOpen(true);
    }
    if (initialProfile) {
      setProfile(initialProfile);
    }
  }, [user, loading, router, initialProfile, setAuthOpen]);

  if (loading || !user || !profile) {
    return <ProfilePageSkeleton />;
  }

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
      preferences: e.target.value,
    });
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    setIsSavingProfile(true);
    await updateProfile({
      dietaryNeeds: profile.dietaryNeeds,
      preferences: profile.preferences,
    });
    setIsSavingProfile(false);
  };
  
  const handleAddPantryItem = async () => {
    if (!newPantryItem.trim()) return;
    setIsAddingPantryItem(true);
    await addPantryItem(newPantryItem);
    setNewPantryItem('');
    setIsAddingPantryItem(false);
  };

  const handleSignOut = () => {
    startSignOut(async () => {
      await signOut();
      window.location.reload();
    });
  };

  const isAdmin = profile.role === 'admin';

  return (
    <div className="relative flex flex-col min-h-screen text-foreground bg-background">
        <Header />
        <main className="flex-1 container py-8 pb-24">
          <div className="max-w-2xl mx-auto space-y-8">
            <header className="text-center">
              <h1 className="text-3xl font-bold tracking-tighter text-primary sm:text-4xl flex items-center justify-center gap-3">
                Your Profile
                {isAdmin && <Badge variant="secondary" className="text-base bg-accent/20 text-accent border-accent/30"><Shield className="h-4 w-4 mr-2"/>Admin</Badge>}
              </h1>
              <p className="mt-1 text-base text-muted-foreground">{user.email}</p>
            </header>

            {/* Profile Settings Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Heart /> Your Vibe</CardTitle>
                <CardDescription>Tune your culinary radar. This helps me give you better recommendations.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Food Rules</h4>
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
                    <h4 className="font-semibold mb-3">Flavor Profile & Preferences</h4>
                    <Textarea
                      placeholder="e.g., bring the heat, cilantro is the devil, give me all the pasta"
                      value={profile?.preferences ?? ""}
                      onChange={handlePreferencesChange}
                    />
                 </div>
                 <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
                    {isSavingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Profile
                 </Button>
              </CardContent>
            </Card>

            {/* Pantry Management Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Utensils /> Your Stash</CardTitle>
                <CardDescription>Your secret weapon inventory. Keep it stocked.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex w-full items-center space-x-2">
                    <Input
                        type="text"
                        placeholder="Add to your arsenal..."
                        value={newPantryItem}
                        onChange={(e) => setNewPantryItem(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddPantryItem()}
                        disabled={isAddingPantryItem}
                    />
                    <Button type="submit" onClick={handleAddPantryItem} disabled={isAddingPantryItem}>
                        {isAddingPantryItem && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Stock It
                    </Button>
                </div>
                 <div className="min-h-[6rem] p-2 rounded-md border border-dashed">
                    {pantryItems.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {pantryItems.map((item) => (
                                <Badge key={item.id} variant="secondary" className="text-base py-1 pl-3 pr-1">
                                    {item.name}
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6 ml-1"
                                        onClick={() => removePantryItem(item.id)}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground p-4 text-center">Your stash is empty. Go hunt and gather.</p>
                    )}
                 </div>
              </CardContent>
            </Card>
            
            {/* Admin Dashboard */}
            {isAdmin && <AdminDashboard />}

             {/* Danger Zone */}
             <Card className="border-destructive/50">
                <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                    <Button variant="destructive" className="w-full" onClick={handleSignOut} disabled={isSigningOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        {isSigningOut ? 'Signing Out...' : 'Sign Out'}
                    </Button>
                </CardContent>
             </Card>

          </div>
        </main>
        <BottomNav />
    </div>
  );
}
