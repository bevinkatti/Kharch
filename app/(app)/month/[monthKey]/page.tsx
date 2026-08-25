import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentMonthKey, getPast12Months, getYear12Months, buildMonthSummary, monthKeyToLabel } from "@/lib/utils";
import type { Month, Expense, UserSettings } from "@/types";
import { MonthLedger } from "@/components/month/MonthLedger";
import { DEFAULT_EXPENSES } from "@/lib/utils";

export const revalidate = 0;

interface Props { params: Promise<{ monthKey: string }> }

export default async function MonthPage({ params }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { monthKey: rawKey } = await params;
  const monthKey = rawKey === "current" ? getCurrentMonthKey() : rawKey;

  if (!/^\d{4}-\d{2}$/.test(monthKey)) redirect("/dashboard");

  // Fetch settings
  const { data: settings } = await supabaseAdmin
    .from("user_settings")
    .select("*")
    .eq("clerk_id", userId)
    .single();

  // Fetch current month
  const { data: month } = await supabaseAdmin
    .from("months")
    .select("*")
    .eq("clerk_id", userId)
    .eq("month_key", monthKey)
    .single();

  let expenses: Expense[] = [];
  if (month) {
    const { data: exp } = await supabaseAdmin
      .from("expenses")
      .select("*")
      .eq("month_id", month.id)
      .order("sort_order");
    expenses = exp ?? [];
  }

  // Fetch previous month data for comparison nudge
  const [prevYear, prevMonthNum] = monthKey.split("-").map(Number);
  const prevDate = new Date(prevYear, prevMonthNum - 2, 1); // go back 1 month
  const prevKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;

  const { data: prevMonth } = await supabaseAdmin
    .from("months")
    .select("*")
    .eq("clerk_id", userId)
    .eq("month_key", prevKey)
    .single();

  let prevMonthSaved: number | null = null;
  let prevMonthLabel: string | null = null;
  if (prevMonth) {
    const { data: prevExpenses } = await supabaseAdmin
      .from("expenses")
      .select("*")
      .eq("month_id", prevMonth.id);
    const summary = buildMonthSummary(prevKey, prevMonth, prevExpenses ?? []);
    prevMonthSaved = summary.total_saved;
    prevMonthLabel = monthKeyToLabel(prevKey).short;
  }

  // Fetch all logged month keys for the tab dots
  const allKeys = getYear12Months();
  const { data: allMonths } = await supabaseAdmin
    .from("months")
    .select("month_key")
    .eq("clerk_id", userId)
    .in("month_key", allKeys);
  const loggedKeys = new Set((allMonths ?? []).map((m: { month_key: string }) => m.month_key));

  const defaultSettings: UserSettings = {
    id: "", clerk_id: userId,
    currency: "₹", city_label: "My Budget", ef_target: 100000, salary: 44800,
    salary_day: null,
    created_at: "", updated_at: "",
  };

  return (
    <MonthLedger
      monthKey={monthKey}
      initialMonth={month ?? null}
      initialExpenses={
        expenses.length > 0
          ? expenses
          : DEFAULT_EXPENSES.map((e, i) => ({
              ...e, id: `default-${i}`, month_id: "", clerk_id: userId, created_at: "",
            }))
      }
      settings={settings ?? defaultSettings}
      isNew={!month}
      prevMonthSaved={prevMonthSaved}
      prevMonthLabel={prevMonthLabel}
      loggedKeys={loggedKeys}
    />
  );
}
