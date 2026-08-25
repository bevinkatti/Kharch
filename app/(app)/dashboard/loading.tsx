export default function DashboardLoading() {
  return (
    <div className="max-w-[860px] mx-auto px-5 sm:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton h-8 w-36 rounded-lg" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="skeleton w-3.5 h-3.5 rounded" />
              <div className="skeleton h-2.5 w-20 rounded" />
            </div>
            <div className="skeleton h-7 w-24 rounded" />
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="rounded-xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="flex items-baseline justify-between mb-5">
          <div className="skeleton h-4 w-20 rounded" />
          <div className="skeleton h-3 w-14 rounded" />
        </div>
        <div className="flex items-end gap-2 h-40">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="skeleton flex-1 rounded-t"
              style={{ height: `${25 + Math.sin(i) * 15 + 20}%` }}
            />
          ))}
        </div>
      </div>

      {/* Month grid */}
      <div>
        <div className="skeleton h-4 w-20 rounded mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="rounded-xl border p-3.5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="skeleton h-3 w-14 rounded mb-3" />
              <div className="skeleton h-5 w-16 rounded mb-1" />
              <div className="skeleton h-2.5 w-8 rounded mb-3" />
              <div className="skeleton h-2.5 w-12 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
