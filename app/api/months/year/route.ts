import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { buildMonthSummary, buildYearStats, getYear12Months } from "@/lib/utils";
import type { Expense, Month } from "@/types";

// GET /api/months/year — returns summaries for all 12 rolling months
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const keys = getYear12Months();

  const { data: months } = await supabaseAdmin
    .from("months")
    .select("*")
    .eq("clerk_id", userId)
    .in("month_key", keys);

  const monthMap: Record<string, Month> = {};
  for (const m of months ?? []) monthMap[m.month_key] = m;

  // Fetch all expenses for those months in one query
  const monthIds = (months ?? []).map((m: Month) => m.id);
  const { data: allExpenses } = monthIds.length
    ? await supabaseAdmin.from("expenses").select("*").in("month_id", monthIds)
    : { data: [] };

  const expMap: Record<string, Expense[]> = {};
  for (const e of allExpenses ?? []) {
    if (!expMap[e.month_id]) expMap[e.month_id] = [];
    expMap[e.month_id].push(e);
  }

  const summaries = keys.map((key) => {
    const month = monthMap[key] ?? null;
    const expenses = month ? (expMap[month.id] ?? []) : [];
    return buildMonthSummary(key, month, expenses);
  });

  const stats = buildYearStats(summaries);

  return NextResponse.json({ data: { summaries, stats } });
}
