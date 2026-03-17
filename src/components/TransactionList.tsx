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
      <div className="glass-card py-16 text-center text-content-muted text-sm animate-in animate-in-delay-3">
        {allEmpty ? "Chưa có giao dịch. Thêm giao dịch đầu tiên!" : "Không có giao dịch nào khớp với bộ lọc."}
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden animate-in animate-in-delay-3">
      <div className="divide-y divide-border">
        {transactions.map((t) => (
          <div key={t.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-accent-soft/50 group transition-colors">
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
                  {t.next_occurrence && <span className="ml-1 text-accent">· tiếp: {t.next_occurrence}</span>}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 ml-4 flex-shrink-0">
              <span className={`text-sm font-semibold ${t.type === "income" ? "text-income" : "text-expense"}`}>
                {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
              </span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit(t)}
                  className="p-1.5 rounded-lg hover:bg-accent-soft text-content-muted hover:text-accent transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => onDelete(t.id)} disabled={deleting === t.id}
                  className="p-1.5 rounded-lg hover:bg-expense-soft text-content-muted hover:text-expense transition-colors"
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
