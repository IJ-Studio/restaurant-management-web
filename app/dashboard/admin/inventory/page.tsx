"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { useInventory, type Product, type Merma } from "@/hooks/useInventory";
import {
  Plus, Trash2, Search, Layers, Archive, AlertTriangle,
  Truck, MoreVertical, TrendingDown, Pencil, X,
} from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────
type Category =
  | "carnes" | "vegetales" | "lacteos" | "bebidas"
  | "granos" | "condimentos" | "utensilios";
type Unit = "kg" | "g" | "l" | "ml" | "pza" | "caja" | "bolsa";

// ─── Constantes con adaptación a modo oscuro ──────────────────────────────────
const CATEGORIES: Record<Category, { label: string; icon: string }> = {
  carnes:    { label: "Carnes",       icon: "🥩" },
  vegetales: { label: "Vegetales",    icon: "🥬" },
  lacteos:   { label: "Lácteos",      icon: "🧀" },
  bebidas:   { label: "Bebidas",      icon: "🥤" },
  granos:    { label: "Granos",       icon: "🌾" },
  condimentos:{ label: "Condimentos", icon: "🧂" },
  utensilios:{ label: "Utensilios",   icon: "🍴" },
};

const MERMA_REASONS: Record<string, { label: string; icon: string }> = {
  caducidad: { label: "Caducidad", icon: "📅" },
  accidente: { label: "Accidente", icon: "💥" },
  calidad:   { label: "Calidad",   icon: "👎" },
  coccion:   { label: "Cocción",   icon: "🍳" },
  otro:      { label: "Otro",      icon: "❓" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function stockStatus(p: Product): "ok" | "low" | "critical" | "over" {
  if (p.stock <= 0) return "critical";
  if (p.stock < p.minStock)
    return p.stock < p.minStock * 0.5 ? "critical" : "low";
  if (p.stock > p.maxStock) return "over";
  return "ok";
}

const STATUS_CFG = {
  ok:       { label: "OK",      color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-400/10" },
  low:      { label: "Bajo",    color: "text-amber-600 dark:text-amber-400",    bg: "bg-amber-50 dark:bg-amber-400/10" },
  critical: { label: "Crítico", color: "text-red-600 dark:text-red-400",        bg: "bg-red-50 dark:bg-red-400/10" },
  over:     { label: "Exceso",  color: "text-blue-600 dark:text-blue-400",      bg: "bg-blue-50 dark:bg-blue-400/10" },
};

// ─── Product Modal ────────────────────────────────────────────────────────────
function ProductModal({
  product, onClose, onSave,
}: {
  product: Product | null;
  onClose: () => void;
  onSave: (p: Product) => void;
}) {
  const blank: Product = {
    id: 0, name: "", sku: "", category: "vegetales", unit: "kg",
    stock: 0, minStock: 0, maxStock: 100, costPerUnit: 0,
    supplier: "", lastUpdated: "", active: true,
  };
  const [form, setForm] = useState<Product>(product ?? blank);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm">
      <div className="bg-surface rounded-3xl shadow-xl w-full max-w-xl overflow-hidden">
        <div className="flex justify-between items-start p-6 border-b border-border bg-surface-alt">
          <div>
            <h2 className="text-xl font-black text-text">{product ? "Editar producto" : "Nuevo producto"}</h2>
            <p className="text-xs text-text-muted mt-1">Control de inventario</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-muted text-text-muted"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-bold uppercase text-text-muted">Nombre *</span>
              <input className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-surface text-sm" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej. Filete de res" />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase text-text-muted">SKU</span>
              <input className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-surface text-sm" value={form.sku}
                onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} placeholder="CARN-001" />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-bold uppercase text-text-muted">Categoría *</span>
              <select className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-surface text-sm"
                value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))}>
                {Object.entries(CATEGORIES).map(([k, v]) => (
                  <option key={k} value={k}>{v.icon} {v.label}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase text-text-muted">Unidad</span>
              <select className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-surface text-sm"
                value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value as Unit }))}>
                {(["kg","g","l","ml","pza","caja","bolsa"] as Unit[]).map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <label className="block">
              <span className="text-xs font-bold uppercase text-text-muted">Stock actual</span>
              <input type="number" min={0} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-surface text-sm"
                value={form.stock} onChange={e => setForm(f => ({ ...f, stock: Number(e.target.value) }))} />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase text-text-muted">Mínimo</span>
              <input type="number" min={0} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-surface text-sm"
                value={form.minStock} onChange={e => setForm(f => ({ ...f, minStock: Number(e.target.value) }))} />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase text-text-muted">Máximo</span>
              <input type="number" min={0} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-surface text-sm"
                value={form.maxStock} onChange={e => setForm(f => ({ ...f, maxStock: Number(e.target.value) }))} />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-bold uppercase text-text-muted">Costo por unidad ($)</span>
              <input type="number" min={0} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-surface text-sm"
                value={form.costPerUnit} onChange={e => setForm(f => ({ ...f, costPerUnit: Number(e.target.value) }))} />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase text-text-muted">Proveedor</span>
              <input className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-surface text-sm"
                value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} placeholder="Nombre del proveedor" />
            </label>
          </div>

          {form.maxStock > 0 && (
            <div className="p-4 rounded-xl bg-surface-alt space-y-2">
              <div className="flex justify-between text-xs font-bold text-text-muted">
                <span>Nivel de stock</span>
                <span>{form.stock} / {form.maxStock} {form.unit}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-border overflow-hidden">
                <div className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (form.stock / form.maxStock) * 100)}%`,
                    backgroundColor: form.stock < form.minStock ? '#dc2626' : form.stock > form.maxStock ? '#2563eb' : '#059669',
                  }} />
              </div>
              <div className="flex justify-between text-[10px] text-text-muted">
                <span>Mín: {form.minStock}</span>
                <span>Máx: {form.maxStock}</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-4 rounded-xl bg-surface-alt">
            <div>
              <p className="text-sm font-bold text-text">Producto activo</p>
              <p className="text-xs text-text-muted">Visible en sistema de inventario</p>
            </div>
            <button type="button" onClick={() => setForm(f => ({ ...f, active: !f.active }))}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.active ? 'bg-brand' : 'bg-border'}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${form.active ? 'left-[calc(100%-22px)]' : 'left-0.5'}`} />
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-5 border-t border-border bg-surface-alt">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-border text-sm font-bold text-text-sec hover:bg-surface-muted">Cancelar</button>
          <button disabled={!form.name} onClick={() => {
            onSave({ ...form, id: form.id || 0, lastUpdated: new Date().toISOString().split("T")[0] });
            onClose();
          }} className="px-5 py-2.5 rounded-xl bg-brand text-white text-sm font-bold hover:bg-brand/90 disabled:opacity-40 shadow-md shadow-brand/20">
            {product ? "Guardar cambios" : "Agregar producto"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Merma Modal ──────────────────────────────────────────────────────────────
function MermaModal({
  products, onClose, onSave,
}: {
  products: Product[];
  onClose: () => void;
  onSave: (m: Merma) => void;
}) {
  const [form, setForm] = useState({
    productId: products[0]?.id ?? 0,
    quantity: 0,
    reason: "caducidad" as Merma["reason"],
    justification: "",
    reportedBy: "",
  });
  const prod = products.find(p => p.id === form.productId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm">
      <div className="bg-surface rounded-3xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex justify-between items-start p-6 border-b border-border bg-surface-alt">
          <div>
            <h2 className="text-xl font-black text-text">Registrar merma</h2>
            <p className="text-xs text-text-muted mt-1">Justificación de desperdicio requerida</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-muted text-text-muted"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-4">
          <label className="block">
            <span className="text-xs font-bold uppercase text-text-muted">Producto *</span>
            <select className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-surface text-sm"
              value={form.productId} onChange={e => setForm(f => ({ ...f, productId: Number(e.target.value) }))}>
              {products.filter(p => p.active).map(p => (
                <option key={p.id} value={p.id}>{p.name} — Stock: {p.stock} {p.unit}</option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-bold uppercase text-text-muted">Cantidad *</span>
              <input type="number" min={0.1} step={0.1} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-surface text-sm"
                value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))}
                placeholder={`Máx: ${prod?.stock ?? 0} ${prod?.unit ?? ""}`} />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase text-text-muted">Causa *</span>
              <select className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-surface text-sm"
                value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value as Merma["reason"] }))}>
                {Object.entries(MERMA_REASONS).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-bold uppercase text-text-muted">Justificación *</span>
            <textarea className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-surface text-sm resize-none" rows={3}
              value={form.justification} onChange={e => setForm(f => ({ ...f, justification: e.target.value }))}
              placeholder="Describe qué ocurrió..." />
          </label>

          <label className="block">
            <span className="text-xs font-bold uppercase text-text-muted">Reportado por</span>
            <input className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-surface text-sm"
              value={form.reportedBy} onChange={e => setForm(f => ({ ...f, reportedBy: e.target.value }))}
              placeholder="Nombre del colaborador" />
          </label>

          {form.quantity > 0 && prod && (
            <div className="flex justify-between items-center p-3 rounded-xl bg-red-50 dark:bg-red-400/10 border border-red-200 dark:border-red-400/30">
              <span className="text-sm font-bold text-red-600 dark:text-red-400"><TrendingDown size={14} className="inline mr-1" />Impacto estimado</span>
              <span className="text-lg font-black text-red-600 dark:text-red-400">-${(form.quantity * (prod.costPerUnit ?? 0)).toFixed(2)}</span>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-5 border-t border-border bg-surface-alt">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-border text-sm font-bold text-text-sec hover:bg-surface-muted">Cancelar</button>
          <button disabled={!form.quantity || !form.justification}
            onClick={() => {
              if (!prod) return;
              onSave({
                id: Date.now(), productId: form.productId, productName: prod.name,
                quantity: form.quantity, unit: prod.unit, reason: form.reason,
                justification: form.justification, reportedBy: form.reportedBy,
                date: new Date().toISOString().split("T")[0], cost: form.quantity * prod.costPerUnit,
              });
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-40 shadow-md">
            Registrar merma
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Stock Adjust Modal ───────────────────────────────────────────────────────
function AdjustModal({
  product, onClose, onSave,
}: {
  product: Product;
  onClose: () => void;
  onSave: (id: number, newStock: number) => void;
}) {
  const [qty, setQty] = useState(0);
  const [mode, setMode] = useState<"add" | "set">("add");
  const newVal = mode === "add" ? product.stock + qty : qty;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="text-lg font-black text-text">Ajustar stock</h3>
          <p className="text-xs text-text-muted mt-1">{product.name} · Actual: {product.stock} {product.unit}</p>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex gap-1.5 p-1 rounded-xl bg-surface-alt">
            {[{ k: "add", l: "Agregar" }, { k: "set", l: "Establecer" }].map(o => (
              <button key={o.k} onClick={() => setMode(o.k as any)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${mode === o.k ? 'bg-surface text-text shadow-sm' : 'text-text-muted'}`}>
                {o.l}
              </button>
            ))}
          </div>
          <label className="block">
            <span className="text-xs font-bold uppercase text-text-muted">{mode === "add" ? "Cantidad a agregar" : "Nuevo valor"}</span>
            <input type="number" className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-surface text-sm"
              value={qty} onChange={e => setQty(Number(e.target.value))} />
          </label>
          <div className="flex justify-between items-center p-3 rounded-xl bg-surface-alt">
            <span className="text-sm font-semibold text-text-sec">Resultado:</span>
            <span className={`text-lg font-black ${newVal < product.minStock ? 'text-red-600' : 'text-emerald-600'}`}>
              {newVal} {product.unit}
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-border bg-surface-alt">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-border text-sm font-bold text-text-sec hover:bg-surface-muted">Cancelar</button>
          <button onClick={() => { onSave(product.id, newVal); onClose(); }}
            className="px-4 py-2 rounded-xl bg-brand text-white text-sm font-bold hover:bg-brand/90 shadow-md shadow-brand/20">Confirmar</button>
        </div>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function InventoryPage() {
  const router = useRouter();
  const { products, mermas, loading, error, saveProduct, deleteProduct, adjustStock, saveMerma } = useInventory();
  const [tab, setTab] = useState<"productos" | "mermas">("productos");
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [productModal, setProductModal] = useState<Product | null | "new">(null);
  const [mermaModal, setMermaModal] = useState(false);
  const [adjustModal, setAdjustModal] = useState<Product | null>(null);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const user = useSelector((state: RootState) => state.auth.user);

  const criticals = products.filter(p => stockStatus(p) === "critical").length;
  const lows = products.filter(p => stockStatus(p) === "low").length;
  const totalValue = products.reduce((s, p) => s + p.stock * p.costPerUnit, 0);
  const mermaTotal = mermas.reduce((s, m) => s + m.cost, 0);

  const filtered = products.filter(p => {
    const ms = [p.name, p.sku, p.supplier].join(" ").toLowerCase().includes(search.toLowerCase());
    const mc = catFilter === "all" || p.category === catFilter;
    const ms2 = statusFilter === "all" ||
      (statusFilter === "active" ? p.active : !p.active) ||
      (statusFilter === "low" && (stockStatus(p) === "low" || stockStatus(p) === "critical"));
    return ms && mc && ms2;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-muted">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-border border-t-brand rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-muted text-sm">Cargando inventario...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-muted">
        <div className="text-center text-red-500">
          <AlertTriangle size={32} className="mx-auto mb-3" />
          <p className="font-bold">Error al cargar inventario</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-surface-muted p-6 md:p-10" onClick={() => setOpenMenu(null)}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-text">Inventario</h1>
          <p className="text-sm text-text-muted mt-1">Control de productos, stock y registro de mermas</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => router.push("/dashboard/admin/inventory/suppliers")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface text-sm font-bold text-text-sec hover:bg-surface-muted">
            <Truck size={16} /> Proveedores
          </button>
          <button onClick={() => setMermaModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-400/30 bg-red-50 dark:bg-red-400/10 text-sm font-bold text-red-600 dark:text-red-400">
            <TrendingDown size={16} /> Registrar merma
          </button>
          <button onClick={() => setProductModal("new")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand text-white text-sm font-bold hover:bg-brand/90 shadow-md shadow-brand/20">
            <Plus size={16} /> Nuevo producto
          </button>
        </div>
      </div>

      {/* Banner de error */}
      {actionError && (
        <div className="flex justify-between items-center p-3 rounded-xl bg-red-50 dark:bg-red-400/10 border border-red-200 dark:border-red-400/30 mb-5">
          <span className="text-sm text-red-600 dark:text-red-400">{actionError}</span>
          <button onClick={() => setActionError(null)} className="text-text-muted"><X size={14} /></button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {[
          { label: "Total productos", value: products.length, color: "bg-brand", sub: "en catálogo" },
          { label: "Stock crítico", value: criticals, color: "bg-red-500", sub: `${lows} en nivel bajo` },
          { label: "Valor inventario", value: `$${totalValue.toLocaleString("es-MX")}`, color: "bg-emerald-500", sub: "costo total en bodega" },
          { label: "Mermas del mes", value: `$${mermaTotal.toLocaleString("es-MX")}`, color: "bg-amber-500", sub: `${mermas.length} registros` },
        ].map(s => (
          <div key={s.label} className="bg-surface rounded-2xl border border-border p-5 shadow-sm">
            <div className={`w-6 h-1 rounded-full ${s.color} mb-3`} />
            <p className="text-2xl font-black text-text">{s.value}</p>
            <p className="text-xs font-bold text-text mt-1">{s.label}</p>
            <p className="text-[11px] text-text-muted">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Alerta stock crítico */}
      {(criticals > 0 || lows > 0) && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-400/10 border border-red-200 dark:border-red-400/30 mb-6">
          <AlertTriangle size={18} className="text-red-500 shrink-0" />
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">
            <strong>{criticals} producto{criticals !== 1 ? "s" : ""} en nivel crítico</strong>
            {lows > 0 && ` y ${lows} en nivel bajo`} — Se recomienda reabastecer.
          </p>
          <button onClick={() => router.push("/dashboard/admin/inventory/suppliers")}
            className="ml-auto text-xs font-bold text-red-600 dark:text-red-400 underline whitespace-nowrap">
            Ver proveedores →
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-0 border-b border-border mb-6">
        {[
          { k: "productos", l: "📦 Productos", count: products.length },
          { k: "mermas", l: "📉 Mermas", count: mermas.length },
        ].map(t => (
          <button key={t.k} onClick={() => setTab(t.k as any)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold transition border-b-2 -mb-[1px] ${tab === t.k ? 'border-brand text-brand' : 'border-transparent text-text-muted'}`}>
            {t.l}
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${tab === t.k ? 'bg-brand/10 text-brand' : 'bg-surface-alt text-text-muted'}`}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* ── PRODUCTOS ── */}
      {tab === "productos" && (
        <>
          {/* Filtros */}
          <div className="flex flex-wrap gap-3 mb-5">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input placeholder="Buscar producto, SKU..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-brand/20" />
            </div>
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-border bg-surface text-sm font-semibold text-text-sec">
              <option value="all">Todas las categorías</option>
              {Object.entries(CATEGORIES).map(([k, v]) => (
                <option key={k} value={k}>{v.icon} {v.label}</option>
              ))}
            </select>
            <div className="flex gap-1 p-1 rounded-xl bg-surface-alt border border-border">
              {["all", "active", "low"].map(o => (
                <button key={o} onClick={() => setStatusFilter(o)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${statusFilter === o ? 'bg-surface text-text shadow-sm' : 'text-text-muted'}`}>
                  {o === "all" ? "Todos" : o === "active" ? "Activos" : "Bajo stock"}
                </button>
              ))}
            </div>
          </div>

          {/* Píldoras de categorías */}
          <div className="flex flex-wrap gap-2 mb-5">
            {Object.entries(CATEGORIES).map(([k, v]) => {
              const count = products.filter(p => p.category === k).length;
              if (!count) return null;
              return (
                <button key={k} onClick={() => setCatFilter(catFilter === k ? "all" : k)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition ${catFilter === k ? 'border-brand/50 bg-brand/5 text-brand' : 'border-border bg-surface text-text-sec hover:border-brand/30'}`}>
                  {v.icon} {v.label} <span className="font-black">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Tabla */}
          <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-alt border-b border-border">
                    {["Producto", "Categoría", "Stock", "Nivel", "Costo unit.", "Proveedor", "Estado", ""].map(h => (
                      <th key={h} className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-text-muted">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={8} className="py-10 text-center text-text-muted text-sm">No se encontraron productos</td></tr>
                  ) : (
                    filtered.map(p => {
                      const st = stockStatus(p);
                      const sc = STATUS_CFG[st];
                      const pct = Math.min(100, (p.stock / p.maxStock) * 100);
                      const cat = CATEGORIES[p.category as keyof typeof CATEGORIES] ?? { label: "Otro", icon: "📦" };
                      return (
                        <tr key={p.id} className="hover:bg-surface-muted/50 transition">
                          <td className="px-4 py-3">
                            <p className="text-sm font-bold text-text">{p.name}</p>
                            <p className="text-[10px] text-text-muted font-mono">{p.sku}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-surface-alt text-text-sec">
                              {cat.icon} {cat.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <p className={`text-sm font-bold ${sc.color}`}>{p.stock} <span className="text-xs font-normal text-text-muted">{p.unit}</span></p>
                            <p className="text-[10px] text-text-muted">Mín {p.minStock} · Máx {p.maxStock}</p>
                          </td>
                          <td className="px-4 py-3 min-w-[100px]">
                            <div className="w-full h-1.5 rounded-full bg-border overflow-hidden mb-1.5">
                              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: st === 'critical' ? '#dc2626' : st === 'low' ? '#d97706' : '#059669' }} />
                            </div>
                            <span className={`text-[10px] font-bold ${sc.color}`}>{sc.label}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm font-semibold text-text">${p.costPerUnit}</span>
                            <span className="text-[10px] text-text-muted"> /{p.unit}</span>
                          </td>
                          <td className="px-4 py-3"><span className="text-xs text-text-sec">{p.supplier}</span></td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${p.active ? 'bg-emerald-50 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400' : 'bg-gray-100 dark:bg-gray-400/10 text-gray-500'}`}>
                              {p.active ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                          <td className="px-4 py-3 relative" onClick={e => e.stopPropagation()}>
                            <button onClick={() => setOpenMenu(openMenu === p.id ? null : p.id)}
                              className="p-1.5 rounded-lg hover:bg-surface-muted text-text-muted"><MoreVertical size={15} /></button>
                            {openMenu === p.id && (
                              <div className="absolute right-0 top-full z-10 bg-surface rounded-xl border border-border shadow-lg min-w-[160px] overflow-hidden">
                                {[
                                  { icon: <Pencil size={13} />, l: "Editar producto", fn: () => { setProductModal(p); setOpenMenu(null); } },
                                  { icon: <Layers size={13} />, l: "Ajustar stock", fn: () => { setAdjustModal(p); setOpenMenu(null); } },
                                  { icon: <TrendingDown size={13} />, l: "Registrar merma", fn: () => { setMermaModal(true); setOpenMenu(null); } },
                                  { icon: <Trash2 size={13} />, l: "Eliminar", fn: () => { deleteProduct(p.id); setOpenMenu(null); }, danger: true },
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
          <p className="text-xs text-text-muted mt-3 text-right">{filtered.length} de {products.length} productos</p>
        </>
      )}

      {/* ── MERMAS ── */}
      {tab === "mermas" && (
        <>
          <div className="flex justify-between items-center mb-5">
            <p className="text-sm text-text-sec">Total pérdida: <strong className="text-red-500">${mermaTotal.toLocaleString("es-MX")}</strong></p>
            <button onClick={() => setMermaModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 dark:border-red-400/30 bg-red-50 dark:bg-red-400/10 text-sm font-bold text-red-600 dark:text-red-400">
              <Plus size={14} /> Nueva merma
            </button>
          </div>
          <div className="space-y-3">
            {mermas.map(m => {
              const rc = MERMA_REASONS[m.reason];
              return (
                <div key={m.id} className="bg-surface rounded-xl border border-border p-4 shadow-sm flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-400/10 flex items-center justify-center shrink-0">
                    <TrendingDown size={20} className="text-red-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-bold text-text">{m.productName} <span className="text-text-muted font-normal">−{m.quantity} {m.unit}</span></p>
                        <p className="text-xs text-text-muted">Reportado por {m.reportedBy || "—"} · {m.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-surface-alt text-text-sec">{rc.label}</span>
                        <span className="text-base font-black text-red-500">-${Number(m.cost).toFixed(2)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-text-sec bg-surface-alt p-2.5 rounded-lg border-l-2 border-border">{m.justification}</p>
                  </div>
                </div>
              );
            })}
            {mermas.length === 0 && (
              <div className="text-center py-12 text-text-muted">
                <Archive size={40} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">Sin mermas registradas</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modales */}
      {productModal !== null && (
        <ProductModal product={productModal === "new" ? null : productModal} onClose={() => setProductModal(null)} onSave={saveProduct} />
      )}
      {mermaModal && (
        <MermaModal products={products} onClose={() => setMermaModal(false)} onSave={saveMerma} />
      )}
      {adjustModal && (
        <AdjustModal product={adjustModal} onClose={() => setAdjustModal(null)} onSave={adjustStock} />
      )}
    </main>
  );
}
