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

function fmtInput(raw: string): string {
  const digits = raw.replace(/\D/g, "");
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

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="font-semibold text-slate-900 dark:text-white">
            {transaction ? "Sửa giao dịch" : "Thêm giao dịch"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="flex rounded-xl border border-slate-200 dark:border-slate-600 overflow-hidden">
            {(["expense", "income"] as TransactionType[]).map((t) => (
              <button key={t} type="button" onClick={() => setType(t)}
                className={`flex-1 py-2.5 text-sm font-medium capitalize transition-colors ${
                  type === t
                    ? t === "income" ? "bg-green-600 text-white" : "bg-red-500 text-white"
                    : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                {t === "income" ? "Thu nhập" : "Chi tiêu"}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Số tiền</label>
            <input
              type="text" inputMode="numeric" value={displayAmount}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "");
                setRawAmount(digits);
                setDisplayAmount(fmtInput(digits));
              }} required
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Mô tả</label>
            <input
              type="text" value={description} onChange={(e) => setDescription(e.target.value)}
              required maxLength={100}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              placeholder="vd. Mua sắm tạp hóa"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Danh mục</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="">Không có</option>
                {filteredCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Ngày</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>

          {/* Recurring */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-600 p-3.5 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />
                <div className={`w-10 h-5 rounded-full transition-colors ${isRecurring ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-600"}`} />
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isRecurring ? "translate-x-5" : ""}`} />
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className={`w-4 h-4 ${isRecurring ? "text-indigo-600" : "text-slate-400"}`} />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Giao dịch lặp lại</span>
              </div>
            </label>

            {isRecurring && (
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5">Chu kỳ lặp lại</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(RECURRENCE_LABELS) as [RecurrenceType, string][]).map(([key, label]) => (
                    <button key={key} type="button" onClick={() => setRecurrence(key)}
                      className={`py-2 rounded-lg text-xs font-medium border transition-colors ${
                        recurrence === key
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-indigo-400"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                  Lần tiếp theo: {calcNextOccurrence(date, recurrence)}
                </p>
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 px-4 py-2.5 rounded-lg">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Hủy
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium transition-colors"
            >
              {loading ? "Đang lưu..." : transaction ? "Lưu thay đổi" : "Thêm giao dịch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
