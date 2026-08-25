"use client";
import { useState, createContext, useContext, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, XCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";
interface ToastMsg { id: string; message: string; type: ToastType; }
interface Ctx { toast: (msg: string, type?: ToastType) => void; }

const ToastCtx = createContext<Ctx>({ toast: () => {} });
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);

  const icons = {
    success: <CheckCircle2 className="w-3.5 h-3.5 flex-none" style={{ color: "var(--brand)" }} />,
    error:   <XCircle      className="w-3.5 h-3.5 flex-none" style={{ color: "var(--red)" }} />,
    info:    <Info         className="w-3.5 h-3.5 flex-none" style={{ color: "var(--text-md)" }} />,
  };

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div className="toasts">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="pointer-events-auto flex items-center gap-2.5 pl-3 pr-2 py-2.5 rounded-xl border"
              style={{
                background: "var(--surface-raised)",
                borderColor: "var(--border-strong)",
                boxShadow: "var(--shadow-lg)",
                minWidth: 220,
                maxWidth: 320,
              }}
            >
              {icons[t.type]}
              <span className="flex-1 text-sm" style={{ color: "var(--text-hi)" }}>{t.message}</span>
              <button
                onClick={() => setToasts(p => p.filter(x => x.id !== t.id))}
                className="w-5 h-5 rounded flex items-center justify-center flex-none transition-colors"
                style={{ color: "var(--text-lo)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--text-md)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--text-lo)")}
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}
