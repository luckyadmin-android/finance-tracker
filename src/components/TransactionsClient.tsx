"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Transaction, Category, TransactionType } from "@/types";
import { deleteTransaction } from "@/app/actions/transactions";
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
      const insertPayloads = due.map((t) => {
        const occurrenceDate = t.next_occurrence!;
        const nextFuture = calcNextFutureOccurrence(occurrenceDate, t.recurrence!);
        return {
          type: t.type, amount: t.amount, description: t.description,
          category_id: t.category_id, date: occurrenceDate,
          is_recurring: true, recurrence: t.recurrence, next_occurrence: nextFuture,
        };
      });

      const dueIds = due.map((t) => t.id);
      const [{ data: created }] = await Promise.all([
        supabase
          .from("transactions")
          .insert(insertPayloads)
          .select("*, category:categories(*)"),
        supabase
          .from("transactions")
          .update({ next_occurrence: null })
          .in("id", dueIds),
      ]);

      const newTransactions: Transaction[] = created ? (created as Transaction[]) : [];

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
    const result = await deleteTransaction(id);
    if (result.success) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } else {
      alert(result.error ?? "Lỗi khi xóa giao dịch.");
    }
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
      <div className="flex items-center justify-between animate-in">
        <div>
          <h1 className="text-3xl font-bold font-display text-content-primary tracking-tight">Giao Dịch</h1>
          <p className="text-content-muted text-sm mt-1">{transactions.length} giao dịch</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 border border-border text-content-secondary hover:bg-accent-soft hover:text-accent px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
          >
            <Download className="w-4 h-4" /> Xuất CSV
          </button>
          <button
            onClick={() => { setEditing(null); setModalOpen(true); }}
            className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-accent/20 hover:shadow-accent/30"
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

      <div className="grid grid-cols-2 gap-4 animate-in animate-in-delay-2">
        <div className="glass-card px-4 py-3.5 flex items-center justify-between bg-income-soft/50">
          <span className="text-sm text-income font-medium">Thu nhập</span>
          <span className="text-sm font-bold text-income">{fmt(totalIncome)}</span>
        </div>
        <div className="glass-card px-4 py-3.5 flex items-center justify-between bg-expense-soft/50">
          <span className="text-sm text-expense font-medium">Chi tiêu</span>
          <span className="text-sm font-bold text-expense">{fmt(totalExpense)}</span>
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
