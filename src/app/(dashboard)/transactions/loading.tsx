export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="skeleton h-8 w-32 mb-2" />
          <div className="skeleton h-4 w-20" />
        </div>
        <div className="flex gap-2">
          <div className="skeleton h-10 w-28 !rounded-xl" />
          <div className="skeleton h-10 w-36 !rounded-xl" />
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="flex gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-10 flex-1 !rounded-xl" />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card px-4 py-3.5">
          <div className="skeleton h-5 w-full" />
        </div>
        <div className="glass-card px-4 py-3.5">
          <div className="skeleton h-5 w-full" />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-3.5 border-b border-border last:border-0">
            <div className="skeleton w-9 h-9 !rounded-xl flex-shrink-0" />
            <div className="flex-1">
              <div className="skeleton h-4 w-1/2 mb-1.5" />
              <div className="skeleton h-3 w-1/3" />
            </div>
            <div className="skeleton h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
