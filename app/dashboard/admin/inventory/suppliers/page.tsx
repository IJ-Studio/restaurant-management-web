"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { useInventory, type Supplier, type PurchaseOrder, type OrderStatus, type OrderItem, type Product } from "@/hooks/useInventory";

import {
  Plus, Trash2, Search, ShoppingCart, MoreVertical,
  ChevronRight, ArrowLeft, Pencil, Truck, X, FileText,
  CheckCircle2, Users, Phone, Mail,
} from "lucide-react";

// ─── Tipos y constantes adaptadas ────────────────────────────────────────────
const ORDER_STATUS: Record<OrderStatus, { label: string; colorClass: string; bgClass: string; icon: React.ReactNode }> = {
  borrador:   { label: "Borrador",   colorClass: "text-gray-600 dark:text-gray-400", bgClass: "bg-gray-100 dark:bg-gray-400/10", icon: <FileText size={12} /> },
  enviada:    { label: "Enviada",    colorClass: "text-blue-600 dark:text-blue-400", bgClass: "bg-blue-50 dark:bg-blue-400/10", icon: <Truck size={12} /> },
  confirmada: { label: "Confirmada", colorClass: "text-amber-600 dark:text-amber-400", bgClass: "bg-amber-50 dark:bg-amber-400/10", icon: <CheckCircle2 size={12} /> },
  en_camino:  { label: "En camino",  colorClass: "text-purple-600 dark:text-purple-400", bgClass: "bg-purple-50 dark:bg-purple-400/10", icon: <Truck size={12} /> },
  recibida:   { label: "Recibida",   colorClass: "text-emerald-600 dark:text-emerald-400", bgClass: "bg-emerald-50 dark:bg-emerald-400/10", icon: <CheckCircle2 size={12} /> },
  cancelada:  { label: "Cancelada",  colorClass: "text-red-600 dark:text-red-400", bgClass: "bg-red-50 dark:bg-red-400/10", icon: <X size={12} /> },
};

