"use client";
import React, { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  Users,
  Settings,
  LogOut,
  Search,
  Bell,
  Plus,
  Pencil,
  Trash2,
  Shield,
  Eye,
  EyeOff,
  ChevronDown,
  X,
  Check,
  UserCheck,
  UserX,
  Phone,
  Mail,
  Calendar,
  Briefcase,
  Lock,
  Clock,
  Filter,
  MoreVertical,
} from "lucide-react";

// ─── Tokens ───────────────────────────────────────────────────────────────────
const T = {
  brand: "#e85d04",
  brandDark: "#dc2f02",
  bg: "#faf9f7",
  surface: "#ffffff",
  elevated: "#f5f3ef",
  subtle: "#ede9e3",
  text: "#1a1208",
  textSec: "#6b5e4e",
  textMut: "#a89880",
  border: "#e8e1d8",
  borderMed: "#d4c8bc",
  shadow: "0 2px 16px rgba(26,18,8,0.07)",
  shadowHov: "0 8px 32px rgba(26,18,8,0.12)",
  fontD: "'Fraunces', Georgia, serif",
  fontB: "'DM Sans', system-ui, sans-serif",
};

// ─── Role config ──────────────────────────────────────────────────────────────
const ROLES: Record<
  string,
  { label: string; color: string; bg: string; desc: string; perms: string[] }
> = {
  admin: {
    label: "Administrador",
    color: "#dc2626",
    bg: "#fef2f2",
    desc: "Acceso total al sistema",
    perms: [
      "dashboard",
      "usuarios",
      "menu",
      "inventario",
      "finanzas",
      "reportes",
      "configuracion",
      "cocina",
      "pedidos",
      "mesero",
    ],
  },
  cajero: {
    label: "Cajero",
    color: "#d97706",
    bg: "#fffbeb",
    desc: "Caja, pedidos y facturación",
    perms: ["dashboard", "pedidos", "finanzas", "menu"],
  },
  mesero: {
    label: "Mesero",
    color: "#0ea5e9",
    bg: "#f0f9ff",
    desc: "Toma y gestión de pedidos",
    perms: ["dashboard", "pedidos", "menu"],
  },
  cocina: {
    label: "Cocina",
    color: "#16a34a",
    bg: "#f0fdf4",
    desc: "Preparación y control de platillos",
    perms: ["dashboard", "cocina", "menu"],
  },
  repartidor: {
    label: "Repartidor",
    color: "#7c3aed",
    bg: "#faf5ff",
    desc: "Gestión de entregas a domicilio",
    perms: ["dashboard", "pedidos"],
  },
};

