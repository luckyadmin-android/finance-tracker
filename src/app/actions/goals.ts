"use server";

import { createClient } from "@/lib/supabase/server";
import { Goal } from "@/types";
import { CATEGORY_COLORS } from "@/lib/utils";

export type GoalActionResult =
  | { success: true; data: Goal }
  | { success: false; error: string };

function validateGoalInput(name: string, targetAmount: number, currentAmount: number, color: string): string | null {
  if (!name.trim()) return "Tên mục tiêu không được để trống.";
  if (name.trim().length > 60) return "Tên không được quá 60 ký tự.";
  if (isNaN(targetAmount) || targetAmount <= 0) return "Số tiền mục tiêu phải lớn hơn 0.";
  if (targetAmount > 999_999_999_999_999) return "Số tiền mục tiêu quá lớn.";
  if (isNaN(currentAmount) || currentAmount < 0) return "Số tiền đã tiết kiệm không hợp lệ.";
  if (currentAmount > targetAmount) return "Số tiền đã tiết kiệm không được vượt quá mục tiêu.";
  if (!CATEGORY_COLORS.includes(color)) return "Màu sắc không hợp lệ.";
  return null;
}

export async function upsertGoal(
  id: string | null,
  name: string,
  targetAmount: number,
  currentAmount: number,
  color: string,
  deadline: string | null
): Promise<GoalActionResult> {
  const validationError = validateGoalInput(name, targetAmount, currentAmount, color);
  if (validationError) return { success: false, error: validationError };

  if (deadline && !/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
    return { success: false, error: "Hạn chót không hợp lệ." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Chưa đăng nhập." };

  const payload = {
    name: name.trim(),
    target_amount: targetAmount,
    current_amount: currentAmount,
    color,
    deadline: deadline || null,
  };

  if (id) {
    const { data, error } = await supabase
      .from("goals").update(payload).eq("id", id).eq("user_id", user.id)
      .select().single();
    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Goal };
  } else {
    const { data, error } = await supabase
      .from("goals").insert(payload).select().single();
    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Goal };
  }
}

export async function addGoalAmount(
  goalId: string,
  currentAmount: number,
  addAmount: number,
  targetAmount: number
): Promise<GoalActionResult> {
  if (!goalId) return { success: false, error: "ID không hợp lệ." };
  if (isNaN(addAmount) || addAmount <= 0) return { success: false, error: "Số tiền không hợp lệ." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Chưa đăng nhập." };

  const newAmount = Math.min(currentAmount + addAmount, targetAmount);
  const { data, error } = await supabase
    .from("goals").update({ current_amount: newAmount }).eq("id", goalId).eq("user_id", user.id)
    .select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data: data as Goal };
}

export async function deleteGoal(id: string): Promise<{ success: boolean; error?: string }> {
  if (!id) return { success: false, error: "ID không hợp lệ." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Chưa đăng nhập." };

  const { error } = await supabase.from("goals").delete().eq("id", id).eq("user_id", user.id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}
