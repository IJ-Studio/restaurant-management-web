'use client';
import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed, Bell, ClipboardList, LogOut,
  CheckCircle2, Clock, AlertCircle, Plus, X,
  ChevronRight, Table2, PhoneCall, Timer
} from 'lucide-react';

const MESAS_INIT = [
  { id: 1, nombre: 'Mesa 1', estado: 'libre', personas: 0, tiempo: null, pedido: null },
  { id: 2, nombre: 'Mesa 2', estado: 'ocupada', personas: 3, tiempo: '22 min', pedido: '#9021' },
  { id: 3, nombre: 'Mesa 3', estado: 'ocupada', personas: 2, tiempo: '8 min', pedido: '#9023' },
  { id: 4, nombre: 'Mesa 4', estado: 'libre', personas: 0, tiempo: null, pedido: null },
  { id: 5, nombre: 'Mesa 5', estado: 'lista', personas: 2, tiempo: '35 min', pedido: '#9018' },
  { id: 6, nombre: 'Mesa 6', estado: 'libre', personas: 0, tiempo: null, pedido: null },
  { id: 7, nombre: 'Mesa 7', estado: 'ocupada', personas: 4, tiempo: '14 min', pedido: '#9022' },
  { id: 8, nombre: 'Mesa 8', estado: 'libre', personas: 0, tiempo: null, pedido: null },
  { id: 9, nombre: 'Barra 1', estado: 'ocupada', personas: 1, tiempo: '5 min', pedido: '#9024' },
  { id: 10, nombre: 'Barra 2', estado: 'libre', personas: 0, tiempo: null, pedido: null },
  { id: 11, nombre: 'Terraza 1', estado: 'lista', personas: 5, tiempo: '28 min', pedido: '#9016' },
  { id: 12, nombre: 'Terraza 2', estado: 'libre', personas: 0, tiempo: null, pedido: null },
];

const MENU_ITEMS = [
  { id: 1, nombre: 'Burger Clásica', precio: 18.00, cat: 'Hamburguesas' },
  { id: 2, nombre: 'Burger Doble', precio: 24.00, cat: 'Hamburguesas' },
  { id: 3, nombre: 'Pizza Margarita', precio: 22.00, cat: 'Pizzas' },
  { id: 4, nombre: 'Pizza Funghi', precio: 24.00, cat: 'Pizzas' },
  { id: 5, nombre: 'Pasta Carbonara', precio: 18.00, cat: 'Pastas' },
  { id: 6, nombre: 'Pasta Bolognesa', precio: 17.00, cat: 'Pastas' },
  { id: 7, nombre: 'Tacos x3', precio: 12.00, cat: 'Mexicano' },
  { id: 8, nombre: 'Agua Fresca', precio: 4.00, cat: 'Bebidas' },
  { id: 9, nombre: 'Refresco', precio: 3.50, cat: 'Bebidas' },
  { id: 10, nombre: 'Café Americano', precio: 5.00, cat: 'Bebidas' },
];

const ESTADOS_COLOR: any = {
  libre: { bg: 'bg-white/5', border: 'border-white/5', text: 'text-gray-500', badge: 'bg-gray-500/10 text-gray-500', label: 'Libre' },
  ocupada: { bg: 'bg-blue-500/8', border: 'border-blue-500/15', text: 'text-blue-300', badge: 'bg-blue-500/15 text-blue-400', label: 'Ocupada' },
  lista: { bg: 'bg-amber-500/8', border: 'border-amber-500/20', text: 'text-amber-300', badge: 'bg-amber-500/15 text-amber-400', label: 'Lista p/cobrar' },
};

