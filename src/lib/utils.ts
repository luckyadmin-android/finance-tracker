import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export const CATEGORY_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#ef4444",
  "#f97316", "#eab308", "#22c55e", "#14b8a6", "#06b6d4",
  "#3b82f6", "#a855f7",
];

export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: "Housing", color: "#6366f1" },
  { name: "Food & Dining", color: "#f97316" },
  { name: "Transportation", color: "#3b82f6" },
  { name: "Healthcare", color: "#ec4899" },
  { name: "Entertainment", color: "#a855f7" },
  { name: "Shopping", color: "#eab308" },
  { name: "Utilities", color: "#14b8a6" },
  { name: "Other", color: "#94a3b8" },
];

export const DEFAULT_INCOME_CATEGORIES = [
  { name: "Salary", color: "#22c55e" },
  { name: "Freelance", color: "#06b6d4" },
  { name: "Investments", color: "#8b5cf6" },
  { name: "Other Income", color: "#94a3b8" },
];
