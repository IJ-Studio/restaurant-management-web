"use client";

import React from "react";

interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color?: string;
  children: React.ReactNode;
  className?: string;
}

export function SectionCard({
  icon,
  title,
  subtitle,
  color = "var(--color-brand)",
  children,
  className = "",
}: SectionCardProps) {
  return (
    <div 
      className={`bg-surface border border-border shadow-sm overflow-hidden mb-8 ${className}`}
      style={{ borderRadius: "var(--radius-standard)" }}
    >
      <div className="px-6 py-5 border-b border-border flex items-center gap-4 bg-surface-alt/30">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm border border-white shrink-0"
          style={{ backgroundColor: `${color}15`, color }}
        >
          {icon}
        </div>
        <div>
          <h2 className="font-display font-black text-[17px] text-text m-0 mb-0.5 tracking-tight">
            {title}
          </h2>
          <p className="text-[11px] font-bold text-text-muted m-0 uppercase tracking-wide">
            {subtitle}
          </p>
        </div>
      </div>
      <div className="p-7">{children}</div>
    </div>
  );
}
