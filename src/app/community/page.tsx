"use client";

import React from "react";
import { Users } from "lucide-react";
import CommunityRecipeForm from "./CommunityRecipeForm";
import CommunityRecipeList from "./CommunityRecipeList";
import { useCulinAI } from "@/hooks/useCulinAI";

export default function CommunityPage() {
  const { user } = useCulinAI();
  const [refresh, setRefresh] = React.useState(0);
  const handleRecipeAdded = () => setRefresh((r) => r + 1);

  return (
    <div className="container py-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Users className="h-7 w-7 text-primary" />
        Community Recipes
      </h1>
      <CommunityRecipeForm onRecipeAdded={handleRecipeAdded} />
      <h2 className="text-lg font-semibold mb-2">All Community Recipes</h2>
      <CommunityRecipeList key={refresh} userId={user?.id ?? ""} />
      {/* TODO: Add tabs for AI, Web, and Community, and show user's own recipes separately if desired */}
      {/* TODO: Add comment and love functionality, and compact/expand details */}
    </div>
  );
}
