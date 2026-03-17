export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header skeleton */}
      <div>
        <div className="skeleton h-8 w-40 mb-2" />
        <div className="skeleton h-4 w-28" />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="skeleton h-3 w-16" />
              <div className="skeleton w-10 h-10 !rounded-xl" />
            </div>
            <div className="skeleton h-7 w-32 mb-1.5" />
            <div className="skeleton h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="glass-card p-6 h-72">
            <div className="skeleton h-5 w-44 mb-5" />
            <div className="skeleton h-48 w-full !rounded-xl" />
          </div>
        ))}
      </div>

      {/* Recent transactions */}
      <div className="glass-card">
        <div className="px-6 py-4 border-b border-border flex justify-between">
          <div className="skeleton h-5 w-40" />
          <div className="skeleton h-5 w-24" />
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-6 py-3.5">
            <div className="skeleton w-9 h-9 !rounded-xl flex-shrink-0" />
            <div className="flex-1">
              <div className="skeleton h-4 w-36 mb-1.5" />
              <div className="skeleton h-3 w-24" />
            </div>
            <div className="skeleton h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
