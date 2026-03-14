'use client';
import React, { useState, useEffect } from 'react';
import {
  Flame, CheckCircle2, Clock, AlertTriangle,
  LogOut, Bell, ChevronRight, Package, X, BarChart3
} from 'lucide-react';

type EstadoPedido = 'nuevo' | 'preparando' | 'listo';

const PEDIDOS_INIT = [
  {
    id: '#9024', mesa: 'Barra 1', llegada: '2 min', estado: 'nuevo' as EstadoPedido,
    items: [
      { nombre: 'Burger Clásica', qty: 1, notas: 'Sin cebolla' },
      { nombre: 'Refresco', qty: 1, notas: '' },
    ]
  },
  {
    id: '#9023', mesa: 'Mesa 3', llegada: '8 min', estado: 'preparando' as EstadoPedido,
    items: [
      { nombre: 'Pizza Funghi', qty: 1, notas: 'Bien cocida' },
      { nombre: 'Pasta Carbonara', qty: 1, notas: '' },
    ]
  },
  {
    id: '#9022', mesa: 'Mesa 7', llegada: '14 min', estado: 'preparando' as EstadoPedido,
    items: [
      { nombre: 'Burger Doble', qty: 2, notas: 'Término medio' },
      { nombre: 'Agua Fresca', qty: 2, notas: '' },
      { nombre: 'Tacos x3', qty: 1, notas: 'Picante' },
    ]
  },
  {
    id: '#9021', mesa: 'Mesa 2', llegada: '22 min', estado: 'listo' as EstadoPedido,
    items: [
      { nombre: 'Pizza Margarita', qty: 1, notas: '' },
      { nombre: 'Café Americano', qty: 3, notas: '' },
    ]
  },
];

const INVENTARIO = [
  { nombre: 'Carne de Res', stock: 2.5, unidad: 'kg', minimo: 3, critico: true },
  { nombre: 'Harina para Pizza', stock: 8, unidad: 'kg', minimo: 5, critico: false },
  { nombre: 'Queso Mozzarella', stock: 1.2, unidad: 'kg', minimo: 2, critico: true },
  { nombre: 'Pasta', stock: 6, unidad: 'kg', minimo: 4, critico: false },
  { nombre: 'Tomate', stock: 4, unidad: 'kg', minimo: 5, critico: true },
  { nombre: 'Aceite de Oliva', stock: 3, unidad: 'L', minimo: 2, critico: false },
  { nombre: 'Tortillas', stock: 30, unidad: 'pzas', minimo: 50, critico: true },
  { nombre: 'Pollo', stock: 5, unidad: 'kg', minimo: 3, critico: false },
];

