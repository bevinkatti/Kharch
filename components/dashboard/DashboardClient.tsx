"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight, TrendingUp, Calendar, Flame, Target, Wallet,
  Check, CheckCircle2, Plus, Pencil, Trash2, GripVertical,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext, DragEndEvent, PointerSensor, TouchSensor,
  useSensor, useSensors, closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useCountUp } from "@/hooks/useCountUp";
import { SavingsChart } from "@/components/charts/SavingsChart";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { fmtShort, fmt, calcTotals } from "@/lib/utils";
import type { MonthSummary, YearStats, Expense, Month, UserSettings } from "@/types";

interface Props {
  firstName: string;
  currency: string;
  stats: YearStats;
  summaries: MonthSummary[];
  chartData: { label: string; saved: number; salary: number }[];
  showSalaryBanner: boolean;
  currentMonthKey: string;
  currentMonth: Month | null;
  currentMonthExpenses: Expense[];
  settings: UserSettings;
}

type SaveState = "idle" | "saving" | "saved" | "error";

export function DashboardClient({
  firstName, currency, stats, summaries, chartData, showSalaryBanner,
  currentMonthKey, currentMonth, currentMonthExpenses, settings,
}: Props) {
  const CUR = currency;
  const { toast } = useToast();
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const monthKey = currentMonthKey;

  // ── Single source of truth: current month state ────────────────────
  // Dashboard owns salary + Expenses. Monthly Moves is owned by This month.
  const [salary,   setSalary]   = useState(currentMonth?.salary ?? settings.salary ?? 44800);
  const [expenses, setExpenses] = useState<Expense[]>(currentMonthExpenses);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 150, tolerance: 8 } }),
  );

  useEffect(() => {
    if (localStorage.getItem(`kharch-salary-${monthKey}`) === "1") setBannerDismissed(true);
  }, [monthKey]);

  function dismissBanner() {
    setBannerDismissed(true);
    localStorage.setItem(`kharch-salary-${monthKey}`, "1");
  }

  // ── Auto-save ──────────────────────────────────────────────────────
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
            expenses: expenses.map((e, i) => ({
              id: e.id,
              label: e.label,
              category: e.category,
              amount: e.amount,
              sort_order: i,
            })),
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
  }, [monthKey, salary, expenses, toast]);

  useEffect(() => { scheduleSave(); },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [salary, expenses]);
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  // ── Expense actions ────────────────────────────────────────────────
  function addExpense() {
    setExpenses(prev => [...prev, {
      id: `new-${Date.now()}`, month_id: "", clerk_id: "",
      label: "New expense", category: "living", amount: 0,
      sort_order: prev.length, created_at: "",
    }]);
  }

  function updateExpense(id: string, field: keyof Expense, value: string | number) {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  }

  function removeExpense() {
    if (!deleteTarget) return;
    setExpenses(prev => prev.filter(e => e.id !== deleteTarget));
    setDeleteTarget(null);
    toast("Removed", "info");
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setExpenses(prev => {
        const oi = prev.findIndex(e => e.id === active.id);
        const ni = prev.findIndex(e => e.id === over.id);
        return arrayMove(prev, oi, ni);
      });
    }
  }

  const { fixed, savings, buffer, livingTotal } = calcTotals(expenses, salary);
  const hasData = stats.months_logged > 0;

  return (
    <div
      className="page-container-dashboard w-full min-w-0 mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-10 space-y-6 sm:space-y-10"
      style={{ maxWidth: 860 }}
    >

      {/* Salary day nudge */}
      {showSalaryBanner && !bannerDismissed && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start sm:items-center justify-between gap-3 px-4 py-3 rounded-xl border"
          style={{ background: "var(--brand-dim)", borderColor: "var(--brand-border)" }}
        >
          <p className="text-sm leading-snug" style={{ color: "var(--text-hi)" }}>
            💸 <strong>Salary day.</strong> Move your savings before anything else.
          </p>
          <button
            onClick={dismissBanner}
            className="text-xs font-medium px-3 py-2 rounded-lg flex-none transition-opacity hover:opacity-70"
            style={{ color: "var(--text-brand)", background: "rgba(0,0,0,0.1)", minHeight: 36 }}
          >
            Dismiss
          </button>
        </motion.div>
      )}

      {/* ── Page header ── */}
      <div className="flex min-w-0 items-end justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="label-caps mb-1.5">Overview</p>
          <h1
            className="text-2xl sm:text-3xl font-semibold"
            style={{ color: "var(--text-hi)", letterSpacing: "-0.035em" }}
          >
            Heyy {firstName}!
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {saveState !== "idle" && (
            <span
              className="text-xs px-2 py-1 rounded"
              style={{
                color: saveState === "saving" ? "var(--text-lo)" : saveState === "saved" ? "var(--brand)" : "var(--red)",
                background: "var(--surface)",
              }}
            >
              {saveState === "saving" ? "Saving…" : saveState === "saved" ? "✓ Saved" : "Save failed"}
            </span>
          )}
          <Link
            href="/month/current"
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-lg transition-colors flex-none"
            style={{ background: "var(--brand)", color: "#0a0a0a" }}
          >
            This month <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Mobile CTA */}
      <Link
        href="/month/current"
        className="sm:hidden flex items-center justify-between px-4 py-3 rounded-xl border"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <span className="text-sm font-medium" style={{ color: "var(--text-hi)" }}>Open this month</span>
        <ArrowRight className="w-4 h-4" style={{ color: "var(--brand)" }} />
      </Link>

      {/* ── Expenses ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium" style={{ color: "var(--text-hi)" }}>Expenses</p>
          <span className="text-xs" style={{ color: "var(--text-lo)" }}>
            Your fixed monthly expenses
          </span>
        </div>
        <div
          className="rounded-xl border overflow-hidden"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          {/* Salary row */}
          <div
            className="px-4 sm:px-5 py-3 flex items-center justify-between border-b"
            style={{ borderColor: "var(--border)" }}
          >
            <span className="text-sm" style={{ color: "var(--text-md)" }}>Monthly salary</span>
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium" style={{ color: "var(--text-lo)" }}>{CUR}</span>
              <input
                type="number"
                value={salary}
                onChange={e => setSalary(parseFloat(e.target.value) || 0)}
                className="bg-transparent font-mono font-semibold text-right focus:outline-none"
                style={{ color: "var(--text-hi)", width: 90, fontSize: 14 }}
                step={100}
                inputMode="numeric"
              />
            </div>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={expenses.map(e => e.id)} strategy={verticalListSortingStrategy}>
              <div>
                <AnimatePresence initial={false}>
                  {expenses.map((exp, i) => (
                    <ExpenseRow
                      key={exp.id}
                      exp={exp}
                      currency={CUR}
                      isLast={i === expenses.length - 1}
                      onChange={updateExpense}
                      onRemove={id => setDeleteTarget(id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </SortableContext>
          </DndContext>

          {/* Buffer row */}
          <div
            className="flex items-center gap-3 px-4 sm:px-5 py-3 border-t"
            style={{ borderColor: "var(--border)" }}
          >
            <TrendingUp className="w-3.5 h-3.5 flex-none" style={{ color: "var(--text-lo)" }} />
            <span className="flex-1 text-sm" style={{ color: "var(--text-md)" }}>Personal buffer</span>
            <span className="font-mono text-sm font-medium flex-none" style={{ color: "var(--amber)" }}>
              {fmt(buffer, CUR)}
            </span>
          </div>

          {/* Breakdown strip */}
          <div
            className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 sm:px-5 py-2.5 border-t text-xs"
            style={{ borderColor: "var(--border)", background: "var(--surface-raised)" }}
          >
            <span style={{ color: "var(--text-lo)" }}>Fixed: <span className="font-mono font-medium" style={{ color: "var(--text-md)" }}>{fmt(fixed, CUR)}</span></span>
            <span style={{ color: "var(--text-lo)" }}>Savings: <span className="font-mono font-medium" style={{ color: "var(--text-md)" }}>{fmt(savings, CUR)}</span></span>
            <span style={{ color: "var(--text-lo)" }}>Living: <span className="font-mono font-medium" style={{ color: "var(--text-md)" }}>{fmt(livingTotal, CUR)}</span></span>
          </div>

          {/* Add row */}
          <div className="border-t" style={{ borderColor: "var(--border)" }}>
            <button
              onClick={addExpense}
              className="w-full flex items-center gap-2 px-4 sm:px-5 text-sm transition-colors"
              style={{ color: "var(--text-lo)", minHeight: 44 }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--surface-raised)"; e.currentTarget.style.color = "var(--text-md)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-lo)"; }}
            >
              <Plus className="w-3.5 h-3.5" /> Add expense
            </button>
          </div>
        </div>
      </div>

      {/* ── Year stats ── */}
      {hasData ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            <Stat label="Saved this year"  raw={stats.total_saved}          display={fmtShort(stats.total_saved, currency)}        icon={<TrendingUp className="w-3.5 h-3.5" />} animate currency={currency} />
            <Stat label="Months logged"    raw={0}                          display={`${stats.months_logged} / 12`}                 icon={<Calendar   className="w-3.5 h-3.5" />} />
            <Stat label="Avg / month"      raw={stats.avg_saved_per_month}  display={fmtShort(stats.avg_saved_per_month, currency)} icon={<Target     className="w-3.5 h-3.5" />} animate currency={currency} />
            <Stat label="Streak"           raw={0}                          display={`${stats.current_streak} mo`}                  icon={<Flame      className="w-3.5 h-3.5" />} />
          </div>

          <div
            className="rounded-xl border p-4 sm:p-5"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="flex items-baseline justify-between mb-1">
              <p className="text-sm font-medium" style={{ color: "var(--text-hi)" }}>Savings</p>
              <p className="text-xs" style={{ color: "var(--text-lo)" }}>This year</p>
            </div>
            <p className="text-xs mb-4" style={{ color: "var(--text-lo)" }}>
              Monthly savings across all logged months
            </p>
            <SavingsChart data={chartData} currency={currency} />
          </div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-xl border px-6 py-12 sm:py-16 text-center"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "var(--brand-dim)", border: "1px solid var(--brand-border)" }}
          >
            <Wallet className="w-5 h-5" style={{ color: "var(--brand)" }} />
          </div>
          <h2
            className="font-semibold mb-2"
            style={{ color: "var(--text-hi)", fontSize: 17, letterSpacing: "-0.025em" }}
          >
            Your money map starts here
          </h2>
          <p
            className="text-sm max-w-xs mx-auto mb-6 leading-relaxed"
            style={{ color: "var(--text-md)" }}
          >
            Log your salary and expenses above to see your full breakdown.
          </p>
          <Link
            href="/month/current"
            className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-lg"
            style={{ background: "var(--brand)", color: "#0a0a0a", minHeight: 44 }}
          >
            Open this month <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
      )}

      {/* ── All months grid ── */}
      <div>
        <p className="text-sm font-medium mb-3 sm:mb-4" style={{ color: "var(--text-hi)" }}>All months</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2.5">
          {summaries.map((s, i) => (
            <MonthCard key={s.month_key} summary={s} currency={currency} index={i} />
          ))}
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove expense?"
        message="This expense will be removed from this month."
        confirmLabel="Remove"
        destructive
        onConfirm={removeExpense}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

/* ── Stat card ── */
function Stat({ label, raw, display, icon, animate: doAnim, currency }: {
  label: string; raw: number; display: string;
  icon: React.ReactNode; animate?: boolean; currency?: string;
}) {
  const counted = useCountUp(doAnim ? raw : 0, { duration: 700 });
  const shown   = doAnim ? fmtShort(counted, currency ?? "₹") : display;

  return (
    <div
      className="rounded-xl border p-3.5 sm:p-4"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center gap-2 mb-2.5 sm:mb-3">
        <span style={{ color: "var(--text-lo)", flexShrink: 0 }}>{icon}</span>
        <span className="label-caps truncate">{label}</span>
      </div>
      <p
        className="font-mono font-semibold text-lg sm:text-xl"
        style={{ color: "var(--text-hi)", letterSpacing: "-0.03em" }}
      >
        {shown}
      </p>
    </div>
  );
}

/* ── Month card ── */
function MonthCard({ summary, currency, index }: {
  summary: MonthSummary; currency: string; index: number;
}) {
  const isCurrent = summary.month_key === new Date().toISOString().slice(0, 7);
  const isLogged  = summary.is_logged;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.02 }}
    >
      <Link
        href={`/month/${summary.month_key}`}
        className="relative group block rounded-xl border p-3 sm:p-3.5 transition-all"
        style={{
          background: "var(--surface)",
          borderColor: isCurrent ? "rgba(62,207,142,0.35)" : "var(--border)",
          minHeight: 88,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = isCurrent ? "rgba(62,207,142,0.55)" : "var(--border-strong)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = isCurrent ? "rgba(62,207,142,0.35)" : "var(--border)";
        }}
      >
        {isCurrent && (
          <span
            className="absolute top-2 right-2 label-caps px-1.5 py-0.5 rounded"
            style={{ background: "var(--brand-dim)", color: "var(--brand)" }}
          >
            now
          </span>
        )}
        <p className="text-xs font-medium mb-2" style={{ color: "var(--text-md)" }}>
          {summary.label}
        </p>
        {isLogged ? (
          <>
            <p
              className="font-mono font-semibold text-base grad-brand"
              style={{ letterSpacing: "-0.02em" }}
            >
              {fmtShort(summary.total_saved, currency)}
            </p>
            <p className="text-2xs mb-2" style={{ color: "var(--text-lo)" }}>saved</p>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 flex-none" style={{ color: "var(--brand)" }} />
              <span className="text-2xs" style={{ color: "var(--text-lo)" }}>
                {summary.checks_done}/{summary.checks_total}
              </span>
            </div>
          </>
        ) : (
          <p className="text-xs mt-1" style={{ color: "var(--text-lo)" }}>—</p>
        )}
      </Link>
    </motion.div>
  );
}

