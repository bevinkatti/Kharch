import { type ClassValue, clsx } from "clsx";
import type { CheckItem, Expense, Month, MonthSummary, YearStats } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// ── Formatting ────────────────────────────────────────────────
export function fmt(amount: number, currency = "₹"): string {
  return currency + Math.round(amount).toLocaleString("en-IN");
}

export function fmtK(amount: number, currency = "₹"): string {
  if (amount >= 100000) return currency + (amount / 100000).toFixed(1) + "L";
  if (amount >= 1000)   return currency + Math.round(amount / 1000) + "k";
  return fmt(amount, currency);
}

export function fmtShort(amount: number, currency = "₹"): string {
  if (amount >= 100000) return currency + (amount / 100000).toFixed(1) + "L";
  if (amount >= 1000)   return currency + (amount / 1000).toFixed(1) + "k";
  return fmt(amount, currency);
}

// ── Date helpers ──────────────────────────────────────────────
const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTH_FULL  = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export function monthKeyToLabel(key: string): { short: string; full: string } {
  const [year, month] = key.split("-").map(Number);
  return {
    short: `${MONTH_SHORT[month - 1]} '${String(year).slice(2)}`,
    full:  `${MONTH_FULL[month - 1]} ${year}`,
  };
}

export function getCurrentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function getYear12Months(): string[] {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
}

export function getPast12Months(): string[] {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
}

// ── Financial calculations ────────────────────────────────────
export function calcTotals(expenses: Expense[], salary: number) {
  let fixed = 0, living = 0, savings = 0;
  for (const e of expenses) {
    const v = Math.max(0, e.amount);
    if (e.category === "fixed")   fixed   += v;
    if (e.category === "living")  living  += v;
    if (e.category === "savings") savings += v;
  }
  const buffer = Math.max(0, salary - fixed - living - savings);
  return { fixed, living, savings, buffer, livingTotal: living + buffer };
}

// ── Default data ──────────────────────────────────────────────
export const DEFAULT_EXPENSES = [
  { label: "Sent to parents",     category: "fixed"   as const, amount: 10000, sort_order: 0 },
  { label: "PG rent",             category: "fixed"   as const, amount: 6500,  sort_order: 1 },
  { label: "Bike EMI",            category: "fixed"   as const, amount: 5441,  sort_order: 2 },
  { label: "Loan EMI",            category: "fixed"   as const, amount: 1608,  sort_order: 3 },
  { label: "Food & groceries",    category: "living"  as const, amount: 6000,  sort_order: 4 },
  { label: "Fuel",                category: "living"  as const, amount: 1300,  sort_order: 5 },
  { label: "Utilities & phone",   category: "living"  as const, amount: 1000,  sort_order: 6 },
  { label: "Emergency fund",      category: "savings" as const, amount: 4000,  sort_order: 7 },
  { label: "SIP / investing",     category: "savings" as const, amount: 5000,  sort_order: 8 },
];

// Kept only to recognize old checklist rows that should not survive the
// migration to expense-driven Monthly Moves.
export const DEFAULT_CHECK_ITEMS: CheckItem[] = [
  { id: "legacy-0", label: "Move savings to separate account", amount: 5000 },
  { id: "legacy-1", label: "Send money home",                  amount: 10000 },
  { id: "legacy-2", label: "Pay rent",                         amount: 6500  },
  { id: "legacy-3", label: "Confirm all EMIs cleared",         amount: 7049  },
  { id: "legacy-4", label: "Mid-month spend check",            amount: 0     },
  { id: "legacy-5", label: "Top up emergency fund",            amount: 4000  },
  { id: "legacy-6", label: "Redirect EMI → SIP when closes",   amount: 0     },
];

const LEGACY_CHECK_LABELS = new Set(DEFAULT_CHECK_ITEMS.map(item => item.label));

function makeManualMoveId(index: number, label: string): string {
  return `manual:${index}:${label.trim().toLowerCase()}`;
}

/**
 * Build the Monthly Moves list from the current Expenses list while
 * preserving completed state and user-created manual tasks.
 *
 * Expense rows are linked by stable expense id. Legacy rows from the old
 * checklist format are recognized and discarded; legacy expense-derived
 * rows without an expense id may fall back to matching by label.
 */
