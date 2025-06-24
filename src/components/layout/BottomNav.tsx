"use client";

import { Camera, AlertTriangle, Users, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PantrySheet } from "@/components/sheets/PantrySheet";
import { ActionDialog } from "@/components/dialogs/ActionDialog";
import { useCulinAI } from "@/hooks/useCulinAI";
import { RecipeDialog } from "../dialogs/RecipeDialog";
import { AuthDialog } from "../dialogs/AuthDialog";
import { CameraDialog } from "../dialogs/CameraDialog";
import { ChefRatAvatar } from "../icons/ChefRatAvatar";
import { usePathname } from 'next/navigation';

export function BottomNav() {
  const { user, setAuthOpen, setChatOpen, setCameraOpen, setCameraMode } = useCulinAI();
  const pathname = usePathname();

  // Helper to check if a route is active
  const isActive = (href: string) => pathname === href;

  const handleDisasterCheck = () => {
    setCameraMode('safety');
    setCameraOpen(true);
  }

  const handleScanLoot = () => {
    setCameraMode('ingredients');
    setCameraOpen(true);
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 z-50 w-full h-16 border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg transition-shadow">
        <div className="grid h-full max-w-lg grid-cols-5 mx-auto">
          <div className="flex items-center justify-center">
            <Button variant="ghost" size="lg" className="flex flex-col h-auto gap-1 py-2" onClick={handleDisasterCheck}>
              <AlertTriangle className="h-7 w-7 mx-auto" />
              <span className="text-sm font-semibold text-muted-foreground">Disaster</span>
            </Button>
          </div>
          <div className="flex items-center justify-center">
            <Button variant="ghost" size="lg" className="flex flex-col h-auto gap-1 py-2" onClick={handleScanLoot}>
              <Camera className="h-7 w-7 mx-auto" />
              <span className="text-sm font-semibold text-muted-foreground">Scan</span>
            </Button>
          </div>
          <div className="relative flex items-center justify-center group">
            {/* Chat button overlays ChefRatAvatar */}
            <button
              onClick={() => setChatOpen(true)}
              className="flex items-center justify-center h-16 w-16 bg-background rounded-full shadow-lg border-2 border-primary absolute -top-8 left-1/2 -translate-x-1/2 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/50"
              aria-label="Talk to Chef"
              style={{ zIndex: 2 }}
            >
              <ChefRatAvatar className="h-12 w-12" />
            </button>
            {/* Optional: animated prompt */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 animate-prompt-pop-in opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                Talk to me!
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-primary"></div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <Button asChild variant="ghost" size="lg" className={`flex flex-col h-auto gap-1 py-2 ${isActive('/community') ? 'text-primary font-bold border-t-2 border-primary' : ''}` }>
              <a href="/community">
                <Users className="h-7 w-7 mx-auto" />
                <span className="text-sm font-semibold">Community</span>
              </a>
            </Button>
          </div>
          <div className="flex items-center justify-center">
            <Button asChild variant="ghost" size="lg" className={`flex flex-col h-auto gap-1 py-2 ${isActive('/profile') ? 'text-primary font-bold border-t-2 border-primary' : ''}` }>
              <a href="/profile">
                <User className="h-7 w-7 mx-auto" />
                <span className="text-sm font-semibold">Profile</span>
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Global dialogs and sheets are kept here, as they are controlled by context and need to be in the component tree */}
      <PantrySheet />
      <ActionDialog />
      <RecipeDialog />
      <AuthDialog />
      <CameraDialog />
    </>
  );
}
