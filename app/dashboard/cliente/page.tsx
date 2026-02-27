'use client';
import React, { useState, useEffect } from 'react';
import {
  ShoppingBag, Clock, CheckCircle2, Star, Search,
  LogOut, Bell, ChevronRight, Plus, Minus, X,
  Flame, Tag, History, Home, UtensilsCrossed, Package
} from 'lucide-react';

const CATEGORIAS = ['Todo', 'Hamburguesas', 'Pizzas', 'Pastas', 'Mexicano', 'Bebidas'];

const MENU = [
  { id: 1, nombre: 'Burger Clásica', precio: 18.00, cat: 'Hamburguesas', rating: 4.8, tiempo: '15-20', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400', tag: null },
  { id: 2, nombre: 'Burger Doble', precio: 24.00, cat: 'Hamburguesas', rating: 4.9, tiempo: '15-20', img: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?q=80&w=400', tag: '🔥 Popular' },
  { id: 3, nombre: 'Pizza Margarita', precio: 22.00, cat: 'Pizzas', rating: 4.7, tiempo: '20-25', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400', tag: null },
  { id: 4, nombre: 'Pizza Funghi', precio: 24.00, cat: 'Pizzas', rating: 4.8, tiempo: '20-25', img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=400', tag: '⭐ Top' },
  { id: 5, nombre: 'Pasta Carbonara', precio: 18.00, cat: 'Pastas', rating: 4.6, tiempo: '15-20', img: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?q=80&w=400', tag: null },
  { id: 6, nombre: 'Pasta Bolognesa', precio: 17.00, cat: 'Pastas', rating: 4.7, tiempo: '15-20', img: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?q=80&w=400', tag: null },
  { id: 7, nombre: 'Tacos x3', precio: 12.00, cat: 'Mexicano', rating: 4.9, tiempo: '10-15', img: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=400', tag: '🔥 Popular' },
  { id: 8, nombre: 'Agua Fresca', precio: 4.00, cat: 'Bebidas', rating: 4.5, tiempo: '5', img: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=400', tag: null },
  { id: 9, nombre: 'Refresco', precio: 3.50, cat: 'Bebidas', rating: 4.3, tiempo: '5', img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400', tag: null },
  { id: 10, nombre: 'Café Americano', precio: 5.00, cat: 'Bebidas', rating: 4.8, tiempo: '5-10', img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=400', tag: null },
];

const PROMOCIONES = [
  { id: 1, titulo: '2x1 en Pizzas', desc: 'Todos los martes', color: 'from-orange-600 to-red-600', emoji: '🍕', hasta: 'Mar 4 Mar' },
  { id: 2, titulo: '20% en tu primera orden', desc: 'Código: QUIJOTE20', color: 'from-purple-600 to-blue-600', emoji: '🎉', hasta: 'Tiempo limitado' },
  { id: 3, titulo: 'Burger + Refresco', desc: 'Combo desde $18', color: 'from-green-600 to-teal-600', emoji: '🍔', hasta: 'Todo el mes' },
];

const HISTORIAL = [
  { id: '#8801', fecha: 'Hace 2 días', items: ['Burger Doble', 'Refresco'], total: 27.50, estado: 'entregado' },
  { id: '#8756', fecha: 'Hace 1 semana', items: ['Pizza Funghi x2', 'Agua Fresca'], total: 52.00, estado: 'entregado' },
  { id: '#8712', fecha: 'Hace 2 semanas', items: ['Pasta Carbonara', 'Café Americano'], total: 23.00, estado: 'entregado' },
];

type Tab = 'inicio' | 'menu' | 'pedido' | 'historial';

export default function ClienteDashboard() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<Tab>('inicio');
  const [categoria, setCategoria] = useState('Todo');
  const [busqueda, setBusqueda] = useState('');
  const [carrito, setCarrito] = useState<any[]>([]);
  const [carritoOpen, setCarritoOpen] = useState(false);
  const [pedidoActivo, setPedidoActivo] = useState<any>(null);

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

  const agregarAlCarrito = (item: any) => {
    setCarrito(prev => {
      const existe = prev.find(i => i.id === item.id);
      if (existe) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
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
    setPedidoActivo({
      id: `#${Math.floor(9000 + Math.random() * 999)}`,
      items: carrito,
      total: totalCarrito,
      estado: 'confirmado',
      tiempo: '20-30 min',
    });
    setCarrito([]);
    setCarritoOpen(false);
    setTab('pedido');
  };

  const menuFiltrado = MENU.filter(item => {
    const coincideCat = categoria === 'Todo' || item.cat === categoria;
    const coincideBusq = item.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return coincideCat && coincideBusq;
  });

  const totalCarrito = carrito.reduce((s, i) => s + i.precio * i.qty, 0);
  const itemsCarrito = carrito.reduce((s, i) => s + i.qty, 0);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* CARRITO MODAL */}
      {carritoOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md bg-[#111] h-full flex flex-col shadow-2xl">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <div>
                <h3 className="font-black text-xl">Tu Pedido</h3>
                <p className="text-xs text-gray-500 mt-0.5">{itemsCarrito} items</p>
              </div>
              <button onClick={() => setCarritoOpen(false)} className="p-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors">
                <X size={20}/>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-white/5">
              {carrito.length === 0 ? (
                <div className="py-20 text-center text-gray-600">
                  <ShoppingBag size={32} className="mx-auto mb-3 opacity-30"/>
                  <p>Tu carrito está vacío</p>
                </div>
              ) : carrito.map(item => (
                <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                  <img src={item.img} alt={item.nombre} className="w-14 h-14 rounded-2xl object-cover"/>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{item.nombre}</p>
                    <p className="text-orange-400 font-black text-sm">${(item.precio * item.qty).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => cambiarQty(item.id, -1)} className="w-7 h-7 rounded-lg bg-white/10 hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center font-black transition-all">-</button>
                    <span className="w-5 text-center font-black text-sm">{item.qty}</span>
                    <button onClick={() => cambiarQty(item.id, 1)} className="w-7 h-7 rounded-lg bg-white/10 hover:bg-orange-500/20 hover:text-orange-400 flex items-center justify-center font-black transition-all">+</button>
                  </div>
                </div>
              ))}
            </div>

            {carrito.length > 0 && (
              <div className="p-6 border-t border-white/5 space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-bold">Subtotal</span>
                  <span className="font-black text-xl">${totalCarrito.toFixed(2)}</span>
                </div>
                <button onClick={realizarPedido} className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2">
                  <ShoppingBag size={18}/> Realizar Pedido
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-40 bg-[#0f0f0f]/90 backdrop-blur-md border-b border-white/5 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-600 rounded-xl flex items-center justify-center font-black text-black text-lg shadow-lg shadow-orange-600/20">Q</div>
          <span className="font-black text-lg tracking-tight">El Quijote</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCarritoOpen(true)}
            className="relative flex items-center gap-2 bg-orange-600 hover:bg-orange-500 px-4 py-2.5 rounded-2xl font-bold text-sm transition-all"
          >
            <ShoppingBag size={16}/>
            Carrito
            {itemsCarrito > 0 && (
              <span className="bg-white text-orange-600 text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">
                {itemsCarrito}
              </span>
            )}
          </button>
          <div className="flex items-center gap-2 bg-white/5 rounded-2xl px-3 py-2">
            <div className="w-7 h-7 bg-gradient-to-br from-orange-500 to-orange-700 rounded-lg flex items-center justify-center font-black text-xs">
              {user?.name?.[0]}{user?.lastname?.[0] || 'C'}
            </div>
            <span className="text-xs font-bold text-gray-300">{user?.name || 'Cliente'}</span>
          </div>
          <button onClick={handleLogout} className="p-2.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
            <LogOut size={16}/>
          </button>
        </div>
      </nav>

      {/* CONTENIDO */}
      <main className="pt-20 pb-24 px-4 md:px-8 max-w-5xl mx-auto">

        {/* TAB: INICIO */}
        {tab === 'inicio' && (
          <div className="space-y-10 pt-6">
            {/* Hero */}
            <div className="relative bg-gradient-to-br from-orange-600/20 to-red-600/10 border border-orange-500/20 rounded-3xl p-8 overflow-hidden">
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-8xl opacity-20">🍔</div>
              <p className="text-orange-400 text-xs font-black uppercase tracking-widest mb-2">Bienvenido de vuelta</p>
              <h1 className="text-3xl font-black tracking-tight mb-2">
                Hola, {user?.name || 'Cliente'} 👋
              </h1>
              <p className="text-gray-400 text-sm mb-6">¿Qué se te antoja hoy?</p>
              <button
                onClick={() => setTab('menu')}
                className="bg-orange-600 hover:bg-orange-500 text-white font-black px-6 py-3 rounded-2xl text-sm transition-all flex items-center gap-2"
              >
                Ver Menú <ChevronRight size={16}/>
              </button>
            </div>

            {/* Promociones */}
            <div>
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-black text-xl">Promociones</h2>
                <span className="text-xs text-orange-400 font-bold flex items-center gap-1"><Tag size={12}/> {PROMOCIONES.length} activas</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PROMOCIONES.map(promo => (
                  <div key={promo.id} className={`bg-gradient-to-br ${promo.color} rounded-3xl p-6 relative overflow-hidden`}>
                    <div className="absolute right-4 top-4 text-4xl opacity-30">{promo.emoji}</div>
                    <p className="font-black text-lg leading-tight mb-1">{promo.titulo}</p>
                    <p className="text-white/70 text-sm mb-3">{promo.desc}</p>
                    <span className="bg-white/20 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wide">
                      Hasta: {promo.hasta}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Más vendidos rápidos */}
            <div>
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-black text-xl flex items-center gap-2"><Flame size={20} className="text-orange-500"/> Más Vendidos</h2>
                <button onClick={() => setTab('menu')} className="text-xs text-orange-400 font-bold flex items-center gap-1">
                  Ver todo <ChevronRight size={14}/>
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {MENU.filter(i => i.tag).map(item => (
                  <div key={item.id} className="bg-[#161616] border border-white/5 rounded-3xl overflow-hidden group hover:border-orange-500/30 transition-all">
                    <div className="relative h-32">
                      <img src={item.img} alt={item.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                      <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-[10px] font-black px-2 py-1 rounded-lg text-orange-400">
                        {item.tag}
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="font-bold text-sm leading-tight mb-1">{item.nombre}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-orange-400 font-black">${item.precio.toFixed(2)}</span>
                        <button
                          onClick={() => agregarAlCarrito(item)}
                          className="w-7 h-7 bg-orange-600 hover:bg-orange-500 rounded-lg flex items-center justify-center transition-all"
                        >
                          <Plus size={14}/>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Último pedido */}
            {HISTORIAL[0] && (
              <div>
                <h2 className="font-black text-xl mb-4">Último Pedido</h2>
                <div className="bg-[#161616] border border-white/5 rounded-3xl p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-400">
                      <CheckCircle2 size={22}/>
                    </div>
                    <div>
                      <p className="font-black">{HISTORIAL[0].id}</p>
                      <p className="text-xs text-gray-500">{HISTORIAL[0].items.join(', ')}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{HISTORIAL[0].fecha}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-orange-400">${HISTORIAL[0].total.toFixed(2)}</p>
                    <button
                      onClick={() => {
                        const items = HISTORIAL[0].items.map(nombre => MENU.find(m => m.nombre.includes(nombre.replace(' x2','')))).filter(Boolean);
                        items.forEach(i => i && agregarAlCarrito(i));
                        setCarritoOpen(true);
                      }}
                      className="text-xs text-orange-400 font-bold mt-1 hover:underline"
                    >
                      Repetir pedido
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: MENÚ */}
        {tab === 'menu' && (
          <div className="pt-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-2xl">Menú</h2>
            </div>

            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16}/>
              <input
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar platillo..."
                className="w-full bg-[#161616] border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-orange-500/40 transition-all"
              />
            </div>

            {/* Categorías */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {CATEGORIAS.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoria(cat)}
                  className={`flex-shrink-0 px-4 py-2 rounded-2xl text-sm font-bold transition-all ${
                    categoria === cat
                      ? 'bg-orange-600 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {menuFiltrado.map(item => (
                <div key={item.id} className="bg-[#161616] border border-white/5 rounded-3xl overflow-hidden flex group hover:border-orange-500/20 transition-all">
                  <div className="relative w-28 flex-shrink-0">
                    <img src={item.img} alt={item.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                    {item.tag && (
                      <div className="absolute top-2 left-2 bg-black/70 text-[9px] font-black px-1.5 py-0.5 rounded text-orange-400">{item.tag}</div>
                    )}
                  </div>
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <p className="font-black text-sm">{item.nombre}</p>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-500">
                        <span className="flex items-center gap-1"><Star size={11} className="text-yellow-500"/> {item.rating}</span>
                        <span className="flex items-center gap-1"><Clock size={11}/> {item.tiempo} min</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-orange-400 font-black">${item.precio.toFixed(2)}</span>
                      <button
                        onClick={() => agregarAlCarrito(item)}
                        className="bg-orange-600 hover:bg-orange-500 text-white px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1"
                      >
                        <Plus size={13}/> Agregar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: PEDIDO ACTIVO */}
        {tab === 'pedido' && (
          <div className="pt-6 space-y-6">
            <h2 className="font-black text-2xl">Estado del Pedido</h2>
            {pedidoActivo ? (
              <div className="space-y-5">
                {/* Card principal */}
                <div className="bg-gradient-to-br from-orange-600/15 to-orange-600/5 border border-orange-500/25 rounded-3xl p-8 text-center">
                  <div className="text-5xl mb-4">
                    {pedidoActivo.estado === 'confirmado' ? '✅' : pedidoActivo.estado === 'preparando' ? '👨‍🍳' : '🛵'}
                  </div>
                  <p className="text-gray-400 text-sm mb-1">Pedido {pedidoActivo.id}</p>
                  <h3 className="text-2xl font-black mb-2">
                    {pedidoActivo.estado === 'confirmado' ? 'Pedido Confirmado' : pedidoActivo.estado === 'preparando' ? 'En Preparación' : 'Listo para recoger'}
                  </h3>
                  <p className="text-gray-500 text-sm">Tiempo estimado: <span className="text-orange-400 font-black">{pedidoActivo.tiempo}</span></p>
                </div>

                {/* Timeline */}
                <div className="bg-[#161616] border border-white/5 rounded-3xl p-6 space-y-4">
                  {[
                    { label: 'Pedido recibido', done: true },
                    { label: 'En preparación', done: pedidoActivo.estado !== 'confirmado' },
                    { label: 'Listo para recoger', done: pedidoActivo.estado === 'listo' },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${step.done ? 'bg-green-500' : 'bg-white/10'}`}>
                        {step.done ? <CheckCircle2 size={16}/> : <div className="w-2 h-2 bg-gray-600 rounded-full"/>}
                      </div>
                      <span className={`text-sm font-bold ${step.done ? 'text-white' : 'text-gray-600'}`}>{step.label}</span>
                    </div>
                  ))}
                </div>

                {/* Resumen */}
                <div className="bg-[#161616] border border-white/5 rounded-3xl p-6">
                  <h4 className="font-black mb-4">Resumen del pedido</h4>
                  <div className="space-y-2 mb-4">
                    {pedidoActivo.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-400">{item.nombre} x{item.qty}</span>
                        <span className="font-bold">${(item.precio * item.qty).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="h-px bg-white/5 my-3"/>
                  <div className="flex justify-between font-black">
                    <span>Total</span>
                    <span className="text-orange-400">${pedidoActivo.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-gray-600">
                <Package size={40} className="mx-auto mb-4 opacity-30"/>
                <p className="font-bold text-lg mb-2">Sin pedido activo</p>
                <button onClick={() => setTab('menu')} className="text-orange-400 font-bold text-sm hover:underline">
                  Ir al menú
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB: HISTORIAL */}
        {tab === 'historial' && (
          <div className="pt-6 space-y-5">
            <h2 className="font-black text-2xl">Historial de Pedidos</h2>
            <div className="space-y-4">
              {HISTORIAL.map(pedido => (
                <div key={pedido.id} className="bg-[#161616] border border-white/5 rounded-3xl p-6 hover:border-white/10 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-black">{pedido.id}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{pedido.fecha}</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-green-500/10 text-green-400 text-[10px] font-black px-2.5 py-1.5 rounded-xl border border-green-500/20">
                      <CheckCircle2 size={12}/> Entregado
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">{pedido.items.join(', ')}</p>
                  <div className="flex justify-between items-center">
                    <span className="font-black text-orange-400 text-lg">${pedido.total.toFixed(2)}</span>
                    <button
                      onClick={() => {
                        const items = pedido.items.map(nombre => MENU.find(m => m.nombre.includes(nombre.replace(' x2','')))).filter(Boolean);
                        items.forEach(i => i && agregarAlCarrito(i));
                        setCarritoOpen(true);
                      }}
                      className="bg-white/5 hover:bg-orange-500/15 hover:text-orange-400 border border-white/10 hover:border-orange-500/30 text-sm font-bold px-4 py-2 rounded-xl transition-all"
                    >
                      Repetir pedido
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* BOTTOM NAV */}
      <nav className="fixed bottom-0 w-full bg-[#0f0f0f]/95 backdrop-blur-md border-t border-white/5 px-8 py-4 flex justify-around z-30">
        {[
          { id: 'inicio', icon: <Home size={22}/>, label: 'Inicio' },
          { id: 'menu', icon: <UtensilsCrossed size={22}/>, label: 'Menú' },
          { id: 'pedido', icon: <Clock size={22}/>, label: 'Pedido' },
          { id: 'historial', icon: <History size={22}/>, label: 'Historial' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setTab(item.id as Tab)}
            className={`flex flex-col items-center gap-1 transition-all ${
              tab === item.id ? 'text-orange-500' : 'text-gray-600 hover:text-gray-400'
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-bold">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}