import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("user_settings")
    .select("*")
    .eq("clerk_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({
      data: { currency: "₹", city_label: "My Budget", ef_target: 100000, salary: 0, salary_day: null },
    });
  }

  return NextResponse.json({ data });
}

export async function PUT(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { currency, city_label, ef_target, salary, salary_day } = body;

  const { data, error } = await supabaseAdmin
    .from("user_settings")
    .upsert(
      { clerk_id: userId, currency, city_label, ef_target, salary, salary_day: salary_day ?? null },
      { onConflict: "clerk_id" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}