const ESTADO_CONFIG: Record<EstadoPedido, { label: string; color: string; bg: string; border: string; next: string }> = {
  nuevo:      { label: 'Nuevo',      color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/25',    next: 'Iniciar' },
  preparando: { label: 'En Cocina',  color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/25',  next: 'Marcar Listo' },
  listo:      { label: 'Listo',      color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/25',  next: 'Entregar' },
};

export default function CocinaDashboard() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [pedidos, setPedidos] = useState(PEDIDOS_INIT);
  const [alertaStock, setAlertaStock] = useState(true);
  const [vistaInv, setVistaInv] = useState(false);
  const [notifEnviada, setNotifEnviada] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const avanzarEstado = (id: string) => {
    setPedidos(prev => prev.map(p => {
      if (p.id !== id) return p;
      const siguiente: EstadoPedido = p.estado === 'nuevo' ? 'preparando' : p.estado === 'preparando' ? 'listo' : 'listo';
      return { ...p, estado: siguiente };
    }));
  };

  const enviarAlertaStock = (item: string) => {
    setNotifEnviada(item);
    setTimeout(() => setNotifEnviada(null), 3000);
  };

  const nuevos    = pedidos.filter(p => p.estado === 'nuevo');
  const preparando = pedidos.filter(p => p.estado === 'preparando');
  const listos    = pedidos.filter(p => p.estado === 'listo');
  const criticosCount = INVENTARIO.filter(i => i.critico).length;

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen bg-[#0d0a08] text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* MODAL INVENTARIO */}
      {vistaInv && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111008] border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Inventario</p>
                <h3 className="text-xl font-black mt-1">Insumos de Cocina</h3>
              </div>
              <button onClick={() => setVistaInv(false)} className="p-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors">
                <X size={20}/>
              </button>
            </div>
            <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
              {INVENTARIO.map(item => {
                const pct = Math.min(100, (item.stock / (item.minimo * 2)) * 100);
                return (
                  <div key={item.nombre} className={`p-4 rounded-2xl border ${item.critico ? 'bg-red-500/5 border-red-500/15' : 'bg-white/3 border-white/5'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-sm">{item.nombre}</p>
                        <p className={`text-xs font-black mt-0.5 ${item.critico ? 'text-red-400' : 'text-gray-500'}`}>
                          {item.stock} {item.unidad} disponibles
                        </p>
                      </div>
                      {item.critico && (
                        <button
                          onClick={() => enviarAlertaStock(item.nombre)}
                          className={`text-[10px] font-black px-2.5 py-1.5 rounded-xl transition-all ${
                            notifEnviada === item.nombre
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : 'bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25'
                          }`}
                        >
                          {notifEnviada === item.nombre ? '✓ Notificado' : '⚠ Notificar'}
                        </button>
                      )}
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${item.critico ? 'bg-red-500' : 'bg-green-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1.5 text-[10px] text-gray-600">
                      <span>Mín: {item.minimo} {item.unidad}</span>
                      <span>{Math.round(pct)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ALERTA STOCK */}
      {alertaStock && criticosCount > 0 && (
        <div className="fixed top-4 right-4 z-40 bg-[#1a0f08] border border-orange-500/30 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-xl max-w-sm">
          <AlertTriangle size={18} className="text-orange-400 flex-shrink-0"/>
          <div className="flex-1">
            <p className="text-sm font-black text-orange-300">{criticosCount} insumos en stock crítico</p>
            <p className="text-xs text-gray-500 mt-0.5">Considera notificar al proveedor</p>
          </div>
          <button onClick={() => setAlertaStock(false)} className="text-gray-600 hover:text-gray-400 transition-colors">
            <X size={16}/>
          </button>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="w-20 border-r border-white/5 bg-[#0a0804] flex flex-col items-center py-8 gap-6 fixed h-full z-30">
        <div className="w-10 h-10 bg-orange-600 rounded-2xl flex items-center justify-center font-black text-black text-lg shadow-lg shadow-orange-600/25 mb-4">
          🍳
        </div>
        <button className="p-3 bg-orange-500/15 text-orange-400 rounded-2xl">
          <Flame size={20}/>
        </button>
        <button onClick={() => setVistaInv(true)} className="p-3 text-gray-600 hover:text-gray-300 hover:bg-white/5 rounded-2xl transition-all relative">
          <Package size={20}/>
          {criticosCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </button>
        <button className="p-3 text-gray-600 hover:text-gray-300 hover:bg-white/5 rounded-2xl transition-all">
          <BarChart3 size={20}/>
        </button>
        <div className="flex-1"/>
        <button onClick={handleLogout} className="p-3 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all">
          <LogOut size={20}/>
        </button>
      </aside>

      {/* CONTENIDO */}
      <main className="flex-1 ml-20 p-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              Estación de Cocina
              <span className="text-sm bg-orange-500/15 text-orange-400 px-3 py-1 rounded-xl font-bold border border-orange-500/20">
                🟢 En turno
              </span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} · Vista en tiempo real
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setVistaInv(true)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-sm font-bold transition-all ${
                criticosCount > 0
                  ? 'bg-red-500/10 border-red-500/25 text-red-400 hover:bg-red-500/15'
                  : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/8'
              }`}
            >
              <Package size={16}/>
              Inventario
              {criticosCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                  {criticosCount}
                </span>
              )}
            </button>
            <div className="flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-600 to-red-700 rounded-xl flex items-center justify-center font-black text-xs">
                {user?.name?.[0]}{user?.lastname?.[0] || 'K'}
              </div>
              <div>
                <p className="text-xs font-black">{user?.name || 'Cocinero'}</p>
                <p className="text-[10px] text-orange-400 uppercase font-bold tracking-widest">Cocina</p>
              </div>
            </div>
          </div>
        </div>

        {/* Kanban de pedidos */}
        <div className="grid grid-cols-3 gap-6">

          {/* Columna NUEVOS */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
                <h2 className="font-black uppercase text-sm tracking-widest text-red-400">Nuevos</h2>
              </div>
              <span className="bg-red-500/15 text-red-400 text-xs font-black w-6 h-6 rounded-lg flex items-center justify-center border border-red-500/20">
                {nuevos.length}
              </span>
            </div>
            {nuevos.map(p => <PedidoCard key={p.id} pedido={p} onAvanzar={avanzarEstado}/>)}
            {nuevos.length === 0 && <EmptyCol color="red"/>}
          </div>

          {/* Columna EN PREPARACIÓN */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-amber-500 rounded-full"></div>
                <h2 className="font-black uppercase text-sm tracking-widest text-amber-400">Preparando</h2>
              </div>
              <span className="bg-amber-500/15 text-amber-400 text-xs font-black w-6 h-6 rounded-lg flex items-center justify-center border border-amber-500/20">
                {preparando.length}
              </span>
            </div>
            {preparando.map(p => <PedidoCard key={p.id} pedido={p} onAvanzar={avanzarEstado}/>)}
            {preparando.length === 0 && <EmptyCol color="amber"/>}
          </div>

          {/* Columna LISTOS */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                <h2 className="font-black uppercase text-sm tracking-widest text-green-400">Listos</h2>
              </div>
              <span className="bg-green-500/15 text-green-400 text-xs font-black w-6 h-6 rounded-lg flex items-center justify-center border border-green-500/20">
                {listos.length}
              </span>
            </div>
            {listos.map(p => <PedidoCard key={p.id} pedido={p} onAvanzar={avanzarEstado}/>)}
            {listos.length === 0 && <EmptyCol color="green"/>}
          </div>
        </div>
      </main>
    </div>
  );
}

function PedidoCard({ pedido, onAvanzar }: { pedido: any, onAvanzar: (id: string) => void }) {
  const cfg = ESTADO_CONFIG[pedido.estado as EstadoPedido];
  const esListo = pedido.estado === 'listo';

  return (
    <div className={`${cfg.bg} border ${cfg.border} rounded-3xl p-5 transition-all`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="font-black text-base">{pedido.id}</p>
          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
            <Clock size={11}/> hace {pedido.llegada} · {pedido.mesa}
          </p>
        </div>
        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
          {cfg.label}
        </span>
      </div>

      <div className="space-y-2 mb-5">
        {pedido.items.map((item: any, i: number) => (
          <div key={i} className="flex items-start gap-2.5">
            <span className={`text-xs font-black w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
              {item.qty}
            </span>
            <div>
              <p className="text-sm font-bold leading-tight">{item.nombre}</p>
              {item.notas && (
                <p className="text-[11px] text-gray-500 italic mt-0.5">{item.notas}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {!esListo && (
        <button
          onClick={() => onAvanzar(pedido.id)}
          className={`w-full py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            pedido.estado === 'nuevo'
              ? 'bg-amber-500 hover:bg-amber-400 text-black'
              : 'bg-green-500 hover:bg-green-400 text-black'
          }`}
        >
          {cfg.next}
          <ChevronRight size={14}/>
        </button>
      )}
      {esListo && (
        <div className="w-full py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 bg-green-500/10 text-green-400 border border-green-500/20">
          <CheckCircle2 size={14}/> Entregado al mesero
        </div>
      )}
    </div>
  );
}

function EmptyCol({ color }: { color: string }) {
  const colors: any = {
    red: 'border-red-500/10 text-red-500/20',
    amber: 'border-amber-500/10 text-amber-500/20',
    green: 'border-green-500/10 text-green-500/20',
  };
  return (
    <div className={`border-2 border-dashed ${colors[color]} rounded-3xl py-12 text-center`}>
      <p className="text-sm font-bold">Sin pedidos</p>
    </div>
  );
}