"use client";
import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getYear12Months, monthKeyToLabel } from "@/lib/utils";

interface Props {
  currentMonthKey: string;
  loggedKeys: Set<string>;
}

export function MonthTabs({ currentMonthKey, loggedKeys }: Props) {
  const router    = useRouter();
  const keys      = getYear12Months();
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const container = scrollRef.current;
    const active    = activeRef.current;
    if (!container || !active) return;
    const offset =
      container.scrollLeft +
      active.getBoundingClientRect().left -
      container.getBoundingClientRect().left -
      container.clientWidth / 2 +
      active.clientWidth / 2;
    container.scrollTo({ left: offset, behavior: "smooth" });
  }, [currentMonthKey]);

  return (
    /*
     * Width is 100% of its parent container.
     * overflow-x: auto is on .tabs-scroll via globals.css.
     * No negative margins — the parent provides the edge padding.
     */
    <div
      ref={scrollRef}
      className="tabs-scroll"
      style={{
        display: "flex",
        gap: 6,
        overflowX: "auto",
        /* Bleed to the container edges without negative margin hacks */
        width: "100%",
        paddingBottom: 2,
      }}
    >
      {keys.map(key => {
        const { short } = monthKeyToLabel(key);
        const active = key === currentMonthKey;
        const logged = loggedKeys.has(key);

        return (
          <button
            key={key}
            ref={active ? activeRef : undefined}
            onClick={() => router.push(`/month/${key}`)}
            style={{
              flexShrink: 0,
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "5px 11px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: active ? 600 : 400,
              whiteSpace: "nowrap",
              cursor: "pointer",
              border: active ? "1px solid var(--border-strong)" : "1px solid transparent",
              background:  active ? "var(--surface)"  : "transparent",
              color:       active ? "var(--text-hi)"  : "var(--text-lo)",
              minHeight: 30,
            }}
          >
            {short}
            {logged && !active && (
              <span
                style={{
                  width: 5, height: 5,
                  borderRadius: "50%",
                  background: "var(--brand)",
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
