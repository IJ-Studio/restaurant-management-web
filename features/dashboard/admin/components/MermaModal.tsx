"use client";

import React, { useState } from "react";
import { X, TrendingDown } from "lucide-react";
import { type InventoryProduct, type Merma } from "@/features/shared/data/restaurantData";

const REASONS_LIST = [
  { k: "caducidad", l: "🚫 Caducidad" },
  { k: "accidente", l: "⚠️ Accidente" },
  { k: "calidad", l: "👎 Baja calidad" },
  { k: "coccion", l: "🔥 Merma cocción" },
  { k: "otro", l: "❓ Otro" },
];

const inpClass =
  "w-full px-3 py-2.5 border border-border bg-surface rounded-xl text-[13px] text-text font-body outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all";
const lblClass = "block text-[11px] font-bold text-text-sec mb-1.5";

export function MermaModal({
  products,
  onClose,
  onSave,
}: {
  products: InventoryProduct[];
  onClose: () => void;
  onSave: (m: Merma) => void;
}) {
  const activeProducts = products.filter((p) => p.active);
  const [form, setForm] = useState({
    productId: activeProducts[0]?.id ?? 0,
    quantity: 0,
    reason: "caducidad" as Merma["reason"],
    justification: "",
    reportedBy: "",
  });

  const selectedProd = products.find((p) => p.id === form.productId);
  const totalLoss = form.quantity * (selectedProd?.costPerUnit ?? 0);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#1a1208]/45 backdrop-blur-sm">
      <div className="bg-surface rounded-[28px] shadow-[0_24px_64px_rgba(26,18,8,0.18)] w-full max-w-[520px] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-7 py-6 border-b border-border flex justify-between items-start bg-surface-alt">
          <div>
            <h2 className="font-display font-black text-xl text-text m-0 mb-1">
              Registrar merma
            </h2>
            <p className="text-xs text-text-muted m-0">
              Desperdicio o salida extraordinaria de inventario
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-surface border border-border rounded-lg cursor-pointer flex text-text-sec hover:bg-border transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <div className="px-7 py-5 flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
          <div>
            <label className={lblClass}>Producto a descontar *</label>
            <select
              className={inpClass}
              value={form.productId}
              onChange={(e) => setForm({ ...form, productId: Number(e.target.value) })}
            >
              {activeProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — Disponible: {p.stock} {p.unit}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lblClass}>Cantidad *</label>
              <input
                type="number"
                min={0}
                step={0.1}
                className={inpClass}
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                placeholder={`Máx: ${selectedProd?.stock ?? 0}`}
              />
            </div>
            <div>
              <label className={lblClass}>Causa de merma *</label>
              <select
                className={inpClass}
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value as Merma["reason"] })}
              >
                {REASONS_LIST.map((v) => (
                  <option key={v.k} value={v.k}>
                    {v.l}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={lblClass}>Justificación detallada *</label>
            <textarea
              className={`${inpClass} min-h-[80px] resize-none`}
              rows={3}
              value={form.justification}
              onChange={(e) => setForm({ ...form, justification: e.target.value })}
              placeholder="Explica detalladamente qué ocurrió..."
            />
          </div>

          <div>
            <label className={lblClass}>Reportado por</label>
            <input
              className={inpClass}
              value={form.reportedBy}
              onChange={(e) => setForm({ ...form, reportedBy: e.target.value })}
              placeholder="Nombre del colaborador"
            />
          </div>

          {/* Impact preview */}
          {form.quantity > 0 && selectedProd && (
            <div className="p-3.5 bg-red-50 rounded-2xl border border-red-100 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <TrendingDown className="text-red-600" size={16} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-red-700 m-0 uppercase tracking-wider">Impacto financiero</p>
                  <p className="text-[10px] text-red-600 m-0">Merma de {form.quantity} {selectedProd.unit}</p>
                </div>
              </div>
              <span className="text-lg font-black text-red-600 font-display">
                -${totalLoss.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-7 py-4 border-t border-border bg-surface-alt flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-[13px] font-bold border-none cursor-pointer bg-surface text-text-sec hover:bg-border transition-colors shadow-sm"
          >
            Cancelar
          </button>
          <button
            disabled={!form.quantity || !form.justification}
            onClick={() => {
              if (!selectedProd) return;
              onSave({
                id: Date.now(),
                productId: form.productId,
                productName: selectedProd.name,
                quantity: form.quantity,
                unit: selectedProd.unit,
                reason: form.reason,
                justification: form.justification,
                reportedBy: form.reportedBy,
                date: new Date().toISOString().split("T")[0],
                cost: totalLoss,
              });
              onClose();
            }}
            className={`px-5 py-2 rounded-xl text-[13px] font-bold border-none cursor-pointer text-white transition-all ${
              form.quantity && form.justification 
                ? "bg-red-600 shadow-[0_4px_12px_rgba(220,38,38,0.3)] hover:-translate-y-px" 
                : "bg-border text-text-muted"
            }`}
          >
            Registrar merma
          </button>
        </div>
      </div>
    </div>
  );
}
