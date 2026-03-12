"use client";

import { Category } from "@/types";
import { useCurrency } from "@/components/CurrencyProvider";
import { AlertTriangle, CheckCircle } from "lucide-react";

export interface BudgetItem {
  category: Category;
  spent: number;
}

export default function BudgetOverview({ items }: { items: BudgetItem[] }) {
  const { fmt } = useCurrency();
  if (items.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <h2 className="font-semibold text-slate-900 dark:text-white">Ngân Sách Tháng Này</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Theo dõi chi tiêu so với hạn mức</p>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-700">
        {items.map(({ category, spent }) => {
          const limit = category.budget_limit!;
          const pct = Math.min((spent / limit) * 100, 100);
          const over = spent > limit;
          const warn = !over && pct >= 80;

          return (
            <div key={category.id} className="px-5 py-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: category.color }} />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{category.name}</span>
                  {over && <span className="flex items-center gap-1 text-xs text-red-500 font-medium"><AlertTriangle className="w-3.5 h-3.5" />Vượt hạn mức</span>}
                  {warn && <span className="flex items-center gap-1 text-xs text-amber-500 font-medium"><AlertTriangle className="w-3.5 h-3.5" />Gần đạt giới hạn</span>}
                  {!over && !warn && spent > 0 && <span className="flex items-center gap-1 text-xs text-green-600 font-medium"><CheckCircle className="w-3.5 h-3.5" />Ổn</span>}
                </div>
                <span className={`text-sm font-semibold ${over ? "text-red-600" : "text-slate-700 dark:text-slate-200"}`}>
                  {fmt(spent)} / {fmt(limit)}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                <div className={`h-2 rounded-full transition-all duration-300 ${over ? "bg-red-500" : warn ? "bg-amber-400" : "bg-green-500"}`} style={{ width: `${pct}%` }} />
              </div>
              <div className="flex justify-between mt-1.5">
                {over ? (
                  <p className="text-xs text-red-500">Vượt {fmt(spent - limit)}</p>
                ) : (
                  <p className="text-xs text-slate-400 dark:text-slate-500">Còn lại {fmt(limit - spent)}</p>
                )}
                <p className="text-xs text-slate-400 dark:text-slate-500">{Math.round(pct)}%</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
