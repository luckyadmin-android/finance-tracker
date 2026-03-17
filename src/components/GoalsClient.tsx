"use client";

import { useState } from "react";
import { Goal } from "@/types";
import { upsertGoal, addGoalAmount, deleteGoal } from "@/app/actions/goals";
import GoalForm, { GoalFormState, DEFAULT_GOAL_FORM, goalFormFromGoal } from "@/components/GoalForm";
import GoalCard from "@/components/GoalCard";
import { Plus, Target } from "lucide-react";

const MAX_AMOUNT = 999_999_999_999;

export default function GoalsClient({ initialGoals }: { initialGoals: Goal[] }) {
  const [goals, setGoals] = useState(initialGoals);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<GoalFormState>(DEFAULT_GOAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function startAdd() {
    setEditingId(null); setForm(DEFAULT_GOAL_FORM); setError(""); setShowForm(true);
  }

  function startEdit(goal: Goal) {
    setEditingId(goal.id); setForm(goalFormFromGoal(goal)); setError(""); setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const target = parseFloat(form.target_amount.replace(/\./g, ""));
    const current = parseFloat(form.current_amount.replace(/\./g, "")) || 0;
    if (isNaN(target) || target <= 0) { setError("Vui lòng nhập số tiền mục tiêu hợp lệ."); return; }
    if (target > MAX_AMOUNT) { setError("Số tiền vượt quá giới hạn cho phép."); return; }
    if (target % 1000 !== 0) { setError("Số tiền mục tiêu phải là bội số của 1.000₫."); return; }
    if (current > 0 && current > MAX_AMOUNT) { setError("Số tiền đã tiết kiệm vượt quá giới hạn cho phép."); return; }
    if (current > 0 && current % 1000 !== 0) { setError("Số tiền đã tiết kiệm phải là bội số của 1.000₫."); return; }
    setLoading(true); setError("");

    const result = await upsertGoal(editingId, form.name, target, current, form.color, form.deadline || null);
    if (!result.success) { setError(result.error); setLoading(false); return; }
    if (editingId) {
      setGoals((prev) => prev.map((g) => (g.id === editingId ? result.data : g)));
    } else {
      setGoals((prev) => [...prev, result.data]);
    }
    setShowForm(false); setEditingId(null); setForm(DEFAULT_GOAL_FORM); setLoading(false);
  }

  async function handleAddAmount(goalId: string, amount: number) {
    const goal = goals.find((g) => g.id === goalId)!;
    const result = await addGoalAmount(goalId, goal.current_amount, amount, goal.target_amount);
    if (result.success) setGoals((prev) => prev.map((g) => (g.id === goalId ? result.data : g)));
  }

  async function handleDelete(id: string) {
    if (!confirm("Xóa mục tiêu này?")) return;
    await deleteGoal(id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between animate-in">
        <div>
          <h1 className="text-3xl font-bold font-display text-content-primary tracking-tight">Mục Tiêu Tiết Kiệm</h1>
          <p className="text-content-muted text-sm mt-1">{goals.length} mục tiêu</p>
        </div>
        <button onClick={startAdd} className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-accent/20 hover:shadow-accent/30">
          <Plus className="w-4 h-4" /> Thêm mục tiêu
        </button>
      </div>

      {showForm && (
        <GoalForm
          form={form} isEditing={!!editingId} loading={loading} error={error}
          onChange={setForm} onSubmit={handleSubmit} onCancel={() => setShowForm(false)}
        />
      )}

      {goals.length === 0 && !showForm ? (
        <div className="glass-card py-16 text-center animate-in animate-in-delay-1">
          <Target className="w-12 h-12 text-content-muted mx-auto mb-3 opacity-40" />
          <p className="text-content-secondary font-medium">Chưa có mục tiêu nào</p>
          <p className="text-content-muted text-sm mt-1">Tạo mục tiêu đầu tiên để bắt đầu tiết kiệm!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal, i) => (
            <GoalCard
              key={goal.id} goal={goal}
              onEdit={startEdit} onDelete={handleDelete} onAddAmount={handleAddAmount}
            />
          ))}
        </div>
      )}
    </div>
  );
}
