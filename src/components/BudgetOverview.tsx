"use client";

import { Category } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { AlertTriangle, CheckCircle } from "lucide-react";

export interface BudgetItem {
  category: Category;
  spent: number;
}

interface Props {
  items: BudgetItem[];
}

export default function BudgetOverview({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200">
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="font-semibold text-slate-900">Ngân Sách Tháng Này</h2>
        <p className="text-xs text-slate-400 mt-0.5">Theo dõi chi tiêu so với hạn mức</p>
      </div>
      <div className="divide-y divide-slate-100">
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
                  <span className="text-sm font-medium text-slate-700">{category.name}</span>
                  {over && (
                    <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5" /> Vượt hạn mức
                    </span>
                  )}
                  {warn && (
                    <span className="flex items-center gap-1 text-xs text-amber-500 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5" /> Gần đạt giới hạn
                    </span>
                  )}
                  {!over && !warn && spent > 0 && (
                    <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                      <CheckCircle className="w-3.5 h-3.5" /> Ổn
                    </span>
                  )}
                </div>
                <span className={`text-sm font-semibold ${over ? "text-red-600" : "text-slate-700"}`}>
                  {formatCurrency(spent)} / {formatCurrency(limit)}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    over ? "bg-red-500" : warn ? "bg-amber-400" : "bg-green-500"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                {over ? (
                  <p className="text-xs text-red-500">Vượt {formatCurrency(spent - limit)}</p>
                ) : (
                  <p className="text-xs text-slate-400">Còn lại {formatCurrency(limit - spent)}</p>
                )}
                <p className="text-xs text-slate-400">{Math.round(pct)}%</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
