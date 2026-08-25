"use client";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

type Theme = "dark" | "light";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const t = (localStorage.getItem("kharch-theme") as Theme) ?? "dark";
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("kharch-theme", next);
  }

  if (!mounted) return <div className="w-7 h-7" />;

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="w-7 h-7 rounded-md flex items-center justify-center transition-colors"
      style={{ color: "var(--text-lo)" }}
      onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-md)"; e.currentTarget.style.background = "var(--surface)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-lo)"; e.currentTarget.style.background = "transparent"; }}
    >
      {theme === "dark"
        ? <Sun className="w-3.5 h-3.5" />
        : <Moon className="w-3.5 h-3.5" />
      }
    </button>
  );
}
