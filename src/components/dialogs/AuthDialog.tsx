"use client";

import { AuthForm } from '@/components/auth/AuthForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useCulinAI } from "@/hooks/useCulinAI";
import { ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AuthDialog() {
  const { isAuthOpen, setAuthOpen } = useCulinAI();

  return (
    <Dialog open={isAuthOpen} onOpenChange={setAuthOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader className="items-center text-center">
            <ChefHat className="h-12 w-12 text-primary" />
            <DialogTitle className="mt-4 text-2xl font-bold tracking-tighter text-foreground sm:text-3xl">
                Welcome to CulinAI
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
                Sign in or create an account to save your recipes and pantry.
            </DialogDescription>
        </DialogHeader>
        
        <div className="pt-4">
            <AuthForm onSuccess={() => setAuthOpen(false)} />
        </div>

        <div className="relative pt-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or
            </span>
          </div>
        </div>

        <div className="text-center pt-2">
            <Button variant="secondary" className="w-full" onClick={() => setAuthOpen(false)}>
                Continue as Guest
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
                Note: Your data will not be saved.
            </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
