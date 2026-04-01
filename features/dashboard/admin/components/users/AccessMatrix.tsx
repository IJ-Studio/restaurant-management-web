"use client";

import React, { useState, useEffect } from "react";
import { 
  Shield, 
  Check, 
  X, 
  Info, 
  Save, 
  Plus, 
  Trash2, 
  Lock,
  Unlock,
  AlertCircle
} from "lucide-react";
import { RoleService } from "@/features/shared/services/dataService";
import { INITIAL_ROLES, type Role } from "@/features/shared/data/restaurantData";

const MODULES = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "pedidos", label: "Pedidos", icon: "🧾" },
  { id: "menu", label: "Catálogo Menú", icon: "🍽️" },
  { id: "cocina", label: "Cocina", icon: "👨‍🍳" },
  { id: "inventario", label: "Inventario", icon: "📦" },
  { id: "finanzas", label: "Finanzas", icon: "💰" },
  { id: "reportes", label: "Reportes", icon: "📈" },
  { id: "usuarios", label: "Personal", icon: "👥" },
  { id: "mesero", label: "Módulo Mesero", icon: "🪑" },
  { id: "configuracion", label: "Configuración", icon: "⚙️" },
];

export function AccessMatrix() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNewRoleModal, setShowNewRoleModal] = useState(false);
  const [newRole, setNewRole] = useState({ name: "", description: "" });

  useEffect(() => {
    const data = RoleService.getRoles();
    setRoles(data);
    setLoading(false);
  }, []);

  const togglePermission = (roleId: string, permId: string) => {
    setRoles(prev => prev.map(role => {
      if (role.id !== roleId) return role;
      const hasPerm = role.permissions.includes(permId);
      const newPerms = hasPerm 
        ? role.permissions.filter(p => p !== permId)
        : [...role.permissions, permId];
      return { ...role, permissions: newPerms };
    }));
  };

  const saveRoles = () => {
    setSaving(true);
    roles.forEach(r => RoleService.upsertRole(r));
    setTimeout(() => {
      setSaving(false);
      alert("Configuración de accesos guardada correctamente.");
    }, 800);
  };

  const handleAddRole = () => {
    if (!newRole.name) return;
    const role: Role = {
      id: newRole.name.toLowerCase().replace(/\s+/g, "-"),
      name: newRole.name,
      description: newRole.description,
      permissions: ["dashboard"]
    };
    const updated = [...roles, role];
    setRoles(updated);
    RoleService.upsertRole(role);
    setShowNewRoleModal(false);
    setNewRole({ name: "", description: "" });
  };

  if (loading) return <div className="p-20 text-center font-black animate-pulse">Cargando Matriz de Seguridad...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Matrix Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface p-8 rounded-[32px] border border-border shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-text tracking-tight flex items-center gap-3">
             <Shield className="text-brand" /> Matriz de Permisos Operativos
          </h2>
          <p className="text-text-muted text-sm font-medium mt-1">
            Cruza los roles de tu personal con los módulos del sistema para definir alcances.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowNewRoleModal(true)}
            className="px-6 py-3 rounded-2xl border border-border bg-white text-xs font-black text-text-muted hover:text-brand hover:border-brand/40 transition-all flex items-center gap-2"
          >
            <Plus size={16} /> NUEVO ROL
          </button>
          <button 
            onClick={saveRoles}
            disabled={saving}
            className="px-8 py-3 rounded-2xl bg-brand text-white text-xs font-black shadow-xl shadow-brand/20 hover:shadow-brand/40 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? "GUARDANDO..." : <><Save size={16} /> GUARDAR CAMBIOS</>}
          </button>
        </div>
      </div>

      {/* The Matrix Table */}
      <div className="bg-surface rounded-[40px] border border-border overflow-hidden shadow-xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="p-8 text-left border-r border-border min-w-[240px]">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                        <Layers size={20} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Módulos del Sistema</span>
                   </div>
                </th>
                {roles.map(role => (
                  <th key={role.id} className="p-6 text-center border-r border-border group">
                    <div className="flex flex-col items-center gap-2">
                       <span className="text-[11px] font-black text-text uppercase tracking-widest">{role.name}</span>
                       <button className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 transition-all">
                          <Trash2 size={12} />
                       </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MODULES.map(module => (
                <tr key={module.id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="p-6 border-r border-border">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{module.icon}</span>
                      <div>
                        <p className="text-sm font-black text-text leading-none mb-1">{module.label}</p>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wide">Acceso al módulo</p>
                      </div>
                    </div>
                  </td>
                  {roles.map(role => {
                    const hasPerm = role.permissions.includes(module.id);
                    const isAdmin = role.id === "admin";
                    
                    return (
                      <td key={`${role.id}-${module.id}`} className="p-6 text-center border-r border-border">
                        <button
                          disabled={isAdmin}
                          onClick={() => togglePermission(role.id, module.id)}
                          className={`
                            w-10 h-10 rounded-2xl flex items-center justify-center mx-auto transition-all duration-300
                            ${isAdmin ? "cursor-not-allowed opacity-50 bg-brand/10 text-brand" : 
                              hasPerm 
                              ? "bg-emerald-100 text-emerald-600 hover:scale-110 shadow-sm" 
                              : "bg-red-50 text-red-300 hover:bg-red-100 hover:text-red-500"
                            }
                          `}
                        >
                          {hasPerm ? <Unlock size={18} /> : <Lock size={18} />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Role Modal (Simple Inline Overlay) */}
      {showNewRoleModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-surface p-10 rounded-[48px] shadow-2xl border border-white/20 w-full max-w-md animate-in zoom-in-95 duration-300">
              <h3 className="text-2xl font-black text-text mb-6">Crear Nuevo Rol</h3>
              <div className="space-y-4">
                 <div>
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-2 px-1">Nombre del Rol</label>
                    <input 
                      value={newRole.name}
                      onChange={e => setNewRole(r => ({ ...r, name: e.target.value }))}
                      className="w-full px-5 py-4 rounded-2xl border border-border font-black text-sm transition-all focus:border-brand bg-gray-50 shadow-inner outline-none"
                      placeholder="Ej. Supervisor Night"
                    />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-2 px-1">Descripción Breve</label>
                    <textarea 
                      value={newRole.description}
                      onChange={e => setNewRole(r => ({ ...r, description: e.target.value }))}
                      className="w-full px-5 py-4 rounded-2xl border border-border font-black text-sm transition-all focus:border-brand bg-gray-50 shadow-inner outline-none h-24 resize-none"
                      placeholder="Indica las responsabilidades..."
                    />
                 </div>
              </div>
              <div className="flex gap-4 mt-8">
                 <button 
                  onClick={() => setShowNewRoleModal(false)}
                  className="flex-1 py-4 text-xs font-black text-text-muted uppercase tracking-widest hover:text-text transition-colors"
                 >
                   Cancelar
                 </button>
                 <button 
                  onClick={handleAddRole}
                  className="flex-1 py-4 bg-brand text-white text-xs font-black rounded-2xl shadow-xl shadow-brand/20 hover:shadow-brand/40 hover:-translate-y-1 transition-all uppercase tracking-widest"
                 >
                   CREAR ROL
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-brand/5 border border-brand/20 p-6 rounded-3xl flex gap-4 items-start">
         <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
            <Info size={20} />
         </div>
         <div>
            <p className="text-[13px] font-black text-brand mb-1 uppercase tracking-tight">Reglas de Seguridad</p>
            <p className="text-[11px] font-bold text-text-muted leading-relaxed uppercase tracking-wide">
              El rol de <strong className="text-text">Administrador</strong> posee permisos globales bloqueados por diseño. 
              Cualquier cambio en esta matriz afectará en tiempo real a todos los colaboradores asociados al rol modificado. 
              Recuerde guardar los cambios antes de salir de esta pestaña.
            </p>
         </div>
      </div>
    </div>
  );
}

function Layers(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
    </svg>
  );
}
