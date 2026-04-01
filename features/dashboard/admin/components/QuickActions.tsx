"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Utensils, Users, Package, DollarSign, BarChart2, MapPin } from "lucide-react";

interface QuickBtnProps {
  icon: React.ReactNode;
  label: string;
  colorClass: string;
  bgClass: string;
  onClick: () => void;
}

function QuickBtn({ icon, label, colorClass, bgClass, onClick }: QuickBtnProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 px-2 py-3.5 rounded-2xl border border-border bg-surface cursor-pointer flex-1 transition-all duration-150 hover:border-brand hover:bg-brand/5 group`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 group-hover:shadow-[0_4px_12px_rgba(232,93,4,0.3)] ${bgClass} ${colorClass}`}
      >
        {icon}
      </div>
      <span className="text-[11px] font-bold text-text-sec text-center leading-tight font-body group-hover:text-brand">
        {label}
      </span>
    </button>
  );
}

export function QuickActions() {
  const router = useRouter();

  const actions = [
    { icon: <Utensils size={16} />, label: "Menú", colorClass: "text-brand", bgClass: "bg-brand/15", path: "/dashboard/admin/menu" },
    { icon: <Users size={16} />, label: "Personal", colorClass: "text-purple-600", bgClass: "bg-purple-100", path: "/dashboard/admin/users" },
    { icon: <Package size={16} />, label: "Inventario", colorClass: "text-emerald-600", bgClass: "bg-emerald-100", path: "/dashboard/admin/inventory" },
    { icon: <DollarSign size={16} />, label: "Finanzas", colorClass: "text-amber-600", bgClass: "bg-amber-100", path: "/dashboard/admin/finance" },
    { icon: <BarChart2 size={16} />, label: "Reportes", colorClass: "text-blue-600", bgClass: "bg-blue-100", path: "/dashboard/admin/reports" },
    { icon: <MapPin size={16} />, label: "Reservas", colorClass: "text-red-600", bgClass: "bg-red-100", path: "/dashboard/admin/reservations" },
  ];

  return (
    <div className="bg-surface rounded-[22px] border border-border shadow-sm overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-border bg-surface-alt">
        <h3 className="font-display font-black text-sm text-text m-0">⚡ Acceso rápido</h3>
      </div>
      <div className="p-2.5 grid grid-cols-3 gap-2">
        {actions.map((a) => (
          <QuickBtn
            key={a.label}
            icon={a.icon}
            label={a.label}
            colorClass={a.colorClass}
            bgClass={a.bgClass}
            onClick={() => router.push(a.path)}
          />
        ))}
      </div>
    </div>
  );
}
