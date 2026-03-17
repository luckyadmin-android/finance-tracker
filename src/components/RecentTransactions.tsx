"use client";

import { Transaction } from "@/types";
import { formatDate, RECURRENCE_LABELS } from "@/lib/utils";
import { useCurrency } from "@/components/CurrencyProvider";
import { ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";

export default function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  const { fmt } = useCurrency();

  if (transactions.length === 0) {
    return (
      <div className="px-6 py-12 text-center text-content-muted text-sm">
        Chưa có giao dịch tháng này. Thêm giao dịch đầu tiên của bạn!
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {transactions.map((t) => (
        <div key={t.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-accent-soft/50 transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${t.type === "income" ? "bg-income-soft" : "bg-expense-soft"}`}>
              {t.type === "income" ? <ArrowUpRight className="w-5 h-5 text-income" /> : <ArrowDownRight className="w-5 h-5 text-expense" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium text-content-primary truncate">{t.description}</p>
                {t.is_recurring && t.recurrence && (
                  <span className="flex items-center gap-0.5 text-[10px] text-accent bg-accent-soft px-1.5 py-0.5 rounded-full flex-shrink-0 font-semibold">
                    <RefreshCw className="w-2.5 h-2.5" />{RECURRENCE_LABELS[t.recurrence]}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-content-muted mt-0.5">
                {t.category?.name ?? "Không phân loại"} · {formatDate(t.date)}
              </p>
            </div>
          </div>
          <span className={`text-sm font-semibold ml-4 flex-shrink-0 ${t.type === "income" ? "text-income" : "text-expense"}`}>
            {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
          </span>
        </div>
      ))}
    </div>
  );
}
