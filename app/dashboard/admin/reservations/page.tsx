"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Calendar, 
  List, 
  Search,
  Filter,
  Download
} from "lucide-react";

import { 
  ReservationService, 
  TableService 
} from "@/features/shared/services/dataService";
import { 
  type Reservation, 
  type DiningTable 
} from "@/features/shared/data/restaurantData";
import { getSessionUser } from "@/lib/session";

import { ReservationList } from "@/features/dashboard/admin/components/reservations/ReservationList";
import { ReservationCalendar } from "@/features/dashboard/admin/components/reservations/ReservationCalendar";
import { ReservationModal } from "@/features/dashboard/admin/components/reservations/ReservationModal";

export default function ReservationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<DiningTable[]>([]);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<"lista" | "calendario">("lista");
  const [modalOpen, setModalOpen] = useState<Reservation | null | "new">(null);
  const [filterStatus, setFilterStatus] = useState<string>("todas");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function init() {
      const u = await getSessionUser();
      if (!u || u.roleName !== "admin") {
        router.push("/login");
        return;
      }
      setUser(u);
      refreshData();
      setLoading(false);
    }
    init();
  }, [router]);

  const refreshData = () => {
    setReservations(ReservationService.getReservations());
    setTables(TableService.getTables());
  };

  const handleConfirm = (id: string) => {
    const list = ReservationService.getReservations();
    const res = list.find(r => r.id === id);
    if (res) {
      ReservationService.upsertReservation({ ...res, status: "confirmada" });
      refreshData();
    }
  };

  const handleCancel = (id: string) => {
    if (!confirm("¿Seguro que deseas cancelar esta reserva?")) return;
    ReservationService.cancelReservation(id);
    refreshData();
  };

  const handleSave = (res: Reservation) => {
    ReservationService.upsertReservation(res);
    refreshData();
    setModalOpen(null);
  };

  const filteredReservations = reservations.filter(r => {
    const matchesStatus = filterStatus === "todas" || r.status === filterStatus;
    const matchesSearch = r.customerName.toLowerCase().includes(search.toLowerCase()) || 
                         r.customerPhone.includes(search);
    return matchesStatus && matchesSearch;
  });

  if (loading || !user) return <div className="p-10 animate-pulse text-text-muted font-bold text-center">Cargando módulo de reservas...</div>;

  return (
    <main className="p-8 md:p-10 min-w-0 max-w-[1400px] mx-auto animate-in fade-in duration-700">
      
      {/* Header Area */}
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-brand rounded-2xl shadow-xl shadow-brand/20 text-white">
              <Calendar size={24}/>
            </div>
            <h1 className="font-display font-black text-4xl tracking-tight leading-none text-text m-0">
              Gestión de Reservas
            </h1>
          </div>
          <p className="text-sm font-medium text-text-muted m-0">
            Control de disponibilidad y asignación de mesas · Sincronizado con La Base
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => alert("Reporte de ocupación generado (Simulación)")}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl text-[13px] font-bold border border-border cursor-pointer bg-surface text-text-sec hover:bg-surface-alt transition-all shadow-sm"
          >
            <Download size={16} /> Exportar
          </button>
          <button
            onClick={() => setModalOpen("new")}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-[13px] font-black border-none cursor-pointer bg-brand text-white shadow-xl shadow-brand/20 hover:-translate-y-0.5 transition-all"
          >
            <Plus size={18} /> Nueva Reserva
          </button>
        </div>
      </header>

      {/* Tabs & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-white p-2 rounded-[28px] border border-border shadow-sm">
        <div className="flex gap-2 p-1 bg-surface-alt rounded-[22px]">
          {[
            { k: "lista", l: "Lista de Solicitudes", i: <List size={16}/> },
            { k: "calendario", l: "Mapa de Disponibilidad", i: <Calendar size={16}/> },
          ].map(t => (
            <button
              key={t.k}
              onClick={() => setTab(t.k as any)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-[18px] text-[13px] font-black transition-all ${
                tab === t.k 
                  ? 'bg-white text-brand shadow-md shadow-brand/5' 
                  : 'text-text-muted hover:text-brand bg-transparent'
              }`}
            >
              {t.i} {t.l}
            </button>
          ))}
        </div>

        {tab === "lista" && (
          <div className="flex items-center gap-3 pr-4">
            <div className="relative group">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand transition-colors"/>
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11 pr-4 py-2.5 bg-surface border-none rounded-2xl text-xs font-bold w-full md:w-[240px] focus:ring-2 focus:ring-brand focus:bg-white transition-all outline-none shadow-inner"
              />
            </div>
            <div className="flex items-center gap-2 bg-surface p-1 rounded-2xl border border-border/50">
              <Filter size={14} className="ml-3 text-text-muted"/>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent border-none text-[11px] font-black text-text-sec focus:ring-0 outline-none pr-4"
              >
                <option value="todas">Todas</option>
                <option value="pendiente">Pendientes</option>
                <option value="confirmada">Confirmadas</option>
                <option value="cancelada">Canceladas</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Content Switcher */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {tab === "lista" ? (
          <ReservationList 
            reservations={filteredReservations}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            onEdit={(res) => setModalOpen(res)}
          />
        ) : (
          <ReservationCalendar 
            tables={tables}
            reservations={reservations}
            selectedDate={new Date().toISOString().split("T")[0]} // Simplificación actual
          />
        )}
      </div>

      {/* Reservation Modal */}
      {modalOpen && (
        <ReservationModal
          reservation={modalOpen === "new" ? null : modalOpen}
          tables={tables}
          onClose={() => setModalOpen(null)}
          onSave={handleSave}
        />
      )}

    </main>
  );
}
