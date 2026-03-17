export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="skeleton h-8 w-44 mb-2" />
          <div className="skeleton h-4 w-20" />
        </div>
        <div className="skeleton h-10 w-36 !rounded-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="skeleton w-10 h-10 !rounded-xl" />
                <div>
                  <div className="skeleton h-4 w-28 mb-1.5" />
                  <div className="skeleton h-3 w-20" />
                </div>
              </div>
            </div>
            <div className="skeleton h-3 w-full mb-2" />
            <div className="skeleton h-2.5 w-full !rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
