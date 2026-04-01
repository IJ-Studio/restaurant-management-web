"use client";

import React from "react";
import { TAG_CONFIG } from "../data/menuMock";

export function TagBadge({ tag }: { tag: string }) {
  const config = TAG_CONFIG as Record<string, any>;
  const c = config[tag];
  if (!c) return null;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-tight ${c.bgClass} ${c.colorClass}`}>
      {c.icon} {c.label}
    </span>
  );
}
