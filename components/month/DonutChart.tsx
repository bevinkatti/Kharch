"use client";
import { motion } from "framer-motion";

interface Props { fixed: number; savings: number; living: number; center: string; }

function describeArc(cx: number, cy: number, r: number, startPct: number, endPct: number) {
  const rad = (pct: number) => ((pct / 100) * 360 - 90) * (Math.PI / 180);
  const x1 = cx + r * Math.cos(rad(startPct));
  const y1 = cy + r * Math.sin(rad(startPct));
  const x2 = cx + r * Math.cos(rad(endPct));
  const y2 = cy + r * Math.sin(rad(endPct));
  const large = endPct - startPct > 50 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
}

export function DonutChart({ fixed, savings, living, center }: Props) {
  const cx = 64, cy = 64, r = 54;
  const gap = 2;
  const segs = [
    { pct: fixed,   color: "#6366f1" },
    { pct: savings, color: "#3ecf8e" },
    { pct: living,  color: "#fbbf24" },
  ];
  let cursor = 0;
  const arcs = segs.map(s => {
    const start = cursor + gap / 2;
    const end   = cursor + s.pct - gap / 2;
    cursor += s.pct;
    return { ...s, start, end };
  });

  return (
    // Responsive: 100px on mobile, 120px on sm+
    <div className="donut-chart-wrap relative flex-none" style={{ width: 110, height: 110 }}>
      <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
        {arcs.map((a, i) => (
          <motion.path
            key={i}
            d={describeArc(cx, cy, r, a.start, a.end)}
            fill={a.color}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
          />
        ))}
        <circle cx={cx} cy={cy} r={38} fill="var(--donut-hole)" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-mono font-semibold leading-none"
          style={{ color: "var(--text-hi)", letterSpacing: "-0.02em", fontSize: 12 }}
        >
          {center}
        </span>
        <span className="label-caps mt-0.5" style={{ fontSize: 9 }}>saved</span>
      </div>
    </div>
  );
}
