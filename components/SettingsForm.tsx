"use client";
import { useState } from "react";
import { Save, Check, Loader2, IndianRupee, MapPin, Shield, TrendingUp, CalendarDays, Smartphone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

interface Props {
  initial: {
    currency: string; city_label: string;
    ef_target: number; salary: number; salary_day?: number | null;
  };
}

type SaveState = "idle" | "saving" | "saved" | "error";

export function SettingsForm({ initial }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [currency,  setCurrency]  = useState(initial.currency);
  const [cityLabel, setCityLabel] = useState(initial.city_label);
  const [efTarget,  setEfTarget]  = useState(initial.ef_target);
  const [salary,    setSalary]    = useState(initial.salary);
  const [salaryDay, setSalaryDay] = useState<number | "">(initial.salary_day ?? "");
  const [saveState, setSaveState] = useState<SaveState>("idle");

  async function handleSave() {
    setSaveState("saving");
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currency, city_label: cityLabel, ef_target: efTarget, salary,
          salary_day: salaryDay === "" ? null : Number(salaryDay),
        }),
      });
      if (!res.ok) throw new Error();
      setSaveState("saved");
      toast("Settings saved", "success");
      setTimeout(() => { setSaveState("idle"); router.refresh(); }, 1800);
    } catch {
      setSaveState("error");
      toast("Something went wrong", "error");
      setTimeout(() => setSaveState("idle"), 3000);
    }
  }

  // Shared input/container styles
  const inputWrap: React.CSSProperties = {
    background: "var(--bg-raised)",
    borderColor: "var(--border-strong)",
  };
  const inputText: React.CSSProperties = {
    color: "var(--text-hi)",
    background: "transparent",
  };

  const rows = [
    {
      icon: IndianRupee, title: "Currency", desc: "Symbol shown next to every amount",
      input: (
        <input
          type="text" value={currency}
          onChange={e => setCurrency(e.target.value)} maxLength={3}
          className="w-16 text-center rounded-lg px-3 py-2.5 font-mono font-semibold border focus:outline-none"
          style={{ ...inputWrap, ...inputText, minHeight: 44 }}
          onFocus={e => (e.currentTarget.style.borderColor = "var(--brand)")}
          onBlur={e => (e.currentTarget.style.borderColor = "var(--border-strong)")}
        />
      ),
    },
    {
      icon: MapPin, title: "Budget label", desc: "Shown at the top of your month view",
      input: (
        <input
          type="text" value={cityLabel}
          onChange={e => setCityLabel(e.target.value)}
          placeholder="e.g. Bengaluru · PG"
          className="w-full sm:w-[200px] rounded-lg px-3 py-2.5 text-sm border focus:outline-none"
          style={{ ...inputWrap, ...inputText, minHeight: 44 }}
          onFocus={e => (e.currentTarget.style.borderColor = "var(--brand)")}
          onBlur={e => (e.currentTarget.style.borderColor = "var(--border-strong)")}
        />
      ),
    },
    {
      icon: TrendingUp, title: "Default salary", desc: "Pre-filled when you open a new month",
      input: (
        <div
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2.5 border"
          style={{ ...inputWrap, minHeight: 44 }}
        >
          <span className="text-sm font-medium" style={{ color: "var(--text-lo)" }}>{currency}</span>
          <input
            type="number" value={salary}
            onChange={e => setSalary(parseFloat(e.target.value) || 0)}
            inputMode="numeric"
            className="w-24 sm:w-28 text-right font-mono font-semibold text-sm focus:outline-none"
            style={inputText}
            step={100}
          />
        </div>
      ),
    },
    {
      icon: Shield, title: "Emergency fund target", desc: "Your goal amount for the emergency fund",
      input: (
        <div
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2.5 border"
          style={{ ...inputWrap, minHeight: 44 }}
        >
          <span className="text-sm font-medium" style={{ color: "var(--text-lo)" }}>{currency}</span>
          <input
            type="number" value={efTarget}
            onChange={e => setEfTarget(parseFloat(e.target.value) || 0)}
            inputMode="numeric"
            className="w-24 sm:w-28 text-right font-mono font-semibold text-sm focus:outline-none"
            style={inputText}
            step={5000}
          />
        </div>
      ),
    },
    {
      icon: CalendarDays, title: "Salary day", desc: "Day of month your salary arrives (1–31)",
      input: (
        <div
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2.5 border"
          style={{ ...inputWrap, minHeight: 44, width: 88 }}
        >
          <input
            type="number" value={salaryDay}
            onChange={e => {
              const v = parseInt(e.target.value);
              setSalaryDay(isNaN(v) ? "" : Math.min(31, Math.max(1, v)));
            }}
            placeholder="1" min={1} max={31}
            inputMode="numeric"
            className="w-full text-right font-mono font-semibold text-sm focus:outline-none"
            style={inputText}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        {rows.map((row, i) => {
          const Icon = row.icon;
          return (
            <div
              key={row.title}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-5 py-4"
              style={{
                borderBottom: i < rows.length - 1 ? "1px solid var(--border)" : undefined,
              }}
            >
              {/* Label */}
              <div className="flex items-start gap-3">
                <Icon className="w-4 h-4 mt-0.5 flex-none" style={{ color: "var(--text-lo)" }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-hi)" }}>
                    {row.title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-lo)" }}>
                    {row.desc}
                  </p>
                </div>
              </div>
              {/* Input — full width on mobile */}
              <div className="pl-7 sm:pl-0 flex-none">{row.input}</div>
            </div>
          );
        })}
      </div>

      <button
        onClick={handleSave}
        disabled={saveState === "saving"}
        className="mt-4 w-full rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
        style={{ background: "var(--brand)", color: "#0a0a0a", minHeight: 48 }}
      >
        {saveState === "saving" && <><Loader2 className="w-4 h-4 animate-spin" />Saving…</>}
        {saveState === "saved"  && <><Check   className="w-4 h-4" />Saved</>}
        {saveState === "error"  && "Try again"}
        {saveState === "idle"   && <><Save    className="w-4 h-4" />Save settings</>}
      </button>

      <Link
        href="/install"
        className="mt-4 rounded-xl border flex items-center gap-3 px-4 sm:px-5 py-4 transition-colors"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-none"
          style={{
            background: "var(--brand-dim)",
            color: "var(--text-brand)",
          }}
        >
          <Smartphone className="w-4 h-4" />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className="text-sm font-medium"
            style={{ color: "var(--text-hi)" }}
          >
            Install Kharch
          </p>
          <p
            className="text-xs mt-0.5"
            style={{ color: "var(--text-lo)" }}
          >
            Add Kharch to your home screen for quick access
          </p>
        </div>

        <span
          className="text-sm flex-none"
          style={{ color: "var(--text-md)" }}
        >
          →
        </span>
      </Link>

    </div>
  );
}
