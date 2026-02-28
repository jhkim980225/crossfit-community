"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatDateShort } from "@/lib/utils";
import { isLift, formatSeconds } from "@/lib/pr-movements";

interface PrRecord {
  id: string;
  movement: string;
  value: number;
  unit: string;
  date: string;
}

interface PrHistoryChartProps {
  history: PrRecord[];
  movement: string;
}

// CSS 커스텀 변수는 SVG attribute에서 직접 사용 불가 → JS로 resolved 값을 읽어서 전달
function getCSSVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

export function PrHistoryChart({ history, movement }: PrHistoryChartProps) {
  const benchmark = !isLift(movement);

  const lineColor = getCSSVar("--chart-1", "oklch(0.646 0.222 41.116)");
  const gridColor = getCSSVar("--border", "oklch(0.922 0 0)");
  const axisColor = getCSSVar("--muted-foreground", "oklch(0.556 0 0)");

  const chartData = history.map((pr) => ({
    date: formatDateShort(pr.date),
    value: pr.value,
  }));

  return (
    <ResponsiveContainer width="100%" height={120}>
      <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: axisColor }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 10, fill: axisColor }}
          axisLine={false}
          tickLine={false}
          reversed={benchmark}
          tickFormatter={benchmark ? (v: number) => formatSeconds(v) : undefined}
        />
        <Tooltip
          formatter={(value: number | undefined) => [
            value != null ? (benchmark ? formatSeconds(value) : `${value} kg`) : "-",
            "기록",
          ]}
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: `1px solid ${gridColor}`,
          }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={lineColor}
          strokeWidth={2}
          dot={{ r: 3, fill: lineColor, strokeWidth: 0 }}
          activeDot={{ r: 4, fill: lineColor }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
