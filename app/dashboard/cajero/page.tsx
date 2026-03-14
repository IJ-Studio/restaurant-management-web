'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  DollarSign, Receipt, CreditCard, Clock, CheckCircle2,
  LogOut, Bell, Search, TrendingUp, FileText, X, ChevronDown,
  Wallet, Banknote, Smartphone, AlertCircle
} from 'lucide-react';

const MOCK_TICKETS = [
  { id: '#9021', mesa: 'Mesa 4', items: 3, total: 48.50, estado: 'pendiente', tiempo: '5 min', cliente: 'Andrés M.' },
  { id: '#9019', mesa: 'Mesa 7', items: 2, total: 32.00, estado: 'pendiente', tiempo: '12 min', cliente: 'Sofía R.' },
  { id: '#9017', mesa: 'Barra 2', items: 5, total: 67.00, estado: 'pendiente', tiempo: '18 min', cliente: 'Carlos V.' },
  { id: '#9015', mesa: 'Mesa 1', items: 1, total: 14.50, estado: 'cobrado', tiempo: '25 min', cliente: 'Laura T.' },
  { id: '#9012', mesa: 'Mesa 9', items: 4, total: 55.00, estado: 'cobrado', tiempo: '40 min', cliente: 'Pedro G.' },
  { id: '#9010', mesa: 'Terraza 1', items: 2, total: 29.00, estado: 'cobrado', tiempo: '52 min', cliente: 'Marta L.' },
];

const METODOS_PAGO = [
  { id: 'efectivo', label: 'Efectivo', icon: <Banknote size={20}/> },
  { id: 'tarjeta', label: 'Tarjeta', icon: <CreditCard size={20}/> },
  { id: 'transferencia', label: 'Transfer.', icon: <Smartphone size={20}/> },
];

