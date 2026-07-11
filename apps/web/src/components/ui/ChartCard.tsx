"use client";

import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartCardProps {
  title: string;
  data: Array<Record<string, string | number>>;
  className?: string;
  height?: number;
}

export function ChartCard({ title, data, className, height = 300 }: ChartCardProps) {
  return (
    <div className={cn("rounded-2xl glass p-6", className)}>
      <h3 className="text-sm font-semibold text-muted mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
          <XAxis
            dataKey="name"
            tick={{ fill: "#94A3B8", fontSize: 12 }}
            axisLine={{ stroke: "#1E293B" }}
          />
          <YAxis
            tick={{ fill: "#94A3B8", fontSize: 12 }}
            axisLine={{ stroke: "#1E293B" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#111827",
              border: "1px solid #1E293B",
              borderRadius: "0.75rem",
              color: "#F8FAFC",
            }}
          />
          <Bar
            dataKey="value"
            fill="#7C3AED"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
