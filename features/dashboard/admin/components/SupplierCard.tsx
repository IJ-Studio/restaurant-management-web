"use client";

import { Users, Phone, Mail, Pencil, ShoppingCart } from "lucide-react";
import { type Supplier } from "../data/suppliersMock";

export function SupplierCard({
  supplier,
  orderCount,
  onEdit,
  onOrder,
}: {
  supplier: Supplier;
  orderCount: number;
  onEdit: () => void;
  onOrder: () => void;
}) {
  return (
    <div
      className={`bg-surface rounded-2xl border border-border p-5 transition-all shadow-sm hover:shadow-md group flex flex-col ${
        supplier.active ? "opacity-100" : "opacity-65 grayscale-[30%]"
      }`}
    >
      <div className="flex justify-between items-start mb-3 gap-2">
        <div className="min-w-0">
          <p className="font-display text-[15px] font-black text-text m-0 mb-1 leading-tight truncate group-hover:text-brand transition-colors">
            {supplier.name}
          </p>
          <span className="inline-flex text-[11px] font-bold px-2 py-0.5 rounded-full bg-surface-alt text-text-sec border border-border">
            {supplier.category}
          </span>
        </div>
        <span
          className={`shrink-0 text-[10px] font-extrabold px-2 py-[3px] rounded-full uppercase tracking-wider ${
            supplier.active ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200"
          }`}
        >
          {supplier.active ? "Activo" : "Inactivo"}
        </span>
      </div>

      <div className="flex flex-col gap-1.5 mb-4 text-[12px] text-text-sec">
        {supplier.contact && (
          <span className="flex items-center gap-2 truncate">
            <Users size={12} className="text-text-muted shrink-0" /> {supplier.contact}
          </span>
        )}
        {supplier.phone && (
          <span className="flex items-center gap-2 truncate">
            <Phone size={12} className="text-text-muted shrink-0" /> {supplier.phone}
          </span>
        )}
        {supplier.email && (
          <span className="flex items-center gap-2 truncate">
            <Mail size={12} className="text-text-muted shrink-0" /> {supplier.email}
          </span>
        )}
      </div>

      <div className="flex gap-2 mb-4 mt-auto">
        <div className="flex-1 bg-surface-alt px-2 py-2 rounded-xl text-center border border-border flex flex-col justify-center">
          <p className="font-display text-base font-black text-brand m-0 leading-none">
            {supplier.deliveryDays}d
          </p>
          <p className="text-[9px] text-text-muted mt-1 mb-0 font-bold uppercase tracking-wider">
            Entrega
          </p>
        </div>
        <div className="flex-1 bg-surface-alt px-2 py-2 rounded-xl text-center border border-border flex flex-col justify-center">
          <p className="font-display text-base font-black text-text m-0 leading-none">
            {orderCount}
          </p>
          <p className="text-[9px] text-text-muted mt-1 mb-0 font-bold uppercase tracking-wider">
            Órdenes
          </p>
        </div>
        <div className="flex-[1.5] bg-surface-alt px-2 py-2 rounded-xl text-center border border-border flex flex-col justify-center">
          <p className="font-display text-sm font-bold text-text m-0 leading-none truncate">
            {supplier.paymentTerms}
          </p>
          <p className="text-[9px] text-text-muted mt-1 mb-0 font-bold uppercase tracking-wider">
            Pago
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {supplier.products.slice(0, 3).map((p, i) => (
          <span
            key={i}
            className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-alt text-text-sec border border-border truncate max-w-[120px]"
          >
            {p}
          </span>
        ))}
        {supplier.products.length > 3 && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-alt text-text-muted border border-border">
            +{supplier.products.length - 3}
          </span>
        )}
      </div>

      <div className="flex gap-2.5 h-9">
        <button
          onClick={onEdit}
          className="w-10 flex items-center justify-center rounded-xl bg-surface border border-border text-text-sec hover:bg-surface-alt hover:text-text cursor-pointer transition-colors"
          title="Editar proveedor"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={onOrder}
          disabled={!supplier.active}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl text-[13px] font-bold border-none cursor-pointer text-white transition-all ${
            supplier.active 
              ? "bg-brand shadow-[0_3px_10px_rgba(232,93,4,0.25)] hover:-translate-y-px" 
              : "bg-border text-text-muted opacity-50"
          }`}
        >
          <ShoppingCart size={14} /> 
          <span className="hidden xs:inline">Nueva orden</span>
        </button>
      </div>
    </div>
  );
}