// ─── Supplier Modal ───────────────────────────────────────────────────────────
function SupplierModal({ supplier, onClose, onSave }: { supplier: Supplier | null; onClose: () => void; onSave: (s: Supplier) => void }) {
  const blank: Supplier = { id: 0, name: "", contact: "", email: "", phone: "", category: "", products: [], paymentTerms: "Contado", deliveryDays: 1, active: true };
  const [form, setForm] = useState<Supplier>(supplier ?? blank);
  const [prodInput, setProdInput] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm">
      <div className="bg-surface rounded-3xl shadow-xl w-full max-w-xl overflow-hidden">
        <div className="flex justify-between items-start p-6 border-b border-border bg-surface-alt">
          <div>
            <h2 className="text-xl font-black text-text">{supplier ? "Editar proveedor" : "Nuevo proveedor"}</h2>
            <p className="text-xs text-text-muted mt-1">Datos de contacto y condiciones comerciales</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-muted text-text-muted"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-4 max-h-[62vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <label className="block"><span className="text-xs font-bold uppercase text-text-muted">Nombre *</span>
              <input className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-surface text-sm" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Empresa o persona" />
            </label>
            <label className="block"><span className="text-xs font-bold uppercase text-text-muted">Persona de contacto</span>
              <input className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-surface text-sm" value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} placeholder="Nombre completo" />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="block"><span className="text-xs font-bold uppercase text-text-muted">Correo electrónico</span>
              <input type="email" className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-surface text-sm" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="ventas@proveedor.mx" />
            </label>
            <label className="block"><span className="text-xs font-bold uppercase text-text-muted">Teléfono</span>
              <input className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-surface text-sm" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="771-000-0000" />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="block"><span className="text-xs font-bold uppercase text-text-muted">Categoría</span>
              <input className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-surface text-sm" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Ej. Carnes y embutidos" />
            </label>
            <label className="block"><span className="text-xs font-bold uppercase text-text-muted">Sitio web</span>
              <input className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-surface text-sm" value={form.website ?? ""} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="www.proveedor.com" />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="block"><span className="text-xs font-bold uppercase text-text-muted">Términos de pago</span>
              <select className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-surface text-sm" value={form.paymentTerms} onChange={e => setForm(f => ({ ...f, paymentTerms: e.target.value }))}>
                {["Contado", "Crédito 7 días", "Crédito 15 días", "Crédito 30 días", "Crédito 60 días"].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </label>
            <label className="block"><span className="text-xs font-bold uppercase text-text-muted">Días de entrega estimados</span>
              <input type="number" min={0} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-surface text-sm" value={form.deliveryDays} onChange={e => setForm(f => ({ ...f, deliveryDays: Number(e.target.value) }))} />
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-text-muted mb-1">Productos que suministra</label>
            <div className="flex gap-2 mb-2">
              <input className="flex-1 px-3 py-2.5 rounded-xl border border-border bg-surface text-sm" value={prodInput} onChange={e => setProdInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && prodInput.trim()) { setForm(f => ({ ...f, products: [...f.products, prodInput.trim()] })); setProdInput(""); } }}
                placeholder="Escribe y presiona Enter para agregar" />
              <button type="button" onClick={() => { if (prodInput.trim()) { setForm(f => ({ ...f, products: [...f.products, prodInput.trim()] })); setProdInput(""); } }}
                className="px-3 py-2.5 rounded-xl bg-brand text-white text-sm font-bold"><Plus size={14} /></button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {form.products.map((p, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-alt text-text-sec border border-border">
                  {p}
                  <button type="button" onClick={() => setForm(f => ({ ...f, products: f.products.filter((_, j) => j !== i) }))} className="text-text-muted hover:text-red-500"><X size={10} /></button>
                </span>
              ))}
            </div>
          </div>

          <label className="block"><span className="text-xs font-bold uppercase text-text-muted">Notas adicionales</span>
            <textarea className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-surface text-sm resize-none" rows={2} value={form.notes ?? ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Horarios de entrega, condiciones especiales, etc." />
          </label>

          <div className="flex items-center justify-between p-4 rounded-xl bg-surface-alt">
            <p className="text-sm font-bold text-text">Proveedor activo</p>
            <button type="button" onClick={() => setForm(f => ({ ...f, active: !f.active }))}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.active ? 'bg-brand' : 'bg-border'}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${form.active ? 'left-[calc(100%-22px)]' : 'left-0.5'}`} />
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-5 border-t border-border bg-surface-alt">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-border text-sm font-bold text-text-sec hover:bg-surface-muted">Cancelar</button>
          <button disabled={!form.name} onClick={() => { onSave({ ...form, id: form.id || 0 }); onClose(); }}
            className="px-5 py-2.5 rounded-xl bg-brand text-white text-sm font-bold hover:bg-brand/90 disabled:opacity-40 shadow-md shadow-brand/20">
            {supplier ? "Guardar cambios" : "Agregar proveedor"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Order Modal ──────────────────────────────────────────────────────────────
function OrderModal({ suppliers, products, order, onClose, onSave, initialSuppId }: { suppliers: Supplier[]; products: Product[]; order: PurchaseOrder | null; onClose: () => void; onSave: (o: PurchaseOrder) => void; initialSuppId?: number }) {
  const active = suppliers.filter(s => s.active);
  const [suppId, setSuppId] = useState(order?.supplierId ?? initialSuppId ?? active[0]?.id ?? 0);
  const [items, setItems] = useState<OrderItem[]>(order?.items ?? [{ productName: "", quantity: 1, unit: "kg", unitCost: 0 }]);
  const [notes, setNotes] = useState(order?.notes ?? "");
  const [status, setStatus] = useState<OrderStatus>(order?.status ?? "borrador");
  const total = items.reduce((s, i) => s + i.quantity * i.unitCost, 0);
  const supp = suppliers.find(s => s.id === suppId);
  const STATUS_FLOW: OrderStatus[] = ["borrador", "enviada", "confirmada", "en_camino", "recibida"];

  function addItem() { setItems(is => [...is, { productName: "", quantity: 1, unit: "kg", unitCost: 0 }]); }
  function removeItem(i: number) { setItems(is => is.filter((_, j) => j !== i)); }
  function updateItem(i: number, field: keyof OrderItem, val: string | number) {
    setItems(is => is.map((item, j) => {
      if (j !== i) return item;
      const updated = { ...item, [field]: val };
      if (field === "productName" && val) {
        const product = products.find(p => p.name.toLowerCase().trim() === String(val).toLowerCase().trim());
        if (product) { updated.unitCost = product.costPerUnit; updated.unit = product.unit || "pza"; }
      }
      return updated;
    }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm">
      <div className="bg-surface rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="flex justify-between items-start p-6 border-b border-border bg-surface-alt">
          <div>
            <h2 className="text-xl font-black text-text">{order ? `Orden ${order.folio}` : "Nueva orden de compra"}</h2>
            <p className="text-xs text-text-muted mt-1">Reabastecimiento de inventario</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-muted text-text-muted"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-4 max-h-[62vh] overflow-y-auto">
          <label className="block"><span className="text-xs font-bold uppercase text-text-muted">Proveedor *</span>
            <select className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-surface text-sm" value={suppId} onChange={e => setSuppId(Number(e.target.value))}>
              {active.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            {supp && <p className="text-[10px] text-text-muted mt-1">Entrega estimada: {supp.deliveryDays} día(s) · {supp.paymentTerms}</p>}
          </label>

          {order && (
            <div>
              <label className="text-xs font-bold uppercase text-text-muted mb-2 block">Estado de la orden</label>
              <div className="flex flex-wrap gap-2">
                {STATUS_FLOW.map(s => {
                  const sc = ORDER_STATUS[s];
                  return (
                    <button key={s} type="button" onClick={() => setStatus(s)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition ${status === s ? `${sc.bgClass} ${sc.colorClass} border-current` : 'border-border text-text-muted hover:border-text-muted'}`}>
                      {sc.icon} {sc.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold uppercase text-text-muted">Productos a ordenar</span>
              <button type="button" onClick={addItem} className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-brand/10 text-brand hover:bg-brand/20"><Plus size={12} /> Agregar</button>
            </div>
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-[2fr_70px_100px_30px] gap-2 items-start">
                  <select className="px-3 py-2.5 rounded-xl border border-border bg-surface text-sm" value={item.productName} onChange={e => updateItem(i, "productName", e.target.value)}>
                    <option value="">Seleccionar producto</option>
                    {products.filter(p => supp ? supp.products.some(sp => sp.toLowerCase().trim() === p.name.toLowerCase().trim()) : false).map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </select>
                  <input type="number" min={1} className="px-3 py-2.5 rounded-xl border border-border bg-surface text-sm" value={item.quantity} onChange={e => updateItem(i, "quantity", Number(e.target.value))} />
                  <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-surface-alt border border-border">
                    <span className="text-sm font-bold text-brand">${item.unitCost.toFixed(2)}</span>
                    <span className="text-[10px] text-text-muted">por {item.unit || "pza"}</span>
                  </div>
                  <button type="button" onClick={() => removeItem(i)} disabled={items.length === 1} className="p-1.5 text-red-500 disabled:text-border hover:bg-red-50 rounded-lg"><X size={14} /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center p-4 rounded-xl bg-surface-alt border border-border">
            <span className="text-sm font-bold text-text-sec">Total estimado</span>
            <span className="text-2xl font-black text-brand">${total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span>
          </div>

          <label className="block"><span className="text-xs font-bold uppercase text-text-muted">Notas (opcional)</span>
            <textarea className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-surface text-sm resize-none" rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Instrucciones especiales, urgencias, etc." />
          </label>
        </div>

        <div className="flex justify-end gap-3 p-5 border-t border-border bg-surface-alt">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-border text-sm font-bold text-text-sec hover:bg-surface-muted">Cancelar</button>
          <button disabled={items.some(i => !i.productName) || !suppId}
            onClick={() => {
              const s = suppliers.find(s => s.id === suppId);
              const folio = order?.folio ?? `OC-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`;
              onSave({ id: order?.id ?? 0, folio, supplierId: suppId, supplierName: s?.name ?? "", status, items, total, createdAt: order?.createdAt ?? new Date().toISOString().split("T")[0], notes });
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-brand text-white text-sm font-bold hover:bg-brand/90 disabled:opacity-40 shadow-md shadow-brand/20">
            {order ? "Actualizar orden" : "Crear orden"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Supplier Card ────────────────────────────────────────────────────────────
function SupplierCard({ supplier, orderCount, onEdit, onOrder }: { supplier: Supplier; orderCount: number; onEdit: () => void; onOrder: () => void }) {
  return (
    <div className={`bg-surface rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-all ${!supplier.active ? 'opacity-65' : ''}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-base font-extrabold text-text">{supplier.name}</p>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-surface-alt text-text-sec">{supplier.category}</span>
        </div>
        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${supplier.active ? 'bg-emerald-50 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400' : 'bg-gray-100 dark:bg-gray-400/10 text-gray-500'}`}>
          {supplier.active ? "Activo" : "Inactivo"}
        </span>
      </div>

      <div className="space-y-1.5 mb-3">
        {supplier.contact && <span className="flex items-center gap-1.5 text-xs text-text-sec"><Users size={11} className="text-text-muted" />{supplier.contact}</span>}
        {supplier.phone && <span className="flex items-center gap-1.5 text-xs text-text-sec"><Phone size={11} className="text-text-muted" />{supplier.phone}</span>}
        {supplier.email && <span className="flex items-center gap-1.5 text-xs text-text-sec"><Mail size={11} className="text-text-muted" />{supplier.email}</span>}
      </div>

      <div className="flex gap-2 mb-3">
        <div className="flex-1 p-2 rounded-xl bg-surface-alt text-center">
          <p className="text-lg font-black text-brand">{supplier.deliveryDays}d</p>
          <p className="text-[9px] font-bold uppercase text-text-muted">Entrega</p>
        </div>
        <div className="flex-1 p-2 rounded-xl bg-surface-alt text-center">
          <p className="text-lg font-black text-text">{orderCount}</p>
          <p className="text-[9px] font-bold uppercase text-text-muted">Órdenes</p>
        </div>
        <div className="flex-[2] p-2 rounded-xl bg-surface-alt text-center">
          <p className="text-sm font-bold text-text">{supplier.paymentTerms}</p>
          <p className="text-[9px] font-bold uppercase text-text-muted">Pago</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-3.5">
        {supplier.products.slice(0, 3).map((p, i) => (
          <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-alt text-text-sec border border-border">{p}</span>
        ))}
        {supplier.products.length > 3 && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-alt text-text-muted">+{supplier.products.length - 3}</span>}
      </div>

      <div className="flex gap-2">
        <button onClick={onEdit} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-border text-xs font-bold text-text-sec hover:bg-surface-muted transition"><Pencil size={12} /> Editar</button>
        <button onClick={onOrder} disabled={!supplier.active} className="flex-[2] flex items-center justify-center gap-1.5 py-2 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand/90 disabled:opacity-40 shadow-md shadow-brand/20 transition"><ShoppingCart size={12} /> Nueva orden</button>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function SuppliersPage() {
  const router = useRouter();
  const { products, suppliers, orders, loading, error, saveSupplier, deleteSupplier, saveOrder, deleteOrder } = useInventory();
  const [tab, setTab] = useState<"proveedores" | "ordenes">("proveedores");
  const [suppModal, setSuppModal] = useState<Supplier | null | "new">(null);
  const [orderModal, setOrderModal] = useState<PurchaseOrder | null | "new">(null);
  const [preselSupp, setPreselSupp] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const user = useSelector((state: RootState) => state.auth.user);

  const pendingOrders = orders.filter(o => !["recibida", "cancelada"].includes(o.status));
  const totalOrdered = orders.filter(o => o.status !== "cancelada").reduce((s, o) => s + o.total, 0);
  const filteredOrders = orders.filter(o => {
    const ms = [o.folio, o.supplierName].join(" ").toLowerCase().includes(search.toLowerCase());
    const mst = statusFilter === "all" || o.status === statusFilter;
    return ms && mst;
  });

  async function handleSaveSupplier(s: Supplier) { try { await saveSupplier(s); } catch { setActionError("Error al guardar el proveedor."); } }
  async function handleDeleteSupplier(id: number) { if (!confirm("¿Eliminar proveedor?")) return; try { await deleteSupplier(id); } catch { setActionError("Error al eliminar el proveedor."); } setOpenMenu(null); }
  async function handleSaveOrder(o: PurchaseOrder) { try { await saveOrder(o); } catch { setActionError("Error al guardar la orden."); } }
  async function handleDeleteOrder(id: number) { if (!confirm("¿Eliminar esta orden?")) return; try { await deleteOrder(id); } catch { setActionError("Error al eliminar la orden."); } setOpenMenu(null); }
  function openNewOrder(supplierId?: number) { setPreselSupp(supplierId ?? null); setOrderModal("new"); }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-muted">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-border border-t-brand rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-muted text-sm">Cargando proveedores...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-muted">
        <div className="text-center text-red-500">
          <p className="font-bold">Error al cargar proveedores</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-surface-muted p-6 md:p-10" onClick={() => setOpenMenu(null)}>
      {actionError && (
        <div className="flex justify-between items-center p-3 rounded-xl bg-red-50 dark:bg-red-400/10 border border-red-200 dark:border-red-400/30 mb-5">
          <span className="text-sm text-red-600 dark:text-red-400">{actionError}</span>
          <button onClick={() => setActionError(null)} className="text-text-muted"><X size={14} /></button>
        </div>
      )}

      <div className="flex items-center gap-1.5 mb-5 text-sm text-text-muted">
        <button onClick={() => router.push("/dashboard/admin/inventory")} className="flex items-center gap-1.5 hover:text-text"><ArrowLeft size={14} /> Inventario</button>
        <ChevronRight size={12} />
        <span className="font-bold text-text-sec">Proveedores y Órdenes</span>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-text">Proveedores</h1>
          <p className="text-sm text-text-muted mt-1">Gestión de proveedores y órdenes de reabastecimiento</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => openNewOrder()} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface text-sm font-bold text-text-sec hover:bg-surface-muted"><ShoppingCart size={16} /> Nueva orden</button>
          <button onClick={() => setSuppModal("new")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand text-white text-sm font-bold hover:bg-brand/90 shadow-md shadow-brand/20"><Plus size={16} /> Nuevo proveedor</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
        {[
          { label: "Proveedores activos", value: suppliers.filter(s => s.active).length, color: "bg-brand", textColor: "text-brand" },
          { label: "Órdenes pendientes", value: pendingOrders.length, color: "bg-amber-500", textColor: "text-amber-600 dark:text-amber-400" },
          { label: "En camino", value: orders.filter(o => o.status === "en_camino").length, color: "bg-purple-500", textColor: "text-purple-600 dark:text-purple-400" },
          { label: "Total comprado", value: `$${totalOrdered.toLocaleString()}`, color: "bg-emerald-500", textColor: "text-emerald-600 dark:text-emerald-400" },
        ].map(s => (
          <div key={s.label} className="bg-surface rounded-2xl border border-border p-5 shadow-sm">
            <div className={`w-6 h-1 rounded-full ${s.color} mb-3`} />
            <p className={`text-2xl font-black ${s.textColor}`}>{s.value}</p>
            <p className="text-xs font-bold text-text mt-1">{s.label}</p>
            <p className="text-[11px] text-text-muted">{s.label.includes("activos") ? "en lista" : s.label.includes("pendientes") ? "en proceso" : s.label.includes("camino") ? "por recibir" : "este período"}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-6 overflow-x-auto">
        {[
          { k: "proveedores", l: "🏭 Proveedores", count: suppliers.filter(s => s.active).length },
          { k: "ordenes", l: "📋 Órdenes de compra", count: orders.length },
        ].map(t => (
          <button key={t.k} onClick={() => setTab(t.k as any)}
            className={`flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold border-b-2 -mb-[1px] whitespace-nowrap transition ${tab === t.k ? 'border-brand text-brand' : 'border-transparent text-text-muted hover:text-text-sec'}`}>
            {t.l}
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${tab === t.k ? 'bg-brand/10 text-brand' : 'bg-surface-alt text-text-muted'}`}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* PROVEEDORES */}
      {tab === "proveedores" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map(s => (
            <SupplierCard key={s.id} supplier={s} orderCount={orders.filter(o => o.supplierId === s.id).length} onEdit={() => setSuppModal(s)} onOrder={() => openNewOrder(s.id)} />
          ))}
          {suppliers.length === 0 && <p className="col-span-full text-center py-12 text-text-muted">No hay proveedores registrados</p>}
        </div>
      )}

      {/* ÓRDENES */}
      {tab === "ordenes" && (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input placeholder="Buscar folio, proveedor..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-brand/20" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-border bg-surface text-sm font-semibold text-text-sec">
              <option value="all">Todos los estados</option>
              {Object.entries(ORDER_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>

          <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-alt border-b border-border">
                    {["Folio", "Proveedor", "Productos", "Estado", "Fecha esperada", "Total", ""].map(h => (
                      <th key={h} className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-text-muted">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredOrders.length === 0 ? (
                    <tr><td colSpan={7} className="py-10 text-center text-text-muted text-sm">No se encontraron órdenes</td></tr>
                  ) : (
                    filteredOrders.map(o => {
                      const sc = ORDER_STATUS[o.status];
                      return (
                        <tr key={o.id} className="hover:bg-surface-muted/50 transition">
                          <td className="px-4 py-3">
                            <p className="text-xs font-bold text-text font-mono">{o.folio}</p>
                            <p className="text-[10px] text-text-muted">{o.createdAt}</p>
                          </td>
                          <td className="px-4 py-3"><p className="text-sm font-bold text-text">{o.supplierName}</p></td>
                          <td className="px-4 py-3">
                            <p className="text-xs text-text-sec">{o.items.length} {o.items.length === 1 ? "producto" : "productos"}</p>
                            <p className="text-[10px] text-text-muted">{o.items.slice(0, 2).map(i => i.productName).join(", ")}{o.items.length > 2 ? "…" : ""}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${sc.bgClass} ${sc.colorClass}`}>{sc.icon} {sc.label}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-text-sec">{o.expectedAt || "—"}</span>
                            {o.receivedAt && <p className="text-[10px] text-emerald-600">Recibida: {o.receivedAt}</p>}
                          </td>
                          <td className="px-4 py-3"><span className="text-sm font-black text-brand">${o.total.toLocaleString()}</span></td>
                          <td className="px-4 py-3 relative" onClick={e => e.stopPropagation()}>
                            <button onClick={() => setOpenMenu(openMenu === o.id ? null : o.id)} className="p-1.5 rounded-lg hover:bg-surface-muted text-text-muted"><MoreVertical size={15} /></button>
                            {openMenu === o.id && (
                              <div className="absolute right-0 top-full z-10 bg-surface rounded-xl border border-border shadow-lg min-w-[160px] overflow-hidden">
                                {[
                                  { icon: <Pencil size={13} />, l: "Editar orden", fn: () => { setOrderModal(o); setOpenMenu(null); } },
                                  { icon: <Trash2 size={13} />, l: "Eliminar", fn: () => handleDeleteOrder(o.id), danger: true },
                                ].map((item, i) => (
                                  <button key={i} onClick={item.fn}
                                    className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm font-semibold hover:bg-surface-muted transition text-left ${(item as any).danger ? 'text-red-500' : 'text-text-sec'}`}>
                                    {item.icon} {item.l}
                                  </button>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modales */}
      {suppModal !== null && <SupplierModal supplier={suppModal === "new" ? null : suppModal} onClose={() => setSuppModal(null)} onSave={handleSaveSupplier} />}
      {orderModal !== null && (
        <OrderModal suppliers={suppliers} products={products} order={orderModal === "new" ? null : orderModal}
          onClose={() => { setOrderModal(null); setPreselSupp(null); }} onSave={handleSaveOrder}
          initialSuppId={orderModal === "new" ? (preselSupp ?? undefined) : undefined} />
      )}
    </main>
  );
}
