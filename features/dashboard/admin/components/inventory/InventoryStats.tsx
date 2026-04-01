import React from 'react';
import { type InventoryProduct, type Merma } from '@/features/shared/data/restaurantData';

interface InventoryStatsProps {
  products: InventoryProduct[];
  mermas: Merma[];
}

export function InventoryStats({ products, mermas }: InventoryStatsProps) {
  const criticals = products.filter(p => p.stock <= p.minStock).length;
  const totalValue = products.reduce((s, p) => s + (p.stock * p.costPerUnit), 0);
  const mermaTotal = mermas.reduce((s, m) => s + m.cost, 0);

  const stats = [
    { label: "Total productos", value: products.length, color: "text-brand", bg: "bg-brand/5", sub: "en catálogo" },
    { label: "Stock crítico", value: criticals, color: "text-red-600", bg: "bg-red-50", sub: "Acción requerida" },
    { label: "Valor inventario", value: `$${totalValue.toLocaleString()}`, color: "text-emerald-600", bg: "bg-emerald-50", sub: "Costo total" },
    { label: "Mermas (Mes)", value: `$${mermaTotal.toLocaleString()}`, color: "text-amber-600", bg: "bg-amber-50", sub: "Pérdida registrada" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((s) => (
        <div key={s.label} className="bg-surface rounded-3xl border border-border p-6 shadow-sm hover:shadow-md transition-all group">
          <div className={`w-8 h-1 rounded-full mb-4 ${s.bg.replace('50', '500').replace('/5', '500')}`} />
          <p className={`font-display text-2xl font-black m-0 mb-1 leading-none ${s.color}`}>
            {s.value}
          </p>
          <p className="text-xs font-black text-text m-0 uppercase tracking-widest">{s.label}</p>
          <p className="text-[11px] text-text-muted m-0 mt-1">{s.sub}</p>
        </div>
      ))}
    </div>
  );
}
