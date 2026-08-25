import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { SettingsForm } from "@/components/SettingsForm";

export const revalidate = 0;

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { data: settings } = await supabaseAdmin
    .from("user_settings")
    .select("*")
    .eq("clerk_id", userId)
    .single();

  return (
    <div className="w-full min-w-0 max-w-xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-10">
      <div className="mb-6 sm:mb-8">
        <p className="label-caps mb-1.5">Preferences</p>
        <h1
          className="font-semibold"
          style={{ color: "var(--text-hi)", fontSize: "clamp(24px, 5vw, 30px)", letterSpacing: "-0.04em" }}
        >
          Settings
        </h1>
      </div>
      <SettingsForm
        initial={settings ?? {
          currency: "₹", city_label: "My Budget",
          ef_target: 100000, salary: 44800, salary_day: null,
        }}
      />
    </div>
  );
}
