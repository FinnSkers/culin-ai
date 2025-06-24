"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useCulinAI } from "@/hooks/useCulinAI";
import { useToast } from "@/hooks/use-toast";
import { generateRecipeSuggestions } from "@/ai/flows/generate-recipe-suggestions";
import { generateRecipe } from "@/ai/flows/generate-recipe";
import { findOnlineRecipe, type FindOnlineRecipeOutput } from "@/ai/flows/find-online-recipe";
import { getRecipeById } from "@/app/recipes/actions";
import { Sparkles, Loader2, ChefHat, Globe, ArrowLeft, BookOpenCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Stage = 'initial' | 'loading' | 'results' | 'generating';

export function RecipeGenerator() {
  // Context/state hooks
  const { pantryItems, profile, setRecipe, setRecipeOpen } = useCulinAI();
  const { toast } = useToast();

  // UI state
  const [stage, setStage] = useState<Stage>('initial');
  const [ingredients, setIngredients] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [onlineSearchResults, setOnlineSearchResults] = useState<FindOnlineRecipeOutput[]>([]);

  // Helper to build payload for AI flows
  const getCommonPayload = () => {
    if (!profile) {
      toast({ variant: 'destructive', title: 'Hold your horses!', description: "Your profile is still loading. Try again in a sec."});
      return null;
    }
    const dietNeeds = Object.entries(profile.dietaryNeeds)
        .filter(([, value]) => value)
        .map(([key]) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()))
        .join(', ');
    const finalIngredients = ingredients || pantryItems.map(item => item.name).join(', ');
    if (!finalIngredients) {
        toast({ variant: 'destructive', title: 'Yo, I Need Food!', description: "Can't make something out of nothing. Add ingredients to your pantry or type 'em in."});
        return null;
    }
    return {
        ingredients: finalIngredients,
        query: finalIngredients, // Add query for the new flow
        dietaryNeeds: dietNeeds,
        preferences: profile.preferences,
    };
  };

  // Suggest-then-generate: Step 1 - get recipe suggestions
  const handleGetRecipes = async () => {
    const payload = getCommonPayload();
    if (!payload) return;
    setStage('loading');
    try {
        const [aiResult, onlineResult] = await Promise.all([
            generateRecipeSuggestions(payload),
            findOnlineRecipe({ query: payload.ingredients })
        ]);

        setSuggestions(aiResult.suggestions);

        // Ensure onlineResult is always an array, even if it's just one result.
        const resultsArray = Array.isArray(onlineResult) ? onlineResult : [onlineResult];
        const validResults = resultsArray.filter(r => r && r.recipeId && r.title);
        setOnlineSearchResults(validResults);

        setStage('results');
    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Brain Fart!', description: "My tiny chef hat must be on too tight. I'm struggling with ideas. Try again."});
        setStage('initial');
    }
  };

  // Suggest-then-generate: Step 2 - user selects an AI recipe, generate full recipe
  const handleSelectAiRecipe = async (recipeTitle: string) => {
    const payload = getCommonPayload();
    if (!payload) return;
    setStage('generating');
    try {
        const result = await generateRecipe({ ...payload, recipeTitle });
        setRecipe(result);
        setRecipeOpen(true);
        resetState();
    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Kitchen Catastrophe', description: 'The AI chef had a meltdown. Give it another shot.'});
        setStage('initial');
    }
  };

  // New handler for selecting a recipe from the web/database search
  const handleSelectOnlineRecipe = async (recipeId: string) => {
    setStage('generating');
    try {
        const result = await getRecipeById(recipeId);
        if (result) {
            setRecipe(result);
            setRecipeOpen(true);
            resetState();
        } else {
            throw new Error("Recipe not found in the database.");
        }
    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Lost Recipe!', description: 'Could not retrieve the recipe from the Chef\'s Secret database.' });
        setStage('results'); // Go back to results screen
    }
  };


  // Reset UI state
  const resetState = () => {
    setStage('initial');
    setSuggestions([]);
    setOnlineSearchResults([]);
    setIngredients("");
  };

  // UI rendering
  return (
    <Card className="w-full bg-card/80 backdrop-blur-sm hover:shadow-primary/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
      <CardHeader>
         {stage !== 'initial' && (
          <Button variant="ghost" size="sm" className="absolute top-4 left-4 h-8 w-8 p-0" onClick={resetState} disabled={stage === 'loading' || stage === 'generating'}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <CardTitle>
          {stage === 'initial' && "What are we making, little chef?"}
          {stage === 'loading' && "Conjuring up Ideas..."}
          {stage === 'results' && "Here's What I Cooked Up"}
          {stage === 'generating' && "Firing up the Stoves..."}
        </CardTitle>
        <CardDescription>
          {stage === 'initial' && "Toss us your ingredients. We'll whip up something special."}
          {stage === 'results' && "Choose from my custom AI ideas or real recipes from the web."}
          {(stage === 'loading' || stage === 'generating') && "Hold on to your apron, this'll be good."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {stage === 'initial' && (
            <form onSubmit={(e) => { e.preventDefault(); handleGetRecipes(); }}>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Textarea
                    id="ingredients"
                    placeholder="Spill the beans. What ingredients are you working with? (Or leave blank to use your pantry)"
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    className="min-h-[80px]"
                    suppressHydrationWarning={true}
                    disabled={stage === 'loading' || stage === 'generating'}
                  />
                </div>
                <Button type="submit" disabled={stage === 'loading' || stage === 'generating'}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Get Recipes
                </Button>
              </div>
            </form>
        )}

        {(stage === 'loading' || stage === 'generating') && (
            <div className="flex flex-col items-center justify-center gap-4 text-center min-h-[250px] animate-startup-fade-in-up-1">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground">{stage === 'generating' ? "Generating your epic recipe..." : "Consulting my cookbook & the web..."}</p>
            </div>
        )}

        {stage === 'results' && (
             <Tabs defaultValue="ai" className="w-full animate-startup-fade-in-up-1">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="ai"><Sparkles className="mr-2"/> AI Ideas</TabsTrigger>
                    <TabsTrigger value="web"><Globe className="mr-2"/> Web Search</TabsTrigger>
                </TabsList>
                <TabsContent value="ai" className="min-h-[200px] pt-4">
                     <div className="flex flex-col gap-3">
                        {suggestions.length === 0 && (
                          <div className="text-center text-muted-foreground">No AI recipe ideas found. Try different ingredients!</div>
                        )}
                        {suggestions.map((suggestion, index) => (
                            <Button
                                key={index}
                                variant="outline"
                                size="lg"
                                className="w-full justify-start text-left h-auto py-3"
                                onClick={() => handleSelectAiRecipe(suggestion)}
                                disabled={stage === 'generating'}
                            >
                                <ChefHat className="mr-4 h-5 w-5 text-primary"/>
                                <span className="flex-1 whitespace-normal">{suggestion}</span>
                            </Button>
                        ))}
                    </div>
                </TabsContent>
                <TabsContent value="web" className="min-h-[200px] pt-4">
                    <div className="flex flex-col gap-3">
                        {onlineSearchResults.length === 0 && (
                          <div className="text-center text-muted-foreground">No web recipes found. Try different ingredients!</div>
                        )}
                        {onlineSearchResults.map((result, index) => (
                             <Card key={index} className="bg-background/50">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center justify-between">
                                        <span className="flex-1">{result.title}</span>
                                        <Button
                                            size="sm"
                                            onClick={() => handleSelectOnlineRecipe(result.recipeId!)}
                                            disabled={stage === 'generating'}
                                        >
                                            <BookOpenCheck className="mr-2 h-4 w-4" />
                                            View Recipe
                                        </Button>
                                    </CardTitle>
                                    <CardDescription>{result.message}</CardDescription>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        )}

      </CardContent>
    </Card>
  );
}
