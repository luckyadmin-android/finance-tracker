"use client";

import { useState, useEffect } from "react";
import { Transaction, Category, TransactionType, RecurrenceType } from "@/types";
import { calcNextOccurrence, RECURRENCE_LABELS } from "@/lib/utils";
import { upsertTransaction } from "@/app/actions/transactions";
import { X, RefreshCw } from "lucide-react";

interface Props {
  transaction: Transaction | null;
  categories: Category[];
  onClose: () => void;
  onSaved: (transaction: Transaction) => void;
}

const MAX_AMOUNT = 999_999_999_999;

function fmtInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 12);
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function TransactionModal({ transaction, categories, onClose, onSaved }: Props) {
  const [type, setType] = useState<TransactionType>(transaction?.type ?? "expense");
  const [rawAmount, setRawAmount] = useState(transaction ? String(transaction.amount) : "");
  const [displayAmount, setDisplayAmount] = useState(transaction ? fmtInput(String(transaction.amount)) : "");
  const [description, setDescription] = useState(transaction?.description ?? "");
  const [categoryId, setCategoryId] = useState(transaction?.category_id ?? "");
  const [date, setDate] = useState(transaction?.date ?? new Date().toISOString().split("T")[0]);
  const [isRecurring, setIsRecurring] = useState(transaction?.is_recurring ?? false);
  const [recurrence, setRecurrence] = useState<RecurrenceType>(transaction?.recurrence ?? "monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filteredCategories = categories.filter((c) => c.type === type);

  useEffect(() => {
    if (!transaction) setCategoryId("");
  }, [type, transaction]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const parsed = parseFloat(rawAmount);
    if (isNaN(parsed) || parsed <= 0) {
      setError("Vui lòng nhập số tiền hợp lệ lớn hơn 0.");
      return;
    }
    if (parsed > MAX_AMOUNT) {
      setError("Số tiền vượt quá giới hạn cho phép.");
      return;
    }
    if (parsed % 1000 !== 0) {
      setError("Số tiền phải là bội số của 1.000₫.");
      return;
    }

    setLoading(true);
    const result = await upsertTransaction(
      transaction?.id ?? null,
      type,
      parsed,
      description,
      categoryId || null,
      date,
      isRecurring,
      isRecurring ? recurrence : null
    );
    if (!result.success) { setError(result.error); setLoading(false); return; }
    onSaved(result.data);
    onClose();
  }

  const inputClass = "w-full px-4 py-3 rounded-xl border border-border bg-surface-primary text-content-primary text-sm focus-ring placeholder:text-content-muted transition-colors";
  const labelClass = "block text-sm font-medium text-content-secondary mb-2";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card !shadow-card-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h2 className="font-semibold font-display text-content-primary text-lg">
            {transaction ? "Sửa giao dịch" : "Thêm giao dịch"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-accent-soft text-content-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Type toggle */}
          <div className="flex rounded-xl border border-border overflow-hidden">
            {(["expense", "income"] as TransactionType[]).map((t) => (
              <button key={t} type="button" onClick={() => setType(t)}
                className={`flex-1 py-3 text-sm font-semibold transition-all ${
                  type === t
                    ? t === "income" ? "bg-income text-white" : "bg-expense text-white"
                    : "bg-surface-primary text-content-muted hover:text-content-secondary"
                }`}
              >
                {t === "income" ? "Thu nhập" : "Chi tiêu"}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div>
            <label className={labelClass}>Số tiền</label>
            <input
              type="text" inputMode="numeric" value={displayAmount}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(0, 12);
                setRawAmount(digits);
                setDisplayAmount(fmtInput(digits));
              }} required
              className={inputClass}
              placeholder="0"
            />
            {(() => {
              const n = parseFloat(rawAmount) || 0;
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
            })()}
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Mô tả</label>
            <input
              type="text" value={description} onChange={(e) => setDescription(e.target.value)}
              required maxLength={100} className={inputClass}
              placeholder="vd. Mua sắm tạp hóa"
            />
          </div>

          {/* Category + Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Danh mục</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                className={inputClass + " appearance-none cursor-pointer"}
              >
                <option value="">Không có</option>
                {filteredCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Ngày</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className={inputClass} />
            </div>
          </div>

          {/* Recurring */}
          <div className="rounded-xl border border-border p-4 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />
                <div className={`w-10 h-5 rounded-full transition-colors ${isRecurring ? "bg-accent" : "bg-border"}`} />
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isRecurring ? "translate-x-5" : ""}`} />
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className={`w-4 h-4 ${isRecurring ? "text-accent" : "text-content-muted"}`} />
                <span className="text-sm font-medium text-content-secondary">Giao dịch lặp lại</span>
              </div>
            </label>

            {isRecurring && (
              <div>
                <label className="block text-xs text-content-muted mb-2">Chu kỳ lặp lại</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(RECURRENCE_LABELS) as [RecurrenceType, string][]).map(([key, label]) => (
                    <button key={key} type="button" onClick={() => setRecurrence(key)}
                      className={`py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                        recurrence === key
                          ? "bg-accent text-white border-accent shadow-md shadow-accent/20"
                          : "bg-surface-primary text-content-secondary border-border hover:border-accent hover:text-accent"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-content-muted mt-2.5">
                  Lần tiếp theo: {calcNextOccurrence(date, recurrence)}
                </p>
              </div>
            )}
          </div>

          {error && <p className="text-sm text-expense bg-expense-soft px-4 py-3 rounded-xl">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-border text-sm font-medium text-content-secondary hover:bg-accent-soft hover:text-accent transition-all"
            >
              Hủy
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-60 text-white text-sm font-semibold transition-all shadow-lg shadow-accent/20"
            >
              {loading ? "Đang lưu..." : transaction ? "Lưu thay đổi" : "Thêm giao dịch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
