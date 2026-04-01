"use client";

import React from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  sub?: string;
  bg?: string;
  color?: string;
}

export function StatCard({ label, value, icon, sub, bg = "bg-surface-alt/50", color = "text-text" }: StatCardProps) {
  return (
    <div className={`p-6 rounded-[28px] border border-border shadow-sm flex flex-col gap-4 group hover:shadow-xl transition-all duration-500 bg-surface`}>
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-2xl flex items-center justify-center ${bg} ${color} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        {sub && (
          <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${bg} ${color} border-current/10`}>
            {sub}
          </span>
        )}
      </div>
      <div>
        <h3 className={`text-3xl font-black tracking-tight mb-1 group-hover:translate-x-1 transition-transform ${color}`}>
          {value}
        </h3>
        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] leading-none m-0">
          {label}
        </p>
      </div>
    </div>
  );
}
