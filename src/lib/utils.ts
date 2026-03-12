import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { RecurrenceType } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type CurrencyCode = "USD" | "VND";

export const CURRENCIES: Record<CurrencyCode, { label: string; symbol: string; locale: string; decimals: number }> = {
  USD: { label: "USD ($)", symbol: "$", locale: "en-US", decimals: 2 },
  VND: { label: "VND (₫)", symbol: "₫", locale: "vi-VN", decimals: 0 },
};

export function formatCurrency(amount: number, currency: CurrencyCode = "USD"): string {
  const cfg = CURRENCIES[currency];
  return new Intl.NumberFormat(cfg.locale, {
    style: "currency",
    currency,
    minimumFractionDigits: cfg.decimals,
    maximumFractionDigits: cfg.decimals,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function calcNextOccurrence(date: string, recurrence: RecurrenceType): string {
  const d = new Date(date + "T00:00:00");
  switch (recurrence) {
    case "daily":   d.setDate(d.getDate() + 1); break;
    case "weekly":  d.setDate(d.getDate() + 7); break;
    case "monthly": d.setMonth(d.getMonth() + 1); break;
    case "yearly":  d.setFullYear(d.getFullYear() + 1); break;
  }
  return d.toISOString().split("T")[0];
}

export function calcNextFutureOccurrence(fromDate: string, recurrence: RecurrenceType): string {
  const today = new Date().toISOString().split("T")[0];
  let next = calcNextOccurrence(fromDate, recurrence);
  while (next <= today) {
    next = calcNextOccurrence(next, recurrence);
  }
  return next;
}

export const RECURRENCE_LABELS: Record<RecurrenceType, string> = {
  daily: "Hàng ngày",
  weekly: "Hàng tuần",
  monthly: "Hàng tháng",
  yearly: "Hàng năm",
};

export const CATEGORY_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#ef4444",
  "#f97316", "#eab308", "#22c55e", "#14b8a6", "#06b6d4",
  "#3b82f6", "#a855f7",
];

export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: "Nhà ở", color: "#6366f1" },
  { name: "Ăn uống", color: "#f97316" },
  { name: "Di chuyển", color: "#3b82f6" },
  { name: "Sức khỏe", color: "#ec4899" },
  { name: "Giải trí", color: "#a855f7" },
  { name: "Mua sắm", color: "#eab308" },
  { name: "Tiện ích", color: "#14b8a6" },
  { name: "Khác", color: "#94a3b8" },
];

export const DEFAULT_INCOME_CATEGORIES = [
  { name: "Lương", color: "#22c55e" },
  { name: "Freelance", color: "#06b6d4" },
  { name: "Đầu tư", color: "#8b5cf6" },
  { name: "Thu nhập khác", color: "#94a3b8" },
];
