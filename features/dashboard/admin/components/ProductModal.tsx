"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { type InventoryProduct } from "@/features/shared/data/restaurantData";

const CATEGORIES_LIST = [
  { k: "entradas", l: "🥗 Entradas" },
  { k: "fuertes", l: "🥩 Platos Fuertes" },
  { k: "bebidas", l: "🍹 Bebidas" },
  { k: "vegetales", l: "🥬 Vegetales" },
  { k: "carnes", l: "🥩 Carnes" },
  { k: "lacteos", l: "🧀 Lácteos" },
  { k: "granos", l: "🌾 Granos" },
  { k: "condimentos", l: "🧂 Condimentos" },
];

const inpClass =
  "w-full px-3 py-2.5 border border-border bg-surface rounded-xl text-[13px] text-text font-body outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all";
const lblClass = "block text-[11px] font-bold text-text-sec mb-1.5";

export function ProductModal({
  product,
  onClose,
  onSave,
}: {
  product: InventoryProduct | null;
  onClose: () => void;
  onSave: (p: InventoryProduct) => void;
}) {
  const blank: InventoryProduct = {
    id: 0,
    name: "",
    sku: "",
    category: "vegetales",
    unit: "kg",
    stock: 0,
    minStock: 0,
    maxStock: 100,
    costPerUnit: 0,
    supplier: "",
    lastUpdated: "",
    active: true,
  };
  const [form, setForm] = useState<InventoryProduct>(product ?? blank);

  const stockPct = form.maxStock > 0 ? Math.min(100, (form.stock / form.maxStock) * 100) : 0;
  const stockColor = form.stock < form.minStock ? "bg-red-500" : form.stock > form.maxStock ? "bg-sky-500" : "bg-emerald-500";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#1a1208]/45 backdrop-blur-sm">
      <div className="bg-surface rounded-[28px] shadow-[0_24px_64px_rgba(26,18,8,0.18)] w-full max-w-[580px] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-7 py-6 border-b border-border flex justify-between items-start bg-surface-alt">
          <div>
            <h2 className="font-display font-black text-xl text-text m-0 mb-1">
              {product ? "Editar producto" : "Nuevo producto"}
            </h2>
            <p className="text-xs text-text-muted m-0">
              Control de inventario de suministros
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lblClass}>Nombre del producto *</label>
              <input
                className={inpClass}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej. Filete de res"
              />
            </div>
            <div>
              <label className={lblClass}>SKU / Código</label>
              <input
                className={inpClass}
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                placeholder="CARN-001"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lblClass}>Categoría *</label>
              <select
                className={inpClass}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES_LIST.map((v) => (
                  <option key={v.k} value={v.k}>
                    {v.l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={lblClass}>Unidad de medida</label>
              <select
                className={inpClass}
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
              >
                {["kg", "g", "l", "ml", "pza", "caja", "bolsa"].map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={lblClass}>Stock actual</label>
              <input
                type="number"
                min={0}
                className={inpClass}
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className={lblClass}>Mínimo (alerta)</label>
              <input
                type="number"
                min={0}
                className={inpClass}
                value={form.minStock}
                onChange={(e) => setForm({ ...form, minStock: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className={lblClass}>Máximo</label>
              <input
                type="number"
                min={0}
                className={inpClass}
                value={form.maxStock}
                onChange={(e) => setForm({ ...form, maxStock: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lblClass}>Costo por unidad ($)</label>
              <input
                type="number"
                min={0}
                className={inpClass}
                value={form.costPerUnit}
                onChange={(e) => setForm({ ...form, costPerUnit: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className={lblClass}>Proveedor principal</label>
              <input
                className={inpClass}
                value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                placeholder="Nombre del proveedor"
              />
            </div>
          </div>

          {/* Stock bar preview */}
          {form.maxStock > 0 && (
            <div className="p-3.5 bg-surface-alt rounded-2xl border border-border shadow-sm">
              <div className="flex justify-between mb-2 items-center">
                <span className="text-xs font-bold text-text-sec">Nivel de stock</span>
                <span className="text-[11px] font-mono text-text-muted">
                  {form.stock} / {form.maxStock} {form.unit}
                </span>
              </div>
              <div className="h-2.5 bg-border rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${stockColor}`}
                  style={{ width: `${stockPct}%` }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[10px] font-bold text-text-muted">Mín: {form.minStock}</span>
                <span className="text-[10px] font-bold text-text-muted">Máx: {form.maxStock}</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-3.5 bg-surface-alt rounded-2xl border border-border">
            <div>
              <p className="text-[13px] font-bold text-text m-0">Producto activo</p>
              <p className="text-[11px] text-text-muted m-0 mt-0.5">Visible en sistema de inventario</p>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, active: !form.active })}
              className={`w-11 h-6 rounded-full border-none cursor-pointer transition-all relative flex items-center ${
                form.active ? "bg-brand" : "bg-border"
              }`}
            >
              <span
                className={`absolute w-5 h-5 bg-white rounded-full transition-all shadow-[0_1px_4px_rgba(0,0,0,0.2)] ${
                  form.active ? "left-[calc(100%-22px)]" : "left-[2px]"
                }`}
              />
            </button>
          </div>
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
            disabled={!form.name}
            onClick={() => {
              onSave({
                ...form,
                id: form.id || Date.now(),
                lastUpdated: new Date().toISOString().split("T")[0],
              });
              onClose();
            }}
            className={`px-5 py-2 rounded-xl text-[13px] font-bold border-none cursor-pointer text-white transition-all ${
              form.name
                ? "bg-brand shadow-[0_4px_12px_rgba(232,93,4,0.3)] hover:-translate-y-px"
                : "bg-border text-text-muted"
            }`}
          >
            {product ? "Guardar cambios" : "Agregar producto"}
          </button>
        </div>
      </div>
    </div>
  );
}
