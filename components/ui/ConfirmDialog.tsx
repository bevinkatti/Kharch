"use client";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export function ConfirmDialog({
  open, title, message, confirmLabel = "Confirm",
  onConfirm, onCancel, destructive = false,
}: Props) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          {/* On mobile: slide up from bottom. On desktop: scale in center */}
          <motion.div
            className="w-full max-w-sm rounded-2xl border p-5 sm:p-6 mx-4"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border-strong)",
              boxShadow: "var(--shadow-lg)",
            }}
            initial={{ scale: 0.96, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.97, opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={e => e.stopPropagation()}
          >
            {destructive && (
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "var(--red-dim)" }}
              >
                <AlertTriangle
                  className="w-4 h-4"
                  style={{ color: "var(--red)" }}
                />
              </div>
            )}

            <h3
              className="font-semibold mb-2"
              style={{
                color: "var(--text-hi)",
                fontSize: 15,
                letterSpacing: "-0.015em",
              }}
            >
              {title}
            </h3>

            <p
              className="text-sm mb-5 leading-relaxed"
              style={{ color: "var(--text-md)" }}
            >
              {message}
            </p>

            <div className="flex gap-2.5">
              <button
                onClick={onCancel}
                className="flex-1 rounded-xl text-sm font-medium border transition-colors"
                style={{
                  background: "var(--bg-raised)",
                  borderColor: "var(--border-strong)",
                  color: "var(--text-md)",
                  minHeight: 44,
                }}
              >
                Cancel
              </button>

              <button
                onClick={onConfirm}
                className="flex-1 rounded-xl text-sm font-semibold"
                style={{
                  background: destructive ? "var(--red)" : "var(--brand)",
                  color: destructive ? "#fff" : "#0a0a0a",
                  minHeight: 44,
                }}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
