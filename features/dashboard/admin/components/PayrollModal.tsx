"use client";

import { useState } from "react";
import { X, Wallet } from "lucide-react";
import type { PayrollEntry } from "@/features/dashboard/admin/types/payroll";

const inpClass =
  "w-full px-3 py-2 border border-border bg-surface rounded-xl text-[13px] text-text font-body outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all";
const lblClass = "block text-[11px] font-bold text-text-sec mb-1.5";

export function PayrollModal({
  entry,
  onClose,
  onSave,
}: {
  entry: PayrollEntry | null;
  onClose: () => void;
  onSave: (e: { id?: string; role: string; name: string; weeklyPay: number; active: boolean }) => void;
}) {
  const isEdit = !!entry;
  const [form, setForm] = useState({
    role: entry?.role ?? "",
    name: entry?.name ?? "",
    weeklyPay: entry?.weeklyPay ?? 0,
    active: entry?.active ?? true,
  });

  const canSave = form.role.trim() !== "" && form.name.trim() !== "" && form.weeklyPay > 0;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#1a1208]/45 backdrop-blur-sm">
      <div className="bg-surface rounded-3xl shadow-[0_24px_64px_rgba(26,18,8,0.18)] w-full max-w-[480px] overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-border flex justify-between items-start bg-surface-alt">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-brand/10 text-brand">
              <Wallet size={20} />
            </div>
            <div>
              <h2 className="font-display font-black text-[18px] text-text m-0 mb-0.5">
                {isEdit ? "Editar empleado" : "Agregar a la nómina"}
              </h2>
              <p className="text-[11px] text-text-muted m-0">Pago semanal</p>
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
            <label className={lblClass}>Rol / Puesto *</label>
            <input
              className={inpClass}
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="Ej. Chef 1, Mesero 2, Gerente"
            />
          </div>
          <div>
            <label className={lblClass}>Nombre *</label>
            <input
              className={inpClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nombre del colaborador"
            />
          </div>
          <div>
            <label className={lblClass}>Pago semanal ($) *</label>
            <input
              type="number"
              min={0}
              step={0.01}
              className={`${inpClass} font-bold`}
              value={form.weeklyPay || ""}
              onChange={(e) => setForm({ ...form, weeklyPay: Number(e.target.value) })}
              placeholder="0.00"
            />
          </div>
          <label className="flex items-center gap-2 text-[13px] font-bold text-text-sec cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="w-4 h-4 accent-brand"
            />
            Empleado activo
          </label>
        </div>

        <div className="px-6 py-4 border-t border-border bg-surface-alt flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-[13px] font-bold border-none cursor-pointer bg-surface text-text-sec hover:bg-border transition-colors shadow-sm"
          >
            Cancelar
          </button>
          <button
            disabled={!canSave}
            onClick={() => {
              onSave({
                id: entry?.id,
                role: form.role.trim(),
                name: form.name.trim(),
                weeklyPay: form.weeklyPay,
                active: form.active,
              });
              onClose();
            }}
            className={`px-5 py-2 rounded-xl text-[13px] font-bold border-none cursor-pointer text-white transition-all ${
              canSave
                ? "bg-brand shadow-[0_4px_12px_rgba(232,93,4,0.28)] hover:-translate-y-px"
                : "bg-border text-text-muted"
            }`}
          >
            {isEdit ? "Guardar cambios" : "Agregar"}
          </button>
        </div>
      </div>
    </div>
  );
}