export function syncCheckItemsWithExpenses(
  expenses: Expense[],
  storedItems: CheckItem[] = [],
  storedChecks: boolean[] = [],
): { items: CheckItem[]; checks: boolean[] } {
  const previous = Array.isArray(storedItems) ? storedItems : [];
  const previousChecks = Array.isArray(storedChecks) ? storedChecks : [];

  const byExpenseId = new Map<string, boolean>();
  const byExpenseLabel = new Map<string, boolean>();
  const byLegacyLabel = new Map<string, boolean>();
  const byManualId = new Map<string, boolean>();
  const byManualLabel = new Map<string, boolean>();

  previous.forEach((item, index) => {
    const checked = previousChecks[index] ?? false;

    if (item.source === "expense" || item.expense_id) {
      if (item.expense_id) byExpenseId.set(item.expense_id, checked);
      byExpenseLabel.set(item.label, checked);
      return;
    }

    // Current manual tasks have an id. Only old unlabeled-by-source rows are
    // eligible for the one-time label fallback.
    if (!LEGACY_CHECK_LABELS.has(item.label) && !item.id) {
      byLegacyLabel.set(item.label, checked);
    }

    if (!LEGACY_CHECK_LABELS.has(item.label) && item.id) {
      byManualId.set(item.id, checked);
      byManualLabel.set(item.label, checked);
    }
  });

  const expenseLabels = new Set(
    expenses.filter(expense => expense.amount > 0).map(expense => expense.label)
  );

  const expenseItems = expenses
    .filter(expense => expense.amount > 0)
    .map((expense): CheckItem => ({
      id: `expense:${expense.id}`,
      label: expense.label,
      amount: expense.amount,
      source: "expense",
      expense_id: expense.id,
      category: expense.category,
    }));

  const manualItems = previous
    .map((item, index) => ({ item, index }))
    .filter(({ item }) =>
      item.source !== "expense" &&
      !item.expense_id &&
      !LEGACY_CHECK_LABELS.has(item.label) &&
      !(expenseLabels.has(item.label) && !item.id)
    )
    .map(({ item, index }): CheckItem => {
      const id = item.id ?? makeManualMoveId(index, item.label);
      byManualId.set(id, previousChecks[index] ?? false);
      byManualLabel.set(item.label, previousChecks[index] ?? false);
      return {
        id,
        label: item.label,
        amount: item.amount,
        source: "manual",
      };
    });

  const items = [...expenseItems, ...manualItems];

  const checks = items.map(item => {
    if (item.source === "expense" && item.expense_id) {
      if (byExpenseId.has(item.expense_id)) {
        return byExpenseId.get(item.expense_id) ?? false;
      }
      return byExpenseLabel.get(item.label) ?? byLegacyLabel.get(item.label) ?? false;
    }

    if (item.id && byManualId.has(item.id)) {
      return byManualId.get(item.id) ?? false;
    }
    return byManualLabel.get(item.label) ?? false;
  });

  return { items, checks };
}

export function calcMonthSaved(month: Month, expenses: Expense[]): number {
  const { savings } = calcTotals(expenses, month.salary);
  const synced = syncCheckItemsWithExpenses(
    expenses,
    month.check_items ?? [],
    month.checks ?? [],
  );

  const hasExpenseMoves = synced.items.some(item => item.source === "expense");

  if (!hasExpenseMoves) {
    // Legacy fallback for months created before expense-linked moves existed.
    return ((month.checks?.[0] ?? false) ? savings : 0) + (month.bonus ?? 0);
  }

  const completedSavings = synced.items.reduce((total, item, index) => {
    if (
      item.source === "expense" &&
      item.category === "savings" &&
      synced.checks[index] &&
      item.amount > 0
    ) {
      return total + item.amount;
    }
    return total;
  }, 0);

  return completedSavings + (month.bonus ?? 0);
}

export function buildMonthSummary(
  month_key: string,
  month: Month | null,
  expenses: Expense[]
): MonthSummary {
  const { short, full } = monthKeyToLabel(month_key);

  if (!month) {
    return {
      month_key, label: short, full_label: full,
      total_saved: 0, salary: 0, fixed: 0, living: 0, savings: 0, buffer: 0,
      is_logged: false, checks_done: 0, checks_total: 0,
    };
  }

  const { fixed, livingTotal, savings, buffer } = calcTotals(expenses, month.salary);
  const synced = syncCheckItemsWithExpenses(
    expenses,
    month.check_items ?? [],
    month.checks ?? [],
  );
  const normalizedMonth = {
    ...month,
    check_items: synced.items,
    checks: synced.checks,
  };
  const total_saved = calcMonthSaved(normalizedMonth, expenses);
  const checks_done = synced.checks.filter(Boolean).length;

  return {
    month_key, label: short, full_label: full, total_saved,
    salary: month.salary, fixed, living: livingTotal, savings, buffer,
    is_logged: true,
    checks_done,
    checks_total: synced.items.length,
  };
}

export function buildYearStats(summaries: MonthSummary[]): YearStats {
  const logged = summaries.filter(s => s.is_logged);
  const total_saved = logged.reduce((a, s) => a + s.total_saved, 0);
  const avg_saved_per_month = logged.length ? total_saved / logged.length : 0;
  const best = logged.reduce(
    (b, s) => (!b || s.total_saved > b.total_saved ? s : b),
    null as MonthSummary | null
  );
  let streak = 0;
  for (let i = summaries.length - 1; i >= 0; i--) {
    if (summaries[i].is_logged) streak++; else break;
  }
  return {
    total_saved,
    months_logged: logged.length,
    avg_saved_per_month,
    best_month: best?.full_label ?? null,
    current_streak: streak,
  };
}

// Compute remaining balance after checked Monthly Move items are deducted.
export function calcChecklistRemaining(
  salary: number,
  items: CheckItem[],
  checks: boolean[]
): number {
  let deducted = 0;
  items.forEach((item, i) => {
    if (checks[i] && item.amount > 0) deducted += item.amount;
  });
  return salary - deducted;
}
