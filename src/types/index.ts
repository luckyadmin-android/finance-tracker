export type TransactionType = "income" | "expense";
export type RecurrenceType = "daily" | "weekly" | "monthly" | "yearly";

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: TransactionType;
  color: string;
  budget_limit?: number | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string | null;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
  is_recurring: boolean;
  recurrence?: RecurrenceType | null;
  next_occurrence?: string | null;
  created_at: string;
  category?: Category;
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  color: string;
  deadline?: string | null;
  created_at: string;
}

export interface MonthlySummary {
  month: string;
  income: number;
  expense: number;
}

export interface CategorySummary {
  category_id: string;
  category_name: string;
  color: string;
  total: number;
  percentage: number;
}
