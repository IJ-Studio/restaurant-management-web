"use client";

import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { LOW_STOCK } from "../data/mockData";

export function StockAlerts() {
  const router = useRouter();

  return (
    <div className="bg-surface rounded-[22px] border border-border shadow-sm overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-border bg-surface-alt flex justify-between items-center">
        <h3 className="font-display font-black text-sm text-text m-0">📦 Alertas inventario</h3>
        <button
          onClick={() => router.push("/dashboard/admin/inventory")}
          className="text-[11px] font-bold text-brand bg-transparent border-none cursor-pointer hover:underline"
        >
          Ver →
        </button>
      </div>

      <div className="p-3 flex flex-col gap-2 flex-1">
        {LOW_STOCK.map((s) => {
          const isCritical = s.urgency === "critical";
          return (
            <div
              key={s.name}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
                isCritical ? "bg-red-50 border-red-200" : "bg-surface-alt border-border"
              }`}
            >
              <AlertTriangle
                size={12}
                className={`shrink-0 ${isCritical ? "text-red-500" : "text-amber-500"}`}
              />
              <span className="flex-1 text-xs font-bold text-text truncate">{s.name}</span>
              <span
                className={`text-[11px] font-black whitespace-nowrap ${
                  isCritical ? "text-red-600" : "text-amber-600"
                }`}
              >
                {s.stock}/{s.min} {s.unit}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
