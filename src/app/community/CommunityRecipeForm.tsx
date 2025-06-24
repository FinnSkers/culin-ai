"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function CommunityRecipeForm({ onRecipeAdded }: { onRecipeAdded: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/community/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          ingredients: ingredients.split("\n").map((i) => i.trim()).filter(Boolean),
          instructions: instructions.split("\n").map((i) => i.trim()).filter(Boolean),
        }),
      });
      if (!res.ok) throw new Error("Failed to add recipe");
      setTitle(""); setDescription(""); setIngredients(""); setInstructions("");
      onRecipeAdded();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded-lg bg-card/50">
      <h3 className="font-semibold mb-2">Share Your Recipe</h3>
      <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required className="mb-2" />
      <Textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="mb-2" />
      <Textarea placeholder="Ingredients (one per line)" value={ingredients} onChange={e => setIngredients(e.target.value)} className="mb-2" required />
      <Textarea placeholder="Instructions (one per line)" value={instructions} onChange={e => setInstructions(e.target.value)} className="mb-2" required />
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      <Button type="submit" disabled={loading}>{loading ? "Adding..." : "Add Recipe"}</Button>
    </form>
  );
}
