"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  TrendingDown,
  Truck,
} from "lucide-react";

import { 
  InventoryService, 
  MermaService 
} from "@/features/shared/services/dataService";
import { 
  type InventoryProduct, 
  type Merma 
} from "@/features/shared/data/restaurantData";

import { InventoryStats } from "@/features/dashboard/admin/components/inventory/InventoryStats";
import { InventoryTable } from "@/features/dashboard/admin/components/inventory/InventoryTable";
import { MermaList } from "@/features/dashboard/admin/components/inventory/MermaList";

import { ProductModal } from "@/features/dashboard/admin/components/ProductModal";
import { MermaModal } from "@/features/dashboard/admin/components/MermaModal";
import { AdjustModal } from "@/features/dashboard/admin/components/AdjustModal";

export default function InventoryPage() {
  const router = useRouter();
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [mermas, setMermas] = useState<Merma[]>([]);
  const [tab, setTab] = useState<"productos" | "mermas">("productos");
  
  const [productModal, setProductModal] = useState<InventoryProduct | null | "new">(null);
  const [mermaModalOpen, setMermaModalOpen] = useState(false);
  const [adjustModal, setAdjustModal] = useState<InventoryProduct | null>(null);

  // Load from "La Base"
  useEffect(() => {
    setProducts(InventoryService.getInventory());
    setMermas(MermaService.getMermas());
  }, []);

  const refreshData = () => {
    setProducts(InventoryService.getInventory());
    setMermas(MermaService.getMermas());
  };

  const handleSaveProduct = (p: any) => {
    InventoryService.saveProduct(p);
    refreshData();
    setProductModal(null);
  };

  const handleDeleteProduct = (id: number) => {
    if (!confirm("¿Eliminar producto?")) return;
    InventoryService.deleteProduct(id);
    refreshData();
  };

  const handleAdjustStock = (id: number, newStock: number) => {
    const inv = InventoryService.getInventory();
    const p = inv.find(x => x.id === id);
    if (p) {
      InventoryService.saveProduct({ ...p, stock: newStock, lastUpdated: new Date().toISOString().split('T')[0] });
      refreshData();
    }
    setAdjustModal(null);
  };

  const handleSaveMerma = (m: Merma) => {
    MermaService.addMerma(m);
    refreshData();
    setMermaModalOpen(false);
  };

  return (
    <main className="p-8 md:p-10 min-w-0 max-w-[1400px] mx-auto animate-in fade-in duration-700">
      
      {/* Header Area */}
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-black text-4xl tracking-tight leading-none mb-2 text-text m-0">
            Inventario Central
          </h1>
          <p className="text-sm font-medium text-text-muted m-0">
            Sincronizado con La Base · Control de Insumos y Mermas
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => router.push("/dashboard/admin/inventory/suppliers")}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl text-[13px] font-bold border border-border cursor-pointer bg-surface text-text-sec hover:bg-surface-alt transition-all shadow-sm"
          >
            <Truck size={16} /> Proveedores
          </button>
          <button
            onClick={() => setMermaModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl text-[13px] font-bold border border-red-100 cursor-pointer bg-red-50 text-red-600 hover:bg-red-100 transition-all shadow-sm"
          >
            <TrendingDown size={16} /> Registrar merma
          </button>
          <button
            onClick={() => setProductModal("new")}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-[13px] font-black border-none cursor-pointer bg-brand text-white shadow-xl shadow-brand/20 hover:-translate-y-0.5 transition-all"
          >
            <Plus size={18} /> Nuevo Producto
          </button>
        </div>
      </header>

      {/* Stats Summary */}
      <InventoryStats products={products} mermas={mermas} />

      {/* Tabs Layout */}
      <div className="flex gap-4 mb-8">
        {[
          { k: "productos", l: "📦 Inventario de Productos" },
          { k: "mermas", l: "📉 Registro de Mermas" },
        ].map(t => (
          <button
            key={t.k}
            onClick={() => setTab(t.k as any)}
            className={`px-6 py-3 rounded-2xl text-sm font-black transition-all border ${
              tab === t.k 
                ? 'bg-surface border-brand text-brand shadow-md' 
                : 'bg-transparent border-transparent text-text-muted hover:text-text-sec hover:bg-surface-alt'
            }`}
          >
            {t.l}
          </button>
        ))}
      </div>

      {/* Content Switcher */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {tab === "productos" ? (
          <InventoryTable 
            products={products}
            onEdit={setProductModal}
            onAdjust={setAdjustModal}
            onDelete={handleDeleteProduct}
          />
        ) : (
          <MermaList mermas={mermas} />
        )}
      </div>

      {/* Unified Modals Container */}
      {productModal && (
        <ProductModal
          product={productModal === "new" ? null : productModal}
          onClose={() => setProductModal(null)}
          onSave={handleSaveProduct}
        />
      )}
      {mermaModalOpen && (
        <MermaModal
          products={products}
          onClose={() => setMermaModalOpen(false)}
          onSave={handleSaveMerma}
        />
      )}
      {adjustModal && (
        <AdjustModal
          product={adjustModal}
          onClose={() => setAdjustModal(null)}
          onSave={handleAdjustStock}
        />
      )}

    </main>
  );
}
