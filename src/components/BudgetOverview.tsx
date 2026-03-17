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
    <div className="glass-card animate-in animate-in-delay-3">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="font-semibold font-display text-content-primary">Ngân Sách Tháng Này</h2>
        <p className="text-xs text-content-muted mt-0.5">Theo dõi chi tiêu so với hạn mức</p>
      </div>
      <div className="divide-y divide-border">
        {items.map(({ category, spent }) => {
          const limit = category.budget_limit!;
          const pct = Math.min((spent / limit) * 100, 100);
          const over = spent > limit;
          const warn = !over && pct >= 80;

          return (
            <div key={category.id} className="px-6 py-4">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: category.color }} />
                  <span className="text-sm font-medium text-content-secondary">{category.name}</span>
                  {over && <span className="flex items-center gap-1 text-[11px] text-expense font-semibold"><AlertTriangle className="w-3.5 h-3.5" />Vượt hạn mức</span>}
                  {warn && <span className="flex items-center gap-1 text-[11px] text-income font-semibold"><AlertTriangle className="w-3.5 h-3.5" />Gần đạt giới hạn</span>}
                  {!over && !warn && spent > 0 && <span className="flex items-center gap-1 text-[11px] text-accent font-semibold"><CheckCircle className="w-3.5 h-3.5" />Ổn</span>}
                </div>
                <span className={`text-sm font-semibold ${over ? "text-expense" : "text-content-secondary"}`}>
                  {fmt(spent)} / {fmt(limit)}
                </span>
              </div>
              <div className="w-full bg-border rounded-full h-2">
                <div className={`h-2 rounded-full transition-all duration-500 ${over ? "bg-expense" : warn ? "bg-income" : "bg-accent"}`} style={{ width: `${pct}%` }} />
              </div>
              <div className="flex justify-between mt-2">
                {over ? (
                  <p className="text-[11px] text-expense font-medium">Vượt {fmt(spent - limit)}</p>
                ) : (
                  <p className="text-[11px] text-content-muted">Còn lại {fmt(limit - spent)}</p>
                )}
                <p className="text-[11px] text-content-muted">{Math.round(pct)}%</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
