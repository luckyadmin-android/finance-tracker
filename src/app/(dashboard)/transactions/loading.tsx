export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto space-y-5 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-2" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20" />
        </div>
        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl w-36" />
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-9 bg-slate-200 dark:bg-slate-700 rounded-lg flex-1" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl" />
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-slate-700 last:border-0">
            <div className="w-9 h-9 bg-slate-200 dark:bg-slate-700 rounded-xl flex-shrink-0" />
            <div className="flex-1">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-1.5" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
            </div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
