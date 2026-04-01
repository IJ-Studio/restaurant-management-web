"use client";

import { useState } from "react";
import { X, Plus, FileText, Truck, CheckCircle2 } from "lucide-react";
import { type Supplier, type PurchaseOrder, type OrderItem, type OrderStatus, ORDER_STATUS } from "../data/suppliersMock";

const inpClass =
  "w-full px-3 py-2.5 border border-border bg-surface rounded-xl text-[13px] text-text font-body outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all";
const lblClass = "block text-[11px] font-bold text-text-sec mb-1.5";

const STATUS_FLOW: OrderStatus[] = [
  "borrador",
  "enviada",
  "confirmada",
  "en_camino",
  "recibida",
];

export function OrderModal({
  suppliers,
  order,
  onClose,
  onSave,
}: {
  suppliers: Supplier[];
  order: PurchaseOrder | null;
  onClose: () => void;
  onSave: (o: PurchaseOrder) => void;
}) {
  const activeSuppliers = suppliers.filter((s) => s.active);
  const [suppId, setSuppId] = useState(order?.supplierId ?? activeSuppliers[0]?.id ?? 0);
  const [items, setItems] = useState<OrderItem[]>(
    order?.items ?? [{ productName: "", quantity: 1, unit: "kg", unitCost: 0 }]
  );
  const [expectedAt, setExpectedAt] = useState(order?.expectedAt ?? "");
  const [notes, setNotes] = useState(order?.notes ?? "");
  const [status, setStatus] = useState<OrderStatus>(order?.status ?? "borrador");

  const total = items.reduce((s, i) => s + i.quantity * i.unitCost, 0);
  const currentSupp = suppliers.find((s) => s.id === suppId);

  function addItem() {
    setItems((is) => [...is, { productName: "", quantity: 1, unit: "kg", unitCost: 0 }]);
  }
  function removeItem(i: number) {
    setItems((is) => is.filter((_, j) => j !== i));
  }
  function updateItem(i: number, field: keyof OrderItem, val: string | number) {
    setItems((is) => is.map((item, j) => (j !== i ? item : { ...item, [field]: val })));
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#1a1208]/45 backdrop-blur-sm">
      <div className="bg-surface rounded-[28px] shadow-[0_24px_64px_rgba(26,18,8,0.18)] w-full max-w-[680px] overflow-hidden flex flex-col">
        <div className="px-7 py-6 border-b border-border flex justify-between items-start bg-surface-alt">
          <div>
            <h2 className="font-display font-black text-xl text-text m-0 mb-1">
              {order ? `Orden ${order.folio}` : "Nueva orden de compra"}
            </h2>
            <p className="text-xs text-text-muted m-0">
              Reabastecimiento de inventario
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-surface border border-border rounded-lg cursor-pointer flex text-text-sec hover:bg-border transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-7 py-5 flex flex-col gap-5 max-h-[66vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={lblClass}>Proveedor *</label>
              <select
                className={inpClass}
                value={suppId}
                onChange={(e) => setSuppId(Number(e.target.value))}
              >
                {activeSuppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {currentSupp && (
                <p className="text-[10px] text-text-muted mt-2 m-0">
                  Entrega estimada: {currentSupp.deliveryDays} día(s) · {currentSupp.paymentTerms}
                </p>
              )}
            </div>
            <div>
              <label className={lblClass}>Fecha esperada de entrega</label>
              <input
                type="date"
                className={inpClass}
                value={expectedAt}
                onChange={(e) => setExpectedAt(e.target.value)}
              />
            </div>
          </div>

          {order && (
            <div>
              <label className={lblClass}>Estado de la orden</label>
              <div className="flex flex-wrap gap-2">
                {STATUS_FLOW.map((s) => {
                  const sc = ORDER_STATUS[s];
                  const active = status === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold cursor-pointer transition-colors border-1.5 ${
                        active 
                          ? `${sc.bgClass} ${sc.textClass} border-[currentColor]` 
                          : "bg-surface border-border text-text-muted hover:bg-surface-alt"
                      }`}
                    >
                      {sc.icon} {sc.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Items */}
          <div className="bg-surface border border-border rounded-2xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <label className={`${lblClass} mb-0`}>Productos a ordenar</label>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg border-none cursor-pointer bg-brand/10 text-brand hover:bg-brand/15 transition-colors"
              >
                <Plus size={12} /> Agregar
              </button>
            </div>

            <div className="grid grid-cols-[minmax(120px,2fr)_80px_80px_90px_32px] gap-2.5 px-1 mb-2">
              {["Producto", "Cant.", "Unidad", "Costo/u", ""].map((h) => (
                <span
                  key={h}
                  className="text-[10px] font-bold text-text-muted tracking-widest uppercase"
                >
                  {h}
                </span>
              ))}
            </div>

            <div className="flex flex-col gap-2.5">
              {items.map((item, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[minmax(120px,2fr)_80px_80px_90px_32px] gap-2.5 items-center"
                >
                  <input
                    className={`${inpClass} py-2 text-xs`}
                    value={item.productName}
                    onChange={(e) => updateItem(i, "productName", e.target.value)}
                    placeholder="Nombre del producto"
                  />
                  <input
                    type="number"
                    min={1}
                    className={`${inpClass} py-2 text-xs font-mono`}
                    value={item.quantity}
                    onChange={(e) => updateItem(i, "quantity", Number(e.target.value))}
                  />
                  <select
                    className={`${inpClass} py-2 text-xs`}
                    value={item.unit}
                    onChange={(e) => updateItem(i, "unit", e.target.value)}
                  >
                    {["kg", "g", "l", "ml", "pza", "caja", "bolsa"].map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={0}
                    className={`${inpClass} py-2 text-xs font-mono`}
                    value={item.unitCost}
                    onChange={(e) => updateItem(i, "unitCost", Number(e.target.value))}
                    placeholder="$0"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    disabled={items.length === 1}
                    className={`p-1.5 flex items-center justify-center rounded-lg border-none cursor-pointer text-text-muted transition-colors ${
                      items.length === 1 ? "opacity-50" : "hover:text-red-500 hover:bg-red-50"
                    }`}
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-2xl border border-emerald-200 shadow-sm">
            <span className="text-sm font-bold text-emerald-700">Total estimado</span>
            <span className="font-display text-[26px] font-black leading-none text-emerald-600">
              ${total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div>
            <label className={lblClass}>Notas opcionales</label>
            <textarea
              className={`${inpClass} resize-y min-h-[60px]`}
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Instrucciones especiales de entrega, urgencias, etc."
            />
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
            disabled={items.some((i) => !i.productName) || !suppId}
            onClick={() => {
              const s = suppliers.find((s) => s.id === suppId);
              const folio = order?.folio ?? `OC-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
              onSave({
                id: order?.id ?? Date.now(),
                folio,
                supplierId: suppId,
                supplierName: s?.name ?? "",
                status,
                items,
                total,
                createdAt: order?.createdAt ?? new Date().toISOString().split("T")[0],
                expectedAt,
                notes,
              });
              onClose();
            }}
            className={`px-5 py-2 rounded-xl text-[13px] font-bold border-none cursor-pointer text-white transition-all ${
              !items.some((i) => !i.productName) && suppId
                ? "bg-brand shadow-[0_4px_12px_rgba(232,93,4,0.3)] hover:-translate-y-px"
                : "bg-border text-text-muted"
            }`}
          >
            {order ? "Actualizar orden" : "Crear orden"}
          </button>
        </div>
      </div>
    </div>
  );
}
