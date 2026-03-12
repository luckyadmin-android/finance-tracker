export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto space-y-5 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-3" />
            <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 h-64" />
        ))}
      </div>
    </div>
  );
}
