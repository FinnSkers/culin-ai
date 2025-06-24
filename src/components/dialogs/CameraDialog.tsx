
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogClose, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCulinAI } from "@/hooks/useCulinAI";
import { Loader2, Camera, X, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { detectIngredients } from "@/ai/flows/detect-ingredients";
import { getSafetyAlert } from "@/ai/flows/safety-alerts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function CameraDialog() {
  const { isCameraOpen, setCameraOpen, cameraMode, addPantryItem } = useCulinAI();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!isCameraOpen) {
          // Stop video streams when dialog is closed
          if (videoRef.current?.srcObject) {
              const stream = videoRef.current.srcObject as MediaStream;
              stream.getTracks().forEach(track => track.stop());
              videoRef.current.srcObject = null;
          }
          return;
      }

      setHasCameraPermission(null); // Reset on open
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        setHasCameraPermission(false);
        toast({
          variant: "destructive",
          title: "Camera Access Denied",
          description: "Please enable camera permissions in your browser settings.",
        });
        setCameraOpen(false); // Close dialog if no permission
      }
    };

    getCameraPermission();

    // Cleanup function
    return () => {
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    };
  }, [isCameraOpen, setCameraOpen, toast]);

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setLoading(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) {
        setLoading(false);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not capture image.' });
        return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const photoDataUri = canvas.toDataURL("image/jpeg");

    try {
      if (cameraMode === 'ingredients') {
          const result = await detectIngredients({ photoDataUri });
          if (result.ingredients && result.ingredients.length > 0) {
            result.ingredients.forEach(addPantryItem);
            toast({ title: "Stash Updated", description: `${result.ingredients.join(', ')} now in your arsenal.` });
          } else {
            toast({ title: "Nothing Found", description: "Couldn't detect any ingredients in the image." });
          }
      } else if (cameraMode === 'safety') {
          const result = await getSafetyAlert({ photoDataUri, description: "Checking for kitchen hazards." });
          if (result.alertType !== 'none') {
              toast({ variant: "destructive", title: `🚨 ${result.alertType.toUpperCase()} ALERT 🚨`, description: `Severity: ${result.severity}. ${result.instructions}` });
          } else {
              toast({ title: "Kitchen's Clear!", description: "No impending doom detected. Cook on." });
          }
      }
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "AI Scan Failed", description: "My digital eyes are blurry. Couldn't process that image." });
    } finally {
      setLoading(false);
      setCameraOpen(false);
    }
  };

  return (
    <Dialog open={isCameraOpen} onOpenChange={setCameraOpen}>
      <DialogContent className="p-0 border-0 bg-black w-screen h-screen max-w-full sm:max-w-full rounded-none sm:rounded-none flex flex-col items-center justify-center">
        <DialogHeader className="sr-only">
          <DialogTitle>Camera for {cameraMode === 'ingredients' ? 'Ingredient Detection' : 'Safety Check'}</DialogTitle>
        </DialogHeader>
        
        {hasCameraPermission === null && (
            <div className="flex flex-col items-center gap-2 text-white">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p>Requesting camera access...</p>
            </div>
        )}

        {hasCameraPermission === false && (
            <Alert variant="destructive" className="max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Camera Access Denied</AlertTitle>
              <AlertDescription>
                CulinAI needs camera access to work its magic. Please enable it in your browser settings and try again.
              </AlertDescription>
            </Alert>
        )}

        {hasCameraPermission && (
          <div className="relative w-full h-full">
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
            <div className="absolute inset-x-0 bottom-0 p-8 flex justify-center bg-gradient-to-t from-black/50 to-transparent">
              <Button size="icon" className="h-20 w-20 rounded-full border-4 border-white bg-transparent hover:bg-white/20" onClick={handleCapture} disabled={loading}>
                {loading ? <Loader2 className="h-10 w-10 animate-spin" /> : <Camera className="h-10 w-10 text-white" />}
                <span className="sr-only">Capture</span>
              </Button>
            </div>
             <DialogClose className="absolute right-4 top-4 rounded-full p-2 bg-black/50 text-white opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                <X className="h-6 w-6" />
                <span className="sr-only">Close</span>
            </DialogClose>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
}
