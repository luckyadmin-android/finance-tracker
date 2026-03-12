"use client";

import { useState } from "react";
import { Goal } from "@/types";
import { upsertGoal, addGoalAmount, deleteGoal } from "@/app/actions/goals";
import GoalForm, { GoalFormState, DEFAULT_GOAL_FORM, goalFormFromGoal } from "@/components/GoalForm";
import GoalCard from "@/components/GoalCard";
import { Plus, Target } from "lucide-react";

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mục Tiêu Tiết Kiệm</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{goals.length} mục tiêu</p>
        </div>
        <button onClick={startAdd} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
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
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 py-16 text-center">
          <Target className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Chưa có mục tiêu nào</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Tạo mục tiêu đầu tiên để bắt đầu tiết kiệm!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => (
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
