"use client";

import React from "react";

interface AboutSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function AboutSection({ title, icon, children, className = "" }: AboutSectionProps) {
  return (
    <section className={`bg-surface rounded-3xl border border-border shadow-sm overflow-hidden mb-6 transition-all hover:shadow-md ${className}`}>
      <div className="px-6 py-5 border-b border-border bg-surface-alt/50 flex items-center gap-3">
        <span className="text-brand shrink-0 scale-110">{icon}</span>
        <h2 className="font-display font-black text-lg text-text m-0 tracking-tight">{title}</h2>
      </div>
      <div className="p-8 group">
        {children}
      </div>
    </section>
  );
}
