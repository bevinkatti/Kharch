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
    const defaultSettings = {
      clerk_id: userId,
      currency: "₹",
      city_label: "My Budget",
      ef_target: 100000,
      salary: 0,
      salary_day: null,
    };

    const { data: created, error: createError } = await supabaseAdmin
      .from("user_settings")
      .insert(defaultSettings)
      .select()
      .single();

    if (createError) {
      // In case of a race condition where settings were created concurrently, fetch existing
      const { data: existing, error: fetchError } = await supabaseAdmin
        .from("user_settings")
        .select("*")
        .eq("clerk_id", userId)
        .maybeSingle();

      if (existing) return NextResponse.json({ data: existing });
      return NextResponse.json({ error: createError.message || fetchError?.message }, { status: 500 });
    }

    return NextResponse.json({ data: created });
  }

  return NextResponse.json({ data });
}

export async function PUT(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const has = (key: string) => Object.prototype.hasOwnProperty.call(body, key);

  // Validate ef_target if provided
  if (has("ef_target")) {
    const efTargetNum = Number(body.ef_target);
    if (isNaN(efTargetNum) || efTargetNum < 0) {
      return NextResponse.json(
        { error: "Emergency fund target must be a non-negative number" },
        { status: 400 }
      );
    }
  }

  // Validate salary if provided
  if (has("salary")) {
    const salaryNum = Number(body.salary);
    if (isNaN(salaryNum) || salaryNum < 0) {
      return NextResponse.json(
        { error: "Salary must be a non-negative number" },
        { status: 400 }
      );
    }
  }

  // Validate salary_day if provided
  if (has("salary_day") && body.salary_day !== null) {
    const dayNum = Number(body.salary_day);
    if (isNaN(dayNum) || dayNum < 1 || dayNum > 31) {
      return NextResponse.json(
        { error: "Salary day must be between 1 and 31" },
        { status: 400 }
      );
    }
  }

  // Fetch existing settings first to preserve existing values
  const { data: existing, error: existingErr } = await supabaseAdmin
    .from("user_settings")
    .select("*")
    .eq("clerk_id", userId)
    .maybeSingle();

  if (existingErr) {
    return NextResponse.json({ error: existingErr.message }, { status: 500 });
  }

  const payload: Record<string, unknown> = {
    clerk_id: userId,
    currency: has("currency") ? (body.currency ?? "₹") : (existing?.currency ?? "₹"),
    city_label: has("city_label") ? (body.city_label ?? "My Budget") : (existing?.city_label ?? "My Budget"),
    ef_target: has("ef_target") ? Number(body.ef_target) : (existing?.ef_target ?? 100000),
    salary: has("salary") ? Number(body.salary) : (existing?.salary ?? 0),
    salary_day: has("salary_day")
      ? (body.salary_day === null || body.salary_day === "" ? null : Number(body.salary_day))
      : (existing?.salary_day ?? null),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabaseAdmin
    .from("user_settings")
    .upsert(payload, { onConflict: "clerk_id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}
