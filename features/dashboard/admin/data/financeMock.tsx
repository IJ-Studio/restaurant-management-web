import React from "react";
import { Banknote, CreditCard, Smartphone } from "lucide-react";

export type MvType = "ingreso" | "egreso";
export type PayMethod = "efectivo" | "tarjeta" | "transferencia";

export interface CashMovement {
  id: number;
  type: MvType;
  concept: string;
  category: string;
  amount: number;
  payMethod: PayMethod;
  responsible: string;
  date: string;
  time: string;
  notes?: string;
}

export interface CashSession {
  id: number;
  date: string;
  openedAt: string;
  closedAt?: string;
  openingBalance: number;
  expectedBalance: number;
  countedBalance?: number;
  difference?: number;
  status: "abierta" | "cerrada" | "pendiente";
  closedBy?: string;
  movements: number;
}

export interface Tip {
  id: number;
  waiter: string;
  tableRef: string;
  amount: number;
  payMethod: PayMethod;
  date: string;
  distributed: boolean;
}

export const INGRESO_CATS = [
  "Venta en mesa",
  "Pedido domicilio",
  "Para llevar",
  "Evento privado",
  "Otro ingreso",
];

export const EGRESO_CATS = [
  "Insumos cocina",
  "Limpieza",
  "Mantenimiento",
  "Transporte",
  "Papelería",
  "Otro gasto",
];

export const PAY_ICONS: Record<PayMethod, React.ReactNode> = {
  efectivo: <Banknote size={13} />,
  tarjeta: <CreditCard size={13} />,
  transferencia: <Smartphone size={13} />,
};

export const PAY_CFG: Record<PayMethod, { label: string; textClass: string; bgClass: string; borderClass: string; hex: string }> = {
  efectivo: { label: "Efectivo", textClass: "text-emerald-600", bgClass: "bg-emerald-50", borderClass: "border-emerald-600", hex: "#059669" },
  tarjeta: { label: "Tarjeta", textClass: "text-blue-600", bgClass: "bg-blue-50", borderClass: "border-blue-600", hex: "#2563eb" },
  transferencia: { label: "Transferencia", textClass: "text-purple-600", bgClass: "bg-purple-50", borderClass: "border-purple-600", hex: "#7c3aed" },
};

export const MOCK_MOVEMENTS: CashMovement[] = [
  {
    id: 1,
    type: "ingreso",
    concept: "Venta turno comida",
    category: "Venta en mesa",
    amount: 4250,
    payMethod: "efectivo",
    responsible: "Carlos M.",
    date: "2026-03-04",
    time: "15:30",
  },
  {
    id: 2,
    type: "ingreso",
    concept: "Venta pago tarjeta",
    category: "Venta en mesa",
    amount: 1890,
    payMethod: "tarjeta",
    responsible: "Carlos M.",
    date: "2026-03-04",
    time: "16:45",
  },
  {
    id: 3,
    type: "egreso",
    concept: "Compra chiles y limones",
    category: "Insumos cocina",
    amount: 320,
    payMethod: "efectivo",
    responsible: "Luis G.",
    date: "2026-03-04",
    time: "14:10",
    notes: "Mercado Central urgente por falta stock.",
  },
  {
    id: 4,
    type: "egreso",
    concept: "Papel higienico y jabón",
    category: "Limpieza",
    amount: 180,
    payMethod: "efectivo",
    responsible: "Ana R.",
    date: "2026-03-04",
    time: "13:05",
  },
  {
    id: 5,
    type: "ingreso",
    concept: "Transferencia evento",
    category: "Evento privado",
    amount: 8500,
    payMethod: "transferencia",
    responsible: "Carlos M.",
    date: "2026-03-03",
    time: "11:00",
  },
  {
    id: 6,
    type: "egreso",
    concept: "Reparación refrigerador",
    category: "Mantenimiento",
    amount: 950,
    payMethod: "efectivo",
    responsible: "Admin",
    date: "2026-03-03",
    time: "17:30",
  },
  {
    id: 7,
    type: "ingreso",
    concept: "Venta noche",
    category: "Venta en mesa",
    amount: 6340,
    payMethod: "efectivo",
    responsible: "Carlos M.",
    date: "2026-03-03",
    time: "22:45",
  },
  {
    id: 8,
    type: "egreso",
    concept: "Bolsas y servilletas",
    category: "Papelería",
    amount: 95,
    payMethod: "efectivo",
    responsible: "Ana R.",
    date: "2026-03-02",
    time: "12:00",
  },
];

export const MOCK_SESSIONS: CashSession[] = [
  {
    id: 1,
    date: "2026-03-04",
    openedAt: "12:00",
    openingBalance: 1500,
    expectedBalance: 7120,
    status: "abierta",
    movements: 4,
  },
  {
    id: 2,
    date: "2026-03-03",
    openedAt: "12:00",
    closedAt: "23:30",
    openingBalance: 1500,
    expectedBalance: 14390,
    countedBalance: 14350,
    difference: -40,
    status: "cerrada",
    closedBy: "Carlos M.",
    movements: 3,
  },
  {
    id: 3,
    date: "2026-03-02",
    openedAt: "12:00",
    closedAt: "23:15",
    openingBalance: 1500,
    expectedBalance: 9875,
    countedBalance: 9875,
    difference: 0,
    status: "cerrada",
    closedBy: "Carlos M.",
    movements: 6,
  },
];

export const MOCK_TIPS: Tip[] = [
  {
    id: 1,
    waiter: "Ana Reyes",
    tableRef: "Mesa 4",
    amount: 80,
    payMethod: "efectivo",
    date: "2026-03-04",
    distributed: false,
  },
  {
    id: 2,
    waiter: "Sofia Torres",
    tableRef: "Mesa 7",
    amount: 120,
    payMethod: "tarjeta",
    date: "2026-03-04",
    distributed: false,
  },
  {
    id: 3,
    waiter: "Ana Reyes",
    tableRef: "Mesa 2",
    amount: 50,
    payMethod: "efectivo",
    date: "2026-03-04",
    distributed: false,
  },
  {
    id: 4,
    waiter: "Ana Reyes",
    tableRef: "Mesa 5",
    amount: 200,
    payMethod: "transferencia",
    date: "2026-03-03",
    distributed: true,
  },
  {
    id: 5,
    waiter: "Sofia Torres",
    tableRef: "Mesa 1",
    amount: 150,
    payMethod: "efectivo",
    date: "2026-03-03",
    distributed: true,
  },
  {
    id: 6,
    waiter: "Carlos Mendoza",
    tableRef: "Mesa 8",
    amount: 100,
    payMethod: "tarjeta",
    date: "2026-03-03",
    distributed: true,
  },
];
