"use client";

import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { ORDERS, ORDER_STATUS } from "../data/mockData";

export function RecentOrdersTable() {
  const router = useRouter();

  const fmt = (n: number) => n.toLocaleString("es-MX", { minimumFractionDigits: 2 });

  return (
    <div className="bg-surface rounded-[22px] border border-border shadow-sm overflow-hidden flex flex-col">
      <div className="px-5 py-4 border-b border-border bg-surface-alt flex justify-between items-center">
        <div>
          <h2 className="font-display font-black text-base text-text mb-0.5">Pedidos en curso</h2>
          <p className="text-[11px] text-text-muted m-0">Actualización en tiempo real vía SSE</p>
        </div>
        <button
          onClick={() => router.push("/dashboard/admin/orders")}
          className="flex items-center gap-1 text-xs font-bold text-brand bg-transparent border-none cursor-pointer hover:underline"
        >
          Ver todos <ChevronRight size={13} />
        </button>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-surface-alt border-b border-border">
              {["ID", "Cliente", "Platillo", "Ubicación", "Estado", "Total"].map((h) => (
                <th
                  key={h}
                  className="px-3.5 py-2.5 text-[9px] font-extrabold tracking-[0.13em] uppercase text-text-muted text-left"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ORDERS.map((o) => {
              const sc = ORDER_STATUS[o.status];
              return (
                <tr
                  key={o.id}
                  className="border-b border-border cursor-pointer transition-colors hover:bg-surface-alt group"
                >
                  <td className="p-3.5">
                    <span className="text-[11px] font-mono font-bold text-brand">{o.id}</span>
                  </td>
                  <td className="p-3.5">
                    <p className="text-xs font-bold text-text mb-0.5">{o.customer}</p>
                    <p className="text-[10px] text-text-muted m-0">{o.time}</p>
                  </td>
                  <td className="p-3.5 max-w-[140px]">
                    <p className="text-xs text-text-sec m-0 truncate">{o.item}</p>
                  </td>
                  <td className="p-3.5">
                    <span className="text-[11px] text-text-sec">{o.table}</span>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${sc.colorClass} ${sc.bgClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${sc.dotClass}`} />
                      {sc.label}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="text-[13px] font-black text-brand">${fmt(o.total)}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
