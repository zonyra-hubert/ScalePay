"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ModeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9 rounded-lg border border-border/50 bg-muted/20" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="p-2 rounded-lg border border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer flex items-center justify-center"
      aria-label="Toggle theme"
      id="theme-toggle-btn"
    >
      {isDark ? (
        <Sun className="h-[18px] w-[18px] text-yellow-500 animate-pulse-subtle" />
      ) : (
        <Moon className="h-[18px] w-[18px] text-slate-700" />
      )}
    </button>
  );
}
