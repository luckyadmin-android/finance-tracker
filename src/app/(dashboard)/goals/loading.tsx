export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded w-44 mb-2" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20" />
        </div>
        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl w-36" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                <div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-28 mb-1.5" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20" />
                </div>
              </div>
            </div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2" />
            <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
