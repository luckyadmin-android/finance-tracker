"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Goal } from "@/types";
import { CATEGORY_COLORS } from "@/lib/utils";
import { useCurrency } from "@/components/CurrencyProvider";
import { Plus, Pencil, Trash2, X, Check, Target, Trophy, Calendar } from "lucide-react";

function fmtInput(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

interface FormState {
  name: string;
  target_amount: string;
  current_amount: string;
  color: string;
  deadline: string;
}

const DEFAULT_FORM: FormState = {
  name: "", target_amount: "", current_amount: "",
  color: CATEGORY_COLORS[0], deadline: "",
};

export default function GoalsClient({ initialGoals }: { initialGoals: Goal[] }) {
  const [goals, setGoals] = useState(initialGoals);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [addAmountId, setAddAmountId] = useState<string | null>(null);
  const [addAmount, setAddAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { fmt } = useCurrency();
  const supabase = createClient();

  function startAdd() {
    setEditingId(null); setForm(DEFAULT_FORM); setError(""); setShowForm(true);
  }

  function startEdit(goal: Goal) {
    setEditingId(goal.id);
    setForm({
      name: goal.name,
      target_amount: fmtInput(String(goal.target_amount)),
      current_amount: fmtInput(String(goal.current_amount)),
      color: goal.color,
      deadline: goal.deadline ?? "",
    });
    setError(""); setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const target = parseFloat(form.target_amount.replace(/\./g, ""));
    const current = parseFloat(form.current_amount.replace(/\./g, "")) || 0;
    if (isNaN(target) || target <= 0) { setError("Nhập số tiền mục tiêu hợp lệ."); return; }
    setLoading(true); setError("");

    const payload = {
      name: form.name.trim(),
      target_amount: target,
      current_amount: current,
      color: form.color,
      deadline: form.deadline || null,
    };

    if (editingId) {
      const { data, error: err } = await supabase
        .from("goals").update(payload).eq("id", editingId).select().single();
      if (err) { setError(err.message); setLoading(false); return; }
      setGoals((prev) => prev.map((g) => (g.id === editingId ? (data as Goal) : g)));
    } else {
      const { data, error: err } = await supabase
        .from("goals").insert(payload).select().single();
      if (err) { setError(err.message); setLoading(false); return; }
      setGoals((prev) => [...prev, data as Goal]);
    }
    setShowForm(false); setEditingId(null); setForm(DEFAULT_FORM); setLoading(false);
  }

  async function handleAddAmount(goalId: string) {
    const amount = parseFloat(addAmount.replace(/\./g, ""));
    if (isNaN(amount) || amount <= 0) return;
    const goal = goals.find((g) => g.id === goalId)!;
    const newAmount = Math.min(goal.current_amount + amount, goal.target_amount);
    const { data } = await supabase
      .from("goals").update({ current_amount: newAmount }).eq("id", goalId).select().single();
    if (data) setGoals((prev) => prev.map((g) => (g.id === goalId ? (data as Goal) : g)));
    setAddAmountId(null); setAddAmount("");
  }

  async function handleDelete(id: string) {
    if (!confirm("Xóa mục tiêu này?")) return;
    await supabase.from("goals").delete().eq("id", id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }

  function daysUntil(deadline: string): number {
    const diff = new Date(deadline).getTime() - new Date().setHours(0, 0, 0, 0);
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mục Tiêu Tiết Kiệm</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{goals.length} mục tiêu</p>
        </div>
        <button onClick={startAdd} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Thêm mục tiêu
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-indigo-200 dark:border-indigo-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white">{editingId ? "Sửa mục tiêu" : "Mục tiêu mới"}</h3>
            <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tên mục tiêu</label>
              <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required maxLength={60} placeholder="vd. Mua xe, Du lịch Nhật Bản..."
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Số tiền mục tiêu</label>
                <input type="text" inputMode="numeric" value={form.target_amount}
                  onChange={(e) => setForm((f) => ({ ...f, target_amount: fmtInput(e.target.value) }))}
                  required placeholder="0"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Đã tiết kiệm được</label>
                <input type="text" inputMode="numeric" value={form.current_amount}
                  onChange={(e) => setForm((f) => ({ ...f, current_amount: fmtInput(e.target.value) }))}
                  placeholder="0"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Hạn chót <span className="text-slate-400 font-normal">(tuỳ chọn)</span>
              </label>
              <input type="date" value={form.deadline} onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Màu sắc</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_COLORS.map((color) => (
                  <button key={color} type="button" onClick={() => setForm((f) => ({ ...f, color }))}
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
              <button type="button" onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >Hủy</button>
              <button type="submit" disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium transition-colors"
              >{loading ? "Đang lưu..." : editingId ? "Lưu thay đổi" : "Tạo mục tiêu"}</button>
            </div>
          </form>
        </div>
      )}

      {/* Goals grid */}
      {goals.length === 0 && !showForm ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 py-16 text-center">
          <Target className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Chưa có mục tiêu nào</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Tạo mục tiêu đầu tiên để bắt đầu tiết kiệm!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const pct = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
            const done = pct >= 100;
            const remaining = goal.target_amount - goal.current_amount;
            const days = goal.deadline ? daysUntil(goal.deadline) : null;
            const overdue = days !== null && days < 0;

            return (
              <div key={goal.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: goal.color + "20" }}>
                      {done
                        ? <Trophy className="w-5 h-5" style={{ color: goal.color }} />
                        : <Target className="w-5 h-5" style={{ color: goal.color }} />
                      }
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{goal.name}</h3>
                      {goal.deadline && (
                        <p className={`text-xs flex items-center gap-1 mt-0.5 ${overdue ? "text-red-500" : "text-slate-400 dark:text-slate-500"}`}>
                          <Calendar className="w-3 h-3" />
                          {overdue ? `Quá hạn ${Math.abs(days!)} ngày` : `Còn ${days} ngày`}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => startEdit(goal)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(goal.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">
                      {fmt(goal.current_amount)} / {fmt(goal.target_amount)}
                    </span>
                    <span className="font-semibold" style={{ color: goal.color }}>{Math.round(pct)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
                    <div className="h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: goal.color }}
                    />
                  </div>
                  {done ? (
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5" /> Mục tiêu đã hoàn thành!
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 dark:text-slate-500">Còn thiếu {fmt(remaining)}</p>
                  )}
                </div>

                {/* Add amount */}
                {!done && (
                  addAmountId === goal.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text" inputMode="numeric" value={addAmount}
                        onChange={(e) => setAddAmount(fmtInput(e.target.value))}
                        onKeyDown={(e) => e.key === "Enter" && handleAddAmount(goal.id)}
                        autoFocus placeholder="Nhập số tiền..."
                        className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button onClick={() => handleAddAmount(goal.id)}
                        className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium"
                      >Thêm</button>
                      <button onClick={() => { setAddAmountId(null); setAddAmount(""); }}
                        className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm"
                      >Hủy</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setAddAmountId(goal.id); setAddAmount(""); }}
                      className="w-full py-2 rounded-xl border-2 border-dashed text-sm font-medium transition-colors hover:border-solid"
                      style={{ borderColor: goal.color + "60", color: goal.color }}
                    >
                      + Thêm tiền tiết kiệm
                    </button>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
