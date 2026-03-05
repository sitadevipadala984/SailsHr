"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui";

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load theme preference from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    const isDarkMode = savedTheme === "dark" || 
      (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    
    setIsDark(isDarkMode);
    updateTheme(isDarkMode);
    setMounted(true);
  }, []);

  const updateTheme = (dark: boolean) => {
    const html = document.documentElement;
    if (dark) {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const toggleDarkMode = () => {
    const newState = !isDark;
    setIsDark(newState);
    updateTheme(newState);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <Button type="button" variant="ghost" aria-label="Toggle dark mode" disabled>
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v6m0 6v6M23 12h-6m-6 0H1M20.485 3.515l-4.243 4.243m-8.484 0l-4.243-4.243M20.485 20.485l-4.243-4.243m-8.484 0l-4.243 4.243" />
        </svg>
      </Button>
    );
  }

  return (
    <Button 
      type="button" 
      variant="ghost" 
      aria-label="Toggle dark mode"
      onClick={toggleDarkMode}
      className="text-text-secondary hover:text-text-primary"
    >
      {isDark ? (
        // Moon icon for dark mode (click to go light)
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ) : (
        // Sun icon for light mode (click to go dark)
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v6m0 6v6M23 12h-6m-6 0H1M20.485 3.515l-4.243 4.243m-8.484 0l-4.243-4.243M20.485 20.485l-4.243-4.243m-8.484 0l-4.243 4.243" />
        </svg>
      )}
    </Button>
  );
}
