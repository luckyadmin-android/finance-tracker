import { Transaction } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function RecentTransactions({
  transactions,
}: {
  transactions: Transaction[];
}) {
  if (transactions.length === 0) {
    return (
      <div className="px-5 py-10 text-center text-slate-400 text-sm">
        Chưa có giao dịch tháng này. Thêm giao dịch đầu tiên của bạn!
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {transactions.map((t) => (
        <div key={t.id} className="flex items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                t.type === "income" ? "bg-green-50" : "bg-red-50"
              }`}
            >
              {t.type === "income" ? (
                <ArrowUpRight className="w-5 h-5 text-green-600" />
              ) : (
                <ArrowDownRight className="w-5 h-5 text-red-500" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{t.description}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {t.category?.name ?? "Uncategorized"} · {formatDate(t.date)}
              </p>
            </div>
          </div>
          <span
            className={`text-sm font-semibold ml-4 flex-shrink-0 ${
              t.type === "income" ? "text-green-600" : "text-red-500"
            }`}
          >
            {t.type === "income" ? "+" : "-"}
            {formatCurrency(t.amount)}
          </span>
        </div>
      ))}
    </div>
  );
}
