"use client";

import React, { useState } from "react";
import { type PaymentDist } from "../../data/reportsMock";

interface DonutChartProps {
  segments: PaymentDist[];
  size?: number;
  strokeWidth?: number;
}

export function DonutChart({
  segments,
  size = 120,
  strokeWidth = 18,
}: DonutChartProps) {
  const [active, setActive] = useState<number | null>(null);
  
  let cumulative = 0;
  const radius = size / 2 - strokeWidth;
  const cx = size / 2;
  const cy = size / 2;
  const circum = 2 * Math.PI * radius;

  return (
    <div className="flex items-center gap-10">
      <svg width={size} height={size} className="overflow-visible filter drop-shadow-md">
        {/* Background track */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          className="stroke-1"
        />
        
        {segments.map((s, i) => {
          const offset = circum * (1 - cumulative / 100);
          const dash = circum * (s.pct / 100);
          cumulative += s.pct;
          const isActive = active === i;
          
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth={isActive ? strokeWidth + 4 : strokeWidth}
              strokeDasharray={`${dash} ${circum - dash}`}
              strokeDashoffset={offset}
              transform={`rotate(-90 ${cx} ${cy})`}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              className="transition-all duration-300 cursor-pointer"
              style={{ strokeLinecap: "round" }}
            />
          );
        })}
        
        {/* Center Labels */}
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          className="font-display font-black text-[13px] fill-text"
        >
          Distribución
        </text>
        <text
          x={cx}
          y={cy + 12}
          textAnchor="middle"
          className="text-[10px] font-bold fill-text-muted uppercase tracking-tighter"
        >
          de pagos
        </text>
      </svg>

      {/* Legend Grid */}
      <div className="grid grid-cols-1 gap-2.5">
        {segments.map((s, i) => (
          <div
            key={i}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            className={`flex items-center gap-3 transition-opacity duration-200 ${
                active !== null && active !== i ? "opacity-40" : "opacity-100"
            }`}
          >
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: s.color }}
            />
            <div>
              <p className="text-[12px] font-black text-text m-0 leading-none mb-0.5">
                {s.method}
              </p>
              <p className="text-[10px] font-bold text-text-muted m-0">
                {s.pct}% · ${s.amount.toLocaleString("es-MX")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
