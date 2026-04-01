"use client";

import React from "react";

interface SettingRowProps {
  label: string;
  description?: string;
  children: React.ReactNode;
  border?: boolean;
}

export function SettingRow({
  label,
  description,
  children,
  border = true,
}: SettingRowProps) {
  return (
    <div
      className={`flex items-center justify-between gap-6 ${
        border ? "pb-5 mb-5 border-b border-border/60" : ""
      }`}
    >
      <div className="flex-1">
        <p className="text-[13px] font-black text-text m-0 mb-1 leading-none">
          {label}
        </p>
        {description && (
          <p className="text-[11px] font-bold text-text-muted m-0 uppercase tracking-wide leading-tight">
            {description}
          </p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
