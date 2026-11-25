"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const KEY = "aurelia-theme";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    setReady(true);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(KEY, next ? "dark" : "light");
    } catch {
      // storage may be unavailable in private mode
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      className={
        compact
          ? "flex h-8 w-8 items-center justify-center hover:text-accent"
          : "flex h-10 w-10 items-center justify-center border border-line/15 hover:border-accent hover:text-accent"
      }
    >
      {ready && dark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
    </button>
  );
}
