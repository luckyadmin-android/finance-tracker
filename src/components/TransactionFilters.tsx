"use client";

import { Category, TransactionType } from "@/types";
import { Search, X } from "lucide-react";

interface Props {
  search: string;
  filterType: TransactionType | "all";
  filterCategory: string;
  filterMonthNum: string;
  filterYear: string;
  visibleCategories: Category[];
  availableYears: number[];
  filteredCount: number;
  totalCount: number;
  onSearchChange: (v: string) => void;
  onTypeChange: (v: TransactionType | "all") => void;
  onCategoryChange: (v: string) => void;
  onMonthChange: (v: string) => void;
  onYearChange: (v: string) => void;
  onClear: () => void;
}

const SELECT_CLASS =
  "px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

export default function TransactionFilters({
  search, filterType, filterCategory, filterMonthNum, filterYear,
  visibleCategories, availableYears, filteredCount, totalCount,
  onSearchChange, onTypeChange, onCategoryChange, onMonthChange, onYearChange, onClear,
}: Props) {
  const hasFilters = search || filterType !== "all" || filterCategory !== "all" || filterMonthNum || filterYear;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text" placeholder="Tìm kiếm theo mô tả hoặc danh mục..." value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select value={filterType} onChange={(e) => onTypeChange(e.target.value as TransactionType | "all")} className={SELECT_CLASS}>
          <option value="all">Tất cả loại</option>
          <option value="income">Thu nhập</option>
          <option value="expense">Chi tiêu</option>
        </select>
        <select value={filterCategory} onChange={(e) => onCategoryChange(e.target.value)} className={SELECT_CLASS}>
          <option value="all">Tất cả danh mục</option>
          {visibleCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filterMonthNum} onChange={(e) => onMonthChange(e.target.value)} className={SELECT_CLASS}>
          <option value="">Tháng</option>
          {["01","02","03","04","05","06","07","08","09","10","11","12"].map((m, i) => (
            <option key={m} value={m}>Tháng {i + 1}</option>
          ))}
        </select>
        <select value={filterYear} onChange={(e) => onYearChange(e.target.value)} className={SELECT_CLASS}>
          <option value="">Năm</option>
          {availableYears.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      {hasFilters && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-slate-500 dark:text-slate-400">Hiển thị {filteredCount} / {totalCount} giao dịch</p>
          <button onClick={onClear} className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
            <X className="w-3.5 h-3.5" /> Xóa bộ lọc
          </button>
        </div>
      )}
    </div>
  );
}
