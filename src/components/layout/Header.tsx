'use client';

import React from "react";
import Link from 'next/link';
import { ChefHat, ClipboardList } from "lucide-react";
import { useCulinAI } from "@/hooks/useCulinAI";
import { Button } from "@/components/ui/button";

export function Header() {
  const { setAuthOpen, setPantryOpen } = useCulinAI();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-startup-fade-in-down">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <div className="mr-4 flex">
          <a href="/" className="mr-6 flex items-center space-x-2">
            <ChefHat className="h-6 w-6 text-primary" />
            <span className="font-bold inline-block font-headline text-lg">
              CulinAI
            </span>
          </a>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setPantryOpen(true)}>
            <ClipboardList />
            Pantry
          </Button>
        </div>
      </div>
    </header>
  );
}
