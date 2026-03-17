"use client";

import { useState } from "react";
import { Category, TransactionType } from "@/types";
import { CATEGORY_COLORS } from "@/lib/utils";
import { useCurrency } from "@/components/CurrencyProvider";
import { upsertCategory, deleteCategory } from "@/app/actions/categories";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";

const MAX_AMOUNT = 999_999_999_999;

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

interface FormState {
  name: string;
  type: TransactionType;
  color: string;
  budget_limit: string;
}

const DEFAULT_FORM: FormState = { name: "", type: "expense", color: CATEGORY_COLORS[0], budget_limit: "" };

export default function CategoriesClient({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { fmt } = useCurrency();

  const incomeCategories = categories.filter((c) => c.type === "income");
  const expenseCategories = categories.filter((c) => c.type === "expense");

  function startAdd() {
    setEditing(null); setForm(DEFAULT_FORM); setError(""); setShowForm(true);
  }

  function startEdit(cat: Category) {
    setEditing(cat.id);
    setForm({ name: cat.name, type: cat.type, color: cat.color, budget_limit: cat.budget_limit ? fmtInput(String(cat.budget_limit)) : "" });
    setError(""); setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name.trim()) return;
    const budgetRaw = parseFloat(form.budget_limit.replace(/\./g, "")) || 0;
    if (budgetRaw > MAX_AMOUNT) { setError("Số tiền vượt quá giới hạn cho phép."); return; }
    if (budgetRaw > 0 && budgetRaw % 1000 !== 0) { setError("Hạn mức ngân sách phải là bội số của 1.000₫."); return; }
    setLoading(true); setError("");
    const budgetVal = budgetRaw > 0 ? budgetRaw : null;

    const result = await upsertCategory(editing, form.name, form.type, form.color, budgetVal ?? null);
    if (!result.success) { setError(result.error); setLoading(false); return; }
    if (editing) {
      setCategories((prev) => prev.map((c) => (c.id === editing ? result.data : c)));
    } else {
      setCategories((prev) => [...prev, result.data]);
    }
    setShowForm(false); setEditing(null); setForm(DEFAULT_FORM); setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Xóa danh mục này? Các giao dịch liên quan sẽ không được phân loại.")) return;
    await deleteCategory(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  const inputClass = "w-full px-4 py-3 rounded-xl border border-border bg-surface-primary text-content-primary text-sm focus-ring placeholder:text-content-muted transition-colors";
  const labelClass = "block text-sm font-medium text-content-secondary mb-2";

  const CategorySection = ({ title, items }: { title: string; items: Category[] }) => (
    <div className="glass-card overflow-hidden animate-in animate-in-delay-2">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="font-semibold font-display text-content-primary">{title}</h2>
      </div>
      {items.length === 0 ? (
        <p className="px-6 py-8 text-sm text-content-muted">Chưa có danh mục nào.</p>
      ) : (
        <div className="divide-y divide-border">
          {items.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between px-6 py-3.5 group hover:bg-accent-soft/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: cat.color }} />
                <div>
                  <span className="text-sm font-medium text-content-secondary">{cat.name}</span>
                  {cat.budget_limit && (
                    <p className="text-[11px] text-content-muted mt-0.5">Hạn mức: {fmt(cat.budget_limit)}/tháng</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(cat)} className="p-1.5 rounded-lg hover:bg-accent-soft text-content-muted hover:text-accent transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(cat.id)} className="p-1.5 rounded-lg hover:bg-expense-soft text-content-muted hover:text-expense transition-colors">
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
      <div className="flex items-center justify-between animate-in">
        <div>
          <h1 className="text-3xl font-bold font-display text-content-primary tracking-tight">Danh Mục</h1>
          <p className="text-content-muted text-sm mt-1">{categories.length} danh mục</p>
        </div>
        <button onClick={startAdd} className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-accent/20 hover:shadow-accent/30">
          <Plus className="w-4 h-4" /> Thêm danh mục
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-6 !border-accent/30 animate-in animate-in-delay-1">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold font-display text-content-primary">{editing ? "Sửa danh mục" : "Danh mục mới"}</h3>
            <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-accent-soft text-content-muted transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Tên</label>
                <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required maxLength={40} className={inputClass} placeholder="vd. Thực phẩm"
                />
              </div>
              <div>
                <label className={labelClass}>Loại</label>
                <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as TransactionType }))}
                  disabled={!!editing}
                  className={inputClass + " appearance-none cursor-pointer disabled:opacity-60"}
                >
                  <option value="expense">Chi tiêu</option>
                  <option value="income">Thu nhập</option>
                </select>
              </div>
            </div>

            {form.type === "expense" && (
              <div>
                <label className={labelClass}>
                  Hạn mức ngân sách / tháng <span className="text-content-muted font-normal">(tuỳ chọn)</span>
                </label>
                <input type="text" inputMode="numeric" value={form.budget_limit}
                  onChange={(e) => setForm((f) => ({ ...f, budget_limit: fmtInput(e.target.value) }))}
                  className={inputClass} placeholder="Để trống nếu không giới hạn"
                />
                {amountHint(form.budget_limit)}
              </div>
            )}

            <div>
              <label className={labelClass}>Màu sắc</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_COLORS.map((color) => (
                  <button key={color} type="button" onClick={() => setForm((f) => ({ ...f, color }))}
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
              <button type="button" onClick={() => setShowForm(false)}
                className="flex-1 py-3 rounded-xl border border-border text-sm font-medium text-content-secondary hover:bg-accent-soft hover:text-accent transition-all"
              >
                Hủy
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 py-3 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-60 text-white text-sm font-semibold transition-all shadow-lg shadow-accent/20"
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
