"use client";

import { useState } from "react";
import { X, User, Plus } from "lucide-react";
import {
  type Invoice,
  type InvoiceItem,
  type CfdiUse,
  type PayMethod,
  CFDI_USES,
  PAY_FORMS,
} from "../data/invoicesMock";

const fmt = (n: number) =>
  n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const inpClass =
  "w-full px-3 py-2 border border-border bg-surface rounded-xl text-[13px] text-text font-body outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all";
const lblClass = "block text-[11px] font-bold text-text-sec mb-1.5";

export function InvoiceModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (inv: Invoice) => void;
}) {
  const [form, setForm] = useState({
    clientName: "",
    clientRFC: "",
    clientEmail: "",
    cfdiUse: "G03" as CfdiUse,
    payMethod: "efectivo" as PayMethod,
    payForm: "01 – Efectivo",
    notes: "",
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", qty: 1, unitPrice: 0 },
  ]);

  const subtotal = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  function updateItem(i: number, field: keyof InvoiceItem, val: string | number) {
    setItems((is) =>
      is.map((item, j) => (j !== i ? item : { ...item, [field]: val }))
    );
  }

  const valid = !!(
    form.clientName &&
    form.clientRFC &&
    items.every((i) => i.description && i.qty > 0 && i.unitPrice > 0)
  );

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#1a1208]/45 backdrop-blur-sm">
      <div className="bg-surface rounded-3xl shadow-[0_24px_64px_rgba(26,18,8,0.18)] w-full max-w-[680px] overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-7 py-5 border-b border-border flex justify-between items-start bg-surface-alt">
          <div>
            <h2 className="font-display font-black text-xl text-text m-0 mb-0.5">
              Nueva factura electrónica
            </h2>
            <p className="text-xs text-text-muted m-0">
              CFDI 4.0 · El Quijote · RFC: EQRE001010XXX
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-surface border border-border rounded-lg cursor-pointer flex text-text-sec hover:bg-border transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-7 flex flex-col gap-4">
          <div className="p-4 bg-surface-alt rounded-2xl border border-border">
            <p className="flex items-center gap-1.5 text-[11px] font-extrabold text-text-muted tracking-widest uppercase mb-3">
              <User size={12} /> Datos del receptor
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={lblClass}>Nombre / Razón social *</label>
                <input
                  className={inpClass}
                  value={form.clientName}
                  onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                  placeholder="Empresa S.A. de C.V."
                />
              </div>
              <div>
                <label className={lblClass}>RFC *</label>
                <input
                  className={`${inpClass} font-mono font-bold uppercase`}
                  value={form.clientRFC}
                  onChange={(e) => setForm({ ...form, clientRFC: e.target.value.toUpperCase() })}
                  placeholder="XAXX010101000"
                  maxLength={13}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={lblClass}>Correo electrónico</label>
                <input
                  type="email"
                  className={inpClass}
                  value={form.clientEmail}
                  onChange={(e) => setForm({ ...form, clientEmail: e.target.value })}
                  placeholder="facturacion@empresa.mx"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={lblClass}>Uso de CFDI *</label>
              <select
                className={inpClass}
                value={form.cfdiUse}
                onChange={(e) => setForm({ ...form, cfdiUse: e.target.value as CfdiUse })}
              >
                {Object.entries(CFDI_USES).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={lblClass}>Forma de pago *</label>
              <select
                className={inpClass}
                value={form.payForm}
                onChange={(e) => setForm({ ...form, payForm: e.target.value })}
              >
                {PAY_FORMS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2.5">
              <p className="text-[11px] font-extrabold text-text-muted tracking-widest uppercase m-0">
                Conceptos
              </p>
              <button
                type="button"
                onClick={() => setItems([...items, { description: "", qty: 1, unitPrice: 0 }])}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border-none cursor-pointer bg-brand/10 text-brand hover:bg-brand/20 transition-colors"
              >
                <Plus size={12} /> Agregar
              </button>
            </div>
            <div className="border border-border rounded-xl overflow-hidden">
              <div className="grid grid-cols-[2fr_70px_100px_24px] gap-0 bg-surface-alt px-3 py-2">
                {["Descripción", "Cant.", "P. Unitario", ""].map((h) => (
                  <span
                    key={h}
                    className="text-[10px] font-bold text-text-muted uppercase tracking-widest"
                  >
                    {h}
                  </span>
                ))}
              </div>
              {items.map((item, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[2fr_70px_100px_24px] gap-2 px-3 py-2.5 border-t border-border items-center"
                >
                  <input
                    className={inpClass}
                    value={item.description}
                    onChange={(e) => updateItem(i, "description", e.target.value)}
                    placeholder="Descripción del servicio"
                  />
                  <input
                    type="number"
                    min={1}
                    className={inpClass}
                    value={item.qty}
                    onChange={(e) => updateItem(i, "qty", Number(e.target.value))}
                  />
                  <input
                    type="number"
                    min={0.01}
                    step={0.01}
                    className={inpClass}
                    value={item.unitPrice || ""}
                    onChange={(e) => updateItem(i, "unitPrice", Number(e.target.value))}
                    placeholder="0.00"
                  />
                  <button
                    type="button"
                    onClick={() => setItems(items.filter((_, j) => j !== i))}
                    disabled={items.length === 1}
                    className="p-1 bg-transparent border-none cursor-pointer text-red-500 disabled:text-border hover:bg-red-50 rounded"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-alt rounded-2xl p-4 flex flex-col gap-1 border border-border">
            {[
              { l: "Subtotal", v: `$${fmt(subtotal)}` },
              { l: "IVA (16%)", v: `$${fmt(iva)}` },
            ].map((r) => (
              <div key={r.l} className="flex justify-between">
                <span className="text-xs text-text-sec font-semibold">{r.l}</span>
                <span className="text-xs text-text-sec font-semibold">{r.v}</span>
              </div>
            ))}
            <div className="border-t border-border pt-2 mt-1 flex justify-between items-center">
              <span className="text-sm font-extrabold text-text">Total a facturar</span>
              <span className="font-display text-xl font-black text-brand">
                ${fmt(total)}
              </span>
            </div>
          </div>

          <div>
            <label className={lblClass}>Notas internas</label>
            <textarea
              className={`${inpClass} resize-y min-h-[60px]`}
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Referencia de pedido, observaciones..."
            />
          </div>
        </div>

        <div className="px-7 py-4 border-t border-border bg-surface-alt flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-[13px] font-bold border-none cursor-pointer bg-surface text-text-sec hover:bg-border transition-colors shadow-sm"
          >
            Cancelar
          </button>
          <button
            disabled={!valid}
            onClick={() => {
              const folio = String(Date.now()).slice(-4).padStart(4, "0");
              onSave({
                id: Date.now(),
                folio,
                series: "A",
                clientName: form.clientName,
                clientRFC: form.clientRFC,
                clientEmail: form.clientEmail,
                cfdiUse: form.cfdiUse,
                payMethod: form.payMethod,
                payForm: form.payForm,
                items,
                subtotal,
                iva,
                total,
                status: "emitida",
                issuedAt: new Date().toISOString().split("T")[0],
                notes: form.notes || undefined,
              });
              onClose();
            }}
            className={`px-5 py-2.5 rounded-xl text-[13px] font-bold border-none cursor-pointer text-white transition-all ${
              valid
                ? "bg-brand shadow-[0_4px_12px_rgba(232,93,4,0.3)] hover:-translate-y-px"
                : "bg-border text-text-muted"
            }`}
          >
            Emitir factura
          </button>
        </div>
      </div>
    </div>
  );
}
