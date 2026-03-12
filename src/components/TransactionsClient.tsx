"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Transaction, Category, TransactionType } from "@/types";
import { formatDate, RECURRENCE_LABELS, calcNextFutureOccurrence } from "@/lib/utils";
import { useCurrency } from "@/components/CurrencyProvider";
import TransactionModal from "@/components/TransactionModal";
import { Plus, Pencil, Trash2, ArrowUpRight, ArrowDownRight, Search, X, Download, RefreshCw } from "lucide-react";

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

        // Create new transaction for the due date
        const { data: created } = await supabase
          .from("transactions")
          .insert({
            type: t.type,
            amount: t.amount,
            description: t.description,
            category_id: t.category_id,
            date: occurrenceDate,
            is_recurring: true,
            recurrence: t.recurrence,
            next_occurrence: nextFuture,
          })
          .select("*, category:categories(*)")
          .single();

        // Clear next_occurrence on the old transaction (it's been consumed)
        await supabase
          .from("transactions")
          .update({ next_occurrence: null })
          .eq("id", t.id);

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
  const hasFilters = search || filterType !== "all" || filterCategory !== "all" || filterMonthNum || filterYear;

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
            <Download className="w-4 h-4" />
            Xuất CSV
          </button>
          <button
            onClick={() => { setEditing(null); setModalOpen(true); }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Thêm giao dịch
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text" placeholder="Tìm kiếm theo mô tả hoặc danh mục..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value as TransactionType | "all"); setFilterCategory("all"); }}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Tất cả loại</option>
            <option value="income">Thu nhập</option>
            <option value="expense">Chi tiêu</option>
          </select>
          <select
            value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Tất cả danh mục</option>
            {visibleCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select
            value={filterMonthNum} onChange={(e) => setFilterMonthNum(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Tháng</option>
            {["01","02","03","04","05","06","07","08","09","10","11","12"].map((m, i) => (
              <option key={m} value={m}>Tháng {i + 1}</option>
            ))}
          </select>
          <select
            value={filterYear} onChange={(e) => setFilterYear(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Năm</option>
            {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        {hasFilters && (
          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">Hiển thị {filtered.length} / {transactions.length} giao dịch</p>
            <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
              <X className="w-3.5 h-3.5" /> Xóa bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* Summary row */}
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

      {/* Transaction list */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 dark:text-slate-500 text-sm">
            {transactions.length === 0 ? "Chưa có giao dịch. Thêm giao dịch đầu tiên!" : "Không có giao dịch nào khớp với bộ lọc."}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {filtered.map((t) => (
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
                    <button onClick={() => { setEditing(t); setModalOpen(true); }}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(t.id)} disabled={deleting === t.id}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
