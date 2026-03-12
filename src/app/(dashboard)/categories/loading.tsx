export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded w-28 mb-2" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20" />
        </div>
        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl w-36" />
      </div>
      {[...Array(2)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-40" />
          </div>
          {[...Array(4)].map((_, j) => (
            <div key={j} className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-700 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded-full" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
