"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Category, TransactionType } from "@/types";
import { CATEGORY_COLORS } from "@/lib/utils";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";

interface Props {
  initialCategories: Category[];
}

interface FormState {
  name: string;
  type: TransactionType;
  color: string;
}

const DEFAULT_FORM: FormState = { name: "", type: "expense", color: CATEGORY_COLORS[0] };

export default function CategoriesClient({ initialCategories }: Props) {
  const [categories, setCategories] = useState(initialCategories);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

  const incomeCategories = categories.filter((c) => c.type === "income");
  const expenseCategories = categories.filter((c) => c.type === "expense");

  function startAdd() {
    setEditing(null);
    setForm(DEFAULT_FORM);
    setError("");
    setShowForm(true);
  }

  function startEdit(cat: Category) {
    setEditing(cat.id);
    setForm({ name: cat.name, type: cat.type, color: cat.color });
    setError("");
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    setError("");

    if (editing) {
      const { data, error: err } = await supabase
        .from("categories")
        .update({ name: form.name.trim(), color: form.color })
        .eq("id", editing)
        .select()
        .single();

      if (err) { setError(err.message); setLoading(false); return; }
      setCategories((prev) => prev.map((c) => (c.id === editing ? (data as Category) : c)));
    } else {
      const { data, error: err } = await supabase
        .from("categories")
        .insert({ name: form.name.trim(), type: form.type, color: form.color })
        .select()
        .single();

      if (err) { setError(err.message); setLoading(false); return; }
      setCategories((prev) => [...prev, data as Category]);
    }

    setShowForm(false);
    setEditing(null);
    setForm(DEFAULT_FORM);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Xóa danh mục này? Các giao dịch liên quan sẽ không được phân loại.")) return;
    await supabase.from("categories").delete().eq("id", id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  const CategorySection = ({ title, items }: { title: string; items: Category[] }) => (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="font-semibold text-slate-900">{title}</h2>
      </div>
      {items.length === 0 ? (
        <p className="px-5 py-6 text-sm text-slate-400">Chưa có danh mục nào.</p>
      ) : (
        <div className="divide-y divide-slate-100">
          {items.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between px-5 py-3.5 group hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-sm font-medium text-slate-700">{cat.name}</span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => startEdit(cat)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Danh Mục</h1>
          <p className="text-slate-500 text-sm mt-1">{categories.length} danh mục</p>
        </div>
        <button
          onClick={startAdd}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Thêm danh mục
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-indigo-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">{editing ? "Sửa danh mục" : "Danh mục mới"}</h3>
            <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Tên</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  maxLength={40}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="vd. Thực phẩm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Loại</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as TransactionType }))}
                  disabled={!!editing}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white disabled:opacity-60"
                >
                  <option value="expense">Chi tiêu</option>
                  <option value="income">Thu nhập</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Màu sắc</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, color }))}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                    style={{ backgroundColor: color }}
                  >
                    {form.color === color && <Check className="w-4 h-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-lg">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium transition-colors"
              >
                {loading ? "Đang lưu..." : editing ? "Lưu thay đổi" : "Thêm danh mục"}
              </button>
            </div>
          </form>
        </div>
      )}

      <CategorySection title="Danh Mục Chi Tiêu" items={expenseCategories} />
      <CategorySection title="Danh Mục Thu Nhập" items={incomeCategories} />
    </div>
  );
}
