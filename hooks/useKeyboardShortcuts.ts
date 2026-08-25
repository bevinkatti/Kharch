"use client";
import { useEffect } from "react";

interface Shortcuts {
  onAddExpense?: () => void;
  onFocusSalary?: () => void;
}

export function useKeyboardShortcuts({ onAddExpense, onFocusSalary }: Shortcuts) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      // Don't fire inside inputs/textareas
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) return;

      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        onAddExpense?.();
      }
      if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        onFocusSalary?.();
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onAddExpense, onFocusSalary]);
}
