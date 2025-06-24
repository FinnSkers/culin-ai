"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useCulinAI } from '@/hooks/useCulinAI';
import { Loader2, Utensils, Lightbulb, Zap, HeartPulse, PartyPopper, Heart, Flame, Coffee, Dumbbell, Smile, Gem, DollarSign, Brain, Moon, Sun, Leaf, Pizza, CookingPot, Cake, ArrowLeft, Sparkles, ChefHat, Globe, CloudRain, HeartCrack, Clapperboard, BookOpen, Feather, ChevronLeft, ChevronRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { suggestMoodRecipes } from '@/ai/flows/suggest-recipe-for-mood';
import { searchWebForMoodRecipes, type SearchWebForMoodRecipesOutput } from '@/ai/flows/search-web-for-mood-recipes';
import { generateRecipeFromMood } from '@/ai/flows/generate-recipe-from-mood';

type Stage = 'initial' | 'loading' | 'results' | 'generating';
type WebSearchResult = SearchWebForMoodRecipesOutput['results'][0];

const moods = [
  { name: 'Comforting', icon: HeartPulse },
  { name: 'Adventurous', icon: Lightbulb },
  { name: 'Quick & Easy', icon: Zap },
  { name: 'Healthy', icon: Leaf },
  { name: 'Celebratory', icon: PartyPopper },
  { name: 'Romantic', icon: Heart },
  { name: 'Spicy', icon: Flame },
  { name: 'Lazy Sunday', icon: Coffee },
  { name: 'Workout Fuel', icon: Dumbbell },
  { name: 'Kid-Friendly', icon: Smile },
  { name: 'Fancy Dinner', icon: Gem },
  { name: 'Budget', icon: DollarSign },
  { name: 'Hangover Cure', icon: Pizza },
  { name: 'Impress a Date', icon: Brain },
  { name: 'Potluck Dish', icon: Utensils },
  { name: 'Grilling Time', icon: CookingPot },
  { name: 'Baking Day', icon: Cake },
  { name: 'Late Night', icon: Moon },
  { name: 'Breakfast', icon: Sun },
  { name: 'Gloomy Day', icon: CloudRain },
  { name: 'Post-Breakup', icon: HeartCrack },
  { name: 'Movie Night', icon: Clapperboard },
  { name: 'Study Session', icon: BookOpen },
  { name: 'Light & Fresh', icon: Feather },
];

export function MoodRecipeGenerator() {
  const { toast } = useToast();
  const { profile, setRecipe, setRecipeOpen } = useCulinAI();
  
  const [stage, setStage] = useState<Stage>('initial');
  const [customMood, setCustomMood] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [webResults, setWebResults] = useState<WebSearchResult[]>([]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);


  const checkScrollability = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft) < scrollWidth - clientWidth);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
        // Timeout to ensure layout is final
        setTimeout(() => {
            checkScrollability();
        }, 100);

        container.addEventListener('scroll', checkScrollability);
        window.addEventListener('resize', checkScrollability);

        return () => {
            container.removeEventListener('scroll', checkScrollability);
            window.removeEventListener('resize', checkScrollability);
        };
    }
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = container.clientWidth * 0.8;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const getCommonPayload = (mood: string) => {
    if (!profile) {
      toast({ variant: 'destructive', title: 'Hold your horses!', description: "Your profile is still loading. Try again in a sec."});
      return null;
    }
    const dietNeeds = Object.entries(profile.dietaryNeeds)
        .filter(([, value]) => value)
        .map(([key]) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()))
        .join(', ');
    
    return {
        mood,
        dietaryNeeds: dietNeeds,
        preferences: profile.preferences,
    }
  }

  const handleMoodSelect = async (mood: string) => {
    if (!mood.trim()) {
        toast({ variant: 'destructive', title: 'Empty Mood!', description: "Please tell me what the vibe is." });
        return;
    }
    const payload = getCommonPayload(mood);
    if (!payload) return;
    
    setSelectedMood(mood);
    setStage('loading');
    
    try {
      const [aiResult, webResult] = await Promise.all([
        suggestMoodRecipes(payload),
        searchWebForMoodRecipes(payload)
      ]);
      
      setAiSuggestions(aiResult.suggestions);
      setWebResults(webResult.results);
      setStage('results');
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Creative Block!', description: "Couldn't come up with a moody meal. Please try again." });
      resetState();
    }
  };
  
  const handleSelectRecipe = async (recipeTitle: string) => {
     const payload = getCommonPayload(selectedMood);
    if (!payload) return;

    setStage('generating');
    try {
        const result = await generateRecipeFromMood({ ...payload, recipeTitle });
        setRecipe(result);
        setRecipeOpen(true);
        resetState();
    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Kitchen Catastrophe', description: 'The AI chef had a meltdown. Give it another shot.'});
        setStage('results'); // Go back to results instead of initial
    }
  }

  const handleCustomMoodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleMoodSelect(customMood);
  }

  const resetState = () => {
    setStage('initial');
    setCustomMood('');
    setSelectedMood('');
    setAiSuggestions([]);
    setWebResults([]);
  }

  const isLoading = stage === 'loading' || stage === 'generating';

  return (
    <Card className="w-full bg-card/80 backdrop-blur-sm hover:shadow-primary/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
      <CardHeader>
        {stage !== 'initial' && (
          <Button variant="ghost" size="sm" className="absolute top-4 left-4 h-8 w-8 p-0" onClick={resetState}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <CardTitle>
          {stage === 'initial' && "What's the vibe today?"}
          {stage === 'loading' && "Reading the Room..."}
          {stage === 'results' && `Ideas for "${selectedMood}"`}
          {stage === 'generating' && "Summoning a Masterpiece..."}
        </CardTitle>
        <CardDescription>
          {stage === 'initial' && "Pick a mood or tell me the occasion. I'll suggest a dish."}
          {stage === 'results' && "My ideas or the web's? Your choice."}
          {(stage === 'loading' || stage === 'generating') && "This is where the magic happens. Don't blink."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {stage === 'initial' && (
          <div className="space-y-4">
            <div className="relative">
              <div
                ref={scrollContainerRef}
                className="flex items-center space-x-3 overflow-x-auto pb-2 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                {moods.map((mood) => (
                  <Button
                    key={mood.name}
                    variant="outline"
                    className="flex-col h-20 w-20 flex-shrink-0 items-center justify-center p-1"
                    disabled={isLoading}
                    onClick={() => handleMoodSelect(mood.name)}
                  >
                    <mood.icon className="h-6 w-6 mb-1" />
                    <span className="text-xs text-center whitespace-normal leading-tight">
                      {mood.name}
                    </span>
                  </Button>
                ))}
              </div>
              {canScrollLeft && (
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-lg hover:bg-accent z-10"
                  onClick={() => handleScroll('left')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              {canScrollRight && (
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-lg hover:bg-accent z-10"
                  onClick={() => handleScroll('right')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <form onSubmit={handleCustomMoodSubmit} className="flex w-full items-center space-x-2">
                <Input 
                    placeholder="Or type an occasion, e.g., 'Rainy Day'"
                    value={customMood}
                    onChange={(e) => setCustomMood(e.target.value)}
                    disabled={isLoading}
                    suppressHydrationWarning={true}
                />
                <Button type="submit" disabled={isLoading}>
                    Suggest
                </Button>
            </form>
        </div>
        )}

        {isLoading && (
            <div className="flex flex-col items-center justify-center gap-4 text-center min-h-[250px] animate-startup-fade-in-up-1">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground">{stage === 'generating' ? "Generating your epic recipe..." : "Consulting the culinary cosmos..."}</p>
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
                        {aiSuggestions.map((suggestion, index) => (
                            <Button
                                key={index}
                                variant="outline"
                                size="lg"
                                className="w-full justify-start text-left h-auto py-3"
                                onClick={() => handleSelectRecipe(suggestion)}
                            >
                                <ChefHat className="mr-4 h-5 w-5 text-primary"/>
                                <span className="flex-1 whitespace-normal">{suggestion}</span>
                            </Button>
                        ))}
                    </div>
                </TabsContent>
                <TabsContent value="web" className="min-h-[200px] pt-4">
                    <div className="flex flex-col gap-3">
                        {webResults.map((result, index) => (
                            <Card key={index} className="cursor-pointer hover:border-primary transition-colors" onClick={() => handleSelectRecipe(result.title)}>
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg">{result.title}</CardTitle>
                                    <CardDescription>{result.snippet}</CardDescription>
                                </CardHeader>
                                <CardFooter>
                                    <p className="text-xs text-muted-foreground">Source: {result.source}</p>
                                </CardFooter>
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
