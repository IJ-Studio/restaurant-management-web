"use client";

import React, { useState } from "react";
import { Users } from "lucide-react";
import { ROLE_LABELS, CREATABLE_ROLES } from "@/config/roles.config";

export default function UsersPage() {
  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    email: "",
    phone: "",
    password: "",
    roleId: 2,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("authToken");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Error creando usuario");

      const newUser = await res.json();
      alert(`Usuario ${newUser.email} creado con éxito`);

      setFormData({
        name: "",
        lastname: "",
        email: "",
        phone: "",
        password: "",
        roleId: 2,
      });
    } catch (err) {
      alert(`Error: ${err}`);
    }
  };

  return (
    <main className="p-6 md:p-10 min-h-screen bg-gray-50/30 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-surface border border-border rounded-[40px] p-10 shadow-sm animate-in fade-in slide-in-from-bottom-6 duration-700"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-[20px] bg-brand/10 text-brand flex items-center justify-center shadow-inner">
            <Users size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-text tracking-tight">
              Alta de Usuario
            </h2>
            <p className="text-xs font-semibold text-text-muted mt-1">
              Registro manual de nuevo colaborador
            </p>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-5">
          <input
            type="text"
            placeholder="Nombre"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full px-5 py-4 rounded-2xl border border-border bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand/30 transition"
          />

          <input
            type="text"
            placeholder="Apellido"
            value={formData.lastname}
            onChange={(e) =>
              setFormData({ ...formData, lastname: e.target.value })
            }
            required
            className="w-full px-5 py-4 rounded-2xl border border-border bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand/30 transition"
          />

          <input
            type="email"
            placeholder="Correo"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
            className="w-full px-5 py-4 rounded-2xl border border-border bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand/30 transition"
          />

          <input
            type="tel"
            placeholder="Teléfono"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            required
            className="w-full px-5 py-4 rounded-2xl border border-border bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand/30 transition"
          />

          <input
            type="password"
            placeholder="Contraseña (mín. 8 caracteres)"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
            minLength={8}
            className="w-full px-5 py-4 rounded-2xl border border-border bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand/30 transition"
          />

          <select
            value={formData.roleId}
            onChange={(e) =>
              setFormData({
                ...formData,
                roleId: parseInt(e.target.value),
              })
            }
            className="w-full px-5 py-4 rounded-2xl border border-border bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand/30 transition"
          >
            {CREATABLE_ROLES.map((roleId) => (
              <option key={roleId} value={roleId}>
                {ROLE_LABELS[roleId]}
              </option>
            ))}
          </select>
        </div>

        {/* Button */}
        <button
          type="submit"
          className="w-full mt-8 py-4 rounded-2xl bg-brand text-white text-xs font-black tracking-widest shadow-2xl shadow-brand/20 hover:shadow-brand/40 hover:-translate-y-1 transition-all active:translate-y-0 active:scale-95"
        >
          CREAR USUARIO
        </button>
      </form>
    </main>
  );
}
