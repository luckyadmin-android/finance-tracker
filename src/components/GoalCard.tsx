"use client";

import { useState } from "react";
import { Goal } from "@/types";
import { useCurrency } from "@/components/CurrencyProvider";
import { Pencil, Trash2, Target, Trophy, Calendar } from "lucide-react";

const MAX_AMOUNT = 999_999_999_999_999;

function fmtInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 15);
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function daysUntil(deadline: string): number {
  const diff = new Date(deadline).getTime() - new Date().setHours(0, 0, 0, 0);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

interface Props {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
  onAddAmount: (goalId: string, amount: number) => void;
}

export default function GoalCard({ goal, onEdit, onDelete, onAddAmount }: Props) {
  const [addingAmount, setAddingAmount] = useState(false);
  const [addAmount, setAddAmount] = useState("");
  const [addError, setAddError] = useState("");
  const { fmt } = useCurrency();

  const pct = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
  const done = pct >= 100;
  const remaining = goal.target_amount - goal.current_amount;
  const days = goal.deadline ? daysUntil(goal.deadline) : null;
  const overdue = days !== null && days < 0;

  const parsedAmount = parseFloat(addAmount.replace(/\./g, "")) || 0;

  function handleAdd() {
    const amount = parseFloat(addAmount.replace(/\./g, ""));
    if (isNaN(amount) || amount <= 0) { setAddError("Vui lòng nhập số tiền hợp lệ."); return; }
    if (amount > MAX_AMOUNT) { setAddError("Số tiền vượt quá giới hạn cho phép."); return; }
    if (amount % 1000 !== 0) { setAddError("Số tiền phải là bội số của 1.000₫."); return; }
    setAddError("");
    onAddAmount(goal.id, amount);
    setAddingAmount(false);
    setAddAmount("");
  }

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAddAmount(fmtInput(e.target.value));
    setAddError("");
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
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
          <button onClick={() => onEdit(goal)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(goal.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 transition-colors">
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

      {!done && (
        addingAmount ? (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text" inputMode="numeric" value={addAmount}
                onChange={handleAmountChange}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                autoFocus placeholder="Nhập số tiền (bội số 1.000)..."
                className={`flex-1 px-3 py-2 rounded-lg border bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${addError ? "border-red-400 dark:border-red-500" : "border-slate-300 dark:border-slate-600"}`}
              />
              <button onClick={handleAdd} className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium">Thêm</button>
              <button onClick={() => { setAddingAmount(false); setAddAmount(""); setAddError(""); }}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm"
              >Hủy</button>
            </div>
            {addError && <p className="text-xs text-red-500">{addError}</p>}
            {!addError && parsedAmount >= 1000 && (
              <p className="text-xs text-slate-400 dark:text-slate-500">
                = {fmt(parsedAmount)}
                {parsedAmount >= 1_000_000_000
                ? <span className="ml-1 text-indigo-400">({(parsedAmount / 1_000_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 2 })} tỉ)</span>
                : parsedAmount >= 1_000_000
                  ? <span className="ml-1 text-indigo-400">({(parsedAmount / 1_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 2 })} triệu)</span>
                  : null}
              </p>
            )}
          </div>
        ) : (
          <button
            onClick={() => setAddingAmount(true)}
            className="w-full py-2 rounded-xl border-2 border-dashed text-sm font-medium transition-colors hover:border-solid"
            style={{ borderColor: goal.color + "60", color: goal.color }}
          >
            + Thêm tiền tiết kiệm
          </button>
        )
      )}
    </div>
  );
}
