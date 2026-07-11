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
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
          <XAxis
            dataKey="name"
            tick={{ fill: "#94A3B8", fontSize: 12 }}
            axisLine={{ stroke: "#1F2937" }}
          />
          <YAxis
            tick={{ fill: "#94A3B8", fontSize: 12 }}
            axisLine={{ stroke: "#1F2937" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0B1120",
              border: "1px solid #1F2937",
              borderRadius: "12px",
              color: "#F8FAFC",
              boxShadow: "0 0 20px rgba(0,229,255,0.1)",
            }}
          />
          <Bar
            dataKey="value"
            fill="url(#cyanGradient)"
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
          />
          <defs>
            <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00E5FF" stopOpacity={1} />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.8} />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