export default function MeseroDashboard() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [mesas, setMesas] = useState(MESAS_INIT);
  const [mesaSeleccionada, setMesaSeleccionada] = useState<any>(null);
  const [pedidoActual, setPedidoActual] = useState<any[]>([]);
  const [llamandoCajero, setLlamandoCajero] = useState<number | null>(null);
  const [tab, setTab] = useState<'mesas' | 'pedidos'>('mesas');

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

  const abrirMesa = (mesa: any) => {
    setMesaSeleccionada(mesa);
    setPedidoActual([]);
  };

  const agregarItem = (item: any) => {
    setPedidoActual(prev => {
      const existe = prev.find(i => i.id === item.id);
      if (existe) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const quitarItem = (id: number) => {
    setPedidoActual(prev => {
      const item = prev.find(i => i.id === id);
      if (!item) return prev;
      if (item.qty === 1) return prev.filter(i => i.id !== id);
      return prev.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i);
    });
  };

  const enviarPedido = () => {
    if (!mesaSeleccionada || pedidoActual.length === 0) return;
    setMesas(prev => prev.map(m =>
      m.id === mesaSeleccionada.id
        ? { ...m, estado: 'ocupada', tiempo: '0 min', pedido: `#${9000 + m.id}` }
        : m
    ));
    setMesaSeleccionada(null);
    setPedidoActual([]);
  };

  const llamarCajero = (mesaId: number) => {
    setLlamandoCajero(mesaId);
    setTimeout(() => setLlamandoCajero(null), 3000);
  };

  const totalPedido = pedidoActual.reduce((s, i) => s + i.precio * i.qty, 0);
  const cats = [...new Set(MENU_ITEMS.map(i => i.cat))];

  const mesasOcupadas = mesas.filter(m => m.estado === 'ocupada').length;
  const mesasLibres = mesas.filter(m => m.estado === 'libre').length;
  const mesasListas = mesas.filter(m => m.estado === 'lista').length;

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen bg-[#0c0c0f] text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* MODAL TOMAR PEDIDO */}
      {mesaSeleccionada && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex">
          {/* Menú */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Nuevo Pedido</p>
                <h2 className="text-2xl font-black mt-1">{mesaSeleccionada.nombre}</h2>
              </div>
              <button onClick={() => setMesaSeleccionada(null)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                <X size={22}/>
              </button>
            </div>
            {cats.map(cat => (
              <div key={cat} className="mb-8">
                <p className="text-xs text-blue-400 uppercase tracking-widest font-black mb-4">{cat}</p>
                <div className="grid grid-cols-2 gap-3">
                  {MENU_ITEMS.filter(i => i.cat === cat).map(item => (
                    <button
                      key={item.id}
                      onClick={() => agregarItem(item)}
                      className="flex justify-between items-center bg-white/5 hover:bg-blue-500/10 border border-white/5 hover:border-blue-500/30 rounded-2xl px-5 py-4 transition-all group text-left"
                    >
                      <div>
                        <p className="font-bold text-sm">{item.nombre}</p>
                        <p className="text-blue-400 font-black text-sm mt-0.5">${item.precio.toFixed(2)}</p>
                      </div>
                      <Plus size={18} className="text-gray-600 group-hover:text-blue-400 transition-colors flex-shrink-0"/>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Resumen pedido */}
          <div className="w-80 bg-[#0a0a0e] border-l border-white/5 flex flex-col">
            <div className="p-6 border-b border-white/5">
              <h3 className="font-black text-lg">Pedido Actual</h3>
              <p className="text-xs text-gray-500 mt-1">{pedidoActual.length} items seleccionados</p>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-white/5">
              {pedidoActual.length === 0 ? (
                <div className="py-16 text-center text-gray-600">
                  <UtensilsCrossed size={28} className="mx-auto mb-3 opacity-30"/>
                  <p className="text-sm">Agrega items del menú</p>
                </div>
              ) : pedidoActual.map(item => (
                <div key={item.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex-1">
                    <p className="font-bold text-sm">{item.nombre}</p>
                    <p className="text-blue-400 text-xs font-black">${(item.precio * item.qty).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => quitarItem(item.id)} className="w-7 h-7 rounded-lg bg-white/10 hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center text-sm font-black transition-all">-</button>
                    <span className="w-6 text-center font-black text-sm">{item.qty}</span>
                    <button onClick={() => agregarItem(item)} className="w-7 h-7 rounded-lg bg-white/10 hover:bg-blue-500/20 hover:text-blue-400 flex items-center justify-center text-sm font-black transition-all">+</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-white/5 space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500 font-bold">Total</span>
                <span className="font-black text-xl text-blue-400">${totalPedido.toFixed(2)}</span>
              </div>
              <button
                onClick={enviarPedido}
                disabled={pedidoActual.length === 0}
                className="w-full bg-blue-500 hover:bg-blue-400 disabled:bg-blue-500/20 disabled:text-blue-500/40 text-white disabled:text-blue-500/40 font-black py-4 rounded-2xl transition-all"
              >
                Enviar a Cocina
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="w-20 border-r border-white/5 bg-[#080810] flex flex-col items-center py-8 gap-6 fixed h-full z-40">
        <div className="w-10 h-10 bg-blue-500 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-lg shadow-blue-500/20 mb-4">
          M
        </div>
        <SideBtn icon={<Table2 size={20}/>} active={tab === 'mesas'} onClick={() => setTab('mesas')} />
        <SideBtn icon={<ClipboardList size={20}/>} active={tab === 'pedidos'} onClick={() => setTab('pedidos')} />
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
            <h1 className="text-3xl font-black tracking-tight">Mis Mesas</h1>
            <p className="text-gray-500 text-sm mt-1">Vista general del salón</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/5 rounded-2xl px-4 py-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center font-black text-xs">
                {user?.name?.[0]}{user?.lastname?.[0] || 'M'}
              </div>
              <div>
                <p className="text-xs font-black">{user?.name || 'Mesero'}</p>
                <p className="text-[10px] text-blue-400 uppercase font-bold tracking-widest">Mesero</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats rápidos */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl px-5 py-4 flex items-center gap-4">
            <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400"><Table2 size={18}/></div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Ocupadas</p>
              <p className="text-2xl font-black text-blue-400">{mesasOcupadas}</p>
            </div>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl px-5 py-4 flex items-center gap-4">
            <div className="p-2 bg-amber-500/20 rounded-xl text-amber-400"><Bell size={18}/></div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Listas p/cobrar</p>
              <p className="text-2xl font-black text-amber-400">{mesasListas}</p>
            </div>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-2xl px-5 py-4 flex items-center gap-4">
            <div className="p-2 bg-white/10 rounded-xl text-gray-400"><CheckCircle2 size={18}/></div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Disponibles</p>
              <p className="text-2xl font-black text-gray-300">{mesasLibres}</p>
            </div>
          </div>
        </div>

        {/* Grid de mesas */}
        <div className="grid grid-cols-3 lg:grid-cols-4 gap-4">
          {mesas.map(mesa => {
            const est = ESTADOS_COLOR[mesa.estado];
            return (
              <div
                key={mesa.id}
                className={`relative ${est.bg} border ${est.border} rounded-3xl p-5 transition-all group`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2.5 rounded-xl ${mesa.estado === 'libre' ? 'bg-white/5' : mesa.estado === 'ocupada' ? 'bg-blue-500/15' : 'bg-amber-500/15'}`}>
                    <Table2 size={18} className={est.text}/>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${est.badge}`}>
                    {est.label}
                  </span>
                </div>

                <p className="font-black text-base">{mesa.nombre}</p>

                {mesa.estado !== 'libre' ? (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-500 flex items-center gap-1.5">
                      <Clock size={12}/> {mesa.tiempo}
                    </p>
                    {mesa.pedido && (
                      <p className="text-xs text-gray-600 font-mono">{mesa.pedido}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-600 mt-2">Sin pedido</p>
                )}

                {/* Acciones */}
                <div className="mt-4 space-y-2 opacity-0 group-hover:opacity-100 transition-all">
                  {mesa.estado === 'libre' && (
                    <button
                      onClick={() => abrirMesa(mesa)}
                      className="w-full bg-blue-500 hover:bg-blue-400 text-white text-xs font-black py-2 rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      <Plus size={14}/> Tomar Pedido
                    </button>
                  )}
                  {mesa.estado === 'ocupada' && (
                    <button
                      onClick={() => abrirMesa(mesa)}
                      className="w-full bg-white/10 hover:bg-blue-500/20 text-xs font-black py-2 rounded-xl transition-all"
                    >
                      Agregar Items
                    </button>
                  )}
                  {(mesa.estado === 'ocupada' || mesa.estado === 'lista') && (
                    <button
                      onClick={() => llamarCajero(mesa.id)}
                      className={`w-full text-xs font-black py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                        llamandoCajero === mesa.id
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-white/5 hover:bg-amber-500/15 hover:text-amber-400 text-gray-400'
                      }`}
                    >
                      <PhoneCall size={13}/>
                      {llamandoCajero === mesa.id ? '¡Cajero llamado!' : 'Llamar Cajero'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

function SideBtn({ icon, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`p-3 rounded-2xl transition-all ${active ? 'bg-blue-500/20 text-blue-400' : 'text-gray-600 hover:text-gray-300 hover:bg-white/5'}`}>
      {icon}
    </button>
  );
}