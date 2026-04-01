"use client";

import { useState } from "react";
import { type CashSession } from "../data/financeMock";

const fmt = (n: number) =>
  n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const inpClass =
  "w-full px-3 py-2 border border-border bg-surface rounded-xl text-[13px] text-text font-body outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all";
const lblClass = "block text-[11px] font-bold text-text-sec mb-1.5";

export function CloseSessionModal({
  session,
  onClose,
  onConfirm,
}: {
  session: CashSession;
  onClose: () => void;
  onConfirm: (counted: number, closedBy: string) => void;
}) {
  const [counted, setCounted] = useState<number>(0);
  const [by, setBy] = useState("");
  const diff = counted - session.expectedBalance;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#1a1208]/45 backdrop-blur-sm">
      <div className="bg-surface rounded-3xl shadow-[0_24px_64px_rgba(26,18,8,0.18)] w-full max-w-[460px] overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-border">
          <h2 className="font-display font-black text-xl text-text m-0 mb-1">
            Cierre de caja
          </h2>
          <p className="text-xs text-text-muted m-0">
            {session.date} · Apertura {session.openedAt}
          </p>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { l: "Saldo apertura", v: `$${fmt(session.openingBalance)}`, c: "text-text" },
              { l: "Movimientos", v: session.movements, c: "text-text" },
              { l: "Saldo esperado", v: `$${fmt(session.expectedBalance)}`, c: "text-brand" },
            ].map((r) => (
              <div key={r.l} className="px-3 py-2.5 bg-surface-alt rounded-xl border border-border">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 m-0">
                  {r.l}
                </p>
                <p className={`text-base font-black m-0 ${r.c}`}>{r.v}</p>
              </div>
            ))}
          </div>

          <div>
            <label className={lblClass}>Efectivo contado en caja *</label>
            <input
              type="number"
              min={0}
              step={0.01}
              className={`${inpClass} text-base font-bold`}
              value={counted || ""}
              onChange={(e) => setCounted(Number(e.target.value))}
              placeholder="0.00"
            />
          </div>

          {counted > 0 && (
            <div
              className={`p-3.5 rounded-xl border ${
                diff === 0
                  ? "bg-emerald-50 border-emerald-300"
                  : diff > 0
                  ? "bg-blue-50 border-blue-300"
                  : "bg-red-50 border-red-300"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-[13px] font-bold text-text-sec">
                  Diferencia:
                </span>
                <span
                  className={`text-xl font-black ${
                    diff === 0
                      ? "text-emerald-600"
                      : diff > 0
                      ? "text-blue-600"
                      : "text-red-600"
                  }`}
                >
                  {diff > 0 ? "+" : ""}${fmt(diff)}
                </span>
              </div>
              <p className="text-[11px] text-text-sec mt-1 m-0">
                {diff === 0
                  ? "✓ Cuadre perfecto"
                  : diff > 0
                  ? "Sobrante en caja"
                  : "Faltante en caja"}
              </p>
            </div>
          )}

          <div>
            <label className={lblClass}>Cierre realizado por *</label>
            <input
              className={inpClass}
              value={by}
              onChange={(e) => setBy(e.target.value)}
              placeholder="Nombre del cajero"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border bg-surface-alt flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-[13px] font-bold border-none cursor-pointer bg-surface text-text-sec hover:bg-border transition-colors shadow-sm"
          >
            Cancelar
          </button>
          <button
            disabled={!counted || !by}
            onClick={() => {
              onConfirm(counted, by);
              onClose();
            }}
            className={`px-5 py-2 rounded-xl text-[13px] font-bold border-none cursor-pointer text-white transition-all ${
              counted && by
                ? "bg-brand shadow-[0_4px_12px_rgba(232,93,4,0.3)] hover:-translate-y-px"
                : "bg-border text-text-muted"
            }`}
          >
            Confirmar cierre
          </button>
        </div>
      </div>
    </div>
  );
}
