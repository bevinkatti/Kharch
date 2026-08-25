"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, IndianRupee, MapPin, Shield, CalendarDays, Check } from "lucide-react";

const steps = [
  { id: "salary",     icon: IndianRupee,  title: "What's your monthly salary?",        desc: "Used to calculate your savings and expense split." },
  { id: "label",      icon: MapPin,       title: "Give your budget a name",             desc: "Something like \"Bengaluru · PG\" or \"Delhi · WFH\"." },
  { id: "ef",         icon: Shield,       title: "Emergency fund goal",                 desc: "We'll track your progress toward this target." },
  { id: "salary_day", icon: CalendarDays, title: "When does your salary arrive?",       desc: "Day of the month (1–31). We'll remind you to move savings first." },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step,      setStep]      = useState(0);
  const [salary,    setSalary]    = useState(44800);
  const [label,     setLabel]     = useState("");
  const [efTarget,  setEfTarget]  = useState(100000);
  const [salaryDay, setSalaryDay] = useState<number | "">(1);
  const [saving,    setSaving]    = useState(false);

  const isLast = step === steps.length - 1;

  async function next() {
    if (!isLast) { setStep(s => s + 1); return; }
    setSaving(true);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currency: "₹", city_label: label || "My Budget",
        ef_target: efTarget, salary,
        salary_day: salaryDay === "" ? null : Number(salaryDay),
      }),
    });
    router.replace("/dashboard");
  }

  const inputBase: React.CSSProperties = {
    background: "var(--bg-raised)",
    borderColor: "var(--border-strong)",
    color: "var(--text-hi)",
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
      style={{ background: "var(--bg)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 mb-12">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--brand)" }}>
          <IndianRupee className="w-3.5 h-3.5" style={{ color: "#0a0a0a" }} strokeWidth={2.5} />
        </div>
        <span className="font-semibold" style={{ color: "var(--text-hi)", letterSpacing: "-0.025em" }}>Kharch</span>
      </div>

      {/* Progress */}
      <div className="flex gap-1.5 mb-10">
        {steps.map((_, i) => (
          <div
            key={i}
            className="h-0.5 rounded-full transition-all duration-300"
            style={{
              width: i === step ? 28 : 12,
              background: i < step ? "var(--brand)" : i === step ? "var(--text-hi)" : "var(--overlay)",
            }}
          />
        ))}
      </div>

      {/* Card */}
      <div className="w-full" style={{ maxWidth: 380 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.16 }}
            className="rounded-2xl border p-6 sm:p-7 mb-3"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            {(() => {
              const Icon = steps[step].icon;
              return (
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-5 border"
                  style={{ background: "var(--surface-raised)", borderColor: "var(--border-strong)" }}
                >
                  <Icon className="w-4 h-4" style={{ color: "var(--text-md)" }} />
                </div>
              );
            })()}

            <p className="label-caps mb-1.5">Step {step + 1} of {steps.length}</p>
            <h2
              className="font-semibold mb-1.5"
              style={{ color: "var(--text-hi)", fontSize: 19, letterSpacing: "-0.025em" }}
            >
              {steps[step].title}
            </h2>
            <p className="text-sm mb-6 leading-relaxed" style={{ color: "var(--text-md)" }}>
              {steps[step].desc}
            </p>

            {/* Step 0 — salary */}
            {step === 0 && (
              <div className="flex items-center gap-2 rounded-xl border px-4 py-3" style={inputBase}>
                <span className="text-lg font-medium" style={{ color: "var(--text-lo)" }}>₹</span>
                <input
                  type="number" value={salary}
                  onChange={e => setSalary(parseFloat(e.target.value) || 0)}
                  className="flex-1 bg-transparent font-mono font-semibold focus:outline-none"
                  style={{ color: "var(--text-hi)", fontSize: 24, letterSpacing: "-0.04em" }}
                  inputMode="numeric" autoFocus step={100}
                />
              </div>
            )}

            {/* Step 1 — label */}
            {step === 1 && (
              <input
                type="text" value={label}
                onChange={e => setLabel(e.target.value)}
                placeholder="e.g. Bengaluru · PG Life"
                className="w-full rounded-xl border px-4 focus:outline-none"
                style={{ ...inputBase, minHeight: 48, fontSize: 15 }}
                autoFocus
                onFocus={e => (e.currentTarget.style.borderColor = "var(--brand)")}
                onBlur={e => (e.currentTarget.style.borderColor = "var(--border-strong)")}
              />
            )}

            {/* Step 2 — EF */}
            {step === 2 && (
              <div className="space-y-2">
                {[50000, 100000, 200000].map(v => (
                  <button
                    key={v}
                    onClick={() => setEfTarget(v)}
                    className="w-full flex items-center justify-between px-4 rounded-xl border text-sm transition-colors"
                    style={{
                      background:  efTarget === v ? "var(--brand-dim)"   : "var(--bg-raised)",
                      borderColor: efTarget === v ? "var(--brand-border)" : "var(--border-strong)",
                      color:       efTarget === v ? "var(--text-brand)"   : "var(--text-md)",
                      minHeight: 48,
                    }}
                  >
                    <span className="font-mono font-medium">₹{v.toLocaleString("en-IN")}</span>
                    {efTarget === v && <Check className="w-4 h-4" style={{ color: "var(--brand)" }} />}
                  </button>
                ))}
                <div className="flex items-center gap-2 rounded-xl border px-4" style={{ ...inputBase, minHeight: 48 }}>
                  <span className="text-sm" style={{ color: "var(--text-lo)" }}>Custom ₹</span>
                  <input
                    type="number" value={efTarget}
                    onChange={e => setEfTarget(parseFloat(e.target.value) || 0)}
                    className="flex-1 bg-transparent font-mono font-semibold text-sm focus:outline-none text-right"
                    style={{ color: "var(--text-hi)" }}
                    inputMode="numeric" step={10000}
                  />
                </div>
              </div>
            )}

            {/* Step 3 — salary day */}
            {step === 3 && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-xl border px-4" style={{ ...inputBase, minHeight: 56 }}>
                  <span className="text-sm font-medium" style={{ color: "var(--text-md)" }}>Day</span>
                  <input
                    type="number" value={salaryDay}
                    onChange={e => {
                      const v = parseInt(e.target.value);
                      setSalaryDay(isNaN(v) ? "" : Math.min(31, Math.max(1, v)));
                    }}
                    placeholder="1" min={1} max={31}
                    className="flex-1 bg-transparent font-mono font-semibold focus:outline-none text-right"
                    style={{ color: "var(--text-hi)", fontSize: 22, letterSpacing: "-0.03em" }}
                    inputMode="numeric" autoFocus
                  />
                </div>
                <p className="text-xs" style={{ color: "var(--text-lo)" }}>
                  You'll see a banner on salary day reminding you to move savings first.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* CTA */}
        <button
          onClick={next}
          disabled={saving}
          className="w-full rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
          style={{ background: "var(--brand)", color: "#0a0a0a", minHeight: 52 }}
        >
          {saving ? "Setting up…" : isLast ? "Open my dashboard" : "Continue"}
          {!saving && <ArrowRight className="w-4 h-4" />}
        </button>

        {step > 0 && (
          <button
            onClick={() => setStep(s => s - 1)}
            className="w-full mt-2 text-sm transition-colors"
            style={{ color: "var(--text-lo)", minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--text-md)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-lo)")}
          >
            Back
          </button>
        )}
      </div>
    </div>
  );
}
