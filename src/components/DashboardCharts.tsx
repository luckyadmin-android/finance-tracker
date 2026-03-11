"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface MonthData { month: string; income: number; expense: number; }
interface CategoryData { name: string; value: number; color: string; }
interface Props { chartData: MonthData[]; categoryData: CategoryData[]; }

function CurrencyTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-slate-700 dark:text-slate-200 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-500 dark:text-slate-400 capitalize">{p.name}:</span>
          <span className="font-medium text-slate-800 dark:text-slate-200">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-slate-700 dark:text-slate-200">{payload[0].name}</p>
      <p className="text-slate-600 dark:text-slate-400 mt-1">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

export default function DashboardCharts({ chartData, categoryData }: Props) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const update = () => setIsDark(document.documentElement.classList.contains("dark"));
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const gridColor = isDark ? "#334155" : "#f1f5f9";
  const tickColor = isDark ? "#64748b" : "#94a3b8";
  const legendColor = isDark ? "#94a3b8" : "#64748b";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Tổng Quan Theo Tháng</h2>
        {chartData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">Chưa có dữ liệu</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: tickColor }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: tickColor }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
              <Tooltip content={<CurrencyTooltip />} />
              <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} name="Thu nhập" />
              <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Chi tiêu" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Chi Tiêu Theo Danh Mục</h2>
        {categoryData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">Chưa có dữ liệu chi tiêu tháng này</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="45%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
              <Legend formatter={(value) => <span style={{ fontSize: 12, color: legendColor }}>{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
