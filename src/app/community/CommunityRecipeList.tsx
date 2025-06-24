"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ChefHat, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

function CompactRecipeCard({ recipe, onExpand, onLove, loved }: any) {
  return (
    <Card className="mb-4 cursor-pointer hover:shadow-lg transition-shadow">
      <CardHeader onClick={onExpand} className="flex flex-row items-center gap-2">
        <CardTitle className="flex-1 flex items-center gap-2">
          <ChefHat className="text-accent" />
          {recipe.title}
          {recipe.source === 'AI' && (
            <Badge variant="secondary" className="ml-2 bg-gradient-to-r from-blue-400 to-purple-500 text-white">AI</Badge>
          )}
        </CardTitle>
        <Badge variant="outline">{recipe.cuisine || "?"}</Badge>
        <Button variant={loved ? "default" : "outline"} size="icon" onClick={e => { e.stopPropagation(); onLove(); }}>
          <Heart className={loved ? "fill-red-500 text-red-500" : ""} />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground line-clamp-2">{recipe.description}</div>
      </CardContent>
    </Card>
  );
}

function ExpandedRecipeCard({ recipe, onCollapse }: any) {
  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center gap-2">
        <CardTitle className="flex-1 flex items-center gap-2">
          <ChefHat className="text-accent" />
          {recipe.title}
          {recipe.source === 'AI' && (
            <Badge variant="secondary" className="ml-2 bg-gradient-to-r from-blue-400 to-purple-500 text-white">AI</Badge>
          )}
        </CardTitle>
        <Badge variant="outline">{recipe.cuisine || "?"}</Badge>
        <Button variant="outline" size="sm" onClick={onCollapse}>Close</Button>
      </CardHeader>
      <CardContent>
        <div className="mb-2 text-sm text-muted-foreground">{recipe.description}</div>
        <div className="mb-2">
          <strong>Ingredients:</strong>
          <ul className="list-disc list-inside ml-4">
            {Array.isArray(recipe.ingredients) ? recipe.ingredients.map((ing: string, i: number) => (
              <li key={i}>{ing}</li>
            )) : null}
          </ul>
        </div>
        <div className="mb-2">
          <strong>Instructions:</strong>
          <ol className="list-decimal list-inside ml-4">
            {Array.isArray(recipe.instructions) ? recipe.instructions.map((step: string, i: number) => (
              <li key={i}>{step}</li>
            )) : null}
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CommunityRecipeList({ userId }: { userId: string }) {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loved, setLoved] = useState<{ [id: string]: boolean }>({});

  useEffect(() => {
    fetch("/api/community/recipes/list")
      .then(res => res.json())
      .then(data => setRecipes(data.recipes.filter((r: any) => !r.source || r.source !== 'AI'))); // Only show community/user recipes
  }, []);

  const handleLove = (id: string) => {
    setLoved(l => ({ ...l, [id]: !l[id] }));
    // TODO: POST to /api/community/recipes/love
  };

  return (
    <div>
      {recipes.map(r =>
        expanded === r.id ? (
          <ExpandedRecipeCard key={r.id} recipe={r} onCollapse={() => setExpanded(null)} />
        ) : (
          <CompactRecipeCard key={r.id} recipe={r} onExpand={() => setExpanded(r.id)} onLove={() => handleLove(r.id)} loved={!!loved[r.id]} />
        )
      )}
    </div>
  );
}
