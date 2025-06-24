
"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCulinAI } from "@/hooks/useCulinAI";
import { Mic, Loader2, Send, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { voiceCommand } from "@/ai/flows/voice-first-interaction";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ChefRatAvatar } from "@/components/icons/ChefRatAvatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type ConversationMessage = {
  speaker: "user" | "ai";
  text: string;
};

type MicState = "idle" | "listening" | "processing" | "speaking";

export function ActionDialog() {
  const { isActionOpen: isChatOpen, setActionOpen: setChatOpen, recipe, currentStep, setCurrentStep, isRecipeOpen, setCameraOpen, setCameraMode, setRecipe, setRecipeOpen, setIsCookingMode } = useCulinAI();
  const { toast } = useToast();
  
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [micState, setMicState] = useState<MicState>("idle");
  const [textInput, setTextInput] = useState("");
  const [isAlwaysListening, setIsAlwaysListening] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const lastAiMessageIndex = useMemo(() => 
    conversation.map(m => m.speaker).lastIndexOf('ai'),
    [conversation]
  );
  
  useEffect(() => {
    if (chatContainerRef.current) {
      const viewport = chatContainerRef.current.parentElement;
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [conversation]);

  const startListening = useCallback(() => {
    if (micState !== 'idle' || !recognitionRef.current) {
      return;
    }
    
    try {
      setMicState('listening');
      recognitionRef.current.start();
    } catch (e) {
      if ((e as DOMException).name === 'InvalidStateError') {
        setMicState('listening');
      } else {
        console.error("Error starting speech recognition:", e);
        setMicState('idle');
      }
    }
  }, [micState]);

  const processCommand = useCallback(async (command: string) => {
    if (!command) return;
    
    setMicState('processing');
    setConversation(prev => [...prev, { speaker: 'user', text: command }]);
    
    try {
      const result = await voiceCommand({ 
          command,
          generateAudio: isAudioEnabled,
          voiceName: 'Algenib',
          ...(isRecipeOpen && recipe && {
              recipeInstructions: recipe.instructions,
              currentStep: currentStep,
          })
      });

      setConversation(prev => [...prev, { speaker: 'ai', text: result.response }]);
      
      if (result.audioResponse) {
        setMicState('speaking');
        if (audioRef.current) audioRef.current.pause();

        audioRef.current = new Audio(result.audioResponse);
        audioRef.current.play().catch(e => {
            console.error("Error playing audio:", e);
            setMicState('idle'); 
        });
        
        audioRef.current.onended = () => {
          setMicState('idle');
        };
      } else {
        setMicState('idle');
      }
      
      const actionsToCloseDialog = ['scanIngredients', 'safetyAlert', 'createRecipe', 'startCooking'];
      if (actionsToCloseDialog.includes(result.action) && !(result.action === 'createRecipe' && !result.recipe)) {
         setTimeout(() => setChatOpen(false), result.audioResponse ? 1500 : 500);
      }

      // Handle UI actions immediately
      if (result.action === 'next') setCurrentStep(prev => Math.min(prev + 1, (recipe?.instructions.split('\n').length || 1) - 1));
      if (result.action === 'previous') setCurrentStep(prev => Math.max(prev - 1, 0));
      if (result.action === 'scanIngredients') { setCameraMode('ingredients'); setCameraOpen(true); }
      if (result.action === 'safetyAlert') { setCameraMode('safety'); setCameraOpen(true); }
      if (result.action === 'startCooking') { setIsCookingMode(true); setRecipeOpen(true); }
      if (result.action === 'createRecipe' && result.recipe) {
        toast({ title: "Recipe Created!", description: `Your recipe for "${result.recipe?.recipeName}" is ready.` });
        setRecipe(result.recipe!);
        setRecipeOpen(true);
      }

    } catch (error) {
      console.error("Error processing command:", error);
      const errorMsg = "My circuits got scrambled. Could you try that again?";
      setConversation(prev => [...prev, { speaker: 'ai', text: errorMsg }]);
      setMicState('idle');
    }
  }, [recipe, isRecipeOpen, currentStep, setChatOpen, setCameraMode, setCameraOpen, setCurrentStep, setRecipe, setRecipeOpen, toast, isAudioEnabled, setIsCookingMode]);

  // Main effect for setting up the speech recognition object
  useEffect(() => {
    if (!isChatOpen) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ variant: "destructive", title: "Browser Not Supported", description: "Your browser doesn't support the magic of voice commands." });
      return;
    }
    
    let initialMessage = "Ready when you are, little chef. What's on your mind?";
    if (isRecipeOpen && recipe) {
      initialMessage = `I see you're looking at "${recipe.recipeName}". Excellent choice! Just say "start cooking" when you're ready, or ask me anything about it.`;
    }
    setConversation([{ speaker: 'ai', text: initialMessage }]);
    
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event) => processCommand(event.results[0][0].transcript);
    recognition.onerror = (event) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
          console.error("Speech recognition error:", event.error);
          toast({ variant: 'destructive', title: 'Mic Error', description: `I couldn't hear you. Please try again.`});
      }
      setMicState('idle');
    };

    recognition.onend = () => {
      setMicState('idle');
    };
    
    recognitionRef.current = recognition;

    return () => {
        if (recognitionRef.current) {
          recognitionRef.current.abort();
        }
        if (audioRef.current) {
          audioRef.current.pause();
        }
        setMicState('idle');
        setConversation([]);
        setTextInput("");
    };
  }, [isChatOpen, processCommand, toast, isRecipeOpen, recipe]);

  // This effect handles the "always listening" loop.
  useEffect(() => {
    if (isChatOpen && isAlwaysListening && micState === 'idle') {
      const timer = setTimeout(() => {
        startListening();
      }, 250); // A small delay to prevent frantic looping.
      return () => clearTimeout(timer);
    }
  }, [isChatOpen, isAlwaysListening, micState, startListening]);
  
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    processCommand(textInput.trim());
    setTextInput("");
  };

  const handleMicButtonClick = () => {
    if (micState === 'listening') {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setMicState('idle');
    } else if (micState === 'idle') {
      startListening();
    }
  };

  const isInputDisabled = micState === 'processing' || micState === 'speaking';

  return (
    <Dialog open={isChatOpen} onOpenChange={setChatOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center">
            <DialogTitle>Talk to CulinAI</DialogTitle>
            <DialogDescription>Your hands-free kitchen helper.</DialogDescription>
            <div className="flex items-center justify-center gap-6 pt-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="always-listen-switch"
                  checked={isAlwaysListening}
                  onCheckedChange={setIsAlwaysListening}
                  disabled={isInputDisabled}
                />
                <Label htmlFor="always-listen-switch" className="text-sm text-muted-foreground">Always Listen</Label>
              </div>
               <div className="flex items-center space-x-2">
                <Switch
                  id="audio-response-switch"
                  checked={isAudioEnabled}
                  onCheckedChange={setIsAudioEnabled}
                  disabled={isInputDisabled}
                />
                <Label htmlFor="audio-response-switch" className="text-sm text-muted-foreground">Audio Response</Label>
              </div>
            </div>
        </DialogHeader>
        <div className="mt-2 h-[calc(100vh-22rem)] max-h-[30rem] flex flex-col">
            <ScrollArea className="flex-grow pr-4 -mr-4">
            <div ref={chatContainerRef} className="space-y-4">
                {conversation.map((msg, index) => (
                <div key={index} className={`flex items-end gap-2 w-full ${msg.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.speaker === 'ai' && (
                    <ChefRatAvatar
                        className={cn(
                            'rounded-full self-start transition-transform duration-300',
                            {
                              'animate-rat-speak': micState === 'speaking' && index === lastAiMessageIndex,
                              'animate-rat-listen': micState === 'listening' && index === lastAiMessageIndex,
                            }
                        )}
                    />
                    )}
                    <p className={`max-w-[85%] rounded-lg px-3 py-2 text-sm break-words ${msg.speaker === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {msg.text}
                    </p>
                </div>
                ))}
                {micState === 'processing' && (
                <div className="flex items-end gap-2 justify-start">
                    <ChefRatAvatar className="rounded-full self-start" />
                    <p className="max-w-[75%] rounded-lg px-3 py-2 bg-muted"><Loader2 className="h-4 w-4 animate-spin" /></p>
                </div>
                )}
            </div>
            </ScrollArea>
            <div className="mt-auto pt-4 border-t">
              <form onSubmit={handleTextSubmit} className="w-full flex items-center gap-2">
                <Input
                  placeholder="Type or talk..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  disabled={isInputDisabled}
                  autoComplete="off"
                />
                {textInput.trim() ? (
                   <Button type="submit" size="icon" disabled={isInputDisabled} aria-label="Send Message">
                    <Send className="h-5 w-5"/>
                  </Button>
                ) : (
                  <Button type="button" size="icon" onClick={handleMicButtonClick} disabled={isInputDisabled} aria-label="Toggle Voice" className={cn(micState === 'listening' && 'bg-destructive hover:bg-destructive/90')}>
                    {micState === 'listening' ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5"/>}
                  </Button>
                )}
              </form>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
