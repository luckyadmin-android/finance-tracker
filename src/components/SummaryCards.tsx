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
      <div className="animate-in">
        <h1 className="text-3xl font-bold font-display text-content-primary tracking-tight">Tổng Quan</h1>
        <p className="text-content-muted text-sm mt-1">{monthLabel}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 animate-in animate-in-delay-1">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-content-muted uppercase tracking-wider">Thu nhập</span>
            <div className="w-10 h-10 bg-income-soft rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-income" />
            </div>
          </div>
          <p className="text-2xl font-bold font-display text-content-primary">{fmt(totalIncome)}</p>
          <p className="text-xs text-content-muted mt-1.5">Tháng này</p>
        </div>

        <div className="glass-card p-5 animate-in animate-in-delay-2">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-content-muted uppercase tracking-wider">Chi tiêu</span>
            <div className="w-10 h-10 bg-expense-soft rounded-xl flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-expense" />
            </div>
          </div>
          <p className="text-2xl font-bold font-display text-content-primary">{fmt(totalExpense)}</p>
          <p className="text-xs text-content-muted mt-1.5">Tháng này</p>
        </div>

        <div className="glass-card p-5 animate-in animate-in-delay-3">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-content-muted uppercase tracking-wider">Số dư</span>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${netBalance >= 0 ? "bg-accent-soft" : "bg-expense-soft"}`}>
              <Wallet className={`w-5 h-5 ${netBalance >= 0 ? "text-accent" : "text-expense"}`} />
            </div>
          </div>
          <p className={`text-2xl font-bold font-display ${netBalance >= 0 ? "text-content-primary" : "text-expense"}`}>
            {fmt(netBalance)}
          </p>
          <p className="text-xs text-content-muted mt-1.5">Thu nhập trừ chi tiêu</p>
        </div>
      </div>
    </>
  );
}
