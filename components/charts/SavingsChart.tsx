"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface Pt { label: string; saved: number; salary: number; }

function Tip({ active, payload, label, currency }: {
  active?: boolean; payload?: { value: number }[]; label?: string; currency: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-3 py-2.5 text-sm border"
      style={{
        background: "var(--surface-raised)",
        borderColor: "var(--border-strong)",
        boxShadow: "var(--shadow-md)",
      }}
    >
      <p className="text-xs mb-1" style={{ color: "var(--text-lo)" }}>{label}</p>
      <p className="font-mono font-semibold" style={{ color: "var(--brand)", fontSize: 13 }}>
        {currency}{Math.round(payload[0]?.value ?? 0).toLocaleString("en-IN")}
      </p>
    </div>
  );
}

export function SavingsChart({ data, currency = "₹" }: { data: Pt[]; currency?: string }) {
  return (
    <ResponsiveContainer width="100%" height={140}>
      <BarChart data={data} barSize={18} margin={{ top: 0, right: 0, left: -32, bottom: 0 }}>
        <XAxis
          dataKey="label"
          tick={{ fill: "var(--text-lo)", fontSize: 9, fontFamily: "Inter" }}
          axisLine={false}
          tickLine={false}
          interval={0}
        />
        <YAxis
          tick={{ fill: "var(--text-lo)", fontSize: 9, fontFamily: "JetBrains Mono" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)}
          width={36}
        />
        <Tooltip
          content={<Tip currency={currency} />}
          cursor={{ fill: "rgba(255,255,255,0.03)", radius: 4 }}
        />
        <Bar
          dataKey="saved"
          radius={[3, 3, 0, 0]}
          isAnimationActive
          animationDuration={500}
          animationEasing="ease-out"
        >
          {data.map((d, i) => (
            <Cell key={i} fill={d.saved > 0 ? "var(--brand)" : "var(--surface-raised)"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
