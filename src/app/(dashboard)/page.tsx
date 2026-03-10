import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import { Transaction } from "@/types";
import DashboardCharts from "@/components/DashboardCharts";
import RecentTransactions from "@/components/RecentTransactions";
import { TrendingUp, TrendingDown, Wallet, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];

  // Current month transactions
  const { data: monthTransactions } = await supabase
    .from("transactions")
    .select("*, category:categories(*)")
    .eq("user_id", user!.id)
    .gte("date", firstOfMonth)
    .lte("date", lastOfMonth)
    .order("date", { ascending: false });

  const transactions: Transaction[] = monthTransactions ?? [];

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  // Last 6 months data for chart
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
    .toISOString()
    .split("T")[0];

  const { data: allMonthData } = await supabase
    .from("transactions")
    .select("type, amount, date")
    .eq("user_id", user!.id)
    .gte("date", sixMonthsAgo)
    .order("date", { ascending: true });

  // Build monthly chart data
  const monthlyMap: Record<string, { income: number; expense: number }> = {};
  (allMonthData ?? []).forEach((t) => {
    const key = t.date.slice(0, 7); // "YYYY-MM"
    if (!monthlyMap[key]) monthlyMap[key] = { income: 0, expense: 0 };
    if (t.type === "income") monthlyMap[key].income += t.amount;
    else monthlyMap[key].expense += t.amount;
  });

  const chartData = Object.entries(monthlyMap).map(([month, vals]) => ({
    month: new Date(month + "-01").toLocaleDateString("en-US", {
      month: "short",
    }),
    income: vals.income,
    expense: vals.expense,
  }));

  // Spending by category this month
  const expenseMap: Record<string, { name: string; color: string; total: number }> = {};
  transactions
    .filter((t) => t.type === "expense" && t.category)
    .forEach((t) => {
      const catId = t.category_id!;
      if (!expenseMap[catId]) {
        expenseMap[catId] = {
          name: t.category!.name,
          color: t.category!.color,
          total: 0,
        };
      }
      expenseMap[catId].total += t.amount;
    });

  const categoryData = Object.values(expenseMap)
    .sort((a, b) => b.total - a.total)
    .map((c) => ({
      name: c.name,
      value: c.total,
      color: c.color,
    }));

  const monthLabel = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">{monthLabel}</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-500">Income</span>
            <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalIncome)}</p>
          <p className="text-xs text-slate-400 mt-1">This month</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-500">Expenses</span>
            <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalExpense)}</p>
          <p className="text-xs text-slate-400 mt-1">This month</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-500">Net Balance</span>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                netBalance >= 0 ? "bg-indigo-50" : "bg-orange-50"
              }`}
            >
              <Wallet
                className={`w-5 h-5 ${netBalance >= 0 ? "text-indigo-600" : "text-orange-500"}`}
              />
            </div>
          </div>
          <p
            className={`text-2xl font-bold ${
              netBalance >= 0 ? "text-slate-900" : "text-orange-600"
            }`}
          >
            {formatCurrency(netBalance)}
          </p>
          <p className="text-xs text-slate-400 mt-1">Income minus expenses</p>
        </div>
      </div>

      {/* Charts */}
      <DashboardCharts chartData={chartData} categoryData={categoryData} />

      {/* Recent transactions */}
      <div className="bg-white rounded-2xl border border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Recent Transactions</h2>
          <Link
            href="/transactions"
            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <RecentTransactions transactions={transactions.slice(0, 8)} />
      </div>
    </div>
  );
}
