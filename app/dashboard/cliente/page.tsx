"use client";

import React, { useState, useEffect } from "react";
import { 
  type Tab 
} from "@/types/navigation";

import { MenuService } from "@/features/shared/services/dataService";
import { type MenuCategory, type MenuItem } from "@/features/shared/data/restaurantData";
import { type ClientOrder } from "@/features/dashboard/cliente/data/clienteMock";

import { ClientNav } from "@/features/dashboard/cliente/components/ClientNav";
import { BottomNav } from "@/features/dashboard/cliente/components/BottomNav";
import { CartDrawer } from "@/features/dashboard/cliente/components/CartDrawer";

import { HomeTab } from "@/features/dashboard/cliente/components/tabs/HomeTab";
import { MenuTab } from "@/features/dashboard/cliente/components/tabs/MenuTab";
import { TrackingTab } from "@/features/dashboard/cliente/components/tabs/TrackingTab";
import { HistoryTab } from "@/features/dashboard/cliente/components/tabs/HistoryTab";

export default function ClienteDashboard() {
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<Tab>("inicio");
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [carrito, setCarrito] = useState<any[]>([]);
  const [carritoOpen, setCarritoOpen] = useState(false);
  const [pedidoActivo, setPedidoActivo] = useState<any>(null);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (stored) setUser(JSON.parse(stored));
    
    // Load synchronized menu from "La Base"
    setMenu(MenuService.getMenu());
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      /* silent */
    }
    if (typeof window !== 'undefined') localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const agregarAlCarrito = (item: MenuItem) => {
    setCarrito((prev) => {
      const existe = prev.find((i) => i.id === item.id);
      if (existe) return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const cambiarQty = (id: number, delta: number) => {
    setCarrito(prev => {
      const item = prev.find(i => i.id === id);
      if (!item) return prev;
      if (item.qty + delta <= 0) return prev.filter(i => i.id !== id);
      return prev.map(i => i.id === id ? { ...i, qty: i.qty + delta } : i);
    });
  };

  const realizarPedido = () => {
    const total = carrito.reduce((s, i) => s + i.precio * i.qty, 0);
    setPedidoActivo({
      id: `#${Math.floor(9000 + Math.random() * 999)}`,
      items: carrito,
      total: total,
      estado: 'confirmado',
      tiempo: '20-30 min',
    });
    setCarrito([]);
    setCarritoOpen(false);
    setTab('pedido');
  };

  const repetirPedido = (order: ClientOrder) => {
    // Buscar los items reales del menú correspondientes al historial
    order.items.forEach((nombre) => {
      const cleanName = nombre.replace(" x2", "").trim();
      const allItems = menu.flatMap((c) => c.items);
      const itemOriginal = allItems.find((m) => m.name.includes(cleanName));
      if (itemOriginal) agregarAlCarrito(itemOriginal);
    });
    setCarritoOpen(true);
  };

  return (
    <div className="min-h-screen bg-bg text-text selection:bg-brand/20">
      
      {/* Upper Navigation Center */}
      <ClientNav 
        user={user} 
        itemsCount={carrito.reduce((s, i) => s + i.qty, 0)}
        onOpenCart={() => setCarritoOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Experience Flow */}
      <main className="pt-24 pb-32 px-4 md:px-8 max-w-5xl mx-auto overflow-x-hidden">
        
        {/* Experience Router */}
        {tab === "inicio" && (
          <HomeTab
            user={user}
            menu={menu}
            onGoToMenu={() => setTab("menu")}
            onAddToCart={agregarAlCarrito}
            onReorder={repetirPedido}
          />
        )}

        {tab === "menu" && (
          <MenuTab menu={menu} onAddToCart={agregarAlCarrito} />
        )}

        {tab === 'pedido' && (
          <TrackingTab 
            order={pedidoActivo} 
            onGoToMenu={() => setTab('menu')} 
          />
        )}

        {tab === 'historial' && (
          <HistoryTab 
            onReorder={repetirPedido} 
          />
        )}

      </main>

      {/* Persistent Interaction Center */}
      <BottomNav 
        activeTab={tab} 
        onTabChange={setTab} 
      />

      {/* Cart Interaction Experience */}
      <CartDrawer 
        isOpen={carritoOpen} 
        onClose={() => setCarritoOpen(false)}
        items={carrito}
        onUpdateQty={cambiarQty}
        onCheckout={realizarPedido}
      />
      
    </div>
  );
}