"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Transaction, Category, TransactionType } from "@/types";
import { RECURRENCE_LABELS, calcNextFutureOccurrence } from "@/lib/utils";
import { useCurrency } from "@/components/CurrencyProvider";
import TransactionModal from "@/components/TransactionModal";
import TransactionFilters from "@/components/TransactionFilters";
import TransactionList from "@/components/TransactionList";
import { Plus, Download } from "lucide-react";

interface Props {
  initialTransactions: Transaction[];
  categories: Category[];
}

export default function TransactionsClient({ initialTransactions, categories }: Props) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<TransactionType | "all">("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterMonthNum, setFilterMonthNum] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const recurringProcessed = useRef(false);
  const { fmt } = useCurrency();
  const supabase = createClient();

  // Auto-create due recurring transactions on mount
  useEffect(() => {
    if (recurringProcessed.current) return;
    recurringProcessed.current = true;

    const today = new Date().toISOString().split("T")[0];
    const due = transactions.filter(
      (t) => t.is_recurring && t.recurrence && t.next_occurrence && t.next_occurrence <= today
    );
    if (due.length === 0) return;

    (async () => {
      const newTransactions: Transaction[] = [];
      for (const t of due) {
        const occurrenceDate = t.next_occurrence!;
        const nextFuture = calcNextFutureOccurrence(occurrenceDate, t.recurrence!);

        const { data: created } = await supabase
          .from("transactions")
          .insert({
            type: t.type, amount: t.amount, description: t.description,
            category_id: t.category_id, date: occurrenceDate,
            is_recurring: true, recurrence: t.recurrence, next_occurrence: nextFuture,
          })
          .select("*, category:categories(*)")
          .single();

        await supabase.from("transactions").update({ next_occurrence: null }).eq("id", t.id);
        if (created) newTransactions.push(created as Transaction);
      }

      if (newTransactions.length > 0) {
        setTransactions((prev) => {
          const updated = prev.map((t) =>
            due.find((d) => d.id === t.id) ? { ...t, next_occurrence: null } : t
          );
          return [...newTransactions, ...updated].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
        });
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const visibleCategories = useMemo(() => {
    if (filterType === "all") return categories;
    return categories.filter((c) => c.type === filterType);
  }, [categories, filterType]);

  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = new Set(transactions.map((t) => parseInt(t.date.slice(0, 4))));
    years.add(currentYear);
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions]);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (filterType !== "all" && t.type !== filterType) return false;
      if (filterCategory !== "all" && t.category_id !== filterCategory) return false;
      if (filterYear && filterMonthNum && !t.date.startsWith(`${filterYear}-${filterMonthNum}`)) return false;
      if (filterYear && !filterMonthNum && !t.date.startsWith(filterYear)) return false;
      if (!filterYear && filterMonthNum && t.date.slice(5, 7) !== filterMonthNum) return false;
      if (
        search &&
        !t.description.toLowerCase().includes(search.toLowerCase()) &&
        !(t.category?.name.toLowerCase().includes(search.toLowerCase()))
      ) return false;
      return true;
    });
  }, [transactions, filterType, filterCategory, filterYear, filterMonthNum, search]);

  const totalIncome = filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  function clearFilters() {
    setSearch(""); setFilterType("all"); setFilterCategory("all");
    setFilterMonthNum(""); setFilterYear("");
  }

  function exportCSV() {
    const headers = ["Ngày", "Loại", "Mô tả", "Danh mục", "Số tiền", "Lặp lại"];
    const rows = filtered.map((t) => [
      t.date,
      t.type === "income" ? "Thu nhập" : "Chi tiêu",
      `"${t.description.replace(/"/g, '""')}"`,
      t.category?.name ?? "Không phân loại",
      t.amount,
      t.is_recurring && t.recurrence ? RECURRENCE_LABELS[t.recurrence] : "",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `giao-dich-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDelete(id: string) {
    if (!confirm("Xóa giao dịch này?")) return;
    setDeleting(id);
    await supabase.from("transactions").delete().eq("id", id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    setDeleting(null);
  }

  function handleSaved(transaction: Transaction) {
    setTransactions((prev) => {
      const exists = prev.find((t) => t.id === transaction.id);
      if (exists) return prev.map((t) => (t.id === transaction.id ? transaction : t));
      return [transaction, ...prev];
    });
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Giao Dịch</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{transactions.length} giao dịch</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" /> Xuất CSV
          </button>
          <button
            onClick={() => { setEditing(null); setModalOpen(true); }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Thêm giao dịch
          </button>
        </div>
      </div>

      <TransactionFilters
        search={search} filterType={filterType} filterCategory={filterCategory}
        filterMonthNum={filterMonthNum} filterYear={filterYear}
        visibleCategories={visibleCategories} availableYears={availableYears}
        filteredCount={filtered.length} totalCount={transactions.length}
        onSearchChange={setSearch}
        onTypeChange={(v) => { setFilterType(v); setFilterCategory("all"); }}
        onCategoryChange={setFilterCategory}
        onMonthChange={setFilterMonthNum}
        onYearChange={setFilterYear}
        onClear={clearFilters}
      />

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-green-700 dark:text-green-400 font-medium">Thu nhập</span>
          <span className="text-sm font-bold text-green-700 dark:text-green-400">{fmt(totalIncome)}</span>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-red-600 dark:text-red-400 font-medium">Chi tiêu</span>
          <span className="text-sm font-bold text-red-600 dark:text-red-400">{fmt(totalExpense)}</span>
        </div>
      </div>

      <TransactionList
        transactions={filtered}
        allEmpty={transactions.length === 0}
        deleting={deleting}
        onEdit={(t) => { setEditing(t); setModalOpen(true); }}
        onDelete={handleDelete}
      />

      {modalOpen && (
        <TransactionModal
          transaction={editing}
          categories={categories}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
