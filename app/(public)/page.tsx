"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, IndianRupee, TrendingUp, CheckCircle2, Shield, Zap } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function LandingPage() {
  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ background: "var(--bg)", color: "var(--text-hi)" }}
    >
      {/* ── Nav ─────────────────────────────────────────── */}
      <nav
        className="fixed inset-x-0 top-0 z-50 glass border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between" style={{ height: 52 }}>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center flex-none"
              style={{ background: "var(--brand)" }}
            >
              <IndianRupee className="w-3.5 h-3.5" style={{ color: "#0a0a0a" }} strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-sm" style={{ letterSpacing: "-0.025em" }}>Kharch</span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Link
              href="/sign-in"
              className="text-sm px-3 py-2 rounded-lg transition-colors"
              style={{ color: "var(--text-md)" }}
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="text-sm font-semibold px-3 py-2 rounded-lg ml-1"
              style={{ background: "var(--brand)", color: "#0a0a0a", minHeight: 36, display: "inline-flex", alignItems: "center" }}
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="pt-28 sm:pt-36 pb-12 sm:pb-20 px-4 sm:px-6">
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <div
            className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border mb-6 sm:mb-8"
            style={{ background: "var(--brand-dim)", borderColor: "var(--brand-border)", color: "var(--text-brand)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full flex-none" style={{ background: "var(--brand)" }} />
            Free · No credit card
          </div>

          <h1
            className="font-semibold leading-[1.08] mb-4 sm:mb-6"
            style={{
              fontSize: "clamp(32px, 8vw, 56px)",
              letterSpacing: "-0.04em",
              color: "var(--text-hi)",
            }}
          >
            Know where your<br />
            <span className="grad-brand">salary went.</span>
          </h1>

          <p
            className="mb-7 sm:mb-9 leading-relaxed"
            style={{
              fontSize: "clamp(14px, 2.5vw, 17px)",
              color: "var(--text-md)",
              maxWidth: 480,
            }}
          >
            Kharch gives you a clear monthly breakdown — fixed, savings, living — the moment your salary lands. No spreadsheets. No confusion.
          </p>

          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2.5">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 text-sm font-semibold px-5 rounded-xl"
              style={{ background: "var(--brand)", color: "#0a0a0a", minHeight: 48 }}
            >
              Start for free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center gap-2 text-sm font-medium px-5 rounded-xl border"
              style={{
                borderColor: "var(--border-strong)", color: "var(--text-md)",
                background: "var(--surface)", minHeight: 48,
              }}
            >
              Sign in
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Product preview ────────────────────────────────── */}
      <section className="px-4 sm:px-6 pb-14 sm:pb-20">
        <motion.div
          className="max-w-[340px] mx-auto"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
        >
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            {/* Header */}
            <div className="px-5 pt-5 pb-4 border-b" style={{ borderColor: "var(--border)" }}>
              <p className="label-caps mb-1">My Budget · Bengaluru</p>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="label-caps mb-0.5">Salary</p>
                  <p className="font-mono font-semibold text-xl" style={{ color: "var(--text-hi)", letterSpacing: "-0.04em" }}>
                    ₹44,800
                  </p>
                </div>
                <div className="text-right">
                  <p className="label-caps mb-0.5">Saved</p>
                  <p className="font-mono font-semibold text-xl grad-brand" style={{ letterSpacing: "-0.03em" }}>₹9,000</p>
                </div>
              </div>
            </div>
            {/* Bars */}
            <div className="px-5 py-4 space-y-3">
              {[
                { label: "Fixed & EMIs",    amt: "₹23,500", pct: 52, color: "#6366f1" },
                { label: "Savings",         amt: "₹9,000",  pct: 20, color: "#3ecf8e" },
                { label: "Living & buffer", amt: "₹12,300", pct: 28, color: "#fbbf24" },
              ].map((r, i) => (
                <div key={r.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span style={{ color: "var(--text-md)" }}>{r.label}</span>
                    <span className="font-mono font-medium" style={{ color: "var(--text-hi)" }}>{r.amt}</span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--overlay)" }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: r.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${r.pct}%` }}
                      transition={{ delay: 0.55 + i * 0.1, duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {/* Footer */}
            <div
              className="px-5 py-4 border-t flex items-center justify-between"
              style={{ borderColor: "var(--border)" }}
            >
              <div>
                <p className="label-caps mb-0.5">Savings rate</p>
                <p className="font-mono font-semibold text-lg" style={{ color: "#3ecf8e" }}>20%</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" style={{ color: "var(--brand)" }} />
                <span className="text-xs font-medium" style={{ color: "var(--text-md)" }}>5/7 done</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Features ───────────────────────────────────────── */}
      <section className="px-4 sm:px-6 pb-16 sm:pb-24 max-w-4xl mx-auto">
        <div className="mb-8 sm:mb-10">
          <p className="label-caps mb-2 sm:mb-3">Features</p>
          <h2
            className="font-semibold"
            style={{
              fontSize: "clamp(22px, 5vw, 30px)",
              color: "var(--text-hi)",
              letterSpacing: "-0.03em",
            }}
          >
            Everything you actually need
          </h2>
        </div>

        <div
          className="rounded-xl border overflow-hidden"
          style={{ borderColor: "var(--border)" }}
        >
          {[
            { icon: TrendingUp,   title: "Salary breakdown",  desc: "Fixed, savings, living — split automatically from your salary every month." },
            { icon: CheckCircle2, title: "Money-flow moves",  desc: "Interactive checklist that deducts each task from your balance in real time." },
            { icon: Shield,       title: "Emergency fund",    desc: "Track progress toward your safety net with a visual progress bar." },
            { icon: Zap,          title: "Auto-save",         desc: "Every change saves automatically. No save button. No lost data." },
            { icon: IndianRupee,  title: "Built for India",   desc: "Rupee-first, Indian number formatting, EMI-aware — not an afterthought." },
          ].map((f, i, arr) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="flex items-start gap-4 px-4 sm:px-6 py-4 sm:py-5"
                style={{
                  background: "var(--surface)",
                  borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-none mt-0.5"
                  style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}
                >
                  <Icon className="w-4 h-4" style={{ color: "var(--text-md)" }} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium mb-1" style={{ color: "var(--text-hi)" }}>{f.title}</p>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-md)" }}>{f.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="max-w-xl mx-auto text-center">
          <h2
            className="font-semibold mb-3"
            style={{
              fontSize: "clamp(22px, 5vw, 30px)",
              color: "var(--text-hi)",
              letterSpacing: "-0.03em",
            }}
          >
            Start tracking today
          </h2>
          <p className="text-sm mb-6 sm:mb-7" style={{ color: "var(--text-md)" }}>
            Free . No ads. No upsells. Just your money, clear as day.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 text-sm font-semibold px-6 rounded-xl"
            style={{ background: "var(--brand)", color: "#0a0a0a", minHeight: 48 }}
          >
            Create free account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex justify-center mt-7">
          <Link
            href="/install"
            className="text-sm"
            style={{ color: "var(--text-md)" }}
          >
            Install Kharch →
          </Link>
        </div>

      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t px-4 sm:px-6 py-5" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: "var(--brand)" }}>
              <IndianRupee className="w-3 h-3" style={{ color: "#0a0a0a" }} strokeWidth={2.5} />
            </div>
            <span className="text-sm font-medium" style={{ color: "var(--text-lo)" }}>Kharch</span>
          </div>
          <p className="text-xs" style={{ color: "var(--text-lo)" }}>Built with ♥ in India</p>
        </div>
      </footer>
    </div>
  );
}
