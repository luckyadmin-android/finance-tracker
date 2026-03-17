"use server";

import { createClient } from "@/lib/supabase/server";
import { Category, TransactionType } from "@/types";
import { CATEGORY_COLORS } from "@/lib/utils";

export type CategoryActionResult =
  | { success: true; data: Category }
  | { success: false; error: string };

function validateCategoryInput(name: string, color: string, budgetLimit: number | null): string | null {
  if (!name.trim()) return "Tên danh mục không được để trống.";
  if (name.trim().length > 40) return "Tên không được quá 40 ký tự.";
  if (!CATEGORY_COLORS.includes(color)) return "Màu sắc không hợp lệ.";
  if (budgetLimit !== null && (isNaN(budgetLimit) || budgetLimit < 0)) return "Hạn mức ngân sách không hợp lệ.";
  if (budgetLimit !== null && budgetLimit > 999_999_999_999) return "Hạn mức ngân sách quá lớn.";
  if (budgetLimit !== null && budgetLimit > 0 && budgetLimit % 1000 !== 0) return "Hạn mức ngân sách phải là bội số của 1.000₫.";
  return null;
}

export async function upsertCategory(
  id: string | null,
  name: string,
  type: TransactionType,
  color: string,
  budgetLimit: number | null
): Promise<CategoryActionResult> {
  const validationError = validateCategoryInput(name, color, budgetLimit);
  if (validationError) return { success: false, error: validationError };
  if (!["income", "expense"].includes(type)) return { success: false, error: "Loại danh mục không hợp lệ." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Chưa đăng nhập." };

  const payload = { name: name.trim(), color, budget_limit: budgetLimit };

  if (id) {
    const { data, error } = await supabase
      .from("categories").update(payload).eq("id", id).eq("user_id", user.id)
      .select().single();
    if (error) { console.error("[upsertCategory] update:", error); return { success: false, error: "Lỗi khi lưu danh mục. Vui lòng thử lại." }; }
    return { success: true, data: data as Category };
  } else {
    const { data, error } = await supabase
      .from("categories").insert({ ...payload, type, user_id: user.id })
      .select().single();
    if (error) { console.error("[upsertCategory] insert:", error); return { success: false, error: "Lỗi khi lưu danh mục. Vui lòng thử lại." }; }
    return { success: true, data: data as Category };
  }
}

export async function deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
  if (!id) return { success: false, error: "ID không hợp lệ." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Chưa đăng nhập." };

  const { error } = await supabase.from("categories").delete().eq("id", id).eq("user_id", user.id);
  if (error) { console.error("[deleteCategory]:", error); return { success: false, error: "Lỗi khi xóa danh mục. Vui lòng thử lại." }; }
  return { success: true };
}
