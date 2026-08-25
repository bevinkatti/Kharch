import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import {
  buildMonthSummary, buildYearStats, getYear12Months, getCurrentMonthKey, DEFAULT_EXPENSES,
} from "@/lib/utils";
import type { Expense, Month, UserSettings } from "@/types";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const revalidate = 0;

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const firstName = user?.firstName ?? "there";

  const { data: settings } = await supabaseAdmin
    .from("user_settings").select("*").eq("clerk_id", userId).single();

  if (!settings) redirect("/onboarding");

  const currency = settings.currency ?? "₹";
  const keys = getYear12Months();
  const currentMonthKey = getCurrentMonthKey();

  const { data: months } = await supabaseAdmin
    .from("months").select("*").eq("clerk_id", userId).in("month_key", keys);

  const monthMap: Record<string, Month> = {};
  for (const m of months ?? []) monthMap[m.month_key] = m;

  const monthIds = (months ?? []).map((m: Month) => m.id);
  const { data: allExpenses } = monthIds.length
    ? await supabaseAdmin.from("expenses").select("*").in("month_id", monthIds)
    : { data: [] };

  const expMap: Record<string, Expense[]> = {};
  for (const e of allExpenses ?? []) {
    if (!expMap[e.month_id]) expMap[e.month_id] = [];
    expMap[e.month_id].push(e);
  }

  const summaries = keys.map(key => {
    const month    = monthMap[key] ?? null;
    const expenses = month ? (expMap[month.id] ?? []) : [];
    return buildMonthSummary(key, month, expenses);
  });

  const stats = buildYearStats(summaries);

  const chartData = summaries.map(s => ({
    label: s.label, saved: s.total_saved, salary: s.salary,
  }));

  const salaryDay: number | null = settings.salary_day ?? null;
  const today = new Date().getDate();
  const showSalaryBanner = salaryDay !== null && Math.abs(today - salaryDay) <= 1;

  // ── Current month data for Expenses + Monthly Moves panels ──
  const currentMonth = monthMap[currentMonthKey] ?? null;
  const currentMonthExpenses = currentMonth
    ? (expMap[currentMonth.id] ?? [])
    : DEFAULT_EXPENSES.map((e, i) => ({
        ...e,
        id: `default-${i}`,
        month_id: "",
        clerk_id: userId,
        created_at: "",
      }));

  const defaultSettings: UserSettings = {
    id: "", clerk_id: userId,
    currency: "₹", city_label: "My Budget", ef_target: 100000, salary: 44800,
    salary_day: null,
    created_at: "", updated_at: "",
  };

  return (
    <DashboardClient
      firstName={firstName}
      currency={currency}
      stats={stats}
      summaries={summaries}
      chartData={chartData}
      showSalaryBanner={showSalaryBanner}
      currentMonthKey={currentMonthKey}
      currentMonth={currentMonth}
      currentMonthExpenses={currentMonthExpenses}
      settings={settings ?? defaultSettings}
    />
  );
}
