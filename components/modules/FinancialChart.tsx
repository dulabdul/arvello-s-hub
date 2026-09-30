"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type ChartData = {
  name: string;
  income: number;
  expense: number;
};

interface FinancialChartProps {
  data: ChartData[];
}

export function FinancialChart({ data }: FinancialChartProps) {
  // Brand colors extracted from our DESIGN.md
  const colorSuccess = "#5C715E"; // Sage Green
  const colorDanger = "#C53030"; // Muted Red

  return (
    <div className="w-full h-80 -ml-4 md:-ml-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 10,
            left: 0,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "currentColor", fontSize: 11, opacity: 0.6 }} 
            dy={10} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "currentColor", fontSize: 11, opacity: 0.6 }} 
            tickFormatter={(value) => `${value / 1000000}M`}
            width={45}
          />
          <Tooltip 
            formatter={(value: any) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value) || 0)}
            contentStyle={{ borderRadius: "8px", border: "1px solid rgba(113, 128, 150, 0.2)", background: "var(--color-bg)", color: "var(--color-text-primary)", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
            itemStyle={{ fontSize: "14px", fontWeight: "600" }}
          />
          <Line 
            type="monotone" 
            dataKey="income" 
            name="Pemasukan" 
            stroke={colorSuccess} 
            strokeWidth={3} 
            dot={false}
            activeDot={{ r: 6, fill: colorSuccess, stroke: "#fff", strokeWidth: 2 }} 
          />
          <Line 
            type="monotone" 
            dataKey="expense" 
            name="Pengeluaran" 
            stroke={colorDanger} 
            strokeWidth={3} 
            dot={false}
            activeDot={{ r: 6, fill: colorDanger, stroke: "#fff", strokeWidth: 2 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
