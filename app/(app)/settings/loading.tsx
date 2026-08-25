export default function SettingsLoading() {
  return (
    <div className="max-w-xl mx-auto px-5 sm:px-8 py-10 space-y-6">
      <div className="space-y-2 mb-8">
        <div className="skeleton h-2.5 w-16 rounded" />
        <div className="skeleton h-8 w-28 rounded-lg" />
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-4 px-5 py-4"
            style={{ borderBottom: i < 4 ? "1px solid var(--border)" : undefined }}
          >
            <div className="flex items-start gap-3">
              <div className="skeleton w-4 h-4 rounded flex-none mt-0.5" />
              <div className="space-y-1.5">
                <div className="skeleton h-3.5 w-28 rounded" />
                <div className="skeleton h-3 w-44 rounded" />
              </div>
            </div>
            <div className="skeleton h-9 w-28 rounded-lg flex-none" />
          </div>
        ))}
      </div>

      <div className="skeleton h-10 w-full rounded-xl" />
    </div>
  );
}
