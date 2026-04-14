"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Search,
  ShoppingCart,
  MoreVertical,
  ChevronRight,
  ArrowLeft,
  Pencil,
} from "lucide-react";

import {
  type Supplier,
  type PurchaseOrder,
  type OrderStatus,
  ORDER_STATUS,
  MOCK_SUPPLIERS,
  MOCK_ORDERS,
} from "@/features/dashboard/admin/data/suppliersMock";

import { SupplierModal } from "@/features/dashboard/admin/components/SupplierModal";
import { OrderModal } from "@/features/dashboard/admin/components/OrderModal";
import { SupplierCard } from "@/features/dashboard/admin/components/SupplierCard";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function SuppliersPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);
  const [orders, setOrders] = useState<PurchaseOrder[]>(MOCK_ORDERS);
  const [tab, setTab] = useState<"proveedores" | "ordenes">("proveedores");
  const [suppModal, setSuppModal] = useState<Supplier | null | "new">(null);
  const [orderModal, setOrderModal] = useState<PurchaseOrder | null | "new">(null);
  const [preselSupp, setPreselSupp] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  function saveSupplier(s: Supplier) {
    setSuppliers((ss) => {
      const ex = ss.find((x) => x.id === s.id);
      return ex ? ss.map((x) => (x.id === s.id ? s : x)) : [...ss, s];
    });
  }

  function saveOrder(o: PurchaseOrder) {
    setOrders((os) => {
      const ex = os.find((x) => x.id === o.id);
      return ex ? os.map((x) => (x.id === o.id ? o : x)) : [...os, o];
    });
  }

  function deleteOrder(id: number) {
    if (!confirm("¿Eliminar esta orden?")) return;
    setOrders((os) => os.filter((o) => o.id !== id));
    setOpenMenu(null);
  }

  function openNewOrder(supplierId?: number) {
    setPreselSupp(supplierId ?? null);
    setOrderModal("new");
  }

  const pendingOrders = orders.filter((o) => !["recibida", "cancelada"].includes(o.status));
  const totalOrdered = orders.filter((o) => o.status !== "cancelada").reduce((s, o) => s + o.total, 0);

  const filteredOrders = orders.filter((o) => {
    const ms = [o.folio, o.supplierName].join(" ").toLowerCase().includes(search.toLowerCase());
    const mst = statusFilter === "all" || o.status === statusFilter;
    return ms && mst;
  });

  return (
    <main className="p-8 md:p-10 min-w-0" onClick={() => setOpenMenu(null)}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 mb-5 text-[13px] text-text-muted">
        <button
          onClick={() => router.push("/dashboard/admin/inventory")}
          className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer text-text-muted font-body text-[13px] hover:text-text-sec transition-colors"
        >
          <ArrowLeft size={14} /> Inventario
        </button>
        <ChevronRight size={12} />
        <span className="font-bold text-text-sec">Proveedores y Órdenes</span>
      </div>

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-black text-3xl tracking-tight leading-none mb-1.5 text-text m-0">
            Proveedores
          </h1>
          <p className="text-sm text-text-muted m-0">
            Gestión de proveedores y órdenes de reabastecimiento
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => openNewOrder()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-bold border border-border cursor-pointer bg-surface text-text-sec hover:bg-surface-alt transition-colors"
          >
            <ShoppingCart size={15} /> Nueva orden
          </button>
          <button
            onClick={() => setSuppModal("new")}
            className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-[13px] font-bold border-none cursor-pointer bg-brand text-white shadow-[0_4px_12px_rgba(232,93,4,0.28)] hover:-translate-y-px transition-all"
          >
            <Plus size={15} /> Nuevo proveedor
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
        {[
          { label: "Proveedores activos", value: suppliers.filter((s) => s.active).length, colorClass: "bg-brand text-brand", sub: "en lista" },
          { label: "Órdenes pendientes", value: pendingOrders.length, colorClass: "bg-amber-600 text-amber-600", sub: "en proceso" },
          { label: "En camino", value: orders.filter((o) => o.status === "en_camino").length, colorClass: "bg-purple-600 text-purple-600", sub: "por recibir" },
          { label: "Total comprado", value: `$${totalOrdered.toLocaleString()}`, colorClass: "bg-emerald-600 text-emerald-600", sub: "este período" },
        ].map((s) => {
          const [bg, textColor] = s.colorClass.split(" ");
          return (
            <div key={s.label} className="bg-surface rounded-[20px] border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-6 h-1 rounded-full mb-3.5 opacity-90 ${bg}`} />
              <p className={`font-display text-[26px] font-black m-0 mb-1 leading-none ${textColor}`}>
                {s.value}
              </p>
              <p className="text-xs font-bold text-text m-0 mb-0.5">{s.label}</p>
              <p className="text-[11px] text-text-muted m-0">{s.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-border mb-6 overflow-x-auto no-scrollbar">
        {[
          { k: "proveedores", l: "🏭 Proveedores", count: suppliers.filter((s) => s.active).length },
          { k: "ordenes", l: "📋 Órdenes de compra", count: orders.length },
        ].map((t) => {
          const active = tab === t.k;
          return (
            <button
              key={t.k}
              onClick={() => setTab(t.k as any)}
              className={`flex items-center gap-1.5 px-5 py-2.5 text-[13px] font-bold border-none cursor-pointer bg-transparent border-b-2 mb-[-1px] whitespace-nowrap transition-colors ${
                active ? "border-brand text-brand" : "border-transparent text-text-muted hover:text-text-sec"
              }`}
            >
              {t.l}
              <span
                className={`px-[7px] py-[1px] rounded-full text-[10px] font-extrabold transition-colors ${
                  active ? "bg-brand/10 text-brand" : "bg-surface-alt text-text-muted"
                }`}
              >
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── PROVEEDORES TAB ── */}
      {tab === "proveedores" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-5">
          {suppliers.map((s) => (
            <SupplierCard
              key={s.id}
              supplier={s}
              orderCount={orders.filter((o) => o.supplierId === s.id).length}
              onEdit={() => setSuppModal(s)}
              onOrder={() => openNewOrder(s.id)}
            />
          ))}
        </div>
      )}

      {/* ── ÓRDENES TAB ── */}
      {tab === "ordenes" && (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1 max-w-[300px] group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none group-focus-within:text-brand transition-colors" size={14} />
              <input
                placeholder="Buscar folio, proveedor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-xl text-[13px] font-body text-text outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all placeholder:text-text-muted"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2 bg-surface text-text-sec border border-border rounded-xl text-[13px] font-bold outline-none cursor-pointer hover:bg-surface-alt transition-colors focus:border-brand"
            >
              <option value="all">Todos los estados</option>
              {Object.entries(ORDER_STATUS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-surface rounded-3xl border border-border overflow-x-auto shadow-sm">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-surface-alt border-b border-border">
                  {["Folio", "Proveedor", "Productos", "Estado", "Fecha esperada", "Total", ""].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-[10px] font-bold text-text-muted tracking-widest uppercase first:pl-5 md:first:pl-6"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o) => {
                  const sc = ORDER_STATUS[o.status];
                  return (
                    <tr
                      key={o.id}
                      className="border-b border-border/50 hover:bg-surface-alt transition-colors last:border-none group/row"
                    >
                      <td className="px-4 py-3.5 first:pl-5 md:first:pl-6">
                        <p className="text-xs font-black text-text font-mono m-0 group-hover/row:text-brand transition-colors">
                          {o.folio}
                        </p>
                        <p className="text-[10px] text-text-muted mt-0.5 m-0 font-medium">
                          {o.createdAt}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 max-w-[160px]">
                        <p className="text-[13px] font-bold text-text m-0 truncate" title={o.supplierName}>
                          {o.supplierName}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 max-w-[200px]">
                        <p className="text-[12px] text-text-sec m-0 font-medium">
                          {o.items.length} {o.items.length === 1 ? "producto" : "productos"}
                        </p>
                        <p className="text-[10px] text-text-muted mt-0.5 m-0 truncate">
                          {o.items.slice(0, 2).map((i) => i.productName).join(", ")}
                          {o.items.length > 2 ? "…" : ""}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border border-[currentColor]/10 ${sc.bgClass} ${sc.textClass}`}
                        >
                          {sc.icon} {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[12px] font-medium text-text-sec">
                          {o.expectedAt || "—"}
                        </span>
                        {o.receivedAt && (
                          <p className="text-[10px] text-emerald-600 mt-0.5 m-0 font-bold">
                            Recibida: {o.receivedAt}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[13px] font-black text-text">
                          ${o.total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right w-[60px]">
                        <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setOpenMenu(openMenu === o.id ? null : o.id)}
                            className="p-1.5 rounded-lg bg-transparent border-none cursor-pointer text-text-muted hover:text-text hover:bg-border transition-colors flex items-center justify-center"
                          >
                            <MoreVertical size={16} />
                          </button>
                          {openMenu === o.id && (
                            <div className="absolute right-0 top-full mt-1 z-10 w-40 bg-surface rounded-xl border border-border shadow-md overflow-hidden">
                              <button
                                onClick={() => {
                                  setOrderModal(o);
                                  setOpenMenu(null);
                                }}
                                className="w-full flex items-center gap-2 px-3.5 py-2.5 text-[12px] font-bold border-none cursor-pointer bg-transparent text-text-sec hover:bg-surface-alt hover:text-text transition-colors text-left"
                              >
                                <Pencil size={13} /> Editar orden
                              </button>
                              <button
                                onClick={() => deleteOrder(o.id)}
                                className="w-full flex items-center gap-2 px-3.5 py-2.5 text-[12px] font-bold border-none cursor-pointer bg-transparent text-red-600 hover:bg-red-50 transition-colors text-left"
                              >
                                <Trash2 size={13} /> Eliminar
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-[13px] font-bold text-text-muted bg-surface/50">
                      No se encontraron órdenes.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modals */}
      {suppModal !== null && (
        <SupplierModal
          supplier={suppModal === "new" ? null : suppModal}
          onClose={() => setSuppModal(null)}
          onSave={saveSupplier}
        />
      )}
      {orderModal !== null && (
        <OrderModal
          suppliers={suppliers}
          order={orderModal === "new" ? null : orderModal}
          onClose={() => {
            setOrderModal(null);
            setPreselSupp(null);
          }}
          onSave={saveOrder}
        />
      )}
    </main>
  );
}
