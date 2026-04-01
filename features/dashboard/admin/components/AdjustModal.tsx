"use client";

import React, { useState } from "react";
import { X, Check } from "lucide-react";
import { type InventoryProduct } from "@/features/shared/data/restaurantData";

const STATUS_CONFIG = {
  ok: { label: "OK", color: "text-emerald-600", bg: "bg-emerald-50" },
  low: { label: "Bajo", color: "text-amber-600", bg: "bg-amber-50" },
  critical: { label: "Crítico", color: "text-red-600", bg: "bg-red-50" },
};

const inpClass =
  "w-full px-3 py-2.5 border border-border bg-surface rounded-xl text-[13px] text-text font-body outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all";
const lblClass = "block text-[11px] font-bold text-text-sec mb-1.5";

export function AdjustModal({
  product,
  onClose,
  onSave,
}: {
  product: InventoryProduct;
  onClose: () => void;
  onSave: (id: number, newStock: number) => void;
}) {
  const [qty, setQty] = useState(0);
  const [mode, setMode] = useState<"add" | "set">("add");
  const newVal = mode === "add" ? product.stock + qty : qty;
  
  const getStatus = (val: number) => {
    if (val <= product.minStock * 0.5) return STATUS_CONFIG.critical;
    if (val <= product.minStock) return STATUS_CONFIG.low;
    return STATUS_CONFIG.ok;
  };

  const statusCfg = getStatus(newVal);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#1a1208]/45 backdrop-blur-sm">
      <div className="bg-surface rounded-3xl shadow-[0_24px_64px_rgba(26,18,8,0.18)] w-full max-w-[380px] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border bg-surface-alt flex justify-between items-start">
          <div>
            <h3 className="font-display font-black text-lg text-text m-0 mb-0.5">
              Ajustar stock
            </h3>
            <p className="text-[11px] text-text-muted m-0">
              {product.name} · Actual: {product.stock} {product.unit}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-surface border border-border rounded-lg cursor-pointer flex text-text-sec hover:bg-border transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Form Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="flex p-1 bg-surface-alt rounded-xl border border-border gap-1">
            {[
              { k: "add", l: "Agregar (+)" },
              { k: "set", l: "Establecer (=)" },
            ].map((o) => (
              <button
                key={o.k}
                onClick={() => setMode(o.k as any)}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-all border-none ${
                    mode === o.k 
                        ? "bg-surface text-text shadow-sm ring-1 ring-border" 
                        : "bg-transparent text-text-muted hover:text-text-sec"
                }`}
              >
                {o.l}
              </button>
            ))}
          </div>

          <div>
            <label className={lblClass}>
              {mode === "add" ? "Cantidad a agregar" : "Nuevo valor de stock"}
            </label>
            <div className="relative">
              <input
                type="number"
                className={inpClass}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                placeholder={mode === "add" ? "+0" : "0"}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-text-muted">
                {product.unit}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-surface-alt rounded-2xl border border-border">
            <span className="text-xs font-bold text-text-sec">Resultado:</span>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-extrabold px-1.5 py-0.5 rounded-full border ${statusCfg.bg} ${statusCfg.color} border-[currentColor]/15`}>
                {statusCfg.label}
              </span>
              <span className={`text-xl font-black font-display ${statusCfg.color}`}>
                {newVal}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-surface-alt flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-[12px] font-bold border-none cursor-pointer bg-surface text-text-sec hover:bg-border transition-colors shadow-sm"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onSave(product.id, newVal);
              onClose();
            }}
            className="px-5 py-2 rounded-xl text-[12px] font-bold border-none cursor-pointer bg-brand text-white shadow-[0_4px_12px_rgba(232,93,4,0.3)] hover:-translate-y-px transition-all flex items-center gap-1.5"
          >
            <Check size={14} /> Confirmar ajuste
          </button>
        </div>
      </div>
    </div>
  );
}
