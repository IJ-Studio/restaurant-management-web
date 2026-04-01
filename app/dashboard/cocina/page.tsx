"use client";

import React, { useState, useEffect } from "react";
import { OrderService, InventoryService } from "@/features/shared/services/dataService";
import { type Order, type InventoryProduct } from "@/features/shared/data/restaurantData";

import { KitchenStats } from "@/features/dashboard/cocina/components/KitchenStats";
import { KanbanColumn } from "@/features/dashboard/cocina/components/KanbanColumn";
import { InventoryModal } from "@/features/dashboard/cocina/components/InventoryModal";
import { KitchenHeader } from "@/features/dashboard/cocina/components/KitchenHeader";
import { StockAlertBanner } from "@/features/dashboard/cocina/components/StockAlertBanner";

export default function CocinaDashboard() {
  const [pedidos, setPedidos] = useState<Order[]>([]);
  const [inventario, setInventario] = useState<InventoryProduct[]>([]);
  const [vistaInv, setVistaInv] = useState(false);
  const [alertaStock, setAlertaStock] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (stored) setUser(JSON.parse(stored));

    // Load synchronized data from "La Base"
    setPedidos(OrderService.getOrders());
    setInventario(InventoryService.getInventory());
    
    // Polling simulation or dynamic update would happen here
    const interval = setInterval(() => {
      setPedidos(OrderService.getOrders());
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const avanzarEstado = (id: string) => {
    const orders = OrderService.getOrders();
    const order = orders.find((o) => o.id === id);
    if (!order) return;

    let nextStatus: Order["status"] = order.status;
    if (order.status === "nuevo") nextStatus = "preparando";
    else if (order.status === "preparando") nextStatus = "listo";

    OrderService.updateOrderStatus(id, nextStatus);
    setPedidos(OrderService.getOrders());
  };

  const nuevos = pedidos.filter((p) => p.status === "nuevo");
  const preparando = pedidos.filter((p) => p.status === "preparando");
  const listos = pedidos.filter((p) => p.status === "listo");
  const criticosCount = inventario.filter((i) => i.stock <= i.minStock).length;

  return (
    <main className="p-8 md:p-10 min-w-0 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      
      <StockAlertBanner 
        criticosCount={criticosCount} 
        onViewInventory={() => setVistaInv(true)}
        onDismiss={() => setAlertaStock(false)}
      />

      <KitchenHeader 
        user={user}
        newOrdersCount={nuevos.length}
        onInventoryClick={() => setVistaInv(true)}
        criticosCount={criticosCount}
      />

      <KitchenStats 
        pedidosCount={pedidos.filter(p => p.status !== 'listo').length} 
        criticosCount={criticosCount} 
        promedioMinutos={12} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <KanbanColumn 
          title="Comandas Nuevas" 
          type="nuevo" 
          orders={nuevos} 
          onAvanzar={avanzarEstado} 
        />
        <KanbanColumn 
          title="En Preparación" 
          type="preparando" 
          orders={preparando} 
          onAvanzar={avanzarEstado} 
        />
        <KanbanColumn 
          title="Listos para Mesa" 
          type="listo" 
          orders={listos} 
          onAvanzar={avanzarEstado} 
        />
      </div>

      <InventoryModal 
        isOpen={vistaInv} 
        onClose={() => setVistaInv(false)} 
      />

    </main>
  );
}