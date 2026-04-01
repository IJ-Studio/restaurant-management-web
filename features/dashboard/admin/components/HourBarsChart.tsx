"use client";

import { HOUR_DATA, HOUR_LABELS } from "../data/mockData";

export function HourBarsChart({ todaySales }: { todaySales: number }) {
  const max = Math.max(...HOUR_DATA);
  const cur = new Date().getHours() - 11; // relative to 11 AM
  const fmt = (n: number) => n.toLocaleString("es-MX", { minimumFractionDigits: 2 });

  return (
    <div className="bg-surface rounded-2xl border border-border p-4 pb-3 shadow-sm">
      <div className="flex justify-between items-start mb-2.5">
        <div>
          <h3 className="font-display font-black text-sm text-text m-0">Ventas por hora</h3>
          <p className="text-[11px] text-text-muted m-0">Hoy</p>
        </div>
        <span className="font-display text-base font-black text-brand">
          ${fmt(todaySales)}
        </span>
      </div>
      
      <div className="flex items-end gap-[3px] h-[72px]">
        {HOUR_DATA.map((v, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-[3px]">
            <div className="w-full flex-1 flex items-end">
              <div
                className={`w-full rounded-t-sm min-h-[3px] transition-[height] duration-400 ${
                  i === cur ? "bg-brand" : "bg-brand/35"
                }`}
                style={{ height: `${(v / max) * 100}%` }}
              />
            </div>
            {i % 2 === 0 && (
              <span className="text-[8px] text-text-muted font-bold">{HOUR_LABELS[i]}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
