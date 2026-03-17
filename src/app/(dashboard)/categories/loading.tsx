export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="skeleton h-8 w-28 mb-2" />
          <div className="skeleton h-4 w-20" />
        </div>
        <div className="skeleton h-10 w-36 !rounded-xl" />
      </div>

      {[...Array(2)].map((_, i) => (
        <div key={i} className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <div className="skeleton h-5 w-40" />
          </div>
          {[...Array(4)].map((_, j) => (
            <div key={j} className="flex items-center justify-between px-6 py-3.5 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <div className="skeleton w-4 h-4 !rounded-full" />
                <div className="skeleton h-4 w-32" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
