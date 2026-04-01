"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { type Tip, type PayMethod, PAY_CFG, PAY_ICONS } from "../data/financeMock";

const inpClass =
  "w-full px-3 py-2 border border-border bg-surface rounded-xl text-[13px] text-text font-body outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all";
const lblClass = "block text-[11px] font-bold text-text-sec mb-1.5";

export function TipModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (t: Tip) => void;
}) {
  const [form, setForm] = useState({
    waiter: "",
    tableRef: "",
    amount: 0,
    payMethod: "efectivo" as PayMethod,
  });

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#1a1208]/45 backdrop-blur-sm">
      <div className="bg-surface rounded-3xl shadow-[0_24px_64px_rgba(26,18,8,0.18)] w-full max-w-[420px] overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-surface-alt">
          <h3 className="font-display font-black text-lg text-text m-0">
            Registrar propina
          </h3>
          <button
            onClick={onClose}
            className="p-1 bg-surface border border-border rounded-lg cursor-pointer flex text-text-sec hover:bg-border transition-colors"
          >
            <X size={14} />
          </button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className={lblClass}>Mesero *</label>
              <input
                className={inpClass}
                value={form.waiter}
                onChange={(e) => setForm({ ...form, waiter: e.target.value })}
                placeholder="Nombre"
              />
            </div>
            <div>
              <label className={lblClass}>Mesa / Referencia</label>
              <input
                className={inpClass}
                value={form.tableRef}
                onChange={(e) => setForm({ ...form, tableRef: e.target.value })}
                placeholder="Mesa 4"
              />
            </div>
          </div>
          <div>
            <label className={lblClass}>Monto de propina ($) *</label>
            <input
              type="number"
              min={1}
              className={`${inpClass} font-bold`}
              value={form.amount || ""}
              onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className={lblClass}>Método</label>
            <div className="flex gap-2">
              {(["efectivo", "tarjeta", "transferencia"] as PayMethod[]).map((m) => {
                const cfg = PAY_CFG[m];
                const sel = form.payMethod === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setForm({ ...form, payMethod: m })}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-[11px] font-bold border-1.5 cursor-pointer transition-colors ${
                      sel ? `${cfg.bgClass} ${cfg.borderClass} ${cfg.textClass}` : "bg-surface border-border text-text-sec hover:bg-surface-alt"
                    }`}
                  >
                    {PAY_ICONS[m]} {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-border bg-surface-alt flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold border-none cursor-pointer bg-surface text-text-sec hover:bg-border transition-colors shadow-sm"
          >
            Cancelar
          </button>
          <button
            disabled={!form.waiter || !form.amount}
            onClick={() => {
              onSave({
                id: Date.now(),
                waiter: form.waiter,
                tableRef: form.tableRef,
                amount: form.amount,
                payMethod: form.payMethod,
                date: new Date().toISOString().split("T")[0],
                distributed: false,
              });
              onClose();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold border-none cursor-pointer text-white transition-all ${
              form.waiter && form.amount
                ? "bg-brand shadow-[0_4px_12px_rgba(232,93,4,0.3)] hover:-translate-y-px"
                : "bg-border text-text-muted"
            }`}
          >
            Registrar
          </button>
        </div>
      </div>
    </div>
  );
}
