"use client";
import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Share2, Download, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fmt, fmtShort } from "@/lib/utils";

interface Props {
  monthLabel: string; savings: number; salary: number;
  fixed: number; living: number; savingsRate: number;
  checksDone: number; checksTotal: number; currency: string;
}

export function ShareCard({
  monthLabel, savings, salary, fixed, living,
  savingsRate, checksDone, checksTotal, currency,
}: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  async function capture(share = false) {
    if (!ref.current) return;
    setBusy(true);
    try {
      const { default: h2c } = await import("html2canvas");
      const canvas = await h2c(ref.current, {
        backgroundColor: "#0a0a0a", scale: 2, useCORS: true, logging: false,
      });
      if (share && navigator.share) {
        canvas.toBlob(async blob => {
          if (!blob) return;
          const file = new File([blob], `kharch-${monthLabel}.png`, { type: "image/png" });
          try { await navigator.share({ files: [file], title: `Kharch — ${monthLabel}` }); }
          catch { await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]); }
        });
      } else {
        const a = document.createElement("a");
        a.download = `kharch-${monthLabel.replace(/\s/g, "-")}.png`;
        a.href = canvas.toDataURL("image/png");
        a.click();
      }
    } catch { /* silent */ }
    finally { setBusy(false); }
  }

  const rateColor = savingsRate >= 20 ? "#3ecf8e" : savingsRate >= 10 ? "#fbbf24" : "#f87171";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg border transition-colors"
        style={{
          borderColor: "var(--border-strong)",
          color: "var(--text-md)",
          background: "transparent",
          padding: "6px 10px",
          minHeight: 36,
          fontSize: 12,
          fontWeight: 500,
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--text-lo)")}
        onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border-strong)")}
      >
        <Share2 className="w-3.5 h-3.5" />
        <span className="hidden xs:inline">Share</span>
      </button>

      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
            className="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="w-full mx-4"
              style={{ maxWidth: 320 }}
              initial={{ scale: 0.96, y: 8 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.97 }}
              transition={{ duration: 0.14 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Shareable card */}
              <div
                ref={ref}
                style={{
                  background: "#0a0a0a", borderRadius: 16, padding: 24,
                  border: "1px solid rgba(255,255,255,0.08)",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                  <div style={{ width: 28, height: 28, background: "#3ecf8e", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ color: "#0a0a0a", fontSize: 14, fontWeight: 700 }}>₹</span>
                  </div>
                  <span style={{ color: "#ededed", fontWeight: 600, fontSize: 14, letterSpacing: "-0.025em" }}>Kharch</span>
                  <span style={{ marginLeft: "auto", color: "#555", fontSize: 11 }}>{monthLabel}</span>
                </div>
                <div style={{ marginBottom: 18 }}>
                  <div style={{ color: "#555", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Saved this month</div>
                  <div style={{ color: "#3ecf8e", fontSize: 32, fontWeight: 700, fontFamily: "monospace", letterSpacing: "-0.03em" }}>{fmt(savings, currency)}</div>
                </div>
                {[
                  { label: "Fixed",   value: fixed,   color: "#6366f1" },
                  { label: "Savings", value: savings, color: "#3ecf8e" },
                  { label: "Living",  value: living,  color: "#fbbf24" },
                ].map(row => (
                  <div key={row.label} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ color: "#a1a1a1", fontSize: 11 }}>{row.label}</span>
                      <span style={{ color: "#ededed", fontSize: 11, fontFamily: "monospace", fontWeight: 600 }}>{fmtShort(row.value, currency)}</span>
                    </div>
                    <div style={{ height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 3 }}>
                      <div style={{ height: "100%", width: `${salary ? Math.min(100, (row.value / salary) * 100) : 0}%`, background: row.color, borderRadius: 3 }} />
                    </div>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                  <div>
                    <div style={{ color: "#555", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em" }}>Rate</div>
                    <div style={{ color: rateColor, fontSize: 20, fontWeight: 700 }}>{savingsRate}%</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "#555", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em" }}>Tasks</div>
                    <div style={{ color: "#ededed", fontSize: 20, fontWeight: 700 }}>{checksDone}/{checksTotal}</div>
                  </div>
                </div>
              </div>

              {/* Action buttons — 44px min-height */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-xl flex items-center justify-center border flex-none transition-colors"
                  style={{
                    width: 44, height: 44,
                    background: "var(--surface)", borderColor: "var(--border-strong)",
                    color: "var(--text-lo)",
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={() => capture(false)} disabled={busy}
                  className="flex-1 rounded-xl flex items-center justify-center gap-1.5 text-sm font-medium border transition-colors"
                  style={{
                    background: "var(--surface)", borderColor: "var(--border-strong)",
                    color: "var(--text-hi)", minHeight: 44,
                  }}
                >
                  {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  Download
                </button>
                <button
                  onClick={() => capture(true)} disabled={busy}
                  className="flex-1 rounded-xl flex items-center justify-center gap-1.5 text-sm font-semibold"
                  style={{ background: "var(--brand)", color: "#0a0a0a", minHeight: 44 }}
                >
                  <Share2 className="w-3.5 h-3.5" /> Share
                </button>
              </div>
            </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
