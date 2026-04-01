"use client";

import { CreditCard, Banknote, Smartphone } from "lucide-react";

export function PaymentSplit() {
  const methods = [
    { method: "Efectivo", pct: 48, colorClass: "text-emerald-600", bgClass: "bg-emerald-600", icon: <Banknote size={12} /> },
    { method: "Tarjeta", pct: 34, colorClass: "text-blue-600", bgClass: "bg-blue-600", icon: <CreditCard size={12} /> },
    { method: "Transferencia", pct: 18, colorClass: "text-purple-600", bgClass: "bg-purple-600", icon: <Smartphone size={12} /> },
  ];

  return (
    <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm">
      <h3 className="font-display font-black text-sm text-text mb-3 m-0">Métodos de pago hoy</h3>
      {methods.map((p) => (
        <div key={p.method} className="mb-2.5 last:mb-0">
          <div className="flex justify-between mb-1">
            <span className="flex items-center gap-1.5 text-xs font-bold text-text-sec">
              <span className={p.colorClass}>{p.icon}</span>
              {p.method}
            </span>
            <span className={`text-xs font-extrabold ${p.colorClass}`}>{p.pct}%</span>
          </div>
          <div className="h-1.5 bg-border rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-[width] duration-400 ${p.bgClass}`}
              style={{ width: `${p.pct}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
