"use client";

import { useState } from "react";
import { X, TrendingDown, TrendingUp } from "lucide-react";
import {
  type CashMovement,
  type MvType,
  type PayMethod,
  INGRESO_CATS,
  EGRESO_CATS,
  PAY_CFG,
  PAY_ICONS,
} from "../data/financeMock";

const inpClass =
  "w-full px-3 py-2 border border-border bg-surface rounded-xl text-[13px] text-text font-body outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all";
const lblClass = "block text-[11px] font-bold text-text-sec mb-1.5";

export function MovementModal({
  type,
  onClose,
  onSave,
}: {
  type: MvType;
  onClose: () => void;
  onSave: (m: CashMovement) => void;
}) {
  const [form, setForm] = useState({
    concept: "",
    category: type === "ingreso" ? INGRESO_CATS[0] : EGRESO_CATS[0],
    amount: 0,
    payMethod: "efectivo" as PayMethod,
    responsible: "",
    notes: "",
  });
  const cats = type === "ingreso" ? INGRESO_CATS : EGRESO_CATS;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#1a1208]/45 backdrop-blur-sm">
      <div className="bg-surface rounded-3xl shadow-[0_24px_64px_rgba(26,18,8,0.18)] w-full max-w-[520px] overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-border flex justify-between items-start bg-surface-alt">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                type === "ingreso" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
              }`}
            >
              {type === "ingreso" ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            </div>
            <div>
              <h2 className="font-display font-black text-[18px] text-text m-0 mb-0.5">
                Registrar {type === "ingreso" ? "ingreso" : "egreso"}
              </h2>
              <p className="text-[11px] text-text-muted m-0">
                Caja chica · {new Date().toLocaleDateString("es-MX")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-surface border border-border rounded-lg cursor-pointer flex text-text-sec hover:bg-border transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div>
            <label className={lblClass}>Concepto *</label>
            <input
              className={inpClass}
              value={form.concept}
              onChange={(e) => setForm({ ...form, concept: e.target.value })}
              placeholder={
                type === "ingreso" ? "Ej. Venta turno comida" : "Ej. Compra insumos limpieza"
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lblClass}>Categoría</label>
              <select
                className={inpClass}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {cats.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={lblClass}>Monto ($) *</label>
              <input
                type="number"
                min={0.01}
                step={0.01}
                className={`${inpClass} font-bold`}
                value={form.amount || ""}
                onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                placeholder="0.00"
              />
            </div>
          </div>
          <div>
            <label className={lblClass}>Método de pago</label>
            <div className="flex gap-2">
              {(["efectivo", "tarjeta", "transferencia"] as PayMethod[]).map((m) => {
                const cfg = PAY_CFG[m];
                const sel = form.payMethod === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setForm({ ...form, payMethod: m })}
                    className={`flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-bold border-1.5 cursor-pointer transition-colors ${
                      sel ? `${cfg.bgClass} ${cfg.borderClass} ${cfg.textClass}` : "bg-surface border-border text-text-sec hover:bg-surface-alt"
                    }`}
                  >
                    {PAY_ICONS[m]} {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className={lblClass}>Responsable</label>
            <input
              className={inpClass}
              value={form.responsible}
              onChange={(e) => setForm({ ...form, responsible: e.target.value })}
              placeholder="Nombre del colaborador"
            />
          </div>
          <div>
            <label className={lblClass}>Notas adicionales</label>
            <textarea
              className={`${inpClass} resize-y min-h-[60px]`}
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Observaciones opcionales..."
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border bg-surface-alt flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-[13px] font-bold border-none cursor-pointer bg-surface text-text-sec hover:bg-border transition-colors shadow-sm"
          >
            Cancelar
          </button>
          <button
            disabled={!form.concept || !form.amount}
            onClick={() => {
              onSave({
                id: Date.now(),
                type,
                concept: form.concept,
                category: form.category,
                amount: form.amount,
                payMethod: form.payMethod,
                responsible: form.responsible,
                date: new Date().toISOString().split("T")[0],
                time: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
                notes: form.notes || undefined,
              });
              onClose();
            }}
            className={`px-5 py-2 rounded-xl text-[13px] font-bold border-none cursor-pointer text-white transition-all ${
              form.concept && form.amount
                ? type === "ingreso"
                  ? "bg-emerald-600 shadow-[0_4px_12px_rgba(5,150,105,0.25)] hover:-translate-y-px"
                  : "bg-red-600 shadow-[0_4px_12px_rgba(220,38,38,0.25)] hover:-translate-y-px"
                : "bg-border text-text-muted"
            }`}
          >
            Registrar {type === "ingreso" ? "ingreso" : "egreso"}
          </button>
        </div>
      </div>
    </div>
  );
}
