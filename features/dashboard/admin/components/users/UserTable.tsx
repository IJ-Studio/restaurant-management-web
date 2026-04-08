"use client";

import React from "react";
import {
  MoreVertical,
  Pencil,
  Trash2,
  UserCheck,
  UserX,
  Shield,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Activity,
  Layers,
  Users,
} from "lucide-react";
import type { StaffMember } from "@/features/shared/data/restaurantData";

interface UserTableProps {
  users: StaffMember[];
  onEdit: (u: StaffMember) => void;
  onDelete: (id: string | number) => void;
  onToggleStatus: (id: string | number) => void;
  onViewAccess: (u: StaffMember) => void;
  openMenu: string | number | null;
  setOpenMenu: (id: string | number | null) => void;
}

const AREA_COLORS: Record<string, string> = {
  cocina: "bg-orange-50 text-orange-600 border-orange-100",
  salón: "bg-blue-50 text-blue-600 border-blue-100",
  barra: "bg-purple-50 text-purple-600 border-purple-100",
  limpieza: "bg-gray-50 text-gray-600 border-gray-100",
  administración: "bg-emerald-50 text-emerald-600 border-emerald-100",
};

export function UserTable({
  users,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewAccess,
  openMenu,
  setOpenMenu,
}: UserTableProps) {
  const getInitials = (u: StaffMember) =>
    (u.name[0] + u.lastname[0]).toUpperCase();

  return (
    <div className="bg-surface rounded-[32px] border border-border overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-border">
              {[
                "Colaborador",
                "Área / Cargo",
                "Contrato",
                "Contacto",
                "Nivel Acceso",
                "Estado",
                "",
              ].map((h) => (
                <th
                  key={h}
                  className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted text-left"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-3 opacity-40">
                    <Users size={48} className="text-text-muted" />
                    <p className="text-sm font-black text-text-muted uppercase tracking-widest italic">
                      No se encontraron colaboradores
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const areaCls =
                  AREA_COLORS[u.area] ||
                  "bg-gray-50 text-gray-600 border-gray-100";

                return (
                  <tr
                    key={u.id}
                    className="hover:bg-gray-50/50 transition-all group cursor-default"
                  >
                    {/* Primary Info */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center font-black text-sm border border-brand/20 shadow-sm shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                          {getInitials(u)}
                        </div>
                        <div>
                          <p className="text-[15px] font-black text-text m-0 mb-1 leading-none tracking-tight group-hover:text-brand transition-colors">
                            {u.name} {u.lastname}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-wider">
                            <span className="bg-surface border border-border px-1.5 py-0.5 rounded-md shadow-sm">
                              {u.id}
                            </span>
                            <span>•</span>
                            <span>Ingreso: {u.hireDate}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Area / Position */}
                    <td className="px-6 py-5">
                      <div className="space-y-1.5">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-tight border ${areaCls}`}
                        >
                          {u.area}
                        </span>
                        <p className="text-[11px] font-bold text-text-sec flex items-center gap-1">
                          <Briefcase size={12} className="opacity-40" />
                          {u.position}
                        </p>
                      </div>
                    </td>

                    {/* Contract */}
                    <td className="px-6 py-5">
                      <span className="text-[11px] font-black text-text-sec uppercase tracking-widest">
                        {u.contractType}
                      </span>
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-[11px] font-black text-text hover:text-brand transition-colors cursor-pointer">
                          <Phone
                            size={12}
                            className="text-text-muted shrink-0"
                          />
                          {u.phone}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-black text-text hover:text-brand transition-colors cursor-pointer">
                          <Mail
                            size={12}
                            className="text-text-muted shrink-0"
                          />
                          <span className="truncate max-w-[140px] lowercase">
                            {u.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Access */}
                    <td className="px-6 py-5">
                      <button
                        onClick={() => onViewAccess(u)}
                        className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-border bg-surface text-[10px] font-black text-text-sec uppercase tracking-widest hover:text-brand hover:border-brand/40 hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95 group/btn"
                      >
                        <Shield
                          size={14}
                          className="group-hover/btn:rotate-12 transition-transform"
                        />
                        {u.roleId}
                      </button>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border transition-all ${
                          u.status === "activo"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : u.status === "suspendido"
                              ? "bg-amber-50 text-amber-600 border-amber-100"
                              : "bg-red-50 text-red-600 border-red-100"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                            u.status === "activo"
                              ? "bg-emerald-600"
                              : u.status === "suspendido"
                                ? "bg-amber-600"
                                : "bg-red-600"
                          }`}
                        />
                        {u.status}
                      </span>
                    </td>

                    {/* Actions Menu */}
                    <td className="px-6 py-5 text-right relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenu(openMenu === u.id ? null : u.id);
                        }}
                        className="p-3 rounded-2xl text-text-muted hover:text-brand hover:bg-brand/5 hover:rotate-90 transition-all duration-300"
                      >
                        <MoreVertical size={20} />
                      </button>

                      {openMenu === u.id && (
                        <div
                          className="absolute right-16 top-1/2 -translate-y-1/2 z-50 bg-surface rounded-[24px] border border-border p-3 shadow-2xl min-w-[200px] animate-in zoom-in-95 slide-in-from-right-4 duration-300"
                          onMouseLeave={() => setOpenMenu(null)}
                        >
                          <div className="px-3 py-2 mb-2 border-b border-border/60">
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] m-0">
                              Acciones Directas
                            </p>
                          </div>
                          <button
                            onClick={() => onEdit(u)}
                            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-[12px] font-black text-text-sec hover:bg-gray-50 hover:text-brand transition-all text-left"
                          >
                            <Pencil size={14} /> Editar Perfil
                          </button>
                          <button
                            onClick={() => onToggleStatus(u.id)}
                            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-[12px] font-black text-text-sec hover:bg-gray-50 transition-all text-left"
                          >
                            {u.status === "activo" ? (
                              <>
                                <UserX size={14} className="text-amber-500" />{" "}
                                Suspender Acceso
                              </>
                            ) : (
                              <>
                                <UserCheck
                                  size={14}
                                  className="text-emerald-500"
                                />{" "}
                                Reactivar Acceso
                              </>
                            )}
                          </button>
                          <div className="h-px bg-border my-2" />
                          <button
                            onClick={() => onDelete(u.id)}
                            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-[12px] font-black text-red-500 hover:bg-red-50 transition-all text-left group/del"
                          >
                            <Trash2
                              size={14}
                              className="group-hover/del:animate-bounce"
                            />{" "}
                            Baja Definitiva
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
