"use client";

import React from "react";

interface BarChartProps {
  data: { [k: string]: any }[];
  valueKey: string;
  maxVal: number;
  color?: string;
  height?: number;
}

export function BarChart({
  data,
  valueKey,
  maxVal,
  color = "#e85d04",
  height = 100,
}: BarChartProps) {
  return (
    <div className="flex items-end gap-1.5 w-full" style={{ height }}>
      {data.map((d, i) => {
        const pct = (d[valueKey] / maxVal) * 100;
        const isToday = i === data.length - 1;
        return (
          <div
            key={i}
            className="flex-1 flex flex-col items-center gap-1.5 group h-full"
          >
            <div className="w-full flex-1 flex items-flex-end relative h-full">
              <div
                className={`w-full rounded-t-md transition-all duration-500 relative group-hover:scale-x-105 ${
                  isToday ? "opacity-100" : "opacity-40 hover:opacity-70"
                }`}
                style={{
                  height: `${pct}%`,
                  backgroundColor: color,
                }}
              >
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-text text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
                  {d[valueKey]?.toLocaleString("es-MX")}
                </div>
              </div>
            </div>
            <span className="text-[9px] font-extrabold text-text-muted uppercase tracking-tighter">
              {d.day || d.mes}
            </span>
          </div>
        );
      })}
    </div>
  );
}
