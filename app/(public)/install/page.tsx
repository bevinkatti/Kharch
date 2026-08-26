"use client";

import Link from "next/link";
import { ArrowLeft, Smartphone, Monitor } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuth } from "@clerk/nextjs";

export default function InstallPage() {
  const { isSignedIn } = useAuth();

  const backHref = isSignedIn ? "/settings" : "/";
  const startHref = isSignedIn ? "/settings" : "/sign-up";

  return (
    <div
      className="min-h-screen px-4 sm:px-6"
      style={{ background: "var(--bg)", color: "var(--text-hi)" }}
    >
      {/* Header */}
      <nav
        className="fixed inset-x-0 top-0 z-50 glass border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <div
          className="max-w-3xl mx-auto flex items-center justify-between px-4 sm:px-6"
          style={{ height: 52 }}
        >
          <Link
            href={backHref}
            className="flex items-center gap-2 text-sm"
            style={{ color: "var(--text-md)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Kharch
          </Link>

          <ThemeToggle />
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-3xl mx-auto pt-28 pb-16">
        <div className="mb-10">
          <p className="label-caps mb-2">Use Kharch like an app</p>

          <h1
            className="font-semibold mb-3"
            style={{
              fontSize: "clamp(30px, 7vw, 46px)",
              letterSpacing: "-0.04em",
            }}
          >
            Install Kharch
          </h1>

          <p
            className="text-sm sm:text-base leading-relaxed max-w-xl"
            style={{ color: "var(--text-md)" }}
          >
            Add Kharch to your home screen for quick access - iPhone, iPad, Android, and desktop browsers.
          </p>
        </div>

        <div className="space-y-3">
          {/* iPhone */}
          <InstallCard
            icon={<Smartphone className="w-5 h-5" />}
            title="iPhone / iPad"
            steps={[
              "Open Kharch in Safari.",
              "Tap the Share button.",
              "Select “Add to Home Screen”.",
              "Tap “Add”.",
            ]}
            note="For iPhone and iPad, use Safari to install Kharch."
          />

          {/* Android */}
          <InstallCard
            icon={<Smartphone className="w-5 h-5" />}
            title="Android"
            steps={[
              "Open Kharch in your browser.",
              "Tap the ⋮ menu.",
              "Select “Install app” or “Add to Home screen”.",
              "Tap “Install” or “Add”.",
            ]}
            note="The exact wording may vary slightly between browsers."
          />

          {/* Desktop */}
          <InstallCard
            icon={<Monitor className="w-5 h-5" />}
            title="Windows / Mac"
            steps={[
              "Open Kharch in a supported browser.",
              "Look for the Install icon in the address bar.",
              "Or open the browser menu.",
              "Select “Install Kharch”.",
            ]}
            note="If an install option is available, your browser will show it."
          />
        </div>

        <div className="text-center mt-10">
          <Link
            href={startHref}
            className="inline-flex items-center justify-center rounded-xl px-5 text-sm font-semibold"
            style={{
              background: "var(--brand)",
              color: "#0a0a0a",
              minHeight: 48,
            }}
          >
            Start using Kharch
          </Link>
        </div>
      </main>
    </div>
  );
}

function InstallCard({
  icon,
  title,
  steps,
  note,
}: {
  icon: React.ReactNode;
  title: string;
  steps: string[];
  note: string;
}) {
  
  return (
    <section
      className="rounded-xl border p-5 sm:p-6"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{
            background: "var(--brand-dim)",
            color: "var(--text-brand)",
          }}
        >
          {icon}
        </div>

        <h2
          className="font-medium text-base"
          style={{ color: "var(--text-hi)" }}
        >
          {title}
        </h2>
      </div>

      <ol className="space-y-3">
        {steps.map((step, index) => (
          <li
            key={step}
            className="flex items-start gap-3 text-sm"
            style={{ color: "var(--text-md)" }}
          >
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center flex-none text-xs font-medium"
              style={{
                background: "var(--surface-raised)",
                color: "var(--text-brand)",
                border: "1px solid var(--border)",
              }}
            >
              {index + 1}
            </span>

            <span className="leading-6">{step}</span>
          </li>
        ))}
      </ol>

      <p
        className="text-xs mt-5 pt-4 border-t"
        style={{
          color: "var(--text-lo)",
          borderColor: "var(--border)",
        }}
      >
        {note}
      </p>
    </section>
  );
}