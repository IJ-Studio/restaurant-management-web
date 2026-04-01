"use client";

export const ROLES: Record<
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

export const ALL_PERMS = [
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

export interface StaffUser {
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
  customPerms: string[];
  revokedPerms: string[];
  avatarInitials?: string;
}

export const MOCK_USERS: StaffUser[] = [
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

export const SHIFTS = ["mañana", "tarde", "noche", "completo"] as const;

export function initials(u: StaffUser) {
  return (u.name[0] + u.lastname[0]).toUpperCase();
}

export function effectivePerms(u: StaffUser) {
  const base = ROLES[u.role].perms;
  return [...new Set([...base, ...u.customPerms])].filter(
    (p) => !u.revokedPerms.includes(p)
  );
}
