'use client';

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { RecipeGenerator } from "@/components/features/RecipeGenerator";
import { MoodRecipeGenerator } from "@/components/features/MoodRecipeGenerator";
import { WelcomeScreen } from "@/components/features/WelcomeScreen";
import { cn } from "@/lib/utils";

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true);

  if (showWelcome) {
    return <WelcomeScreen onGetStarted={() => setShowWelcome(false)} />;
  }

  return (
    <div className="relative flex flex-col min-h-screen text-foreground bg-background">
      <div
        className="absolute inset-0 opacity-10 animate-background-pan"
        style={{
          backgroundImage: `
            radial-gradient(circle at 15% 50%, hsl(var(--primary) / 0.1), transparent 25%),
            radial-gradient(circle at 85% 30%, hsl(var(--accent) / 0.1), transparent 25%)
          `,
          backgroundSize: '200% 100%',
        }}
      />
      <div className="relative z-10 flex flex-col flex-1 animate-fade-in">
        <Header />
        <main className="flex-1 container py-6 pb-20">
          <div className="max-w-xl mx-auto text-center">
            <h1 className="text-3xl font-bold tracking-tighter text-primary sm:text-4xl animate-glow animate-startup-fade-in-up-1">
              Anyone Can Cook
            </h1>
            <p className="mt-2 text-base text-muted-foreground animate-startup-fade-in-up-2">
              Your AI-powered sous-chef. No tiny rat hiding in your hat required.
            </p>

            <div className="mt-10 text-left space-y-8 animate-startup-fade-in-up-3">
              <MoodRecipeGenerator />
              <RecipeGenerator />
            </div>
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
