"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCulinAI } from "@/hooks/useCulinAI";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Sparkles, Flame, Beef, Wheat, Droplet, ShoppingCart, Eye, ClipboardList, ListOrdered } from "lucide-react";
import React, { useState, useEffect, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Progress } from "../ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


export function RecipeDialog() {
  const { isRecipeOpen, setRecipeOpen, recipe, currentStep, setCurrentStep, setShoppingList, isCookingMode, setIsCookingMode } = useCulinAI();
  const [showImage, setShowImage] = useState(false);
  const { toast } = useToast();
  
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (isRecipeOpen) {
      setCurrentStep(0);
      setShowImage(false);
    }
  }, [isRecipeOpen, recipe, setCurrentStep]);
  
  const instructions = React.useMemo(() => {
    return recipe?.instructions.split('\n').filter(line => line.trim() !== '') || [];
  }, [recipe]);

  const progress = instructions.length > 0 ? ((currentStep + 1) / instructions.length) * 100 : 0;
  const isCooking = isCookingMode;

  // Scroll to the current step when it changes
  useEffect(() => {
    if (isCooking && stepRefs.current[currentStep]) {
        const container = scrollContainerRef.current;
        const element = stepRefs.current[currentStep];
        if (container && element) {
            const containerRect = container.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();

            const offset = elementRect.top - containerRect.top - (containerRect.height / 2) + (elementRect.height / 2);

            container.scrollTo({
                top: container.scrollTop + offset,
                behavior: 'smooth',
            });
        }
    }
  }, [currentStep, isCooking]);


  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, instructions.length - 1));
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };
  
  const startCooking = () => {
    setIsCookingMode(true);
  }

  const handleAddToShoppingList = () => {
    if (!recipe) return;
    const ingredientsArray = recipe.ingredients.split('\n').filter(line => line.trim() !== '').map(item => item.trim().replace(/^- /,''));
    setShoppingList(prev => [...new Set([...prev, ...ingredientsArray])]);
    toast({
        title: "Shopping List Updated!",
        description: "The ingredients have been added to your shopping list.",
    });
  }

  return (
    <Dialog open={isRecipeOpen} onOpenChange={setRecipeOpen}>
      <DialogContent className="max-w-md md:max-w-2xl bg-card/80 backdrop-blur-sm">
        <DialogHeader>
          {recipe?.photoDataUri ? (
            showImage ? (
                <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden -mx-6 -mt-6">
                    <Image 
                        src={recipe.photoDataUri} 
                        alt={recipe.recipeName} 
                        fill
                        className="object-cover"
                    />
                </div>
            ) : (
                <div className="w-full h-24 mb-4 -mx-6 -mt-6 bg-muted/50 flex items-center justify-center">
                    <Button variant="outline" onClick={() => setShowImage(true)}>
                        <Eye className="mr-2 h-4 w-4" />
                        See what it looks like
                    </Button>
                </div>
            )
          ) : null}
          <DialogTitle className="text-xl font-bold text-primary sm:text-2xl">{recipe?.recipeName}</DialogTitle>
          <DialogDescription>
            {isCooking 
              ? "Alright, little chef. Time to make some magic. Follow these steps."
              : "Here's the game plan. Ready to create something Ego would love?"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto pr-2 -mr-4">
            <div className="py-4">
                {!isCooking ? (
                    <Tabs defaultValue="ingredients" className="w-full animate-startup-fade-in-up-1">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="ingredients"><ClipboardList className="mr-2 h-4 w-4" />Ingredients</TabsTrigger>
                            <TabsTrigger value="instructions"><ListOrdered className="mr-2 h-4 w-4" />Steps</TabsTrigger>
                            <TabsTrigger value="nutrition"><Flame className="mr-2 h-4 w-4" />Nutrition</TabsTrigger>
                        </TabsList>
                        <TabsContent value="ingredients" className="mt-4 text-sm text-muted-foreground">
                            {recipe?.ingredients.trim() ? (
                              <ul className="list-disc pl-5 space-y-1 whitespace-pre-line">
                                  {recipe.ingredients.split('\n').filter(item => item.trim()).map((item, index) => (
                                    <li key={index}>{item.trim().replace(/^- /,'')}</li>
                                  ))}
                              </ul>
                            ) : (
                              <div className="text-muted-foreground italic">No ingredients listed.</div>
                            )}
                        </TabsContent>
                        <TabsContent value="instructions" className="mt-4 text-sm text-muted-foreground">
                            {instructions.length > 0 ? (
                              <ol className="list-decimal pl-5 space-y-2">
                                  {instructions.map((instruction, index) => (
                                      <li key={index}>{instruction.replace(/^\d+\.\s*/, '')}</li>
                                  ))}
                              </ol>
                            ) : (
                              <div className="text-muted-foreground italic">No steps provided.</div>
                            )}
                        </TabsContent>
                        <TabsContent value="nutrition" className="mt-4">
                            {recipe?.nutrition && recipe.nutrition.calories ? (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                                    <div className="flex flex-col items-center justify-center p-3 bg-muted/50 rounded-lg transition-transform hover:scale-105">
                                        <Flame className="h-6 w-6 text-primary mb-1" />
                                        <p className="font-bold text-lg">{recipe.nutrition.calories}</p>
                                        <p className="text-xs text-muted-foreground">Calories</p>
                                    </div>
                                    <div className="flex flex-col items-center justify-center p-3 bg-muted/50 rounded-lg transition-transform hover:scale-105">
                                        <Beef className="h-6 w-6 text-primary mb-1" />
                                        <p className="font-bold text-lg">{recipe.nutrition.protein}</p>
                                        <p className="text-xs text-muted-foreground">Protein</p>
                                    </div>
                                    <div className="flex flex-col items-center justify-center p-3 bg-muted/50 rounded-lg transition-transform hover:scale-105">
                                        <Wheat className="h-6 w-6 text-primary mb-1" />
                                        <p className="font-bold text-lg">{recipe.nutrition.carbs}</p>
                                        <p className="text-xs text-muted-foreground">Carbs</p>
                                    </div>
                                    <div className="flex flex-col items-center justify-center p-3 bg-muted/50 rounded-lg transition-transform hover:scale-105">
                                        <Droplet className="h-6 w-6 text-primary mb-1" />
                                        <p className="font-bold text-lg">{recipe.nutrition.fat}</p>
                                        <p className="text-xs text-muted-foreground">Fat</p>
                                    </div>
                                </div>
                            ) : (
                              <div className="text-muted-foreground italic">No nutrition info available.</div>
                            )}
                        </TabsContent>
                    </Tabs>
                ) : (
                    <div className="relative animate-startup-fade-in-up-1">
                        <div className="absolute left-0 top-0 h-full w-1 flex items-center">
                            <div className="w-full bg-muted rounded-full overflow-hidden">
                                <Progress value={progress} className="w-1 h-full !bg-primary" />
                            </div>
                        </div>
                        <div
                            ref={scrollContainerRef}
                            className="h-[45vh] w-full space-y-4 overflow-y-auto pl-6 pr-2"
                        >
                            {instructions.map((instruction, index) => (
                                <div
                                    key={index}
                                    ref={el => stepRefs.current[index] = el}
                                    className={cn(
                                        "p-4 rounded-xl border-2 transition-all duration-300",
                                        index === currentStep
                                            ? "bg-muted border-primary shadow-lg scale-102"
                                            : "bg-muted/50 border-transparent opacity-70"
                                    )}
                                >
                                    <p className="font-bold text-base mb-2 text-primary">
                                        Step {index + 1} of {instructions.length}
                                    </p>
                                    <p className="text-foreground text-sm leading-relaxed">
                                        {instruction.replace(/^\d+\.\s*/, '')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row sm:justify-between items-center gap-4 pt-4">
            {!isCooking ? (
              <div className="w-full flex flex-row justify-end gap-2">
                <Button onClick={handleAddToShoppingList} variant="secondary" size="lg">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to List
                </Button>
                <Button onClick={startCooking} size="lg">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Let's Cook!
                </Button>
              </div>
            ) : (
                <>
                    <div className="flex-1 text-left text-sm text-muted-foreground font-medium">
                        Step {currentStep + 1} of {instructions.length}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handlePrev} disabled={currentStep === 0}>
                            <ChevronLeft />
                            Previous
                        </Button>
                        <Button onClick={handleNext} disabled={currentStep === instructions.length - 1}>
                            Next
                            <ChevronRight />
                        </Button>
                    </div>
                </>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
