"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { useCurrency } from "@/components/CurrencyProvider";

interface MonthData { month: string; income: number; expense: number; }
interface CategoryData { name: string; value: number; color: string; }
interface Props { chartData: MonthData[]; categoryData: CategoryData[]; }

function CurrencyTooltip({ active, payload, label, fmt }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string; fmt: (n: number) => string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 text-sm !shadow-card-lg">
      <p className="font-semibold font-display text-content-primary mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-content-muted capitalize">{p.name}:</span>
          <span className="font-medium text-content-primary">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload, fmt }: { active?: boolean; payload?: { name: string; value: number }[]; fmt: (n: number) => string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 text-sm !shadow-card-lg">
      <p className="font-semibold font-display text-content-primary">{payload[0].name}</p>
      <p className="text-content-secondary mt-1">{fmt(payload[0].value)}</p>
    </div>
  );
}

export default function DashboardCharts({ chartData, categoryData }: Props) {
  const { fmt } = useCurrency();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const update = () => setIsDark(document.documentElement.classList.contains("dark"));
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const gridColor = isDark ? "rgba(154, 181, 168, 0.08)" : "rgba(16, 69, 50, 0.06)";
  const tickColor = isDark ? "#5e7d6f" : "#7a9489";
  const legendColor = isDark ? "#9ab5a8" : "#3d5a50";
  const incomeColor = isDark ? "#f0c040" : "#d4a017";
  const expenseColor = isDark ? "#fb6b85" : "#e04560";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="glass-card p-6 animate-in animate-in-delay-2">
        <h2 className="font-semibold font-display text-content-primary mb-5">Tổng Quan Theo Tháng</h2>
        {chartData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-content-muted text-sm">Chưa có dữ liệu</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: tickColor, fontFamily: 'Lexend' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: tickColor, fontFamily: 'Lexend' }} axisLine={false} tickLine={false} tickFormatter={(v) => fmt(v)} />
              <Tooltip content={<CurrencyTooltip fmt={fmt} />} />
              <Bar dataKey="income" fill={incomeColor} radius={[6, 6, 0, 0]} name="Thu nhập" />
              <Bar dataKey="expense" fill={expenseColor} radius={[6, 6, 0, 0]} name="Chi tiêu" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="glass-card p-6 animate-in animate-in-delay-3">
        <h2 className="font-semibold font-display text-content-primary mb-5">Chi Tiêu Theo Danh Mục</h2>
        {categoryData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-content-muted text-sm">Chưa có dữ liệu chi tiêu tháng này</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="45%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip content={<PieTooltip fmt={fmt} />} />
              <Legend formatter={(value) => <span style={{ fontSize: 11, color: legendColor, fontFamily: 'Lexend' }}>{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
