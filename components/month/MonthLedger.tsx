"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, Trophy, TrendingUp, Loader2,
} from "lucide-react";
import {
  cn, fmt, fmtK, monthKeyToLabel, calcTotals, calcMonthSaved,
  syncCheckItemsWithExpenses,
} from "@/lib/utils";
import type { CheckItem, Expense, UserSettings, Month } from "@/types";
import { DonutChart }           from "./DonutChart";
import { SavingsRateBadge }     from "./SavingsRateBadge";
import { ShareCard }            from "./ShareCard";
import { MonthTabs }            from "./MonthTabs";
import { MoneyFlowChecklist }   from "./MoneyFlowChecklist";
import { useToast }             from "@/components/ui/Toast";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

interface Props {
  monthKey: string;
  initialMonth: Month | null;
  initialExpenses: Expense[];
  settings: UserSettings;
  isNew: boolean;
  prevMonthSaved?: number | null;
  prevMonthLabel?: string | null;
  loggedKeys: Set<string>;
}

type SaveState = "idle" | "saving" | "saved" | "error";

export function MonthLedger({
  monthKey, initialMonth, initialExpenses, settings, isNew,
  prevMonthSaved, prevMonthLabel, loggedKeys,
}: Props) {
  const { full: monthLabel } = monthKeyToLabel(monthKey);
  const CUR = settings.currency || "₹";
  const { toast } = useToast();

  const [salary,   setSalary]   = useState(initialMonth?.salary ?? settings.salary ?? 44800);
  const [expenses] = useState<Expense[]>(initialExpenses);

  const [initialMoveState] = useState(() =>
    syncCheckItemsWithExpenses(
      initialExpenses,
      initialMonth?.check_items ?? [],
      initialMonth?.checks ?? [],
    )
  );
  const [checks, setChecks] = useState<boolean[]>(initialMoveState.checks);
  const [checkItems, setCheckItems] = useState<CheckItem[]>(initialMoveState.items);
  const [bonus,     setBonus]     = useState(initialMonth?.bonus     ?? 0);
  const [notes,     setNotes]     = useState(initialMonth?.notes     ?? "");
  const [efAmount,  setEfAmount]  = useState(initialMonth?.ef_amount ?? 0);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [nudgeDismissed, setNudgeDismissed] = useState(false);

  const salaryRef = useRef<HTMLInputElement>(null);
  const timerRef  = useRef<NodeJS.Timeout | null>(null);

  const { fixed, savings, buffer, livingTotal } = calcTotals(expenses, salary);
  const total      = fixed + savings + livingTotal;
  const fixedPct   = total ? (fixed       / total * 100) : 33;
  const savingsPct = total ? (savings     / total * 100) : 20;
  const livingPct  = total ? (livingTotal / total * 100) : 47;

  const checksDone = checks.filter(Boolean).length;
  const allDone    = checksDone === checks.length && checks.length > 0;
  const monthSaved = calcMonthSaved(
    {
      ...(initialMonth ?? {
        id: "",
        clerk_id: "",
        month_key: monthKey,
        salary,
        bonus,
        ef_amount: efAmount,
        notes,
        checks,
        check_items: checkItems,
        created_at: "",
        updated_at: "",
      }),
      salary,
      bonus,
      ef_amount: efAmount,
      notes,
      checks,
      check_items: checkItems,
    },
    expenses,
  );
  const efPct       = settings.ef_target
    ? Math.min(100, (efAmount / settings.ef_target) * 100) : 0;
  const savingsRate = salary ? Math.round((savings / salary) * 100) : 0;
  const showNudge   = !!prevMonthSaved && !allDone && !nudgeDismissed;

  useEffect(() => {
    if (allDone) setNudgeDismissed(true);
  }, [allDone]);

  useEffect(() => {
    if (localStorage.getItem(`kharch-nudge-${monthKey}`) === "1") setNudgeDismissed(true);
  }, [monthKey]);

  function dismissNudge() {
    setNudgeDismissed(true);
    localStorage.setItem(`kharch-nudge-${monthKey}`, "1");
  }

  const scheduleSave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSaveState("saving");
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/months", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            month_key: monthKey,
            salary,
            bonus,
            ef_amount: efAmount,
            notes,
            checks,
            check_items: checkItems,
          }),
        });
        if (!res.ok) throw new Error();
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 2000);
      } catch {
        setSaveState("error");
        toast("Auto-save failed", "error");
        setTimeout(() => setSaveState("idle"), 3000);
      }
    }, 800);
  }, [monthKey, salary, bonus, efAmount, notes, checks, checkItems, toast]);

  useEffect(() => { scheduleSave(); },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [salary, bonus, efAmount, notes, checks, checkItems]);
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  function handleItemsChange(items: CheckItem[]) {
    setCheckItems(items);
  }

  function handleChecksChange(next: boolean[]) {
    setChecks(next);
    // Auto-update EF when EF item is toggled
    const efIdx = checkItems.findIndex(it =>
      it.label.toLowerCase().includes("emergency fund") && it.amount > 0
    );
    if (efIdx !== -1) {
      if (next[efIdx] && !checks[efIdx]) {
        setEfAmount(prev => prev + (checkItems[efIdx]?.amount ?? 0));
      } else if (!next[efIdx] && checks[efIdx]) {
        setEfAmount(prev => Math.max(0, prev - (checkItems[efIdx]?.amount ?? 0)));
      }
    }
  }

  useKeyboardShortcuts({
    onAddExpense: () => {},
    onFocusSalary: () => salaryRef.current?.focus(),
  });

  const Hr = () => <div className="h-px" style={{ background: "var(--border)" }} />;

  return (
    <div
      className="page-container-month w-full min-w-0 mx-auto px-4 sm:px-6 md:px-8 py-5 sm:py-8 space-y-4 sm:space-y-6"
      style={{ maxWidth: 640 }}
    >
      {/* Month tabs */}
      <MonthTabs currentMonthKey={monthKey} loggedKeys={loggedKeys} />

      {/* Comparison nudge */}
      <AnimatePresence>
        {showNudge && prevMonthSaved != null && prevMonthLabel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div
              className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm border"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <p className="min-w-0 leading-snug text-xs sm:text-sm" style={{ color: "var(--text-md)" }}>
                <span style={{ color: "var(--text-hi)", fontWeight: 500 }}>{prevMonthLabel}</span>
                {" — "}
                <span style={{ color: "var(--brand)", fontWeight: 600 }}>
                  {fmt(prevMonthSaved, CUR)}
                </span> saved
                {monthSaved > 0 && monthSaved >= prevMonthSaved && (
                  <> · <span style={{ color: "var(--brand)" }}>+{fmt(monthSaved - prevMonthSaved, CUR)} ahead</span></>
                )}
                {monthSaved > 0 && monthSaved < prevMonthSaved && (
                  <> · <span style={{ color: "var(--red)" }}>{fmt(prevMonthSaved - monthSaved, CUR)} behind</span></>
                )}
              </p>
              <button
                onClick={dismissNudge}
                style={{ color: "var(--text-lo)", flexShrink: 0, minWidth: 24, minHeight: 24 }}
              >✕</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fresh month banner */}
      {isNew && (
        <div
          className="text-sm px-4 py-3 rounded-xl border"
          style={{ background: "var(--surface)", borderColor: "var(--border-strong)", color: "var(--text-md)" }}
        >
          Set your expenses on the Dashboard and mark your moves done here.
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="label-caps mb-1">{settings.city_label}</p>
          <h1
            className="month-h1 font-semibold"
            style={{ color: "var(--text-hi)", letterSpacing: "-0.04em", fontSize: 28 }}
          >
            {monthLabel}
          </h1>
        </div>
        <div className="flex items-center gap-2 pt-1 flex-none">
          <SaveBadge state={saveState} />
          <ShareCard
            monthLabel={monthLabel} savings={savings} salary={salary}
            fixed={fixed} living={livingTotal} savingsRate={savingsRate}
            checksDone={checksDone} checksTotal={checks.length} currency={CUR}
          />
        </div>
      </div>

      {/* ── Overview card ── */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        {/* Salary row */}
        <div className="salary-row px-4 sm:px-5 pt-4 sm:pt-5 pb-4 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="label-caps mb-1">Monthly salary</p>
            <div className="flex items-baseline gap-1">
              <span
                className="font-medium flex-none"
                style={{ color: "var(--text-lo)", fontSize: 17 }}
              >
                {CUR}
              </span>
              <input
                ref={salaryRef}
                type="number"
                value={salary}
                onChange={e => setSalary(parseFloat(e.target.value) || 0)}
                className="salary-input bg-transparent font-mono font-semibold focus:outline-none"
                style={{
                  color: "var(--text-hi)",
                  letterSpacing: "-0.04em",
                  fontSize: 30,
                  width: 160,
                  maxWidth: "100%",
                }}
                step={100}
                inputMode="numeric"
                title="S to focus"
              />
            </div>
          </div>
          <div className="salary-saved-block text-right pt-0.5 flex-none">
            <p className="label-caps mb-1">Saved</p>
            <p
              className={cn("font-mono font-semibold", monthSaved > 0 ? "grad-brand" : "")}
              style={{
                color: monthSaved > 0 ? undefined : "var(--text-lo)",
                letterSpacing: "-0.03em",
                fontSize: 18,
              }}
            >
              {fmtK(monthSaved, CUR)}
            </p>
          </div>
        </div>

        <Hr />

        {/* Donut + legend */}
        <div
          className="donut-legend-row px-4 sm:px-5 py-4 sm:py-5 flex items-center"
          style={{ gap: 20 }}
        >
          <DonutChart
            fixed={fixedPct} savings={savingsPct} living={livingPct}
            center={fmtK(savings, CUR)}
          />
          <div className="flex-1 min-w-0 space-y-3">
            <LegendRow dot="#6366f1" label="Fixed & EMIs"    value={fmt(fixed, CUR)} />
            <LegendRow dot="#3ecf8e" label="Savings"         value={fmt(savings, CUR)} />
            <LegendRow dot="#fbbf24" label="Living & buffer" value={fmt(livingTotal, CUR)} />
          </div>
        </div>

        {/* Savings rate badge */}
        {salary > 0 && savings > 0 && (
          <>
            <Hr />
            <div className="px-4 sm:px-5 py-3">
              <SavingsRateBadge savings={savings} salary={salary} />
            </div>
          </>
        )}
      </div>

      {/* ── Notes ── */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="px-4 sm:px-5 py-3.5 border-b" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm font-medium" style={{ color: "var(--text-hi)" }}>Notes</p>
        </div>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Anything worth noting this month…"
          rows={3}
          className="notes-textarea w-full px-4 sm:px-5 py-4 bg-transparent text-sm resize-none focus:outline-none leading-relaxed"
          style={{ color: "var(--text-hi)", minHeight: 88 }}
        />
      </div>

      {/* ── Money-flow checklist ── */}
      <MoneyFlowChecklist
        salary={salary}
        currency={CUR}
        items={checkItems}
        checks={checks}
        efAmount={efAmount}
        onItemsChange={handleItemsChange}
        onChecksChange={handleChecksChange}
      />

      {/* ── Reward ── */}
      <motion.div
        animate={{ opacity: allDone ? 1 : 0.4 }}
        transition={{ duration: 0.3 }}
        className="rounded-xl border flex items-center gap-4 px-4 sm:px-5 py-4"
        style={{
          background: allDone ? "var(--brand-dim)" : "var(--surface)",
          borderColor: allDone ? "var(--brand-border)" : "var(--border)",        }}
      >
        <Trophy
          className="w-5 h-5 flex-none"
          style={{ color: allDone ? "var(--brand)" : "var(--text-lo)" }}
        />
        <div className="flex-1 min-w-0">
          <p className="label-caps mb-0.5">
            {allDone ? "Month closed" : "Complete all moves to unlock"}
          </p>
          <p
            className="font-mono font-semibold"
            style={{ color: "var(--text-hi)", letterSpacing: "-0.03em", fontSize: 20 }}
          >
            {fmt(monthSaved, CUR)}
          </p>
        </div>
        {allDone && <span className="text-xl flex-none">🎉</span>}
      </motion.div>

      {/* ── Emergency fund ── */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div
          className="px-4 sm:px-5 py-3.5 flex items-center justify-between border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="text-sm font-medium" style={{ color: "var(--text-hi)" }}>Emergency fund</p>
          <span className="font-mono text-xs font-medium" style={{ color: "var(--brand)" }}>
            {Math.round(efPct)}%
          </span>
        </div>

        <div className="px-4 sm:px-5 py-4 space-y-3">
          <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--overlay)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: "var(--brand)" }}
              animate={{ width: `${efPct}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between text-xs" style={{ color: "var(--text-lo)" }}>
            <span className="font-mono">{fmt(efAmount, CUR)}</span>
            <span>target {fmt(settings.ef_target, CUR)}</span>
          </div>
          <div className="flex items-center justify-between pt-1 gap-3">
            <span className="text-sm" style={{ color: "var(--text-md)" }}>Current amount</span>
            <div
              className="flex items-center gap-1 rounded-md px-3 py-2 flex-none"
              style={{ background: "var(--bg-raised)" }}
            >
              <span className="text-sm" style={{ color: "var(--text-lo)" }}>{CUR}</span>
              <input
                type="number"
                value={efAmount || ""}
                onChange={e => setEfAmount(parseFloat(e.target.value) || 0)}
                placeholder="0"
                inputMode="numeric"
                className="text-right bg-transparent font-mono font-semibold text-sm focus:outline-none"
                style={{ color: "var(--text-hi)", width: 80 }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function LegendRow({ dot, label, value }: { dot: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full flex-none" style={{ background: dot }} />
      <span className="legend-label flex-1 min-w-0 text-sm" style={{ color: "var(--text-md)" }}>{label}</span>
      <span className="legend-value font-mono text-sm font-medium flex-none" style={{ color: "var(--text-hi)" }}>{value}</span>
    </div>
  );
}

function SaveBadge({ state }: { state: SaveState }) {
  return (
    <AnimatePresence mode="wait">
      {state === "saving" && (
        <motion.span key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-lo)" }}>
          <Loader2 className="w-3 h-3 animate-spin" />
          <span className="hidden sm:inline">Saving</span>
        </motion.span>
      )}
      {state === "saved" && (
        <motion.span key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="flex items-center gap-1.5 text-xs" style={{ color: "var(--brand)" }}>
          <Check className="w-3 h-3" />
          <span className="hidden sm:inline">Saved</span>
        </motion.span>
      )}
      {state === "error" && (
        <motion.span key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="text-xs" style={{ color: "var(--red)" }}>
          Failed
        </motion.span>
      )}
    </AnimatePresence>
  );
}