export default function CajeroDashboard() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [ticketActivo, setTicketActivo] = useState<any>(null);
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [tickets, setTickets] = useState(MOCK_TICKETS);
  const [busqueda, setBusqueda] = useState('');
  const [efectivoDado, setEfectivoDado] = useState('');

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

  const cobrarTicket = (ticket: any) => {
    setTicketActivo(ticket);
    setMetodoPago('efectivo');
    setEfectivoDado('');
  };

  const confirmarCobro = () => {
    setTickets(prev => prev.map(t =>
      t.id === ticketActivo.id ? { ...t, estado: 'cobrado' } : t
    ));
    setTicketActivo(null);
  };

  const ticketsPendientes = tickets.filter(t => t.estado === 'pendiente');
  const ticketsCobrados = tickets.filter(t => t.estado === 'cobrado');
  const totalDia = tickets.filter(t => t.estado === 'cobrado').reduce((s, t) => s + t.total, 0);
  const cambio = efectivoDado ? Math.max(0, parseFloat(efectivoDado) - (ticketActivo?.total || 0)) : 0;

  const filtrados = tickets.filter(t =>
    t.id.includes(busqueda) || t.mesa.toLowerCase().includes(busqueda.toLowerCase()) || t.cliente.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* MODAL COBRO */}
      {ticketActivo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl">
            {/* Header modal */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Cobrar Ticket</p>
                <h3 className="text-2xl font-black mt-1">{ticketActivo.id} — {ticketActivo.mesa}</h3>
              </div>
              <button onClick={() => setTicketActivo(null)} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-gray-400 hover:text-white">
                <X size={20}/>
              </button>
            </div>

            {/* Detalle */}
            <div className="p-6 space-y-3">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Cliente</span><span className="text-white font-bold">{ticketActivo.cliente}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>Artículos</span><span className="text-white font-bold">{ticketActivo.items} items</span>
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>Subtotal</span><span className="text-white font-bold">${(ticketActivo.total * 0.84).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>IVA (16%)</span><span className="text-white font-bold">${(ticketActivo.total * 0.16).toFixed(2)}</span>
              </div>
              <div className="h-px bg-white/10 my-2"></div>
              <div className="flex justify-between text-xl font-black">
                <span>Total</span>
                <span className="text-green-400">${ticketActivo.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Método de pago */}
            <div className="px-6 pb-4">
              <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-3">Método de Pago</p>
              <div className="grid grid-cols-3 gap-2">
                {METODOS_PAGO.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setMetodoPago(m.id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all text-sm font-bold ${
                      metodoPago === m.id
                        ? 'bg-green-500/15 border-green-500/50 text-green-400'
                        : 'bg-white/3 border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    {m.icon}
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Efectivo dado */}
            {metodoPago === 'efectivo' && (
              <div className="px-6 pb-4">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">Efectivo recibido</p>
                <input
                  type="number"
                  value={efectivoDado}
                  onChange={e => setEfectivoDado(e.target.value)}
                  placeholder={`Mínimo $${ticketActivo.total.toFixed(2)}`}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-lg font-black focus:outline-none focus:border-green-500/50 transition-all"
                />
                {efectivoDado && parseFloat(efectivoDado) >= ticketActivo.total && (
                  <div className="flex justify-between mt-2 text-sm">
                    <span className="text-gray-500">Cambio</span>
                    <span className="text-green-400 font-black">${cambio.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Botones */}
            <div className="p-6 pt-2 grid grid-cols-2 gap-3">
              <button
                onClick={() => setTicketActivo(null)}
                className="py-3 rounded-2xl border border-white/10 text-gray-400 hover:bg-white/5 font-bold transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarCobro}
                disabled={metodoPago === 'efectivo' && (!efectivoDado || parseFloat(efectivoDado) < ticketActivo.total)}
                className="py-3 rounded-2xl bg-green-500 hover:bg-green-400 disabled:bg-green-500/30 disabled:text-green-500/50 text-black font-black transition-all"
              >
                Confirmar Cobro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="w-20 border-r border-white/5 bg-[#080808] flex flex-col items-center py-8 gap-6 fixed h-full z-40">
        <div className="w-10 h-10 bg-green-500 rounded-2xl flex items-center justify-center font-black text-black text-lg shadow-lg shadow-green-500/20 mb-4">
          $
        </div>
        <SideIcon icon={<DollarSign size={20}/>} active />
        <SideIcon icon={<Receipt size={20}/>} />
        <SideIcon icon={<FileText size={20}/>} />
        <SideIcon icon={<CreditCard size={20}/>} />
        <div className="flex-1" />
        <button onClick={handleLogout} className="p-3 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all">
          <LogOut size={20}/>
        </button>
      </aside>

      {/* CONTENIDO */}
      <main className="flex-1 ml-20 p-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Caja Principal</h1>
            <p className="text-gray-500 text-sm mt-1">
              {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16}/>
              <input
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar ticket..."
                className="bg-white/5 border border-white/5 rounded-2xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-green-500/30 w-56 transition-all"
              />
            </div>
            <button className="relative p-2.5 text-gray-400 hover:text-white bg-white/5 rounded-2xl transition-colors">
              <Bell size={18} />
              {ticketsPendientes.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full"></span>
              )}
            </button>
            <div className="flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center font-black text-xs text-black">
                {user?.name?.[0]}{user?.lastname?.[0] || 'C'}
              </div>
              <div>
                <p className="text-xs font-black">{user?.name || 'Cajero'}</p>
                <p className="text-[10px] text-green-500 uppercase font-bold tracking-widest">Cajero</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-5 mb-10">
          <div className="bg-gradient-to-br from-green-500/15 to-green-500/5 border border-green-500/20 rounded-3xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-green-500/20 rounded-xl text-green-400"><TrendingUp size={20}/></div>
              <span className="text-xs bg-green-500/10 text-green-400 font-black px-2 py-1 rounded-lg">Hoy</span>
            </div>
            <p className="text-gray-500 text-xs uppercase tracking-widest font-bold mb-1">Ventas del Día</p>
            <h3 className="text-3xl font-black text-green-400">${totalDia.toFixed(2)}</h3>
          </div>
          <div className="bg-[#111] border border-white/5 rounded-3xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-orange-500/15 rounded-xl text-orange-400"><Clock size={20}/></div>
              <span className="text-xs bg-orange-500/10 text-orange-400 font-black px-2 py-1 rounded-lg">{ticketsPendientes.length} activos</span>
            </div>
            <p className="text-gray-500 text-xs uppercase tracking-widest font-bold mb-1">Por Cobrar</p>
            <h3 className="text-3xl font-black">${ticketsPendientes.reduce((s, t) => s + t.total, 0).toFixed(2)}</h3>
          </div>
          <div className="bg-[#111] border border-white/5 rounded-3xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-blue-500/15 rounded-xl text-blue-400"><CheckCircle2 size={20}/></div>
              <span className="text-xs bg-blue-500/10 text-blue-400 font-black px-2 py-1 rounded-lg">Cerrados</span>
            </div>
            <p className="text-gray-500 text-xs uppercase tracking-widest font-bold mb-1">Tickets Cerrados</p>
            <h3 className="text-3xl font-black">{ticketsCobrados.length}</h3>
          </div>
          <div className="bg-[#111] border border-white/5 rounded-3xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-purple-500/15 rounded-xl text-purple-400"><Wallet size={20}/></div>
              <span className="text-xs bg-purple-500/10 text-purple-400 font-black px-2 py-1 rounded-lg">Promedio</span>
            </div>
            <p className="text-gray-500 text-xs uppercase tracking-widest font-bold mb-1">Ticket Promedio</p>
            <h3 className="text-3xl font-black">
              ${ticketsCobrados.length ? (totalDia / ticketsCobrados.length).toFixed(2) : '0.00'}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-6">
          {/* Tickets pendientes — más grande */}
          <div className="col-span-3 bg-[#111] rounded-3xl border border-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <div>
                <h2 className="font-black text-lg uppercase tracking-tight">Tickets Pendientes</h2>
                <p className="text-xs text-gray-500 mt-0.5">Listos para cobrar</p>
              </div>
              <span className="bg-orange-500/15 text-orange-400 text-xs font-black px-3 py-1.5 rounded-xl border border-orange-500/20">
                {ticketsPendientes.length} pendientes
              </span>
            </div>
            <div className="divide-y divide-white/5">
              {(busqueda ? filtrados : tickets).filter(t => t.estado === 'pendiente').map(ticket => (
                <div key={ticket.id} className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-400 font-mono text-xs font-black">
                      {ticket.mesa.replace(/\D/g, '')}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{ticket.mesa}</p>
                      <p className="text-xs text-gray-500">{ticket.cliente} · {ticket.items} items · {ticket.tiempo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-black text-white">${ticket.total.toFixed(2)}</span>
                    <button
                      onClick={() => cobrarTicket(ticket)}
                      className="bg-green-500 hover:bg-green-400 text-black text-xs font-black px-4 py-2 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      Cobrar
                    </button>
                  </div>
                </div>
              ))}
              {ticketsPendientes.length === 0 && (
                <div className="py-16 text-center text-gray-600">
                  <CheckCircle2 size={32} className="mx-auto mb-3 text-green-500/30"/>
                  <p className="font-bold">Todo cobrado</p>
                </div>
              )}
            </div>
          </div>

          {/* Panel derecho */}
          <div className="col-span-2 space-y-5">

            {/* Métodos de pago del día */}
            <div className="bg-[#111] rounded-3xl border border-white/5 p-6">
              <h2 className="font-black uppercase tracking-tight mb-5">Métodos de Pago</h2>
              <div className="space-y-3">
                {[
                  { label: 'Efectivo', pct: 55, color: 'bg-green-500' },
                  { label: 'Tarjeta', pct: 35, color: 'bg-blue-500' },
                  { label: 'Transferencia', pct: 10, color: 'bg-purple-500' },
                ].map(m => (
                  <div key={m.label}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-400 font-bold">{m.label}</span>
                      <span className="text-white font-black">{m.pct}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full ${m.color} rounded-full`} style={{ width: `${m.pct}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Historial reciente */}
            <div className="bg-[#111] rounded-3xl border border-white/5 overflow-hidden">
              <div className="p-6 border-b border-white/5">
                <h2 className="font-black uppercase tracking-tight">Cobros Recientes</h2>
              </div>
              <div className="divide-y divide-white/5">
                {ticketsCobrados.slice(0, 4).map(t => (
                  <div key={t.id} className="flex justify-between items-center px-6 py-3.5">
                    <div>
                      <p className="text-sm font-bold">{t.id}</p>
                      <p className="text-xs text-gray-500">{t.mesa} · {t.tiempo} ago</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400 font-black text-sm">${t.total.toFixed(2)}</span>
                      <CheckCircle2 size={14} className="text-green-500"/>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Botón generar reporte */}
            <button className="w-full bg-white/5 hover:bg-white/8 border border-white/10 rounded-3xl p-4 flex items-center justify-center gap-3 font-black text-sm transition-all group">
              <FileText size={18} className="text-gray-400 group-hover:text-white transition-colors"/>
              Generar Reporte del Turno
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function SideIcon({ icon, active = false }: { icon: React.ReactNode, active?: boolean }) {
  return (
    <button className={`p-3 rounded-2xl transition-all ${active ? 'bg-green-500/20 text-green-400' : 'text-gray-600 hover:text-gray-300 hover:bg-white/5'}`}>
      {icon}
    </button>
  );
}