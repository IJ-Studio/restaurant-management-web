"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  Bell, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Wallet,
  FileText
} from "lucide-react";

import { 
  MOCK_TICKETS, 
  type Ticket, 
} from "@/features/dashboard/cajero/data/cajeroMock";

import { StatCard } from "@/features/dashboard/cajero/components/StatCard";
import { TicketRow } from "@/features/dashboard/cajero/components/TicketRow";
import { BillingModal } from "@/features/dashboard/cajero/components/BillingModal";
import { PaymentDistribution } from "@/features/dashboard/cajero/components/PaymentDistribution";

export default function CajeroDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
  const [ticketActivo, setTicketActivo] = useState<Ticket | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (stored) setUser(JSON.parse(stored));
  }, []);

  // Action Handlers
  function cobrarTicket(ticket: Ticket) {
    setTicketActivo(ticket);
  }

  function confirmarCobro(metodo: string, efectivo?: number) {
    if (!ticketActivo) return;
    
    setTickets(prev => prev.map(t =>
      t.id === ticketActivo.id 
        ? { ...t, estado: 'cobrado', metodoPago: metodo, cobradoAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } 
        : t
    ));
    setTicketActivo(null);
  }

  // Filter & Stats
  const filtrados = tickets.filter(t =>
    t.id.includes(busqueda) || 
    t.mesa.toLowerCase().includes(busqueda.toLowerCase()) || 
    t.cliente.toLowerCase().includes(busqueda.toLowerCase())
  );

  const pendientes = tickets.filter(t => t.estado === 'pendiente');
  const cobrados = tickets.filter(t => t.estado === 'cobrado');
  const totalDia = cobrados.reduce((s, t) => s + t.total, 0);

  return (
    <main className="p-8 md:p-10 min-w-0 max-w-[1400px]">
      
      {/* Header Section */}
      <header className="flex justify-between items-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
        <div>
          <h1 className="font-display font-black text-3xl tracking-tight leading-none mb-1.5 text-text m-0">
            Caja Principal
          </h1>
          <p className="text-sm text-text-muted m-0 font-medium capitalize">
            {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand transition-colors" size={16}/>
            <input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por Ticket, Mesa o Cliente..."
              className="bg-surface border border-border rounded-xl py-2.5 pl-10 pr-5 text-[13px] font-bold focus:outline-none focus:border-brand/40 w-64 transition-all shadow-sm"
            />
          </div>
          
          <button className="relative p-2.5 bg-surface border border-border rounded-xl text-text-muted hover:text-brand hover:shadow-md transition-all group">
            <Bell size={20} className="group-hover:animate-bounce" />
            {pendientes.length > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-orange-500 border-2 border-white rounded-full"></span>
            )}
          </button>

          <div className="w-px h-10 bg-border/60 mx-2" />

          <div className="flex items-center gap-3 bg-surface border border-border rounded-2xl px-4 py-2.5 shadow-sm transition-all hover:shadow-md">
            <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-display font-black text-xs border border-emerald-100 uppercase">
              {user?.name?.[0] || 'C'}{user?.lastname?.[0] || 'J'}
            </div>
            <div className="hidden sm:block">
              <p className="text-[13px] font-black leading-none mb-1">{user?.name || 'Cajero'}</p>
              <p className="text-[9px] text-emerald-600 uppercase font-black tracking-widest leading-none">Turno Activo</p>
            </div>
          </div>
        </div>
      </header>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <StatCard 
          label="Ventas del Día" 
          value={`$${totalDia.toFixed(2)}`} 
          icon={<TrendingUp size={22}/>} 
          sub="Caja"
          bg="bg-emerald-50" 
          color="text-emerald-600" 
        />
        <StatCard 
          label="Por Cobrar" 
          value={`$${pendientes.reduce((s, t) => s + t.total, 0).toFixed(2)}`} 
          icon={<Clock size={22}/>} 
          sub={`${pendientes.length} Activos`}
          bg="bg-orange-50" 
          color="text-orange-600" 
        />
        <StatCard 
          label="Tickets Cerrados" 
          value={cobrados.length} 
          icon={<CheckCircle2 size={22}/>} 
          sub="Finalizados"
          bg="bg-blue-50" 
          color="text-blue-600" 
        />
        <StatCard 
          label="Ticket Promedio" 
          value={`$${cobrados.length ? (totalDia / cobrados.length).toFixed(2) : '0.00'}`} 
          icon={<Wallet size={22}/>} 
          sub="Estimado"
          bg="bg-purple-50" 
          color="text-purple-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Pending Tickets Table */}
        <section className="lg:col-span-3 bg-surface rounded-[32px] border border-border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
           <div className="px-8 py-6 border-b border-border bg-surface-alt/20 flex justify-between items-center">
              <div>
                 <h2 className="font-display font-black text-lg uppercase tracking-tight m-0">Tickets Pendientes</h2>
                 <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest mt-1">Listos para procesar pago</p>
              </div>
              <span className="bg-orange-50 text-orange-600 text-[10px] font-black px-3.5 py-1.5 rounded-full border border-orange-100 uppercase tracking-widest">
                 {pendientes.length} por cobrar
              </span>
           </div>
           
           <div className="divide-y divide-border/50">
              {filtrados.filter(t => t.estado === 'pendiente').map(ticket => (
                 <TicketRow 
                   key={ticket.id} 
                   ticket={ticket} 
                   onAction={cobrarTicket} 
                 />
              ))}
              {pendientes.length === 0 && (
                <div className="py-24 text-center">
                   <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm">
                      <CheckCircle2 size={32} />
                   </div>
                   <p className="text-[13px] font-black text-text-sec uppercase tracking-widest">Todo cobrado perfectamente</p>
                </div>
              )}
           </div>
        </section>

        {/* Right Distribution Sidebar */}
        <aside className="lg:col-span-2 space-y-8 animate-in fade-in slide-in-from-right-4 duration-1000 delay-500">
           {/* Payment Analytics */}
           <PaymentDistribution />

           {/* Recent Closures */}
           <section className="bg-surface rounded-[32px] border border-border shadow-sm overflow-hidden">
              <div className="px-7 py-5 border-b border-border">
                 <h2 className="font-display font-black text-md uppercase tracking-tight m-0">Últimos Cerrados</h2>
              </div>
              <div className="divide-y divide-border/50">
                 {cobrados.slice(0, 4).map(t => (
                    <div key={t.id} className="px-7 py-4.5 flex justify-between items-center hover:bg-surface-alt/30 transition-colors">
                       <div>
                          <p className="text-[13px] font-black text-text m-0">{t.id} · {t.mesa}</p>
                          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-0.5">{t.metodoPago} • {t.cobradoAt}</p>
                       </div>
                       <div className="flex items-center gap-3">
                          <span className="text-[13px] font-black text-emerald-600">${t.total.toFixed(2)}</span>
                          <CheckCircle2 size={14} className="text-emerald-500" />
                       </div>
                    </div>
                 ))}
                 {cobrados.length === 0 && (
                   <p className="p-8 text-center text-[11px] font-black text-text-muted uppercase tracking-widest">Sin cobros en este turno</p>
                 )}
              </div>
           </section>

           <button className="w-full bg-surface border-2 border-border/80 hover:bg-white hover:border-brand/40 hover:shadow-xl hover:shadow-brand/5 rounded-3xl p-5 flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest transition-all active:scale-95 group shadow-sm">
              <FileText size={18} className="text-text-muted group-hover:text-brand transition-colors"/>
              Generar Corte de Caja
           </button>
        </aside>
      </div>

      {/* Overlays */}
      {ticketActivo && (
        <BillingModal 
          ticket={ticketActivo} 
          onClose={() => setTicketActivo(null)} 
          onConfirm={confirmarCobro} 
        />
      )}
    </main>
  );
}