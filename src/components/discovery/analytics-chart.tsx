"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import type { AnalyticsPoint } from "@/src/lib/discovery/types";

export function AnalyticsViewsChart({ data }: { data: AnalyticsPoint[] }) {
  const rows = data.map((point) => ({
    date: String(point.date).slice(0, 10).slice(5),
    views: Number(point.views ?? 0),
  }));
  const hasData = rows.some((row) => row.views > 0);

  if (!hasData) {
    return <p className="mt-6 text-sm text-white/35">No views in this period yet.</p>;
  }

  return (
    <div className="mt-6 h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={rows} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="szViewsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "rgba(255,255,255,0.32)", fontSize: 11 }}
            interval="preserveStartEnd"
          />
          <Tooltip
            cursor={{ stroke: "rgba(255,255,255,0.12)" }}
            contentStyle={{
              background: "#121214",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              fontSize: 12,
            }}
            labelStyle={{ color: "rgba(255,255,255,0.5)" }}
            itemStyle={{ color: "#fff" }}
          />
          <Area
            type="monotone"
            dataKey="views"
            stroke="#f5f5f5"
            strokeWidth={1.6}
            fill="url(#szViewsFill)"
            dot={false}
            activeDot={{ r: 3, fill: "#fff" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
