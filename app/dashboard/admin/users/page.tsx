"use client";

import React, { useState, useEffect } from "react";
import { Users, Edit2, Plus, Search, Power, X } from "lucide-react";
import { ROLE_LABELS, CREATABLE_ROLES, ROLE_NAMES } from "@/config/roles.config";
import { api } from "@/lib/api";

export default function UsersPage() {
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    email: "",
    phone: "",
    password: "",
    roleId: 2,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.get<any[]>("/users");
      setUsersList(data);
    } catch (err: any) {
      alert(`Error al obtener usuarios: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditUser(null);
    setFormData({
      name: "",
      lastname: "",
      email: "",
      phone: "",
      password: "",
      roleId: 2,
    });
    setShowForm(true);
  };

  const handleOpenEdit = (user: any) => {
    setEditUser(user);
    setFormData({
      name: user.name || "",
      lastname: user.lastname || "",
      email: user.email || "",
      phone: user.phone || "",
      password: "", // Contraseña vacía al editar a menos que se desee cambiar
      roleId: user.roleId || 2,
    });
    setShowForm(true);
  };

  const handleToggleActive = async (user: any) => {
    const actionText = user.isActive ? "desactivar" : "activar";
    if (confirm(`¿Estás seguro de que deseas ${actionText} a ${user.name} ${user.lastname}?`)) {
      try {
        await api.patch(`/users/${user.id}`, { isActive: !user.isActive });
        alert(`Usuario ${user.isActive ? "desactivado" : "activado"} con éxito`);
        fetchUsers();
      } catch (err: any) {
        alert(`Error al cambiar estado: ${err.message}`);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { ...formData };
      
      // Al editar, si no se introduce contraseña, se remueve del payload
      if (editUser && !payload.password) {
        delete payload.password;
      }

      if (editUser) {
        await api.patch(`/users/${editUser.id}`, payload);
        alert("Usuario actualizado con éxito");
      } else {
        await api.post("/users", payload);
        alert("Usuario creado con éxito");
      }

      setShowForm(false);
      fetchUsers();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  // Filtrado de usuarios
  const filteredUsers = usersList.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      roleFilter === "all" ? true : String(user.roleId) === roleFilter;

    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? user.isActive
        : !user.isActive;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadgeStyle = (roleId: number) => {
    switch (roleId) {
      case 1:
        return "bg-purple-100 text-purple-700 border-purple-200";
      case 2:
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case 3:
        return "bg-blue-100 text-blue-700 border-blue-200";
      case 4:
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <main className="p-6 md:p-10 min-w-0">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-text tracking-tight flex items-center gap-3">
              <Users className="text-brand" size={32} />
              Gestión de Personal
            </h1>
            <p className="text-sm font-semibold text-text-muted mt-1">
              Administra las cuentas de los colaboradores de la plataforma.
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-brand text-white text-sm font-black tracking-wide shadow-lg shadow-brand/20 hover:shadow-brand/40 hover:-translate-y-0.5 transition-all active:translate-y-0"
          >
            <Plus size={18} />
            NUEVO COLABORADOR
          </button>
        </div>

        {/* Filters Panel */}
        <div className="bg-white border border-border rounded-3xl p-5 mb-6 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-4 flex items-center text-text-muted">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-5 py-3 rounded-2xl border border-border bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition"
            />
          </div>
          
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-3 rounded-2xl border border-border bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand/20 transition"
            >
              <option value="all">Todos los Roles</option>
              <option value="1">Administrador</option>
              <option value="2">Cajero</option>
              <option value="3">Mesero</option>
              <option value="4">Cocina</option>
              <option value="5">Cliente</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 rounded-2xl border border-border bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand/20 transition"
            >
              <option value="all">Todos los Estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white border border-border rounded-3xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-10 text-center text-text-muted animate-pulse">
              Cargando lista de colaboradores...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-10 text-center text-text-muted font-semibold">
              No se encontraron colaboradores que coincidan con los filtros.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-border">
                    <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-text-muted">Colaborador</th>
                    <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-text-muted">Contacto</th>
                    <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-text-muted">Rol</th>
                    <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-text-muted">Estado</th>
                    <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-text-muted text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-bold text-sm">
                            {user.name?.[0]?.toUpperCase()}
                            {user.lastname?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-text">
                              {user.name} {user.lastname}
                            </div>
                            <div className="text-xs text-text-muted">
                              ID: {user.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-text font-medium">{user.email}</div>
                        <div className="text-xs text-text-muted">{user.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRoleBadgeStyle(user.roleId)}`}>
                          {ROLE_LABELS[user.roleId] || "Desconocido"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          user.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? "bg-emerald-500" : "bg-red-500"}`} />
                          {user.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(user)}
                            className="p-2 rounded-xl border border-border hover:bg-gray-100 text-text-sec transition-all"
                            title="Editar colaborador"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleToggleActive(user)}
                            className={`p-2 rounded-xl border transition-all ${
                              user.isActive
                                ? "border-red-200 hover:bg-red-50 text-red-600"
                                : "border-emerald-200 hover:bg-emerald-50 text-emerald-600"
                            }`}
                            title={user.isActive ? "Desactivar" : "Activar"}
                          >
                            <Power size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity">
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-gray-50">
                <h3 className="text-xl font-bold text-text flex items-center gap-2">
                  {editUser ? <Edit2 size={20} className="text-brand" /> : <Plus size={20} className="text-brand" />}
                  {editUser ? "Editar Colaborador" : "Registrar Colaborador"}
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-1 rounded-lg text-text-muted hover:bg-gray-200 transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold uppercase text-text-muted mb-1">Nombre</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand/20 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold uppercase text-text-muted mb-1">Apellido</label>
                    <input
                      type="text"
                      value={formData.lastname}
                      onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand/20 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-text-muted mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand/20 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-text-muted mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand/20 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-text-muted mb-1">
                    Contraseña {editUser && <span className="text-[10px] text-text-muted font-normal lowercase">(dejar vacío para no cambiar)</span>}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editUser}
                    minLength={8}
                    placeholder={editUser ? "••••••••" : "Mínimo 8 caracteres"}
                    className="w-full px-4 py-3 rounded-xl border border-border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand/20 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-text-muted mb-1">Rol</label>
                  <select
                    value={formData.roleId}
                    onChange={(e) => setFormData({ ...formData, roleId: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border border-border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand/20 transition"
                  >
                    {CREATABLE_ROLES.map((roleId) => (
                      <option key={roleId} value={roleId}>
                        {ROLE_LABELS[roleId]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Modal Actions */}
                <div className="flex gap-3 justify-end pt-4 border-t border-border mt-6">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-5 py-3 rounded-xl border border-border text-sm font-bold text-text-sec hover:bg-gray-50 transition"
                  >
                    CANCELAR
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-brand text-white text-sm font-bold hover:bg-brand/90 transition shadow-md shadow-brand/10"
                  >
                    {editUser ? "GUARDAR CAMBIOS" : "CREAR COLABORADOR"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </main>
  );
}
