"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { type Supplier } from "../data/suppliersMock";

const inpClass =
  "w-full px-3 py-2.5 border border-border bg-surface rounded-xl text-[13px] text-text font-body outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all";
const lblClass = "block text-[11px] font-bold text-text-sec mb-1.5";

export function SupplierModal({
  supplier,
  onClose,
  onSave,
}: {
  supplier: Supplier | null;
  onClose: () => void;
  onSave: (s: Supplier) => void;
}) {
  const blank: Supplier = {
    id: 0,
    name: "",
    contact: "",
    email: "",
    phone: "",
    category: "",
    products: [],
    paymentTerms: "Contado",
    deliveryDays: 1,
    active: true,
  };
  const [form, setForm] = useState<Supplier>(supplier ?? blank);
  const [prodInput, setProdInput] = useState("");

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#1a1208]/45 backdrop-blur-sm">
      <div className="bg-surface rounded-[28px] shadow-[0_24px_64px_rgba(26,18,8,0.18)] w-full max-w-[580px] overflow-hidden flex flex-col">
        <div className="px-7 py-6 border-b border-border flex justify-between items-start bg-surface-alt">
          <div>
            <h2 className="font-display font-black text-xl text-text m-0 mb-1">
              {supplier ? "Editar proveedor" : "Nuevo proveedor"}
            </h2>
            <p className="text-xs text-text-muted m-0">
              Datos de contacto y condiciones comerciales
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-surface border border-border rounded-lg cursor-pointer flex text-text-sec hover:bg-border transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-7 py-5 flex flex-col gap-3.5 max-h-[62vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={lblClass}>Nombre del proveedor *</label>
              <input
                className={inpClass}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Empresa o persona"
              />
            </div>
            <div>
              <label className={lblClass}>Persona de contacto</label>
              <input
                className={inpClass}
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
                placeholder="Nombre completo"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={lblClass}>Correo electrónico</label>
              <input
                type="email"
                className={inpClass}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="ventas@proveedor.mx"
              />
            </div>
            <div>
              <label className={lblClass}>Teléfono</label>
              <input
                className={inpClass}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="771-000-0000"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={lblClass}>Categoría de productos</label>
              <input
                className={inpClass}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Ej. Carnes y embutidos"
              />
            </div>
            <div>
              <label className={lblClass}>Sitio web</label>
              <input
                className={inpClass}
                value={form.website ?? ""}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="www.proveedor.com"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={lblClass}>Términos de pago</label>
              <select
                className={inpClass}
                value={form.paymentTerms}
                onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })}
              >
                {[
                  "Contado",
                  "Crédito 7 días",
                  "Crédito 15 días",
                  "Crédito 30 días",
                  "Crédito 60 días",
                ].map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={lblClass}>Días de entrega estimados</label>
              <input
                type="number"
                min={0}
                className={inpClass}
                value={form.deliveryDays}
                onChange={(e) => setForm({ ...form, deliveryDays: Number(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className={lblClass}>Productos que suministra</label>
            <div className="flex gap-2 mb-2">
              <input
                className={`${inpClass} flex-1`}
                value={prodInput}
                onChange={(e) => setProdInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && prodInput.trim()) {
                    setForm({ ...form, products: [...form.products, prodInput.trim()] });
                    setProdInput("");
                  }
                }}
                placeholder="Escribe y presiona Enter para agregar"
              />
              <button
                type="button"
                onClick={() => {
                  if (prodInput.trim()) {
                    setForm({ ...form, products: [...form.products, prodInput.trim()] });
                    setProdInput("");
                  }
                }}
                className="px-3.5 py-2.5 rounded-xl text-xs font-bold border-none cursor-pointer bg-brand text-white shadow-sm flex items-center shrink-0 hover:bg-brand/90 transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {form.products.map((p, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-surface-alt border border-border text-text-sec"
                >
                  {p}
                  <button
                    type="button"
                    onClick={() =>
                      setForm({ ...form, products: form.products.filter((_, j) => j !== i) })
                    }
                    className="bg-transparent border-none p-0 cursor-pointer flex text-text-muted hover:text-red-500 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className={lblClass}>Notas adicionales</label>
            <textarea
              className={`${inpClass} min-h-[60px] resize-y`}
              rows={2}
              value={form.notes ?? ""}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Horarios de entrega, condiciones especiales, etc."
            />
          </div>

          <div className="flex items-center justify-between p-3.5 bg-surface-alt rounded-2xl border border-border">
            <p className="text-[13px] font-bold text-text m-0">
              Proveedor activo
            </p>
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
              onSave({ ...form, id: form.id || Date.now() });
              onClose();
            }}
            className={`px-5 py-2 rounded-xl text-[13px] font-bold border-none cursor-pointer text-white transition-all ${
              form.name
                ? "bg-brand shadow-[0_4px_12px_rgba(232,93,4,0.3)] hover:-translate-y-px"
                : "bg-border text-text-muted"
            }`}
          >
            {supplier ? "Guardar cambios" : "Agregar proveedor"}
          </button>
        </div>
      </div>
    </div>
  );
}
