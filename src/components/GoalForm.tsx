"use client";

import { Goal } from "@/types";
import { CATEGORY_COLORS } from "@/lib/utils";
import { X, Check } from "lucide-react";

function fmtInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 12);
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function amountHint(formatted: string) {
  const n = parseFloat(formatted.replace(/\./g, "")) || 0;
  if (n < 1000) return null;
  return (
    <p className="text-xs text-content-muted mt-1.5">
      = {n.toLocaleString("vi-VN")}₫
      {n >= 1_000_000_000
        ? <span className="ml-1 text-accent">({(n / 1_000_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 2 })} tỉ)</span>
        : n >= 1_000_000
          ? <span className="ml-1 text-accent">({(n / 1_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 2 })} triệu)</span>
          : null}
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
  const inputClass = "w-full px-4 py-3 rounded-xl border border-border bg-surface-primary text-content-primary text-sm focus-ring placeholder:text-content-muted transition-colors";
  const labelClass = "block text-sm font-medium text-content-secondary mb-2";

  return (
    <div className="glass-card p-6 !border-accent/30 animate-in animate-in-delay-1">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold font-display text-content-primary">{isEditing ? "Sửa mục tiêu" : "Mục tiêu mới"}</h3>
        <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-accent-soft text-content-muted transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Tên mục tiêu</label>
          <input type="text" value={form.name} onChange={(e) => onChange({ ...form, name: e.target.value })}
            required maxLength={60} placeholder="vd. Mua xe, Du lịch Nhật Bản..."
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Số tiền mục tiêu</label>
            <input type="text" inputMode="numeric" value={form.target_amount}
              onChange={(e) => onChange({ ...form, target_amount: fmtInput(e.target.value) })}
              required placeholder="0" className={inputClass}
            />
            {amountHint(form.target_amount)}
          </div>
          <div>
            <label className={labelClass}>Đã tiết kiệm được</label>
            <input type="text" inputMode="numeric" value={form.current_amount}
              onChange={(e) => onChange({ ...form, current_amount: fmtInput(e.target.value) })}
              placeholder="0" className={inputClass}
            />
            {amountHint(form.current_amount)}
          </div>
        </div>
        <div>
          <label className={labelClass}>
            Hạn chót <span className="text-content-muted font-normal">(tuỳ chọn)</span>
          </label>
          <input type="date" value={form.deadline} onChange={(e) => onChange({ ...form, deadline: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Màu sắc</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_COLORS.map((color) => (
              <button key={color} type="button" onClick={() => onChange({ ...form, color })}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:shadow-md"
                style={{ backgroundColor: color }}
              >
                {form.color === color && <Check className="w-4 h-4 text-white drop-shadow" />}
              </button>
            ))}
          </div>
        </div>
        {error && <p className="text-sm text-expense bg-expense-soft px-4 py-3 rounded-xl">{error}</p>}
        <div className="flex gap-3">
          <button type="button" onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-border text-sm font-medium text-content-secondary hover:bg-accent-soft hover:text-accent transition-all"
          >Hủy</button>
          <button type="submit" disabled={loading}
            className="flex-1 py-3 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-60 text-white text-sm font-semibold transition-all shadow-lg shadow-accent/20"
          >{loading ? "Đang lưu..." : isEditing ? "Lưu thay đổi" : "Tạo mục tiêu"}</button>
        </div>
      </form>
    </div>
  );
}
