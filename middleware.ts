import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const isPublicRoute = createRouteMatcher([
  "/",
  "/install(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/onboarding(.*)",
  "/sitemap.xml",
  "/robots.txt",
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  if (req.nextUrl.pathname === "/") {
    const { userId } = await auth();
    if (userId) {
      const { data: settings, error } = await supabaseAdmin
        .from("user_settings")
        .select("clerk_id")
        .eq("clerk_id", userId)
        .maybeSingle();

      if (error) {
        return new Response("Unable to verify account setup.", { status: 503 });
      }

      if (!settings) {
        return Response.redirect(new URL("/onboarding", req.url));
      }

      const now = new Date();
      const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      return Response.redirect(new URL(`/month/${monthKey}`, req.url));
    }
  }

  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
