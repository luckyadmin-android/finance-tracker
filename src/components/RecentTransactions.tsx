"use client";

import { Transaction } from "@/types";
import { formatDate, RECURRENCE_LABELS } from "@/lib/utils";
import { useCurrency } from "@/components/CurrencyProvider";
import { ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";

export default function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  const { fmt } = useCurrency();

  if (transactions.length === 0) {
    return (
      <div className="px-5 py-10 text-center text-slate-400 dark:text-slate-500 text-sm">
        Chưa có giao dịch tháng này. Thêm giao dịch đầu tiên của bạn!
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-700">
      {transactions.map((t) => (
        <div key={t.id} className="flex items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${t.type === "income" ? "bg-green-50 dark:bg-green-900/30" : "bg-red-50 dark:bg-red-900/30"}`}>
              {t.type === "income" ? <ArrowUpRight className="w-5 h-5 text-green-600" /> : <ArrowDownRight className="w-5 h-5 text-red-500" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{t.description}</p>
                {t.is_recurring && t.recurrence && (
                  <span className="flex items-center gap-0.5 text-xs text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded-full flex-shrink-0">
                    <RefreshCw className="w-2.5 h-2.5" />{RECURRENCE_LABELS[t.recurrence]}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                {t.category?.name ?? "Không phân loại"} · {formatDate(t.date)}
              </p>
            </div>
          </div>
          <span className={`text-sm font-semibold ml-4 flex-shrink-0 ${t.type === "income" ? "text-green-600" : "text-red-500"}`}>
            {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
          </span>
        </div>
      ))}
    </div>
  );
}
