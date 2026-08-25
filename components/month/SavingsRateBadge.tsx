"use client";

interface Props { savings: number; salary: number; }

export function SavingsRateBadge({ savings, salary }: Props) {
  if (!salary) return null;
  const rate = Math.round((savings / salary) * 100);

  const style =
    rate >= 20
      ? { bg: "var(--brand-dim)",  text: "var(--brand)",  border: "var(--brand-border)" }
      : rate >= 10
      ? { bg: "var(--amber-dim)",  text: "var(--amber)",  border: "rgba(251,191,36,0.25)" }
      : { bg: "var(--red-dim)",    text: "var(--red)",    border: "rgba(248,113,113,0.25)" };

  return (
    <div className="tip inline-flex">
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
        style={{ background: style.bg, color: style.text, borderColor: style.border }}
      >
        Savings rate: {rate}%
      </span>
      <div className="tip-body">
        Financial advisors recommend saving at least 20% of income
      </div>
    </div>
  );
}
