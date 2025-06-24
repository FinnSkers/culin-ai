"use client";

import { CulinAIContext } from "@/context/CulinAIProvider";
import type { CulinAIContextType } from "@/context/CulinAIProvider";
import { useContext } from "react";

/**
 * useCulinAI - React hook to access the CulinAI app context.
 * Must be used within a <CulinAIProvider>.
 * @returns {CulinAIContextType} The full app context (profile, pantry, recipe, UI state, etc.)
 */
export const useCulinAI = (): CulinAIContextType => {
  const context = useContext(CulinAIContext);
  if (!context) {
    throw new Error("useCulinAI must be used within a CulinAIProvider");
  }
  return context;
};
