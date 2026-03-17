import { createClient } from "@/lib/supabase/server";
import { Transaction, Category } from "@/types";
import SummaryCards from "@/components/SummaryCards";
import DashboardCharts from "@/components/DashboardCharts";
import RecentTransactions from "@/components/RecentTransactions";
import BudgetOverview, { BudgetItem } from "@/components/BudgetOverview";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().split("T")[0];

  const [{ data: monthTransactions }, { data: budgetCategories }, { data: allMonthData }] = await Promise.all([
    supabase
      .from("transactions")
      .select("*, category:categories(*)")
      .eq("user_id", user!.id)
      .gte("date", firstOfMonth)
      .lte("date", lastOfMonth)
      .order("date", { ascending: false }),
    supabase
      .from("categories")
      .select("*")
      .eq("user_id", user!.id)
      .eq("type", "expense")
      .not("budget_limit", "is", null),
    supabase
      .from("transactions")
      .select("type, amount, date")
      .eq("user_id", user!.id)
      .gte("date", sixMonthsAgo)
      .order("date", { ascending: true }),
  ]);

  const transactions: Transaction[] = monthTransactions ?? [];
  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpense;

  const monthlyMap: Record<string, { income: number; expense: number }> = {};
  (allMonthData ?? []).forEach((t) => {
    const key = t.date.slice(0, 7);
    if (!monthlyMap[key]) monthlyMap[key] = { income: 0, expense: 0 };
    if (t.type === "income") monthlyMap[key].income += t.amount;
    else monthlyMap[key].expense += t.amount;
  });

  const chartData = Object.entries(monthlyMap).map(([month, vals]) => ({
    month: new Date(month + "-01").toLocaleDateString("vi-VN", { month: "short" }),
    income: vals.income,
    expense: vals.expense,
  }));

  const expenseMap: Record<string, { name: string; color: string; total: number }> = {};
  transactions.filter((t) => t.type === "expense" && t.category).forEach((t) => {
    const catId = t.category_id!;
    if (!expenseMap[catId]) expenseMap[catId] = { name: t.category!.name, color: t.category!.color, total: 0 };
    expenseMap[catId].total += t.amount;
  });

  const categoryData = Object.values(expenseMap)
    .sort((a, b) => b.total - a.total)
    .map((c) => ({ name: c.name, value: c.total, color: c.color }));

  const spendingByCategoryId: Record<string, number> = {};
  transactions.filter((t) => t.type === "expense" && t.category_id).forEach((t) => {
    spendingByCategoryId[t.category_id!] = (spendingByCategoryId[t.category_id!] ?? 0) + t.amount;
  });

  const budgetItems: BudgetItem[] = (budgetCategories ?? [])
    .filter((c): c is Category & { budget_limit: number } => !!c.budget_limit)
    .map((c) => ({ category: c as Category, spent: spendingByCategoryId[c.id] ?? 0 }));

  const monthLabel = now.toLocaleDateString("vi-VN", { month: "long", year: "numeric" });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <SummaryCards
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        netBalance={netBalance}
        monthLabel={monthLabel}
      />
      <DashboardCharts chartData={chartData} categoryData={categoryData} />
      {budgetItems.length > 0 && <BudgetOverview items={budgetItems} />}
      <div className="glass-card animate-in animate-in-delay-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-semibold font-display text-content-primary">Giao Dịch Gần Đây</h2>
          <Link href="/transactions" className="flex items-center gap-1.5 text-sm text-accent hover:text-accent-hover font-semibold transition-colors">
            Xem tất cả <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <RecentTransactions transactions={transactions.slice(0, 8)} />
      </div>
    </div>
  );
}
