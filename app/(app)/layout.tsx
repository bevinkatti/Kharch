"use client";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, CalendarDays, Settings, IndianRupee } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ToastProvider } from "@/components/ui/Toast";
import { OfflineBanner } from "@/components/ui/OfflineBanner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <ToastProvider>
      <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>

        {/* ── Desktop sidebar ─────────────────────────────── */}
        <aside
          className="hidden md:flex flex-col w-[220px] fixed inset-y-0 left-0 z-40 border-r"
          style={{ background: "var(--bg)", borderColor: "var(--border)" }}
        >
          <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-none"
                style={{ background: "var(--brand)" }}
              >
                <IndianRupee className="w-3.5 h-3.5" style={{ color: "#0a0a0a" }} strokeWidth={2.5} />
              </div>
              <span className="font-semibold text-base" style={{ color: "var(--text-hi)", letterSpacing: "-0.025em" }}>
                Kharch
              </span>
            </Link>
          </div>

          <nav className="flex-1 px-3 py-3 space-y-0.5">
            <SidebarLink href="/dashboard"     icon={<LayoutDashboard className="w-[15px] h-[15px]" />} label="Dashboard"  active={pathname === "/dashboard"} />
            <SidebarLink href="/month/current" icon={<CalendarDays    className="w-[15px] h-[15px]" />} label="This month" active={pathname.startsWith("/month")} />
            <SidebarLink href="/settings"      icon={<Settings        className="w-[15px] h-[15px]" />} label="Settings"   active={pathname === "/settings"} />
          </nav>

          <div
            className="px-4 pb-5 pt-3 border-t flex items-center gap-2.5"
            style={{ borderColor: "var(--border)" }}
          >
            <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-7 h-7 rounded-lg" } }} />
            <span className="flex-1 text-xs truncate" style={{ color: "var(--text-lo)" }}>Account</span>
            <ThemeToggle />
          </div>
        </aside>

        {/* ── Main ─────────────────────────────────────────── */}
        <main
          className="flex-1 min-w-0 w-full md:ml-[220px] min-h-screen"
          style={{ paddingBottom: "calc(72px + env(safe-area-inset-bottom, 0px))" }}
        >
          {/* Mobile header — full-width, proper height for iOS tap targets */}
          <header
            className="md:hidden sticky top-0 z-30 glass border-b flex items-center justify-between px-4"
            style={{ borderColor: "var(--border)", height: 52, paddingTop: "env(safe-area-inset-top, 0px)" }}
          >
            <Link href="/dashboard" className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "var(--brand)" }}
              >
                <IndianRupee className="w-3.5 h-3.5" style={{ color: "#0a0a0a" }} strokeWidth={2.5} />
              </div>
              <span className="font-semibold text-sm" style={{ color: "var(--text-hi)", letterSpacing: "-0.025em" }}>
                Kharch
              </span>
            </Link>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-7 h-7" } }} />
            </div>
          </header>

          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              className="page-wrap w-full min-w-0 max-w-full"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* ── Mobile bottom nav ────────────────────────────── */}
        <nav
          className="md:hidden fixed bottom-0 inset-x-0 z-40 glass border-t"
          style={{
            borderColor: "var(--border)",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          <div className="flex items-stretch" style={{ height: 72 }}>
            <MobileLink href="/dashboard"     icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard"  active={pathname === "/dashboard"} />
            <MobileLink href="/month/current" icon={<CalendarDays    className="w-5 h-5" />} label="Month"      active={pathname.startsWith("/month")} />
            <MobileLink href="/settings"      icon={<Settings        className="w-5 h-5" />} label="Settings"   active={pathname === "/settings"} />
          </div>
        </nav>

        <OfflineBanner />
      </div>
    </ToastProvider>
  );
}

function SidebarLink({ href, icon, label, active }: {
  href: string; icon: React.ReactNode; label: string; active: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors"
      style={{
        background: active ? "var(--surface)" : "transparent",
        color: active ? "var(--text-hi)" : "var(--text-md)",
        fontWeight: active ? 500 : 400,
      }}
    >
      <span style={{ opacity: active ? 1 : 0.55, flexShrink: 0 }}>{icon}</span>
      {label}
    </Link>
  );
}

function MobileLink({ href, icon, label, active }: {
  href: string; icon: React.ReactNode; label: string; active: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex-1 flex flex-col items-center justify-center gap-1 transition-colors"
      style={{ color: active ? "var(--brand)" : "var(--text-lo)" }}
    >
      {icon}
      <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, letterSpacing: "0.01em" }}>{label}</span>
    </Link>
  );
}