/* ── Expense row (sortable, drag-and-drop) ── */
function ExpenseRow({ exp, currency, isLast, onChange, onRemove }: {
  exp: Expense; currency: string; isLast: boolean;
  onChange: (id: string, field: keyof Expense, value: string | number) => void;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: exp.id });
  const [isEditing, setIsEditing] = useState(false);
  const [draftLabel, setDraftLabel] = useState(exp.label);
  const [draftCategory, setDraftCategory] = useState<Expense["category"]>(exp.category);
  const [draftAmount, setDraftAmount] = useState<number | "">(exp.amount || "");

  const catColor = { fixed: "#6366f1", living: "#fbbf24", savings: "#3ecf8e" }[exp.category];
  const draftCatColor = { fixed: "#6366f1", living: "#fbbf24", savings: "#3ecf8e" }[draftCategory];

  useEffect(() => {
    if (!isEditing) {
      setDraftLabel(exp.label);
      setDraftCategory(exp.category);
      setDraftAmount(exp.amount || "");
    }
  }, [exp.label, exp.category, exp.amount, isEditing]);

  function startEditing() {
    setDraftLabel(exp.label);
    setDraftCategory(exp.category);
    setDraftAmount(exp.amount || "");
    setIsEditing(true);
  }

  function saveEditing() {
    onChange(exp.id, "label", draftLabel.trim() || "Expense");
    onChange(exp.id, "category", draftCategory);
    onChange(exp.id, "amount", Number(draftAmount) || 0);
    setIsEditing(false);
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.15 }}
    >
      <div
        className="expense-row group flex items-center border-b"
        style={{
          borderColor: isLast ? "transparent" : "var(--border)",
          minHeight: 48,
          gap: 8,
          paddingLeft: 12,
          paddingRight: 8,
        }}
      >
        {/* Drag handle */}
        <button
          className="drag-handle-col drag-handle flex-none opacity-0 group-hover:opacity-40 transition-opacity"
          style={{ color: "var(--text-lo)", width: 20, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }}
          {...attributes} {...listeners}
          tabIndex={-1}
          aria-label="Reorder"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>

        {isEditing ? (
          <>
            {/* Category — editable only after pressing pencil */}
            <select
              value={draftCategory}
              onChange={e => setDraftCategory(e.target.value as Expense["category"])}
              className="expense-category-select font-medium rounded border-0 focus:outline-none cursor-pointer flex-none"
              style={{
                background: `${draftCatColor}18`,
                color: draftCatColor,
                padding: "4px 8px",
                fontSize: 11,
                minHeight: 28,
              }}
              aria-label="Expense category"
            >
              <option value="fixed">Fixed</option>
              <option value="living">Living</option>
              <option value="savings">Savings</option>
            </select>

            {/* Label */}
            <input
              type="text"
              value={draftLabel}
              onChange={e => setDraftLabel(e.target.value)}
              className="expense-label-input flex-1 min-w-0 bg-transparent text-sm focus:outline-none rounded px-1 py-1.5 transition-colors"
              style={{ color: "var(--text-hi)", background: "var(--surface-raised)" }}
              autoFocus
              aria-label="Expense name"
              onKeyDown={e => {
                if (e.key === "Enter") saveEditing();
                if (e.key === "Escape") setIsEditing(false);
              }}
            />

            {/* Amount */}
            <div
              className="expense-amount-wrap flex items-center gap-0.5 rounded-md flex-none"
              style={{ background: "var(--bg-raised)", padding: "6px 8px" }}
            >
              <span className="text-xs flex-none" style={{ color: "var(--text-lo)" }}>{currency}</span>
              <input
                type="number"
                value={draftAmount}
                onChange={e => setDraftAmount(e.target.value === "" ? "" : parseFloat(e.target.value) || 0)}
                placeholder="0"
                inputMode="numeric"
                className="expense-amount-input bg-transparent text-right font-mono font-medium focus:outline-none"
                style={{ color: "var(--text-hi)", width: 64, fontSize: 13 }}
                aria-label="Expense amount"
                onKeyDown={e => {
                  if (e.key === "Enter") saveEditing();
                  if (e.key === "Escape") setIsEditing(false);
                }}
              />
            </div>
          </>
        ) : (
          <>
            {/* Category — read-only until edit mode */}
            <span
              className="expense-category-select font-medium rounded flex-none"
              style={{
                background: `${catColor}18`,
                color: catColor,
                padding: "4px 8px",
                fontSize: 11,
                minHeight: 28,
                display: "flex",
                alignItems: "center",
              }}
            >
              {exp.category === "fixed" ? "Fixed" : exp.category === "living" ? "Living" : "Savings"}
            </span>

            {/* Label — read-only until edit mode */}
            <span
              className="expense-label-input flex-1 min-w-0 text-sm px-1 py-1.5 truncate"
              style={{ color: "var(--text-hi)" }}
            >
              {exp.label}
            </span>

            {/* Amount — read-only until edit mode */}
            <div
              className="expense-amount-wrap flex items-center gap-0.5 rounded-md flex-none"
              style={{ background: "var(--bg-raised)", padding: "6px 8px" }}
            >
              <span className="text-xs flex-none" style={{ color: "var(--text-lo)" }}>{currency}</span>
              <span
                className="expense-amount-input text-right font-mono font-medium"
                style={{ color: "var(--text-hi)", width: 64, fontSize: 13 }}
              >
                {exp.amount || 0}
              </span>
            </div>
          </>
        )}

        {/* Edit / Save */}
        <button
          onClick={isEditing ? saveEditing : startEditing}
          className="expense-edit-btn flex-none rounded flex items-center justify-center transition-all"
          style={{
            color: isEditing ? "var(--brand)" : "var(--text-lo)",
            width: 28,
            minHeight: 44,
          }}
          title={isEditing ? "Save expense" : "Edit expense"}
          aria-label={isEditing ? "Save expense" : "Edit expense"}
          onMouseEnter={e => {
            e.currentTarget.style.color = isEditing ? "var(--brand)" : "var(--text-md)";
            e.currentTarget.style.background = "var(--overlay)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = isEditing ? "var(--brand)" : "var(--text-lo)";
            e.currentTarget.style.background = "transparent";
          }}
        >
          {isEditing ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <Pencil className="w-3.5 h-3.5" />}
        </button>

        {/* Remove */}
        <button
          onClick={() => onRemove(exp.id)}
          className="expense-remove-btn flex-none rounded flex items-center justify-center transition-all"
          style={{ color: "var(--text-lo)", width: 28, minHeight: 44, opacity: 1 }}
          onMouseEnter={e => { e.currentTarget.style.color = "var(--red)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "var(--text-lo)"; }}
          aria-label="Remove expense"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
