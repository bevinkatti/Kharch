export default function MonthLoading() {
  return (
    <div className="max-w-[640px] mx-auto px-5 sm:px-8 py-8 space-y-6">
      {/* Tabs */}
      <div className="flex gap-1.5">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="skeleton h-6 rounded-full" style={{ width: i === 3 ? 40 : 28 }} />
        ))}
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="skeleton h-2.5 w-24 rounded" />
          <div className="skeleton h-8 w-40 rounded-lg" />
        </div>
        <div className="skeleton h-7 w-16 rounded-lg" />
      </div>

      {/* Overview card */}
      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="px-5 pt-5 pb-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-end justify-between">
            <div className="space-y-2">
              <div className="skeleton h-2.5 w-24 rounded" />
              <div className="skeleton h-8 w-32 rounded" />
            </div>
            <div className="space-y-2 text-right">
              <div className="skeleton h-2.5 w-12 rounded ml-auto" />
              <div className="skeleton h-6 w-20 rounded ml-auto" />
            </div>
          </div>
        </div>
        <div className="px-5 py-5 flex items-center gap-7">
          <div className="skeleton w-[120px] h-[120px] rounded-full flex-none" />
          <div className="flex-1 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="skeleton w-2 h-2 rounded-full flex-none" />
                <div className="skeleton h-3 flex-1 rounded" />
                <div className="skeleton h-3 w-16 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expenses */}
      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
          <div className="skeleton h-4 w-20 rounded" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
            <div className="skeleton h-2 w-2 rounded-full flex-none" />
            <div className="skeleton h-5 w-14 rounded-md flex-none" />
            <div className="skeleton h-4 flex-1 rounded" />
            <div className="skeleton h-7 w-24 rounded-md flex-none" />
          </div>
        ))}
      </div>

      {/* Checklist */}
      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="skeleton h-4 w-28 rounded" />
        </div>
        <div className="px-5 pt-4 pb-1">
          <div className="skeleton h-0.5 w-full rounded" />
        </div>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-3">
            <div className="skeleton w-[18px] h-[18px] rounded flex-none" />
            <div className="skeleton h-3.5 flex-1 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
