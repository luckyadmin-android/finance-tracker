"use client";

import { useState } from "react";
import { Goal } from "@/types";
import { useCurrency } from "@/components/CurrencyProvider";
import { Pencil, Trash2, Target, Trophy, Calendar } from "lucide-react";

const MAX_AMOUNT = 999_999_999_999;

function fmtInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 12);
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function daysUntil(deadline: string): number {
  const diff = new Date(deadline).getTime() - new Date().setHours(0, 0, 0, 0);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

interface Props {
  goal: Goal;
  deleting?: boolean;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
  onAddAmount: (goalId: string, amount: number) => void;
}

export default function GoalCard({ goal, deleting, onEdit, onDelete, onAddAmount }: Props) {
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
    <div className="glass-card p-5 animate-in animate-in-delay-1">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: goal.color + "20" }}>
            {done
              ? <Trophy className="w-5 h-5" style={{ color: goal.color }} />
              : <Target className="w-5 h-5" style={{ color: goal.color }} />
            }
          </div>
          <div>
            <h3 className="font-semibold font-display text-content-primary">{goal.name}</h3>
            {goal.deadline && (
              <p className={`text-[11px] flex items-center gap-1 mt-0.5 ${overdue ? "text-expense" : "text-content-muted"}`}>
                <Calendar className="w-3 h-3" />
                {overdue ? `Quá hạn ${Math.abs(days!)} ngày` : `Còn ${days} ngày`}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onEdit(goal)} className="p-1.5 rounded-lg hover:bg-accent-soft text-content-muted hover:text-accent transition-colors">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(goal.id)} disabled={deleting} className="p-1.5 rounded-lg hover:bg-expense-soft text-content-muted hover:text-expense transition-colors disabled:opacity-40 disabled:pointer-events-none">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-content-muted">
            {fmt(goal.current_amount)} / {fmt(goal.target_amount)}
          </span>
          <span className="font-bold font-display" style={{ color: goal.color }}>{Math.round(pct)}%</span>
        </div>
        <div className="w-full bg-border rounded-full h-2.5">
          <div className="h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: goal.color }}
          />
        </div>
        {done ? (
          <p className="text-xs text-accent font-semibold flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5" /> Mục tiêu đã hoàn thành!
          </p>
        ) : (
          <p className="text-[11px] text-content-muted">Còn thiếu {fmt(remaining)}</p>
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
                className={`flex-1 px-3 py-2.5 rounded-xl border bg-surface-primary text-content-primary text-sm focus-ring ${addError ? "border-expense" : "border-border"}`}
              />
              <button onClick={handleAdd} className="px-3 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-semibold transition-all">Thêm</button>
              <button onClick={() => { setAddingAmount(false); setAddAmount(""); setAddError(""); }}
                className="px-3 py-2.5 rounded-xl border border-border text-content-muted hover:bg-accent-soft text-sm transition-all"
              >Hủy</button>
            </div>
            {addError && <p className="text-xs text-expense">{addError}</p>}
            {!addError && parsedAmount >= 1000 && (
              <p className="text-xs text-content-muted">
                = {fmt(parsedAmount)}
                {parsedAmount >= 1_000_000_000
                ? <span className="ml-1 text-accent">({(parsedAmount / 1_000_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 2 })} tỉ)</span>
                : parsedAmount >= 1_000_000
                  ? <span className="ml-1 text-accent">({(parsedAmount / 1_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 2 })} triệu)</span>
                  : null}
              </p>
            )}
          </div>
        ) : (
          <button
            onClick={() => setAddingAmount(true)}
            className="w-full py-2.5 rounded-xl border-2 border-dashed text-sm font-semibold transition-all hover:border-solid"
            style={{ borderColor: goal.color + "40", color: goal.color }}
          >
            + Thêm tiền tiết kiệm
          </button>
        )
      )}
    </div>
  );
}
