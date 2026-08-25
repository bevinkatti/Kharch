import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { DEFAULT_EXPENSES } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const month_key = req.nextUrl.searchParams.get("key");
  if (!month_key) return NextResponse.json({ error: "month_key required" }, { status: 400 });

  const { data: month, error } = await supabaseAdmin
    .from("months").select("*").eq("clerk_id", userId).eq("month_key", month_key).single();

  if (error && error.code !== "PGRST116")
    return NextResponse.json({ error: error.message }, { status: 500 });

  if (!month) return NextResponse.json({ data: null });

  const { data: expenses } = await supabaseAdmin
    .from("expenses").select("*").eq("month_id", month.id).order("sort_order");

  return NextResponse.json({ data: { ...month, expenses: expenses ?? [] } });
}

export async function PUT(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { month_key } = body;

  if (!month_key) {
    return NextResponse.json({ error: "month_key required" }, { status: 400 });
  }

  const has = (key: string) => Object.prototype.hasOwnProperty.call(body, key);

  const { data: existingMonth, error: existingMonthErr } = await supabaseAdmin
    .from("months")
    .select("id")
    .eq("clerk_id", userId)
    .eq("month_key", month_key)
    .maybeSingle();

  if (existingMonthErr) {
    return NextResponse.json({ error: existingMonthErr.message }, { status: 500 });
  }

  const isNewMonth = !existingMonth;

  // Partial month saves are intentional:
  // Dashboard owns salary/expenses; This month owns checklist/notes/EF.
  // This prevents one screen's autosave from overwriting another screen's
  // newer state with stale values.
  const monthPayload: Record<string, unknown> = {
    clerk_id: userId,
    month_key,
  };

  for (const key of ["salary", "bonus", "ef_amount", "notes", "checks", "check_items"]) {
    if (has(key)) monthPayload[key] = body[key];
  }

  const { data: month, error: monthErr } = await supabaseAdmin
    .from("months")
    .upsert(monthPayload, { onConflict: "clerk_id,month_key" })
    .select()
    .single();

  if (monthErr || !month) {
    return NextResponse.json(
      { error: monthErr?.message ?? "Failed to save month" },
      { status: 500 }
    );
  }

  // A brand-new month opened from This month still needs its initial
  // Dashboard expense set. Dashboard can subsequently replace it normally.
  if (isNewMonth && !has("expenses")) {
    const { data: existingInitialExpenses } = await supabaseAdmin
      .from("expenses")
      .select("id")
      .eq("month_id", month.id)
      .eq("clerk_id", userId)
      .limit(1);

    if (!existingInitialExpenses?.length) {
      const { error } = await supabaseAdmin
        .from("expenses")
        .insert(
          DEFAULT_EXPENSES.map(expense => ({
            month_id: month.id,
            clerk_id: userId,
            label: expense.label,
            category: expense.category,
            amount: expense.amount,
            sort_order: expense.sort_order,
          }))
        );

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }
  }

  // Expenses are only reconciled when the caller explicitly sends them.
  // This keeps This month's checklist autosave from touching Dashboard data.
  if (Array.isArray(body.expenses)) {
    const { data: existingExpenses, error: existingErr } = await supabaseAdmin
      .from("expenses")
      .select("id")
      .eq("month_id", month.id)
      .eq("clerk_id", userId);

    if (existingErr) {
      return NextResponse.json({ error: existingErr.message }, { status: 500 });
    }

    const existingIds = new Set((existingExpenses ?? []).map((e: { id: string }) => e.id));
    const incomingExistingIds = new Set<string>();
    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    for (const [index, expense] of body.expenses.entries()) {
      if (
        !expense ||
        typeof expense.label !== "string" ||
        !["fixed", "living", "savings"].includes(expense.category)
      ) {
        continue;
      }

      const payload = {
        month_id: month.id,
        clerk_id: userId,
        label: expense.label.trim() || "Expense",
        category: expense.category,
        amount: Math.max(0, Number(expense.amount) || 0),
        sort_order: index,
      };

      const existingId =
        typeof expense.id === "string" &&
        uuidPattern.test(expense.id) &&
        existingIds.has(expense.id)
          ? expense.id
          : null;

      if (existingId) {
        incomingExistingIds.add(existingId);
        const { error } = await supabaseAdmin
          .from("expenses")
          .update(payload)
          .eq("id", existingId)
          .eq("month_id", month.id)
          .eq("clerk_id", userId);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
      } else {
        const { error } = await supabaseAdmin
          .from("expenses")
          .insert(payload);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
      }
    }

    // Anything previously stored but omitted by Dashboard was deleted.
    const removedIds = [...existingIds].filter(id => !incomingExistingIds.has(id));
    if (removedIds.length > 0) {
      const { error } = await supabaseAdmin
        .from("expenses")
        .delete()
        .in("id", removedIds)
        .eq("month_id", month.id)
        .eq("clerk_id", userId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ data: { month_key } });
}