const ALL_PERMS = [
  { key: "dashboard", label: "Dashboard", icon: "📊" },
  { key: "pedidos", label: "Pedidos", icon: "🧾" },
  { key: "menu", label: "Catálogo Menú", icon: "🍽️" },
  { key: "cocina", label: "Cocina", icon: "👨‍🍳" },
  { key: "inventario", label: "Inventario", icon: "📦" },
  { key: "finanzas", label: "Finanzas", icon: "💰" },
  { key: "reportes", label: "Reportes", icon: "📈" },
  { key: "usuarios", label: "Usuarios", icon: "👥" },
  { key: "mesero", label: "Módulo Mesero", icon: "🪑" },
  { key: "configuracion", label: "Configuración", icon: "⚙️" },
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface StaffUser {
  id: number;
  name: string;
  lastname: string;
  email: string;
  phone: string;
  role: keyof typeof ROLES;
  active: boolean;
  hireDate: string;
  shift: "mañana" | "tarde" | "noche" | "completo";
  salary: number;
  address: string;
  customPerms: string[]; // overrides on top of role defaults
  revokedPerms: string[]; // revoked from role defaults
  avatarInitials?: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_USERS: StaffUser[] = [
  {
    id: 1,
    name: "Carlos",
    lastname: "Mendoza",
    email: "carlos@quijote.mx",
    phone: "771-234-5678",
    role: "cajero",
    active: true,
    hireDate: "2023-03-15",
    shift: "mañana",
    salary: 8500,
    address: "Calle Hidalgo 23, Huejutla",
    customPerms: [],
    revokedPerms: [],
  },
  {
    id: 2,
    name: "Ana",
    lastname: "Reyes",
    email: "ana@quijote.mx",
    phone: "771-345-6789",
    role: "mesero",
    active: true,
    hireDate: "2022-11-01",
    shift: "tarde",
    salary: 7200,
    address: "Av. Juárez 45, Huejutla",
    customPerms: [],
    revokedPerms: [],
  },
  {
    id: 3,
    name: "Luis",
    lastname: "García",
    email: "luis@quijote.mx",
    phone: "771-456-7890",
    role: "cocina",
    active: true,
    hireDate: "2021-06-20",
    shift: "completo",
    salary: 9000,
    address: "Col. Centro 12, Huejutla",
    customPerms: [],
    revokedPerms: [],
  },
  {
    id: 4,
    name: "María",
    lastname: "López",
    email: "maria@quijote.mx",
    phone: "771-567-8901",
    role: "cajero",
    active: false,
    hireDate: "2024-01-10",
    shift: "tarde",
    salary: 8500,
    address: "Calle 5 de Mayo 8, Huejutla",
    customPerms: [],
    revokedPerms: [],
  },
  {
    id: 5,
    name: "Pedro",
    lastname: "Hernández",
    email: "pedro@quijote.mx",
    phone: "771-678-9012",
    role: "repartidor",
    active: true,
    hireDate: "2023-09-05",
    shift: "noche",
    salary: 6800,
    address: "Fraccionamiento Las Flores 34, Huejutla",
    customPerms: [],
    revokedPerms: [],
  },
  {
    id: 6,
    name: "Sofia",
    lastname: "Torres",
    email: "sofia@quijote.mx",
    phone: "771-789-0123",
    role: "mesero",
    active: true,
    hireDate: "2024-02-14",
    shift: "mañana",
    salary: 7200,
    address: "Col. Obrera 56, Huejutla",
    customPerms: [],
    revokedPerms: [],
  },
];

const SHIFTS = ["mañana", "tarde", "noche", "completo"] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function initials(u: StaffUser) {
  return (u.name[0] + u.lastname[0]).toUpperCase();
}
function effectivePerms(u: StaffUser) {
  const base = ROLES[u.role].perms;
  return [...new Set([...base, ...u.customPerms])].filter(
    (p) => !u.revokedPerms.includes(p),
  );
}

// ─── NavItem ──────────────────────────────────────────────────────────────────
function NavItem({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        borderRadius: 14,
        fontSize: 14,
        fontWeight: 600,
        border: "none",
        cursor: "pointer",
        width: "100%",
        textAlign: "left",
        transition: "all .15s",
        background: active ? T.brand : h ? T.elevated : "transparent",
        color: active ? "#fff" : h ? T.text : T.textSec,
        boxShadow: active ? "0 4px 14px rgba(232,93,4,.25)" : "none",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

// ─── RoleBadge ────────────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: keyof typeof ROLES }) {
  const r = ROLES[role];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 10px",
        borderRadius: 99,
        fontSize: 11,
        fontWeight: 800,
        color: r.color,
        background: r.bg,
      }}
    >
      {r.label}
    </span>
  );
}

