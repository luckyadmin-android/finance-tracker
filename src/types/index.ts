export type TransactionType = "income" | "expense";

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: TransactionType;
  color: string;
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
  created_at: string;
  category?: Category;
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
