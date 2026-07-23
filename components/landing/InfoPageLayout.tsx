"use client";

import type { LucideIcon } from "lucide-react";
import BackButton from "@/components/BackButton";

interface InfoPageLayoutProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
}

export default function InfoPageLayout({ title, subtitle, icon: Icon, children }: InfoPageLayoutProps) {
  return (
    <div className="w-full bg-background text-[var(--color-text)] min-h-screen">
      <section className="px-8 lg:px-24 pt-28 pb-10 border-b border-[var(--color-border)]">
        <BackButton fallbackHref="/" label="Volver" className="mb-6 -ml-2" />
        <div className="flex items-center gap-4">
          {Icon && (
            <div className="w-12 h-12 rounded-2xl bg-[var(--color-brand)]/10 text-[var(--color-brand)] flex items-center justify-center flex-shrink-0">
              <Icon size={22} />
            </div>
          )}
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">{title}</h1>
            {subtitle && (
              <p className="text-[var(--color-text-sec)] mt-1.5 max-w-2xl text-sm md:text-base">{subtitle}</p>
            )}
          </div>
        </div>
      </section>

      <section className="px-8 lg:px-24 py-12">
        <div className="max-w-4xl mx-auto space-y-6">{children}</div>
      </section>
    </div>
  );
}

export function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-surface p-7 md:p-8 shadow-sm space-y-3">
      <h2 className="text-lg font-bold tracking-tight">{title}</h2>
      <div className="text-[var(--color-text-sec)] text-sm leading-relaxed space-y-3">{children}</div>
    </div>
  );
}
