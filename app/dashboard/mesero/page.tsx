'use client';

import React, { useState, useEffect } from 'react';
import { 
  Table2, ClipboardList, LogOut, 
  Bell, CheckCircle2 
} from 'lucide-react';

import { 
  MenuService, 
  TableService, 
  OrderService, 
  SettingsService 
} from '@/features/shared/services/dataService';
import { 
  type DiningTable, 
  type MenuCategory, 
  type OrderItem 
} from '@/features/shared/data/restaurantData';

import { TableGrid } from '@/features/dashboard/mesero/components/TableGrid';
import { OrderModal } from '@/features/dashboard/mesero/components/OrderModal';

export default function MeseroDashboard() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [tables, setTables] = useState<DiningTable[]>([]);
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [settings, setSettings] = useState(SettingsService.getSettings());
  
  const [selectedTable, setSelectedTable] = useState<DiningTable | null>(null);
  const [callingId, setCallingId] = useState<string | number | null>(null);
  const [activeTab, setActiveTab] = useState<'mesas' | 'pedidos'>('mesas');

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));

    // Initial Load from "La Base"
    setTables(TableService.getTables());
    setMenu(MenuService.getMenu());
    setSettings(SettingsService.getSettings());
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleCallCajero = (id: string | number) => {
    setCallingId(id);
    TableService.updateTableStatus(id, 'lista');
    setTables(TableService.getTables());
    setTimeout(() => setCallingId(null), 3000);
  };

  const handleSendOrder = (tableId: string | number, items: OrderItem[]) => {
    const orderId = `#${Math.floor(Math.random() * 9000) + 1000}`;
    const total = items.reduce((acc, item) => {
      // Find item price in menu to be safe
      const flatMenu = menu.flatMap(c => c.items);
      const menuI = flatMenu.find(mi => mi.name === item.name);
      return acc + (menuI ? menuI.price * item.qty : 0);
    }, 0);

    // 1. Create Order
    OrderService.addOrder({
      id: orderId,
      table: String(tableId),
      timestamp: 'Ahora',
      status: 'nuevo',
      items,
      total
    });

    // 2. Update Table Status
    TableService.updateTableStatus(tableId, 'ocupada', orderId);
    setTables(TableService.getTables());
  };

  if (!mounted) return null;

  const stats = {
    ocupadas: tables.filter(t => t.status === 'ocupada').length,
    listas: tables.filter(t => t.status === 'lista').length,
    libres: tables.filter(t => t.status === 'libre').length,
  };

  return (
    <div className="flex min-h-screen bg-background text-text animate-in fade-in duration-700">

      {/* OVERLAYS */}
      {selectedTable && (
        <OrderModal
          table={selectedTable}
          menu={menu}
          onClose={() => setSelectedTable(null)}
          onSendOrder={handleSendOrder}
        />
      )}

      {/* SLIM SIDEBAR */}
      <aside className="w-20 border-r border-border bg-surface-alt flex flex-col items-center py-8 gap-6 fixed h-full z-40">
        <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center font-display font-black text-white text-xl shadow-lg shadow-brand/20 mb-4 animate-bounce-slow">
          {settings.shortName || 'R'}
        </div>
        
        <SideNavBtn 
          icon={<Table2 size={20}/>} 
          active={activeTab === 'mesas'} 
          onClick={() => setActiveTab('mesas')} 
          label="Mesas"
        />
        <SideNavBtn 
          icon={<ClipboardList size={20}/>} 
          active={activeTab === 'pedidos'} 
          onClick={() => setActiveTab('pedidos')} 
          label="Pedidos"
        />

        <div className="flex-1"/>
        
        <button 
          onClick={handleLogout} 
          className="p-3.5 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all group relative"
        >
          <LogOut size={20}/>
          <span className="absolute left-full ml-4 px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Cerrar Sesión</span>
        </button>
      </aside>

      {/* CONTENT AREA */}
      <main className="flex-1 ml-20 p-8 md:p-12 max-w-[1400px] mx-auto">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="font-display font-black text-4xl tracking-tight leading-none mb-1 text-text">
              Salón Principal
            </h1>
            <p className="text-sm font-medium text-text-muted">
              {settings.restaurantName} · Gestión de Mesas y Comandas
            </p>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex items-center gap-3 bg-surface border border-border rounded-2xl px-5 py-2.5 shadow-sm">
                <div className="w-9 h-9 bg-brand/10 text-brand rounded-xl flex items-center justify-center font-display font-black text-xs border border-brand/10">
                  {user?.name?.[0]}{user?.lastname?.[0] || 'M'}
                </div>
                <div>
                  <p className="text-[13px] font-black leading-none mb-1">{user?.name || 'Mesero'}</p>
                  <p className="text-[9px] text-brand uppercase font-black tracking-widest leading-none">En Turno</p>
                </div>
             </div>
          </div>
        </header>

        {/* Mini Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <StatCard 
            label="Mesas Ocupadas" 
            value={stats.ocupadas} 
            color="text-brand" 
            bg="bg-brand/5" 
            icon={<Table2 size={18}/>} 
            borderColor="border-brand/10"
          />
          <StatCard 
            label="Listas para cobrar" 
            value={stats.listas} 
            color="text-amber-500" 
            bg="bg-amber-500/5" 
            icon={<Bell size={18}/>} 
            borderColor="border-amber-500/10"
          />
          <StatCard 
            label="Mesas Disponibles" 
            value={stats.libres} 
            color="text-emerald-500" 
            bg="bg-emerald-500/5" 
            icon={<CheckCircle2 size={18}/>} 
            borderColor="border-emerald-500/10"
          />
        </div>

        {/* Global Tables View */}
        <div className="mb-6 flex items-center justify-between">
           <h2 className="font-display font-black text-xl text-text-sec">Mapa de Mesas</h2>
           <div className="text-[11px] font-extrabold text-text-muted uppercase tracking-widest flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Actualizado recientemente
           </div>
        </div>

        <TableGrid 
          tables={tables}
          onOpenTable={(t) => setSelectedTable(t)}
          onCallCajero={handleCallCajero}
          callingId={callingId}
        />

      </main>
    </div>
  );
}

function StatCard({ label, value, color, bg, icon, borderColor }: any) {
  return (
    <div className={`${bg} border ${borderColor} rounded-3xl px-6 py-5 flex items-center gap-5 transition-transform hover:scale-[1.02] duration-300 shadow-sm`}>
      <div className={`p-3 ${bg.replace('/5', '/15')} rounded-2xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mb-1">{label}</p>
        <p className={`text-3xl font-display font-black leading-none ${color}`}>{value}</p>
      </div>
    </div>
  );
}

function SideNavBtn({ icon, active, onClick, label }: any) {
  return (
    <button 
      onClick={onClick} 
      className={`p-4 rounded-2xl transition-all relative group ${
        active 
          ? 'bg-brand text-white shadow-lg shadow-brand/20' 
          : 'text-text-muted hover:text-text-sec hover:bg-surface border border-transparent hover:border-border'
      }`}
    >
      {icon}
      {!active && (
        <span className="absolute left-full ml-4 px-2 py-1 bg-surface border border-border text-text-muted text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
          {label}
        </span>
      )}
    </button>
  );
}