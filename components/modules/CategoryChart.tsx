"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type CategoryData = {
  name: string;
  value: number;
};

interface CategoryChartProps {
  data: CategoryData[];
  type: "INCOME" | "EXPENSE";
}

const INCOME_COLORS = ["#5C715E", "#839E85", "#AEC6B0", "#CDE0CE", "#E5F0E6"];
const EXPENSE_COLORS = ["#C53030", "#E53E3E", "#FC8181", "#FEB2B2", "#FED7D7"];

export function CategoryChart({ data, type }: CategoryChartProps) {
  const colors = type === "INCOME" ? INCOME_COLORS : EXPENSE_COLORS;

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-sm text-brand-muted">
        Tidak ada data
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: any) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value))}
            contentStyle={{ borderRadius: "8px", border: "1px solid rgba(113, 128, 150, 0.2)", background: "var(--color-bg)", color: "var(--color-text-primary)", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
            itemStyle={{ fontSize: "14px", fontWeight: "600" }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            wrapperStyle={{ fontSize: '11px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
