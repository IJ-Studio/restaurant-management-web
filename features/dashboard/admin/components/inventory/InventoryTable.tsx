import React from 'react';
import { MoreVertical, Pencil, Trash2, Layers } from 'lucide-react';
import { type InventoryProduct } from '@/features/shared/data/restaurantData';

interface InventoryTableProps {
  products: InventoryProduct[];
  onEdit: (p: InventoryProduct) => void;
  onAdjust: (p: InventoryProduct) => void;
  onDelete: (id: number) => void;
}

const CATEGORY_MAP: Record<string, { label: string, icon: string, color: string, bg: string }> = {
  carnes: { label: "Carnes", icon: "🥩", color: "text-red-700", bg: "bg-red-50" },
  vegetales: { label: "Veg", icon: "🥬", color: "text-emerald-700", bg: "bg-emerald-50" },
  lacteos: { label: "Lácteos", icon: "🧀", color: "text-amber-700", bg: "bg-amber-50" },
  bebidas: { label: "Bebidas", icon: "🥤", color: "text-sky-700", bg: "bg-sky-50" },
  granos: { label: "Granos", icon: "🌾", color: "text-orange-800", bg: "bg-orange-50" },
};

export function InventoryTable({ products, onEdit, onAdjust, onDelete }: InventoryTableProps) {
  return (
    <div className="bg-surface rounded-3xl border border-border overflow-hidden shadow-sm overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-surface-alt border-b border-border">
            {["Producto", "Categoría", "Stock Actual", "Nivel", "Costo", "Estado", ""].map((h) => (
              <th key={h} className="px-5 py-4 text-[10px] font-black text-text-muted tracking-widest uppercase">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const cat = CATEGORY_MAP[p.category] || { label: p.category, icon: "📦", color: "text-gray-700", bg: "bg-gray-50" };
            const isLow = p.stock <= p.minStock;
            const pct = p.maxStock > 0 ? Math.min(100, (p.stock / p.maxStock) * 100) : 0;

            return (
              <tr key={p.id} className="border-b border-border/50 hover:bg-surface-alt/50 transition-colors last:border-none group">
                <td className="px-5 py-4">
                  <p className="text-[13px] font-bold text-text m-0 group-hover:text-brand transition-colors">{p.name}</p>
                  <p className="text-[10px] font-mono text-text-muted m-0 mt-1">{p.sku}</p>
                </td>
                <td className="px-5">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${cat.bg} ${cat.color}`}>
                    {cat.icon} {cat.label}
                  </span>
                </td>
                <td className="px-5">
                  <p className={`text-sm font-black m-0 ${isLow ? 'text-red-600' : 'text-text'}`}>
                    {p.stock} <span className="text-[11px] font-bold text-text-muted uppercase ml-0.5">{p.unit}</span>
                  </p>
                  <p className="text-[10px] text-text-muted m-0 mt-0.5 font-medium">Mín {p.minStock}</p>
                </td>
                <td className="px-5">
                  <div className="w-24">
                    <div className="h-1.5 bg-border rounded-full overflow-hidden mb-1.5">
                      <div className={`h-full rounded-full transition-all duration-500 ${isLow ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </td>
                <td className="px-5">
                  <p className="text-[13px] font-bold text-text m-0">${p.costPerUnit}</p>
                  <p className="text-[10px] text-text-muted m-0 mt-0.5 uppercase font-bold">por {p.unit}</p>
                </td>
                <td className="px-5">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tight ${p.active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                    {p.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-5 text-right">
                   <div className="flex items-center justify-end gap-1">
                      <button onClick={() => onAdjust(p)} className="p-2 text-text-muted hover:text-brand hover:bg-brand/5 rounded-lg transition-all" title="Ajustar Stock"><Layers size={16}/></button>
                      <button onClick={() => onEdit(p)} className="p-2 text-text-muted hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Pencil size={16}/></button>
                      <button onClick={() => onDelete(p.id)} className="p-2 text-text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16}/></button>
                   </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
