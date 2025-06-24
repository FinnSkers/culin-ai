'use client';

import { useEffect } from 'react';

const themes = [
  // Original Rebel
  { background: '224 71% 4%', primary: '45 100% 51%', accent: '32 100% 50%' },
  // Sunset
  { background: '24 38% 8%', primary: '30 100% 60%', accent: '5 80% 65%' },
  // Forest
  { background: '120 20% 8%', primary: '90 70% 55%', accent: '140 60% 60%' },
  // Ocean
  { background: '210 40% 8%', primary: '190 100% 55%', accent: '240 80% 70%' },
  // Plum
  { background: '280 25% 9%', primary: '260 100% 70%', accent: '310 90% 65%' },
  // Mint
  { background: '165 25% 9%', primary: '150 100% 65%', accent: '180 80% 60%' },
];

export function ThemeManager() {
  useEffect(() => {
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    const root = document.documentElement;
    root.style.setProperty('--background', randomTheme.background);
    root.style.setProperty('--primary', randomTheme.primary);
    root.style.setProperty('--accent', randomTheme.accent);
  }, []);

  return null; // This component doesn't render anything
}
