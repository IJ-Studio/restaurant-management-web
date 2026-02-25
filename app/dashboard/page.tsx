"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  ClipboardList, 
  Users, 
  Settings, 
  LogOut,
  TrendingUp,
  Clock,
  CheckCircle2,
  Bell,
  Search
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Evitar errores de hidratación en Next.js
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    // Aquí puedes limpiar cookies o localStorage si los usas
    // localStorage.removeItem('session'); 
    router.push('/');
  };

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen bg-[#0f0f0f] text-white font-sans">
      
      {/* --- SIDEBAR IZQUIERDO --- */}
      <aside className="w-64 border-r border-white/5 bg-[#0a0a0a] flex flex-col fixed h-full z-50">
        <div className="p-8 flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center font-black text-black text-xl shadow-lg shadow-orange-500/20">
            Q
          </div>
          <span className="text-lg font-black tracking-tighter uppercase italic">
            Quijote<span className="text-orange-500">Admin</span>
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold px-4 mb-4">Menú Principal</p>
          <NavItem icon={<LayoutDashboard size={20}/>} label="Dashboard" active />
          <NavItem icon={<ClipboardList size={20}/>} label="Pedidos" />
          <NavItem icon={<UtensilsCrossed size={20}/>} label="Menú" />
          <NavItem icon={<Users size={20}/>} label="Personal" />
          <div className="pt-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold px-4 mb-4">Sistema</p>
            <NavItem icon={<Settings size={20}/>} label="Configuración" />
          </div>
        </nav>

        {/* BOTÓN CERRAR SESIÓN */}
        <div className="p-4 border-t border-white/5 bg-[#0a0a0a]">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-4 text-gray-400 hover:text-red-500 hover:bg-red-500/5 rounded-2xl transition-all font-bold group"
          >
            <div className="p-2 rounded-lg group-hover:bg-red-500/10 transition-colors">
              <LogOut size={20}/>
            </div>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="flex-1 ml-64 p-8 lg:p-12">
        
        {/* HEADER SUPERIOR */}
        <header className="flex justify-between items-center mb-12">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar pedidos, clientes..." 
              className="w-full bg-[#161616] border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-orange-500/50 transition-all"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
              <Bell size={22} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-[#0f0f0f]"></span>
            </button>
            <div className="h-8 w-[1px] bg-white/10"></div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-bold">Chef Quijote</p>
                <p className="text-[10px] text-orange-500 uppercase font-black tracking-widest">Master Admin</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl border border-white/10 shadow-lg shadow-orange-500/10 flex items-center justify-center font-bold">
                AD
              </div>
            </div>
          </div>
        </header>

        {/* TARJETAS DE ESTADÍSTICAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <StatCard title="Ventas del Día" value="$1,840.50" icon={<TrendingUp size={24}/>} trend="+15.2%" isPositive={true} />
          <StatCard title="Pedidos Activos" value="12" icon={<Clock size={24}/>} trend="En cocina" isPositive={false} />
          <StatCard title="Tickets Cerrados" value="58" icon={<CheckCircle2 size={24}/>} trend="+10 hoy" isPositive={true} />
        </div>

        {/* SECCIÓN DE TABLA */}
        <div className="bg-[#161616] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#1a1a1a]/50">
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter">Pedidos Recientes</h2>
              <p className="text-xs text-gray-500 mt-1">Monitoreo en tiempo real de la cocina</p>
            </div>
            <button className="bg-white/5 hover:bg-white/10 px-6 py-2.5 rounded-xl text-xs font-bold transition-all border border-white/5">
              Descargar Reporte
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-black border-b border-white/5">
                  <th className="px-8 py-6">ID Pedido</th>
                  <th className="px-8 py-6">Cliente</th>
                  <th className="px-8 py-6">Platillo</th>
                  <th className="px-8 py-6">Estado</th>
                  <th className="px-8 py-6 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                <TableRow id="#8801" customer="Marcos Díaz" item="Combo Burger Pro" status="Pendiente" total="$24.00" statusType="warning" />
                <TableRow id="#8799" customer="Elena Smith" item="Pizza Funghi x2" status="En Preparación" total="$32.50" statusType="info" />
                <TableRow id="#8795" customer="Roberto Gil" item="Pasta Carbonara" status="Completado" total="$18.00" statusType="success" />
                <TableRow id="#8792" customer="Lucía Fer" item="Tacos al Pastor" status="Completado" total="$12.00" statusType="success" />
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTES ---

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm ${
      active 
      ? 'bg-orange-600 text-white shadow-xl shadow-orange-600/20' 
      : 'text-gray-500 hover:bg-white/5 hover:text-gray-200'
    }`}>
      <span className={active ? "text-white" : "text-gray-500 group-hover:text-white"}>{icon}</span>
      {label}
    </button>
  );
}

function StatCard({ title, value, icon, trend, isPositive }: any) {
  return (
    <div className="bg-[#161616] p-8 rounded-[2.5rem] border border-white/5 hover:border-orange-500/30 transition-all relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-orange-500/10 transition-all"></div>
      <div className="flex justify-between items-start mb-6">
        <div className="p-4 bg-orange-500/10 rounded-2xl text-orange-500">
          {icon}
        </div>
        <span className={`text-xs font-black px-2 py-1 rounded-lg ${isPositive ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}>
          {trend}
        </span>
      </div>
      <p className="text-gray-500 text-xs uppercase tracking-widest font-bold mb-2">{title}</p>
      <h3 className="text-4xl font-black tracking-tighter">{value}</h3>
    </div>
  );
}

function TableRow({ id, customer, item, status, total, statusType }: any) {
  const styles: any = {
    warning: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    info: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    success: "bg-green-500/10 text-green-500 border-green-500/20",
  };

  return (
    <tr className="hover:bg-white/[0.02] transition-colors group">
      <td className="px-8 py-6 text-gray-500 font-mono text-xs">{id}</td>
      <td className="px-8 py-6 font-bold">{customer}</td>
      <td className="px-8 py-6 text-gray-400">{item}</td>
      <td className="px-8 py-6">
        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border shadow-sm ${styles[statusType]}`}>
          {status}
        </span>
      </td>
      <td className="px-8 py-6 text-right font-black text-orange-500">{total}</td>
    </tr>
  );
}