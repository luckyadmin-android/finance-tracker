"use server";

import { createClient } from "@/lib/supabase/server";
import { calcNextOccurrence } from "@/lib/utils";
import { Transaction, TransactionType, RecurrenceType } from "@/types";

export type TransactionActionResult =
  | { success: true; data: Transaction }
  | { success: false; error: string };

function validateTransactionInput(formData: {
  type: string;
  amount: number;
  description: string;
  categoryId: string | null;
  date: string;
  isRecurring: boolean;
  recurrence: string | null;
}): string | null {
  if (!["income", "expense"].includes(formData.type)) return "Loại giao dịch không hợp lệ.";
  if (isNaN(formData.amount) || formData.amount <= 0) return "Số tiền phải lớn hơn 0.";
  if (formData.amount > 999_999_999_999_999) return "Số tiền quá lớn.";
  if (!formData.description.trim()) return "Vui lòng nhập mô tả.";
  if (formData.description.trim().length > 100) return "Mô tả không được quá 100 ký tự.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.date)) return "Ngày không hợp lệ.";
  if (formData.isRecurring && formData.recurrence && !["daily", "weekly", "monthly", "yearly"].includes(formData.recurrence)) {
    return "Chu kỳ lặp lại không hợp lệ.";
  }
  return null;
}

export async function upsertTransaction(
  id: string | null,
  type: TransactionType,
  amount: number,
  description: string,
  categoryId: string | null,
  date: string,
  isRecurring: boolean,
  recurrence: RecurrenceType | null
): Promise<TransactionActionResult> {
  const validationError = validateTransactionInput({ type, amount, description, categoryId, date, isRecurring, recurrence });
  if (validationError) return { success: false, error: validationError };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Chưa đăng nhập." };

  const payload = {
    type,
    amount,
    description: description.trim(),
    category_id: categoryId || null,
    date,
    is_recurring: isRecurring,
    recurrence: isRecurring ? recurrence : null,
    next_occurrence: isRecurring && recurrence ? calcNextOccurrence(date, recurrence) : null,
  };

  if (id) {
    const { data, error } = await supabase
      .from("transactions").update(payload).eq("id", id).eq("user_id", user.id)
      .select("*, category:categories(*)").single();
    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Transaction };
  } else {
    const { data, error } = await supabase
      .from("transactions").insert(payload)
      .select("*, category:categories(*)").single();
    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Transaction };
  }
}

export async function deleteTransaction(id: string): Promise<{ success: boolean; error?: string }> {
  if (!id) return { success: false, error: "ID không hợp lệ." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Chưa đăng nhập." };

  const { error } = await supabase.from("transactions").delete().eq("id", id).eq("user_id", user.id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}
