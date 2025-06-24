
import { useState, useEffect, useCallback } from 'react';

// This function checks if a tip has been seen. It's safe for SSR.
const hasSeenTip = (tipId: string): boolean => {
  if (typeof window === 'undefined') return true; // Assume seen on server
  try {
    return localStorage.getItem(`tip_seen_${tipId}`) === 'true';
  } catch (error) {
    console.error("Failed to read from localStorage", error);
    return true; // Err on the side of not showing the tip
  }
};

// This function marks a tip as seen.
const markTipAsSeen = (tipId: string) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`tip_seen_${tipId}`, 'true');
  } catch (error) {
    console.error("Failed to write to localStorage", error);
  }
};

export const useFirstTimeTip = (tipId: string) => {
  // This state tracks if it's the user's first interaction with this feature.
  const [isFirstTime, setIsFirstTime] = useState(false);

  // On component mount, check if the tip has been seen.
  useEffect(() => {
    // Only check on the client side
    if (typeof window !== 'undefined') {
      setIsFirstTime(!hasSeenTip(tipId));
    }
  }, [tipId]);

  // This is the handler for the Tooltip's onOpenChange prop.
  const onOpenChange = useCallback((open: boolean) => {
    // If the tooltip is being opened and it's the first time,
    // mark it as seen and update the state.
    if (open && isFirstTime) {
      markTipAsSeen(tipId);
      setIsFirstTime(false);
    }
  }, [tipId, isFirstTime]);

  // The hook returns the handler and a boolean for styling purposes (e.g., animations).
  // We don't return a "showTip" state to control the `open` prop anymore.
  return { isFirstTime, onOpenChange };
};