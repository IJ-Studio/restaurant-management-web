"use client";

import { TABLE_CFG, TABLES } from "../data/mockData";

export function TableStatusGrid() {
  const freeTables = TABLES.filter((t) => t.status === "libre").length;
  const occupiedTables = TABLES.filter((t) => t.status === "ocupada").length;

  return (
    <div className="bg-surface rounded-[22px] border border-border shadow-sm overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-border bg-surface-alt flex justify-between items-center">
        <h3 className="font-display font-black text-sm text-text m-0">🗺 Estado de mesas</h3>
        <span className="text-[11px] font-bold text-text-muted">
          {occupiedTables} ocup. · {freeTables} libres
        </span>
      </div>
      
      <div className="p-3 grid grid-cols-4 gap-1.5 flex-1 content-start">
        {TABLES.map((t) => {
          const cfg = TABLE_CFG[t.status];
          return (
            <div
              key={t.n}
              className={`rounded-[10px] border-[1.5px] p-1.5 text-center cursor-pointer transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 ${cfg.bgClass} ${cfg.borderClass}`}
            >
              <p className={`font-display text-[13px] font-black leading-none mb-0.5 ${cfg.colorClass}`}>
                {t.n}
              </p>
              <p className={`text-[8px] font-bold uppercase tracking-wider leading-tight m-0 ${cfg.colorClass}`}>
                {t.status === "ocupada" ? `${t.guests}👤` : t.status.slice(0, 5)}
              </p>
            </div>
          );
        })}
      </div>

      <div className="px-3 pb-3 flex flex-wrap gap-2">
        {Object.entries(TABLE_CFG).map(([k, cfg]) => (
          <span key={k} className={`flex items-center gap-1 text-[10px] font-bold ${cfg.colorClass}`}>
            <span className={`w-1.5 h-1.5 rounded-sm ${cfg.colorClass.replace("text-", "bg-")}`} />
            {cfg.label}
          </span>
        ))}
      </div>
    </div>
  );
}
