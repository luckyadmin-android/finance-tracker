"use client";

import { Goal } from "@/types";
import { CATEGORY_COLORS } from "@/lib/utils";
import { X, Check } from "lucide-react";

function fmtInput(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function amountHint(formatted: string) {
  const n = parseFloat(formatted.replace(/\./g, "")) || 0;
  if (n < 1000) return null;
  return (
    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
      = {n.toLocaleString("vi-VN")}₫
      {n >= 1_000_000 && <span className="ml-1 text-indigo-400">({(n / 1_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 2 })} triệu)</span>}
    </p>
  );
}

export interface GoalFormState {
  name: string;
  target_amount: string;
  current_amount: string;
  color: string;
  deadline: string;
}

export const DEFAULT_GOAL_FORM: GoalFormState = {
  name: "", target_amount: "", current_amount: "",
  color: CATEGORY_COLORS[0], deadline: "",
};

export function goalFormFromGoal(goal: Goal): GoalFormState {
  return {
    name: goal.name,
    target_amount: fmtInput(String(goal.target_amount)),
    current_amount: fmtInput(String(goal.current_amount)),
    color: goal.color,
    deadline: goal.deadline ?? "",
  };
}

interface Props {
  form: GoalFormState;
  isEditing: boolean;
  loading: boolean;
  error: string;
  onChange: (form: GoalFormState) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}

export default function GoalForm({ form, isEditing, loading, error, onChange, onSubmit, onCancel }: Props) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-indigo-200 dark:border-indigo-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white">{isEditing ? "Sửa mục tiêu" : "Mục tiêu mới"}</h3>
        <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">
          <X className="w-4 h-4" />
        </button>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tên mục tiêu</label>
          <input type="text" value={form.name} onChange={(e) => onChange({ ...form, name: e.target.value })}
            required maxLength={60} placeholder="vd. Mua xe, Du lịch Nhật Bản..."
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Số tiền mục tiêu</label>
            <input type="text" inputMode="numeric" value={form.target_amount}
              onChange={(e) => onChange({ ...form, target_amount: fmtInput(e.target.value) })}
              required placeholder="0"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            {amountHint(form.target_amount)}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Đã tiết kiệm được</label>
            <input type="text" inputMode="numeric" value={form.current_amount}
              onChange={(e) => onChange({ ...form, current_amount: fmtInput(e.target.value) })}
              placeholder="0"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            {amountHint(form.current_amount)}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Hạn chót <span className="text-slate-400 font-normal">(tuỳ chọn)</span>
          </label>
          <input type="date" value={form.deadline} onChange={(e) => onChange({ ...form, deadline: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Màu sắc</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_COLORS.map((color) => (
              <button key={color} type="button" onClick={() => onChange({ ...form, color })}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                style={{ backgroundColor: color }}
              >
                {form.color === color && <Check className="w-4 h-4 text-white" />}
              </button>
            ))}
          </div>
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 px-4 py-2.5 rounded-lg">{error}</p>}
        <div className="flex gap-3">
          <button type="button" onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >Hủy</button>
          <button type="submit" disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium transition-colors"
          >{loading ? "Đang lưu..." : isEditing ? "Lưu thay đổi" : "Tạo mục tiêu"}</button>
        </div>
      </form>
    </div>
  );
}