// ─── User Modal ───────────────────────────────────────────────────────────────
function UserModal({
  user,
  onClose,
  onSave,
}: {
  user: StaffUser | null;
  onClose: () => void;
  onSave: (u: StaffUser) => void;
}) {
  const blank: StaffUser = {
    id: 0,
    name: "",
    lastname: "",
    email: "",
    phone: "",
    role: "mesero",
    active: true,
    hireDate: "",
    shift: "mañana",
    salary: 0,
    address: "",
    customPerms: [],
    revokedPerms: [],
  };
  const [form, setForm] = useState<StaffUser>(user ?? blank);
  const [tab, setTab] = useState<"datos" | "acceso">("datos");
  const [showPw, setShowPw] = useState(false);
  const [pw, setPw] = useState("");

  const rolePerms = ROLES[form.role].perms;
  const effPerms = effectivePerms(form);

  function togglePerm(key: string) {
    const inBase = rolePerms.includes(key);
    const inCustom = form.customPerms.includes(key);
    const inRevoked = form.revokedPerms.includes(key);
    if (inBase) {
      // currently active via base → revoke
      if (inRevoked) {
        setForm((f) => ({
          ...f,
          revokedPerms: f.revokedPerms.filter((p) => p !== key),
        }));
      } else {
        setForm((f) => ({ ...f, revokedPerms: [...f.revokedPerms, key] }));
      }
    } else {
      // not in base → toggle custom
      if (inCustom) {
        setForm((f) => ({
          ...f,
          customPerms: f.customPerms.filter((p) => p !== key),
        }));
      } else {
        setForm((f) => ({ ...f, customPerms: [...f.customPerms, key] }));
      }
    }
  }

  function handleRoleChange(r: keyof typeof ROLES) {
    setForm((f) => ({ ...f, role: r, customPerms: [], revokedPerms: [] }));
  }

  const inp: React.CSSProperties = {
    width: "100%",
    padding: "9px 12px",
    border: `1px solid ${T.borderMed}`,
    borderRadius: 10,
    fontSize: 13,
    fontFamily: T.fontB,
    color: T.text,
    background: T.surface,
    outline: "none",
    boxSizing: "border-box",
  };
  const lbl: React.CSSProperties = {
    display: "block",
    fontSize: 11,
    fontWeight: 700,
    color: T.textSec,
    marginBottom: 5,
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(26,18,8,0.45)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        style={{
          background: T.surface,
          borderRadius: 28,
          boxShadow: "0 24px 64px rgba(26,18,8,0.18)",
          width: "100%",
          maxWidth: 640,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px 28px 0",
            borderBottom: `1px solid ${T.border}`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 16,
            }}
          >
            <div>
              <h2
                style={{
                  fontFamily: T.fontD,
                  fontWeight: 900,
                  fontSize: 20,
                  color: T.text,
                  margin: "0 0 4px",
                  letterSpacing: "-.02em",
                }}
              >
                {user ? "Editar colaborador" : "Nuevo colaborador"}
              </h2>
              <p style={{ fontSize: 12, color: T.textMut, margin: 0 }}>
                {user
                  ? `ID #${user.id} · ${ROLES[user.role].label}`
                  : "Personal operativo del restaurante"}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                padding: 6,
                background: T.elevated,
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                display: "flex",
              }}
            >
              <X size={16} style={{ color: T.textSec }} />
            </button>
          </div>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 0 }}>
            {(["datos", "acceso"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: "10px 20px",
                  fontSize: 13,
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  background: "none",
                  transition: "all .15s",
                  borderBottom:
                    tab === t
                      ? `2px solid ${T.brand}`
                      : "2px solid transparent",
                  color: tab === t ? T.brand : T.textMut,
                }}
              >
                {t === "datos" ? "📋 Datos Laborales" : "🔐 Niveles de Acceso"}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div
          style={{ padding: "22px 28px", maxHeight: "60vh", overflowY: "auto" }}
        >
          {/* ── TAB: DATOS LABORALES ── */}
          {tab === "datos" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <label style={lbl}>Nombre *</label>
                  <input
                    style={inp}
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="Nombre"
                  />
                </div>
                <div>
                  <label style={lbl}>Apellido *</label>
                  <input
                    style={inp}
                    value={form.lastname}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, lastname: e.target.value }))
                    }
                    placeholder="Apellido"
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <label style={lbl}>Correo electrónico *</label>
                  <input
                    type="email"
                    style={inp}
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    placeholder="correo@quijote.mx"
                  />
                </div>
                <div>
                  <label style={lbl}>Teléfono</label>
                  <input
                    style={inp}
                    value={form.phone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    placeholder="771-000-0000"
                  />
                </div>
              </div>

              <div>
                <label style={lbl}>Dirección</label>
                <input
                  style={inp}
                  value={form.address}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, address: e.target.value }))
                  }
                  placeholder="Calle, número, colonia"
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <label style={lbl}>Fecha de ingreso</label>
                  <input
                    type="date"
                    style={inp}
                    value={form.hireDate}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, hireDate: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label style={lbl}>Turno</label>
                  <select
                    style={inp}
                    value={form.shift}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, shift: e.target.value as any }))
                    }
                  >
                    {SHIFTS.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Salario mensual ($)</label>
                  <input
                    type="number"
                    min={0}
                    style={inp}
                    value={form.salary}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, salary: Number(e.target.value) }))
                    }
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label style={lbl}>Rol del sistema *</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {Object.entries(ROLES).map(([key, r]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        handleRoleChange(key as keyof typeof ROLES)
                      }
                      style={{
                        padding: "7px 14px",
                        borderRadius: 10,
                        fontSize: 12,
                        fontWeight: 700,
                        border: `2px solid ${form.role === key ? r.color : T.border}`,
                        background: form.role === key ? r.bg : T.surface,
                        color: form.role === key ? r.color : T.textSec,
                        cursor: "pointer",
                        transition: "all .15s",
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: 11, color: T.textMut, marginTop: 6 }}>
                  {ROLES[form.role].desc}
                </p>
              </div>

              {/* Password */}
              {!user && (
                <div>
                  <label style={lbl}>Contraseña temporal *</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPw ? "text" : "password"}
                      style={{ ...inp, paddingRight: 38 }}
                      value={pw}
                      onChange={(e) => setPw(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((s) => !s)}
                      style={{
                        position: "absolute",
                        right: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: T.textMut,
                        display: "flex",
                      }}
                    >
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Active toggle */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  background: T.elevated,
                  borderRadius: 12,
                }}
              >
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: T.text,
                      margin: 0,
                    }}
                  >
                    Estado del colaborador
                  </p>
                  <p
                    style={{
                      fontSize: 11,
                      color: T.textMut,
                      margin: "2px 0 0",
                    }}
                  >
                    Los usuarios inactivos no pueden iniciar sesión
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, active: !f.active }))}
                  style={{
                    width: 44,
                    height: 24,
                    borderRadius: 99,
                    border: "none",
                    cursor: "pointer",
                    transition: "all .2s",
                    position: "relative",
                    background: form.active ? T.brand : T.borderMed,
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: 2,
                      borderRadius: "50%",
                      width: 20,
                      height: 20,
                      background: "#fff",
                      transition: "all .2s",
                      boxShadow: "0 1px 4px rgba(0,0,0,.2)",
                      left: form.active ? "calc(100% - 22px)" : 2,
                    }}
                  />
                </button>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: form.active ? "#059669" : "#dc2626",
                  }}
                >
                  {form.active ? "Activo" : "Inactivo"}
                </span>
              </div>
            </div>
          )}

          {/* ── TAB: NIVELES DE ACCESO ── */}
          {tab === "acceso" && (
            <div>
              {/* Role summary */}
              <div
                style={{
                  padding: "14px 16px",
                  background: ROLES[form.role].bg,
                  borderRadius: 14,
                  border: `1px solid ${ROLES[form.role].color}30`,
                  marginBottom: 20,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Shield size={20} style={{ color: ROLES[form.role].color }} />
                  <div>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: ROLES[form.role].color,
                        margin: 0,
                      }}
                    >
                      Rol base: {ROLES[form.role].label}
                    </p>
                    <p
                      style={{
                        fontSize: 11,
                        color: T.textSec,
                        margin: "2px 0 0",
                      }}
                    >
                      Puedes ampliar o restringir permisos individualmente
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {ALL_PERMS.map((p) => {
                  const inBase = rolePerms.includes(p.key);
                  const inRevoked = form.revokedPerms.includes(p.key);
                  const inCustom = form.customPerms.includes(p.key);
                  const active = effPerms.includes(p.key);
                  const isBase = inBase && !inRevoked;
                  const isCustom = !inBase && inCustom;
                  const isRevoked = inBase && inRevoked;

                  return (
                    <div
                      key={p.key}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 14px",
                        borderRadius: 12,
                        border: `1px solid ${T.border}`,
                        background: active ? T.surface : T.elevated,
                        transition: "all .15s",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <span style={{ fontSize: 18 }}>{p.icon}</span>
                        <div>
                          <p
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: active ? T.text : T.textMut,
                              margin: 0,
                            }}
                          >
                            {p.label}
                          </p>
                          <p
                            style={{
                              fontSize: 10,
                              margin: "2px 0 0",
                              color: isBase
                                ? "#059669"
                                : isCustom
                                  ? T.brand
                                  : isRevoked
                                    ? "#dc2626"
                                    : T.textMut,
                            }}
                          >
                            {isBase
                              ? "✓ Incluido en el rol"
                              : isCustom
                                ? "+ Permiso adicional"
                                : isRevoked
                                  ? "✗ Restringido manualmente"
                                  : "Sin acceso por defecto"}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => togglePerm(p.key)}
                        style={{
                          width: 40,
                          height: 22,
                          borderRadius: 99,
                          border: "none",
                          cursor: "pointer",
                          transition: "all .2s",
                          position: "relative",
                          background: active ? T.brand : T.borderMed,
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            top: 2,
                            borderRadius: "50%",
                            width: 18,
                            height: 18,
                            background: "#fff",
                            transition: "all .2s",
                            boxShadow: "0 1px 4px rgba(0,0,0,.2)",
                            left: active ? "calc(100% - 20px)" : 2,
                          }}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>

              <p
                style={{
                  fontSize: 11,
                  color: T.textMut,
                  marginTop: 12,
                  textAlign: "center",
                }}
              >
                {effPerms.length} de {ALL_PERMS.length} módulos habilitados
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 28px",
            borderTop: `1px solid ${T.border}`,
            background: T.elevated,
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "9px 20px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              background: T.subtle,
              color: T.textSec,
            }}
          >
            Cancelar
          </button>
          <button
            disabled={!form.name || !form.lastname || !form.email}
            onClick={() => {
              onSave(form);
              onClose();
            }}
            style={{
              padding: "9px 20px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              color: "#fff",
              background:
                form.name && form.lastname && form.email ? T.brand : "#ccc",
              boxShadow:
                form.name && form.lastname && form.email
                  ? "0 4px 12px rgba(232,93,4,.3)"
                  : "none",
            }}
          >
            {user ? "Guardar cambios" : "Crear colaborador"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Access Detail Drawer ─────────────────────────────────────────────────────
function AccessDrawer({
  user,
  onClose,
}: {
  user: StaffUser;
  onClose: () => void;
}) {
  const perms = effectivePerms(user);
  const r = ROLES[user.role];
  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 90, display: "flex" }}
      onClick={onClose}
    >
      <div style={{ flex: 1, background: "rgba(26,18,8,0.3)" }} />
      <div
        style={{
          width: 380,
          background: T.surface,
          height: "100%",
          overflowY: "auto",
          boxShadow: "-8px 0 40px rgba(26,18,8,.12)",
          padding: "28px 24px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h3
            style={{
              fontFamily: T.fontD,
              fontWeight: 900,
              fontSize: 18,
              color: T.text,
              margin: 0,
            }}
          >
            Accesos de {user.name}
          </h3>
          <button
            onClick={onClose}
            style={{
              padding: 6,
              background: T.elevated,
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              display: "flex",
            }}
          >
            <X size={15} style={{ color: T.textSec }} />
          </button>
        </div>

        <div
          style={{
            padding: "12px 14px",
            background: r.bg,
            borderRadius: 14,
            border: `1px solid ${r.color}30`,
            marginBottom: 20,
          }}
        >
          <p
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: r.color,
              margin: "0 0 2px",
            }}
          >
            <Shield
              size={13}
              style={{ marginRight: 5, verticalAlign: "middle" }}
            />
            {r.label}
          </p>
          <p style={{ fontSize: 11, color: T.textSec, margin: 0 }}>{r.desc}</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {ALL_PERMS.map((p) => {
            const has = perms.includes(p.key);
            const isCustom = user.customPerms.includes(p.key);
            const isRevoked = user.revokedPerms.includes(p.key);
            return (
              <div
                key={p.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: has ? T.surface : T.elevated,
                  border: `1px solid ${T.border}`,
                  opacity: has ? 1 : 0.6,
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    color: has ? T.text : T.textMut,
                  }}
                >
                  <span style={{ fontSize: 16 }}>{p.icon}</span>
                  {p.label}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {isCustom && (
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 800,
                        color: T.brand,
                        background: "#fff0e8",
                        padding: "2px 6px",
                        borderRadius: 99,
                      }}
                    >
                      EXTRA
                    </span>
                  )}
                  {isRevoked && (
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 800,
                        color: "#dc2626",
                        background: "#fef2f2",
                        padding: "2px 6px",
                        borderRadius: 99,
                      }}
                    >
                      RESTRINGIDO
                    </span>
                  )}
                  {has ? (
                    <Check size={14} style={{ color: "#059669" }} />
                  ) : (
                    <X size={14} style={{ color: "#dc2626" }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [modal, setModal] = useState<StaffUser | null | "new">(null);
  const [drawer, setDrawer] = useState<StaffUser | null>(null);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [searchFocus, setSearchFocus] = useState(false);

  const user = useSelector((state: RootState) => state.auth.user);

  const filtered = users.filter((u) => {
    const matchSearch = [u.name, u.lastname, u.email, u.phone]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "active" ? u.active : !u.active);
    return matchSearch && matchRole && matchStatus;
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function saveUser(u: StaffUser) {
    try {
      if (u.id) {
        await fetch(`/api/admin/users/${u.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(u),
        });
      } else {
        await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(u),
        });
      }
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteUser(id: number) {
    if (!confirm("¿Eliminar este colaborador?")) return;
    try {
      await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
    setOpenMenu(null);
  }

  async function toggleActive(id: number) {
    const u = users.find((x) => x.id === id);
    if (!u) return;
    try {
      await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...u, active: !u.active }),
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
    setOpenMenu(null);
  }
  const handleLogout = () => {};

  const stats = [
    { label: "Total personal", value: users.length, color: "#e85d04" },
    {
      label: "Activos",
      value: users.filter((u) => u.active).length,
      color: "#059669",
    },
    {
      label: "Inactivos",
      value: users.filter((u) => !u.active).length,
      color: "#dc2626",
    },
    {
      label: "Roles activos",
      value: new Set(users.filter((u) => u.active).map((u) => u.role)).size,
      color: "#7c3aed",
    },
  ];

  const shiftColor: Record<string, { bg: string; color: string }> = {
    mañana: { bg: "#fff7ed", color: "#d97706" },
    tarde: { bg: "#eff6ff", color: "#2563eb" },
    noche: { bg: "#faf5ff", color: "#7c3aed" },
    completo: { bg: "#f0fdf4", color: "#059669" },
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: T.fontB,
        background: T.bg,
        color: T.text,
      }}
      onClick={() => setOpenMenu(null)}
    >
        <AdminSidebar activePage="users" user={user} onLogout={handleLogout} />

        {/* ── MAIN ── */}
        <main style={{ flex: 1, marginLeft: 260, padding: "40px 48px" }}>
          {/* Header */}
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 36,
            }}
          >
            <div>
              <h1
                style={{
                  fontFamily: T.fontD,
                  fontWeight: 900,
                  fontSize: 32,
                  letterSpacing: "-.03em",
                  lineHeight: 1.1,
                  margin: "0 0 6px",
                  color: T.text,
                }}
              >
                Gestión de Personal
              </h1>
              <p style={{ fontSize: 14, color: T.textMut, margin: 0 }}>
                Datos laborales y niveles de acceso del equipo operativo
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <button
                style={{
                  padding: 8,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: T.textSec,
                  position: "relative",
                }}
              >
                <Bell size={20} />
                <span
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: T.brand,
                    border: `2px solid ${T.bg}`,
                  }}
                />
              </button>
              <div style={{ width: 1, height: 28, background: T.border }} />
              <button
                onClick={() => setModal("new")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 18px",
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  color: "#fff",
                  background: T.brand,
                  boxShadow: "0 4px 12px rgba(232,93,4,.28)",
                }}
              >
                <Plus size={15} /> Nuevo colaborador
              </button>
            </div>
          </header>

          {/* Stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 16,
              marginBottom: 28,
            }}
          >
            {stats.map((s) => (
              <div
                key={s.label}
                style={{
                  background: T.surface,
                  borderRadius: 20,
                  border: `1px solid ${T.border}`,
                  padding: "18px 20px",
                  boxShadow: T.shadow,
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 3,
                    borderRadius: 99,
                    background: s.color,
                    marginBottom: 14,
                  }}
                />
                <p
                  style={{
                    fontFamily: T.fontD,
                    fontSize: 28,
                    fontWeight: 900,
                    color: s.color,
                    margin: "0 0 4px",
                    letterSpacing: "-.03em",
                  }}
                >
                  {s.value}
                </p>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: T.text,
                    margin: 0,
                  }}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* Role distribution */}
          <div
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 28,
              flexWrap: "wrap",
            }}
          >
            {Object.entries(ROLES).map(([key, r]) => {
              const count = users.filter((u) => u.role === key).length;
              if (!count) return null;
              return (
                <div
                  key={key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 14px",
                    borderRadius: 12,
                    background: r.bg,
                    border: `1px solid ${r.color}30`,
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: r.color,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{ fontSize: 12, fontWeight: 700, color: r.color }}
                  >
                    {r.label}
                  </span>
                  <span
                    style={{ fontSize: 12, fontWeight: 900, color: r.color }}
                  >
                    {count}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Filters */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 24,
            }}
          >
            <div style={{ position: "relative", flex: 1, maxWidth: 300 }}>
              <Search
                size={15}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: T.textMut,
                  pointerEvents: "none",
                }}
              />
              <input
                type="text"
                placeholder="Buscar por nombre, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchFocus(true)}
                onBlur={() => setSearchFocus(false)}
                style={{
                  width: "100%",
                  paddingLeft: 36,
                  paddingRight: 14,
                  paddingTop: 9,
                  paddingBottom: 9,
                  borderRadius: 11,
                  fontSize: 13,
                  fontFamily: T.fontB,
                  color: T.text,
                  background: T.surface,
                  outline: "none",
                  transition: "all .15s",
                  boxSizing: "border-box",
                  border: `1px solid ${searchFocus ? T.brand : T.border}`,
                  boxShadow: searchFocus
                    ? "0 0 0 3px rgba(232,93,4,.10)"
                    : "none",
                }}
              />
            </div>

            {/* Role filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                padding: "9px 14px",
                borderRadius: 11,
                fontSize: 13,
                fontWeight: 600,
                border: `1px solid ${T.border}`,
                background: T.surface,
                color: T.textSec,
                fontFamily: T.fontB,
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="all">Todos los roles</option>
              {Object.entries(ROLES).map(([k, r]) => (
                <option key={k} value={k}>
                  {r.label}
                </option>
              ))}
            </select>

            {/* Status filter */}
            <div
              style={{
                display: "flex",
                gap: 4,
                padding: 4,
                borderRadius: 11,
                background: T.elevated,
                border: `1px solid ${T.border}`,
              }}
            >
              {[
                { k: "all", l: "Todos" },
                { k: "active", l: "Activos" },
                { k: "inactive", l: "Inactivos" },
              ].map((o) => (
                <button
                  key={o.k}
                  onClick={() => setStatusFilter(o.k as any)}
                  style={{
                    padding: "5px 14px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    transition: "all .15s",
                    background:
                      statusFilter === o.k ? T.surface : "transparent",
                    color: statusFilter === o.k ? T.text : T.textMut,
                    boxShadow:
                      statusFilter === o.k
                        ? "0 1px 4px rgba(26,18,8,0.1)"
                        : "none",
                  }}
                >
                  {o.l}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div
            style={{
              background: T.surface,
              borderRadius: 24,
              border: `1px solid ${T.border}`,
              boxShadow: T.shadow,
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    borderBottom: `1px solid ${T.border}`,
                    background: T.elevated,
                  }}
                >
                  {[
                    "Colaborador",
                    "Rol",
                    "Turno",
                    "Contacto",
                    "Accesos",
                    "Estado",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 18px",
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: ".13em",
                        textTransform: "uppercase",
                        color: T.textMut,
                        textAlign: "left",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        padding: "40px",
                        textAlign: "center",
                        color: T.textMut,
                        fontSize: 14,
                      }}
                    >
                      No se encontraron colaboradores
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => {
                    const permsCount = effectivePerms(u).length;
                    const sc = shiftColor[u.shift];
                    return (
                      <tr
                        key={u.id}
                        style={{
                          borderBottom: `1px solid ${T.border}`,
                          transition: "background .15s",
                          cursor: "default",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = T.elevated)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        {/* Avatar + name */}
                        <td style={{ padding: "14px 18px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <div
                              style={{
                                width: 38,
                                height: 38,
                                borderRadius: 12,
                                flexShrink: 0,
                                background: `${ROLES[u.role].color}20`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 13,
                                fontWeight: 900,
                                color: ROLES[u.role].color,
                              }}
                            >
                              {initials(u)}
                            </div>
                            <div>
                              <p
                                style={{
                                  fontSize: 13,
                                  fontWeight: 700,
                                  color: T.text,
                                  margin: 0,
                                }}
                              >
                                {u.name} {u.lastname}
                              </p>
                              <p
                                style={{
                                  fontSize: 11,
                                  color: T.textMut,
                                  margin: "2px 0 0",
                                }}
                              >
                                Desde{" "}
                                {new Date(u.hireDate).toLocaleDateString(
                                  "es-MX",
                                  { month: "short", year: "numeric" },
                                )}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td style={{ padding: "14px 18px" }}>
                          <RoleBadge role={u.role} />
                        </td>

                        {/* Shift */}
                        <td style={{ padding: "14px 18px" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              padding: "4px 10px",
                              borderRadius: 99,
                              fontSize: 11,
                              fontWeight: 700,
                              color: sc.color,
                              background: sc.bg,
                            }}
                          >
                            <Clock size={10} />{" "}
                            {u.shift.charAt(0).toUpperCase() + u.shift.slice(1)}
                          </span>
                        </td>

                        {/* Contact */}
                        <td style={{ padding: "14px 18px" }}>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 3,
                            }}
                          >
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                                fontSize: 12,
                                color: T.textSec,
                              }}
                            >
                              <Mail size={11} style={{ color: T.textMut }} />
                              {u.email}
                            </span>
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                                fontSize: 12,
                                color: T.textSec,
                              }}
                            >
                              <Phone size={11} style={{ color: T.textMut }} />
                              {u.phone}
                            </span>
                          </div>
                        </td>

                        {/* Perms */}
                        <td style={{ padding: "14px 18px" }}>
                          <button
                            onClick={() => setDrawer(u)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 5,
                              padding: "5px 10px",
                              borderRadius: 9,
                              fontSize: 11,
                              fontWeight: 700,
                              border: "none",
                              cursor: "pointer",
                              background: `${ROLES[u.role].color}15`,
                              color: ROLES[u.role].color,
                              transition: "all .15s",
                            }}
                          >
                            <Lock size={11} /> {permsCount} módulos
                          </button>
                        </td>

                        {/* Status */}
                        <td style={{ padding: "14px 18px" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              padding: "4px 10px",
                              borderRadius: 99,
                              fontSize: 11,
                              fontWeight: 800,
                              background: u.active ? "#ecfdf5" : "#fef2f2",
                              color: u.active ? "#059669" : "#dc2626",
                            }}
                          >
                            {u.active ? (
                              <UserCheck size={11} />
                            ) : (
                              <UserX size={11} />
                            )}
                            {u.active ? "Activo" : "Inactivo"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: "14px 18px" }}>
                          <div
                            style={{ position: "relative" }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() =>
                                setOpenMenu(openMenu === u.id ? null : u.id)
                              }
                              style={{
                                padding: 6,
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                borderRadius: 8,
                                display: "flex",
                                color: T.textMut,
                              }}
                            >
                              <MoreVertical size={16} />
                            </button>
                            {openMenu === u.id && (
                              <div
                                style={{
                                  position: "absolute",
                                  right: 0,
                                  top: "100%",
                                  zIndex: 10,
                                  background: T.surface,
                                  borderRadius: 12,
                                  border: `1px solid ${T.border}`,
                                  boxShadow: T.shadowHov,
                                  minWidth: 160,
                                  overflow: "hidden",
                                }}
                              >
                                {[
                                  {
                                    icon: <Pencil size={13} />,
                                    label: "Editar",
                                    action: () => {
                                      setModal(u);
                                      setOpenMenu(null);
                                    },
                                  },
                                  {
                                    icon: <Shield size={13} />,
                                    label: "Ver accesos",
                                    action: () => {
                                      setDrawer(u);
                                      setOpenMenu(null);
                                    },
                                  },
                                  {
                                    icon: u.active ? (
                                      <UserX size={13} />
                                    ) : (
                                      <UserCheck size={13} />
                                    ),
                                    label: u.active ? "Desactivar" : "Activar",
                                    action: () => toggleActive(u.id),
                                  },
                                  {
                                    icon: <Trash2 size={13} />,
                                    label: "Eliminar",
                                    action: () => deleteUser(u.id),
                                    danger: true,
                                  },
                                ].map((item, i) => (
                                  <button
                                    key={i}
                                    onClick={item.action}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 8,
                                      width: "100%",
                                      padding: "10px 14px",
                                      fontSize: 13,
                                      fontWeight: 600,
                                      border: "none",
                                      cursor: "pointer",
                                      background: "none",
                                      color: (item as any).danger
                                        ? "#dc2626"
                                        : T.textSec,
                                      textAlign: "left",
                                    }}
                                    onMouseEnter={(e) =>
                                      (e.currentTarget.style.background =
                                        T.elevated)
                                    }
                                    onMouseLeave={(e) =>
                                      (e.currentTarget.style.background =
                                        "none")
                                    }
                                  >
                                    {item.icon}
                                    {item.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer info */}
          <p
            style={{
              fontSize: 12,
              color: T.textMut,
              marginTop: 14,
              textAlign: "right",
            }}
          >
            Mostrando {filtered.length} de {users.length} colaboradores
          </p>
        </main>

      {/* Modal */}
      {modal !== null && (
        <UserModal
          user={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSave={saveUser}
        />
      )}

      {/* Access Drawer */}
      {drawer && <AccessDrawer user={drawer} onClose={() => setDrawer(null)} />}
    </div>
  );
}
