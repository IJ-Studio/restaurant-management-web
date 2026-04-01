"use client";

import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color?: string;
  sub?: string;
  colorClass?: string;
  bgClass?: string;
}

/**
 * Reusable KPI Card component.
 * Supports both color-based styling (hex) and class-based styling (Tailwind).
 */
export function KpiCard({
  label,
  value,
  change,
  icon,
  color,
  sub,
  colorClass,
  bgClass,
}: KpiCardProps) {
  const isPositive = change !== undefined ? change >= 0 : true;

  // Derive styles from hex color or classes
  const iconBg = bgClass || (color ? `${color}15` : "bg-brand/10");
  const iconColor = colorClass || (color ? color : "text-brand");
  const valueColor = color || "";

  return (
    <div className="bg-surface rounded-[24px] border border-border p-6 shadow-sm hover:shadow-xl transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm border border-white ${iconBg} ${iconColor}`}
          style={color && !bgClass ? { backgroundColor: `${color}15`, color } : {}}
        >
          {icon}
        </div>
        {change !== undefined && (
          <div
            className={`flex items-center gap-0.5 text-[11px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
              isPositive
                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                : "bg-red-50 text-red-600 border-red-100"
            }`}
          >
            {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(change)}%
          </div>
        )}
      </div>

      <p
        className={`font-display text-2xl font-black m-0 mb-1 leading-none tracking-tight group-hover:text-brand transition-colors ${colorClass || ""}`}
        style={color ? { color } : {}}
      >
        {value}
      </p>

      <p className="text-[12px] font-black text-text m-0 uppercase tracking-widest leading-none mt-1">
        {label}
      </p>

      <p className="text-[10px] text-text-muted m-0 mt-2 font-medium">
        {sub || "vs. período anterior"}
      </p>
    </div>
  );
}

// Alias for backward compatibility or different naming preferences
export const KPICard = KpiCard;
export default KpiCard;
