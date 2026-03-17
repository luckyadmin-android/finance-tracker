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
  "px-3 py-2.5 rounded-xl border border-border bg-surface-primary text-content-primary text-sm focus-ring appearance-none cursor-pointer";

export default function TransactionFilters({
  search, filterType, filterCategory, filterMonthNum, filterYear,
  visibleCategories, availableYears, filteredCount, totalCount,
  onSearchChange, onTypeChange, onCategoryChange, onMonthChange, onYearChange, onClear,
}: Props) {
  const hasFilters = search || filterType !== "all" || filterCategory !== "all" || filterMonthNum || filterYear;

  return (
    <div className="glass-card p-4 space-y-3 animate-in animate-in-delay-1">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
          <input
            type="text" placeholder="Tìm kiếm theo mô tả hoặc danh mục..." value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface-primary text-content-primary text-sm focus-ring placeholder:text-content-muted"
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
          <p className="text-xs text-content-muted">Hiển thị {filteredCount} / {totalCount} giao dịch</p>
          <button onClick={onClear} className="flex items-center gap-1 text-xs text-content-muted hover:text-accent transition-colors font-medium">
            <X className="w-3.5 h-3.5" /> Xóa bộ lọc
          </button>
        </div>
      )}
    </div>
  );
}
