"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  Calendar, 
  ShieldCheck, 
  FileText, 
  Plus,
  Clock,
  LayoutDashboard
} from "lucide-react";

import { StaffService, RoleService } from "@/features/shared/services/dataService";
import type { StaffMember, Role } from "@/features/shared/data/restaurantData";

// Components
import { UserTable } from "@/features/dashboard/admin/components/users/UserTable";
import { UserModal } from "@/features/dashboard/admin/components/users/UserModal";
import { UserFilters } from "@/features/dashboard/admin/components/users/UserFilters";
import { AccessMatrix } from "@/features/dashboard/admin/components/users/AccessMatrix";
import { ShiftCalendar } from "@/features/dashboard/admin/components/users/ShiftCalendar";
import { IncidencePanel } from "@/features/dashboard/admin/components/users/IncidencePanel";
import { AdminReports } from "@/features/dashboard/admin/components/users/AdminReports";

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState<"directory" | "shifts" | "access" | "reports">("directory");
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<StaffMember | null | "new">(null);
  
  // Stats
  const activeStaffCount = staff.filter(s => s.status === "activo").length;

  useEffect(() => {
    setStaff(StaffService.getStaff());
    setRoles(RoleService.getRoles());
  }, []);

  const refreshData = () => {
    setStaff(StaffService.getStaff());
  };

  const tabs = [
    { id: "directory", label: "Directorio", icon: <Users size={18} /> },
    { id: "shifts", label: "Turnos", icon: <Calendar size={18} /> },
    { id: "access", label: "Accesos", icon: <ShieldCheck size={18} /> },
    { id: "reports", label: "Reportes", icon: <FileText size={18} /> },
  ] as const;

  return (
    <main className="p-6 md:p-10 min-h-screen bg-gray-50/30">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black text-text tracking-tight animate-in fade-in slide-in-from-left-4 duration-700">
            Gestión de Capital Humano
          </h1>
          <p className="text-text-muted text-sm font-semibold mt-1.5 animate-in fade-in slide-in-from-left-4 duration-700 delay-75 flex items-center gap-2">
            <LayoutDashboard size={14} className="text-brand" /> Administración centralizada de personal, horarios y seguridad.
          </p>
        </div>

        <button 
          onClick={() => setModal("new")}
          className="flex items-center gap-2 px-8 py-4 bg-brand text-white text-xs font-black rounded-2xl shadow-2xl shadow-brand/20 hover:shadow-brand/40 hover:-translate-y-1 transition-all active:translate-y-0 active:scale-95 animate-in fade-in slide-in-from-right-4 duration-700"
        >
          <Plus size={20} /> ALTA DE COLABORADOR
        </button>
      </header>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <div className="bg-surface p-8 rounded-[40px] border border-border shadow-sm flex items-center gap-6 group hover:shadow-xl hover:border-brand/30 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
          <div className="w-16 h-16 rounded-[22px] bg-brand/10 text-brand flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
            <Users size={28} />
          </div>
          <div>
            <p className="text-xs font-black text-text-muted uppercase tracking-[0.2em] mb-1">Plantilla Total</p>
            <p className="text-4xl font-black text-text tracking-tighter leading-tight">{staff.length}</p>
          </div>
        </div>

        <div className="bg-surface p-8 rounded-[40px] border border-border shadow-sm flex items-center gap-6 group hover:shadow-xl hover:border-emerald-500/30 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 delay-100">
          <div className="w-16 h-16 rounded-[22px] bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
            <Clock size={28} />
          </div>
          <div>
            <p className="text-xs font-black text-text-muted uppercase tracking-[0.2em] mb-1">Activos Ahora</p>
            <p className="text-4xl font-black text-text tracking-tighter leading-tight">{activeStaffCount}</p>
          </div>
        </div>

        <div className="bg-surface p-8 rounded-[40px] border border-border shadow-sm flex items-center gap-6 group hover:shadow-xl hover:border-purple-500/30 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 delay-200">
          <div className="w-16 h-16 rounded-[22px] bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
            <ShieldCheck size={28} />
          </div>
          <div>
            <p className="text-xs font-black text-text-muted uppercase tracking-[0.2em] mb-1">Perfiles de Acceso</p>
            <p className="text-4xl font-black text-text tracking-tighter leading-tight">{roles.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <nav className="flex gap-2 p-1.5 bg-surface border border-border rounded-[32px] mb-10 shadow-md w-fit animate-in fade-in duration-700 mx-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-3 px-8 py-4 rounded-[26px] text-xs font-black uppercase tracking-widest transition-all duration-500
              ${activeTab === tab.id 
                ? "bg-brand text-white shadow-2xl shadow-brand/20 -translate-y-1" 
                : "text-text-muted hover:bg-gray-50 hover:text-text"
              }
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <section className="animate-in fade-in slide-in-from-bottom-6 duration-700">
        {activeTab === "directory" && (
          <div className="space-y-8">
            <UserFilters 
              search={search}
              onSearchChange={setSearch}
              roleFilter="all"
              onRoleFilterChange={() => {}}
              statusFilter="all"
              onStatusFilterChange={() => {}}
            />
            <UserTable 
              users={staff.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.lastname.toLowerCase().includes(search.toLowerCase()))}
              onEdit={setModal}
              onDelete={(id) => {
                if (confirm("¿Está seguro de eliminar definitivamente a este colaborador? Esta acción es irreversible.")) {
                  StaffService.deleteMember(id as string);
                  refreshData();
                }
              }}
              onToggleStatus={(id) => {
                const s = staff.find(x => x.id === id);
                if (s) {
                  const newStatus = s.status === "activo" ? "suspendido" : "activo";
                  StaffService.upsertMember({ ...s, status: newStatus });
                  refreshData();
                }
              }}
              onViewAccess={() => setActiveTab("access")}
              openMenu={null}
              setOpenMenu={() => {}}
            />
          </div>
        )}

        {activeTab === "shifts" && <ShiftCalendar />}

        {activeTab === "access" && <AccessMatrix />}

        {activeTab === "reports" && (
           <div className="space-y-12">
              <AdminReports />
              <div className="h-px bg-border max-w-4xl mx-auto opacity-40" />
              <IncidencePanel />
           </div>
        )}
      </section>

      {modal && (
        <UserModal 
          user={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSave={(u) => {
            StaffService.upsertMember(u as StaffMember);
            setModal(null);
            refreshData();
          }}
        />
      )}
    </main>
  );
}
