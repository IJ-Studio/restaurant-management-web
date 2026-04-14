"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight, Plus, Search } from "lucide-react";

import {
  type Invoice,
  type InvStatus,
  MOCK_INVOICES,
  STATUS_CFG,
} from "@/features/dashboard/admin/data/invoicesMock";
import { InvoiceDrawer } from "@/features/dashboard/admin/components/InvoiceDrawer";
import { InvoiceModal } from "@/features/dashboard/admin/components/InvoiceModal";
import AdminSidebar from "@/components/admin/AdminSidebar";

const fmt = (n: number) =>
  n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [newModal, setNewModal] = useState(false);
  const [drawer, setDrawer] = useState<Invoice | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchFocus, setSearchFocus] = useState(false);

  const filtered = invoices.filter((inv) => {
    const ms = [inv.folio, inv.clientName, inv.clientRFC]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase());
    const mst = statusFilter === "all" || inv.status === statusFilter;
    return ms && mst;
  });

  const totalEmitido = invoices
    .filter((i) => i.status !== "cancelada")
    .reduce((s, i) => s + i.total, 0);
  const totalPagado = invoices
    .filter((i) => i.status === "pagada")
    .reduce((s, i) => s + i.total, 0);
  const totalPend = invoices
    .filter((i) => ["emitida", "pendiente"].includes(i.status))
    .reduce((s, i) => s + i.total, 0);

  function changeStatus(id: number, status: InvStatus) {
    setInvoices((is) =>
      is.map((i) =>
        i.id !== id
          ? i
          : {
              ...i,
              status,
              paidAt: status === "pagada" ? new Date().toISOString().split("T")[0] : i.paidAt,
            }
      )
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar activePage="invoices" user={{ name: "Admin" }} />
      <main className="flex-1 ml-[260px] p-8 md:p-10 min-w-0">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 mb-5 text-[13px] text-text-muted">
          <button
            onClick={() => router.push("/dashboard/admin/finance")}
            className="flex items-center gap-1 bg-transparent border-none cursor-pointer text-text-muted font-body text-[13px] hover:text-text-sec transition-colors"
          >
            <ArrowLeft size={14} /> Finanzas
          </button>
          <ChevronRight size={12} />
          <span className="font-bold text-text-sec">Facturas electrónicas</span>
        </div>

        {/* Header */}
        <header className="flex justify-between items-start mb-8">
          <div>
            <h1 className="font-display font-black text-3xl tracking-tight leading-none mb-1.5 text-text m-0">
              Facturas electrónicas
            </h1>
            <p className="text-sm text-text-muted m-0">
              Emisión de CFDI 4.0 · RFC emisor: EQRE001010XXX
            </p>
          </div>
          <button
            onClick={() => setNewModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-bold border-none cursor-pointer text-white bg-brand shadow-[0_4px_12px_rgba(232,93,4,0.28)] hover:-translate-y-px hover:shadow-lg transition-all"
          >
            <Plus size={15} /> Nueva factura
          </button>
        </header>

        {/* KPI Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
          {[
            { l: "Total emitido", v: `$${fmt(totalEmitido)}`, colorClass: "bg-brand text-brand", count: `${invoices.length} facturas` },
            { l: "Cobrado", v: `$${fmt(totalPagado)}`, colorClass: "bg-emerald-600 text-emerald-600", count: `${invoices.filter((i) => i.status === "pagada").length} pagadas` },
            { l: "Por cobrar", v: `$${fmt(totalPend)}`, colorClass: "bg-amber-600 text-amber-600", count: `${invoices.filter((i) => ["emitida", "pendiente"].includes(i.status)).length} pendientes` },
            { l: "Canceladas", v: invoices.filter((i) => i.status === "cancelada").length.toString(), colorClass: "bg-red-600 text-red-600", count: "este período" },
          ].map((s) => {
            const [bg, textColor] = s.colorClass.split(" ");
            return (
              <div key={s.l} className="bg-surface rounded-[20px] border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-6 h-1 rounded-full mb-3.5 opacity-90 ${bg}`} />
                <p className={`font-display text-[26px] font-black m-0 mb-1 leading-none ${textColor}`}>
                  {s.v}
                </p>
                <p className="text-xs font-bold text-text m-0 mb-0.5">{s.l}</p>
                <p className="text-[11px] text-text-muted m-0">{s.count}</p>
              </div>
            );
          })}
        </div>

        {/* Toolbar: Search & Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-5 md:items-center">
          <div className="relative flex-1 max-w-[320px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            <input
              placeholder="Buscar folio, cliente, RFC..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
              className={`w-full pl-[34px] pr-3 py-2 rounded-xl text-[13px] font-body text-text bg-surface outline-none border transition-all duration-150 ${
                searchFocus ? "border-brand shadow-[0_0_0_3px_rgba(232,93,4,0.1)]" : "border-border"
              }`}
            />
          </div>
          <div className="flex gap-1 p-1 rounded-xl bg-surface-alt border border-border overflow-x-auto no-scrollbar">
            {["all", "emitida", "pagada", "pendiente", "cancelada"].map((s) => {
              const cfg = s === "all" ? { label: "Todas" } : STATUS_CFG[s as InvStatus];
              const active = statusFilter === s;
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border-none cursor-pointer whitespace-nowrap transition-all ${
                    active ? "bg-surface text-text shadow-[0_1px_4px_rgba(26,18,8,0.1)]" : "bg-transparent text-text-muted hover:text-text-sec"
                  }`}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-surface-alt border-b border-border text-left">
                  {["Folio", "Cliente", "Uso CFDI", "Emisión", "Status", "Monto"].map((h) => (
                    <th key={h} className={`px-5 py-3.5 text-[10px] font-bold text-text-muted tracking-widest uppercase ${h === "Monto" ? "text-right" : ""}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => {
                  const sc = STATUS_CFG[inv.status];
                  return (
                    <tr
                      key={inv.id}
                      onClick={() => setDrawer(inv)}
                      className="border-b border-border cursor-pointer hover:bg-surface-alt transition-colors group"
                    >
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-mono font-bold text-text-sec group-hover:text-brand transition-colors">
                          {inv.series}
                          {inv.folio}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-[13px] font-bold text-text m-0 mb-0.5">{inv.clientName}</p>
                        <p className="text-[10px] font-mono text-text-sec m-0">RFC: {inv.clientRFC}</p>
                      </td>
                      <td className="px-5 py-3.5 text-[11px] font-bold text-text-sec uppercase tracking-wider">
                        {inv.cfdiUse}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-text-sec">
                        {inv.issuedAt}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${sc.colorClass} ${sc.bgClass}`}>
                          {sc.icon} {sc.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="text-[13px] font-black text-text">${fmt(inv.total)}</span>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-sm font-bold text-text-muted">
                      No se encontraron facturas con los filtros actuales.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {newModal && (
          <InvoiceModal
            onClose={() => setNewModal(false)}
            onSave={(inv) => setInvoices([inv, ...invoices])}
          />
        )}

        {drawer && (
          <InvoiceDrawer
            inv={drawer}
            onClose={() => setDrawer(null)}
            onStatusChange={changeStatus}
          />
        )}
      </main>
    </div>
  );
}
