"use client";

import { Transaction } from "@/types";
import { formatDate, RECURRENCE_LABELS } from "@/lib/utils";
import { useCurrency } from "@/components/CurrencyProvider";
import { Pencil, Trash2, ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";

interface Props {
  transactions: Transaction[];
  allEmpty: boolean;
  deleting: string | null;
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
}

export default function TransactionList({ transactions, allEmpty, deleting, onEdit, onDelete }: Props) {
  const { fmt } = useCurrency();

  if (transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 py-16 text-center text-slate-400 dark:text-slate-500 text-sm">
        {allEmpty ? "Chưa có giao dịch. Thêm giao dịch đầu tiên!" : "Không có giao dịch nào khớp với bộ lọc."}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="divide-y divide-slate-100 dark:divide-slate-700">
        {transactions.map((t) => (
          <div key={t.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 group transition-colors">
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
                  {t.next_occurrence && <span className="ml-1 text-indigo-400">· tiếp: {t.next_occurrence}</span>}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 ml-4 flex-shrink-0">
              <span className={`text-sm font-semibold ${t.type === "income" ? "text-green-600" : "text-red-500"}`}>
                {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
              </span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit(t)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => onDelete(t.id)} disabled={deleting === t.id}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
