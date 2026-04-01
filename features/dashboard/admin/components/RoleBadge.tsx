"use client";

import React from "react";
import { ROLES } from "../data/usersMock";

interface RoleBadgeProps {
  role: keyof typeof ROLES;
  className?: string;
}

export function RoleBadge({ role, className = "" }: RoleBadgeProps) {
  const r = ROLES[role];
  if (!r) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest border transition-all duration-300 hover:scale-105 ${className}`}
      style={{
        color: r.color,
        backgroundColor: `${r.color}15`,
        borderColor: `${r.color}30`,
      }}
    >
      <span 
        className="w-1.5 h-1.5 rounded-full" 
        style={{ backgroundColor: r.color }}
      />
      {r.label}
    </span>
  );
}
