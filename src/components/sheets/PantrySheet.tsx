"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { useCulinAI } from "@/hooks/useCulinAI";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export function PantrySheet() {
  const { isPantryOpen, setPantryOpen, pantryItems, addPantryItem, removePantryItem, loading, user, shoppingList, setShoppingList } = useCulinAI();
  const [newItem, setNewItem] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddItem = async () => {
    if (!newItem.trim()) return;
    setIsAdding(true);
    await addPantryItem(newItem);
    setNewItem("");
    setIsAdding(false);
  };

  const handleRemoveShoppingListItem = (itemToRemove: string) => {
    setShoppingList(prev => prev.filter(item => item !== itemToRemove));
  }
  
  const handleClearShoppingList = () => {
    setShoppingList([]);
  }

  return (
    <Sheet open={isPantryOpen} onOpenChange={setPantryOpen}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>My Stash & Shopping List</SheetTitle>
          <SheetDescription>
            {user ? "Your secret weapon inventory. Keep it stocked." : "Your guest pantry. Sign in to save your ingredients."}
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 flex flex-col gap-4 py-4 min-h-0">
            <div className="flex-1 flex flex-col gap-4">
                <h3 className="text-lg font-semibold">In Stock</h3>
                <ScrollArea className="flex-1 pr-4 -mr-4 h-40">
                    <div className="flex flex-wrap gap-2">
                    {loading && !user ? null : loading ? <p className="text-sm text-muted-foreground">Loading your stash...</p> :
                    pantryItems.length > 0 ? (
                        pantryItems.map((item) => (
                        <Badge key={item.id} variant="secondary" className="text-base py-1 pl-3 pr-1">
                            {item.name}
                            <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 ml-1"
                            onClick={() => removePantryItem(item.id)}
                            >
                            <Trash2 className="h-3 w-3" />
                            </Button>
                        </Badge>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground">{user ? "Your stash is empty. Go hunt and gather." : "Your guest pantry is empty."}</p>
                    )}
                    </div>
                </ScrollArea>
            </div>

            <Separator className="my-4" />

            <div className="flex-1 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Shopping List</h3>
                    {shoppingList.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={handleClearShoppingList}>Clear All</Button>
                    )}
                </div>
                <ScrollArea className="flex-1 pr-4 -mr-4 h-40">
                    <div className="flex flex-col gap-2">
                        {shoppingList.length > 0 ? (
                            shoppingList.map((item, index) => (
                                <div key={index} className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
                                    <span className="text-sm">{item}</span>
                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleRemoveShoppingListItem(item)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">Your shopping list is empty. Generate a recipe to add ingredients.</p>
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
        <SheetFooter>
            <div className="flex w-full items-center space-x-2">
                <Input
                    type="text"
                    placeholder="Add to your arsenal..."
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                    disabled={isAdding}
                />
                <Button type="submit" onClick={handleAddItem} disabled={isAdding}>
                  {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Stock It
                </Button>
            </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
