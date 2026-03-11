"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Transaction, Category, TransactionType } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import TransactionModal from "@/components/TransactionModal";
import { Plus, Pencil, Trash2, ArrowUpRight, ArrowDownRight, Search, X } from "lucide-react";

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
  const [filterMonth, setFilterMonth] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const supabase = createClient();

  const visibleCategories = useMemo(() => {
    if (filterType === "all") return categories;
    return categories.filter((c) => c.type === filterType);
  }, [categories, filterType]);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (filterType !== "all" && t.type !== filterType) return false;
      if (filterCategory !== "all" && t.category_id !== filterCategory) return false;
      if (filterMonth && !t.date.startsWith(filterMonth)) return false;
      if (
        search &&
        !t.description.toLowerCase().includes(search.toLowerCase()) &&
        !(t.category?.name.toLowerCase().includes(search.toLowerCase()))
      )
        return false;
      return true;
    });
  }, [transactions, filterType, filterCategory, filterMonth, search]);

  const totalIncome = filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const hasFilters = search || filterType !== "all" || filterCategory !== "all" || filterMonth;

  function clearFilters() {
    setSearch("");
    setFilterType("all");
    setFilterCategory("all");
    setFilterMonth("");
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
          <h1 className="text-2xl font-bold text-slate-900">Giao Dịch</h1>
          <p className="text-slate-500 text-sm mt-1">{transactions.length} giao dịch</p>
        </div>
        <button
          onClick={() => { setEditing(null); setModalOpen(true); }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Thêm giao dịch
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mô tả hoặc danh mục..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value as TransactionType | "all"); setFilterCategory("all"); }}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="all">Tất cả loại</option>
            <option value="income">Thu nhập</option>
            <option value="expense">Chi tiêu</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="all">Tất cả danh mục</option>
            {visibleCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        {hasFilters && (
          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-slate-500">Hiển thị {filtered.length} / {transactions.length} giao dịch</p>
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Xóa bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-green-700 font-medium">Thu nhập</span>
          <span className="text-sm font-bold text-green-700">{formatCurrency(totalIncome)}</span>
        </div>
        <div className="bg-red-50 rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-red-600 font-medium">Chi tiêu</span>
          <span className="text-sm font-bold text-red-600">{formatCurrency(totalExpense)}</span>
        </div>
      </div>

      {/* Transaction list */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            {transactions.length === 0
              ? "Chưa có giao dịch. Thêm giao dịch đầu tiên của bạn!"
              : "Không có giao dịch nào khớp với bộ lọc."}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((t) => (
              <div key={t.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 group transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${t.type === "income" ? "bg-green-50" : "bg-red-50"}`}>
                    {t.type === "income" ? (
                      <ArrowUpRight className="w-5 h-5 text-green-600" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{t.description}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {t.category?.name ?? "Không phân loại"} · {formatDate(t.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                  <span className={`text-sm font-semibold ${t.type === "income" ? "text-green-600" : "text-red-500"}`}>
                    {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => { setEditing(t); setModalOpen(true); }}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      disabled={deleting === t.id}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
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
