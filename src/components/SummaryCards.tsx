"use client";

import { useCurrency } from "@/components/CurrencyProvider";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

interface Props {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  monthLabel: string;
}

export default function SummaryCards({ totalIncome, totalExpense, netBalance, monthLabel }: Props) {
  const { fmt } = useCurrency();

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tổng Quan</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{monthLabel}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Thu nhập</span>
            <div className="w-9 h-9 bg-green-50 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{fmt(totalIncome)}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Tháng này</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Chi tiêu</span>
            <div className="w-9 h-9 bg-red-50 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{fmt(totalExpense)}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Tháng này</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Số dư</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${netBalance >= 0 ? "bg-indigo-50 dark:bg-indigo-900/30" : "bg-orange-50 dark:bg-orange-900/30"}`}>
              <Wallet className={`w-5 h-5 ${netBalance >= 0 ? "text-indigo-600" : "text-orange-500"}`} />
            </div>
          </div>
          <p className={`text-2xl font-bold ${netBalance >= 0 ? "text-slate-900 dark:text-white" : "text-orange-600"}`}>
            {fmt(netBalance)}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Thu nhập trừ chi tiêu</p>
        </div>
      </div>
    </>
  );
}
