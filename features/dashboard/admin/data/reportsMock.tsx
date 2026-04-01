"use client";

import React from "react";

export interface SalesData {
  day?: string;
  mes?: string;
  ventas?: number;
  pedidos?: number;
  total?: number;
}

export interface ProductMetric {
  name: string;
  ventas: number;
  ingreso: number;
  trend: number;
}

export interface StaffMetric {
  name: string;
  pedidos: number;
  propinas: number;
  satisfaccion: number;
  rol: string;
}

export interface PaymentDist {
  method: string;
  pct: number;
  amount: number;
  color: string;
}

export const WEEKLY_SALES: SalesData[] = [
  { day: "Lun", ventas: 4250, pedidos: 18 },
  { day: "Mar", ventas: 3800, pedidos: 15 },
  { day: "Mié", ventas: 5100, pedidos: 22 },
  { day: "Jue", ventas: 4700, pedidos: 20 },
  { day: "Vie", ventas: 7200, pedidos: 31 },
  { day: "Sáb", ventas: 9400, pedidos: 40 },
  { day: "Dom", ventas: 8600, pedidos: 37 },
];

export const MONTHLY_TREND: SalesData[] = [
  { mes: "Sep", total: 142000 },
  { mes: "Oct", total: 158000 },
  { mes: "Nov", total: 134000 },
  { mes: "Dic", total: 195000 },
  { mes: "Ene", total: 121000 },
  { mes: "Feb", total: 148000 },
  { mes: "Mar", total: 67000 },
];

export const TOP_PRODUCTS: ProductMetric[] = [
  { name: "Filete de res al vino", ventas: 312, ingreso: 93600, trend: 8.2 },
  { name: "Paella valenciana", ventas: 278, ingreso: 83400, trend: 5.1 },
  { name: "Costillas BBQ", ventas: 241, ingreso: 60250, trend: -2.3 },
  { name: "Pizza española", ventas: 198, ingreso: 39600, trend: 12.4 },
  { name: "Crema de champiñones", ventas: 187, ingreso: 28050, trend: 3.7 },
  { name: "Tiramisú casero", ventas: 165, ingreso: 24750, trend: 18.1 },
];

export const STAFF_METRICS: StaffMetric[] = [
  { name: "Ana Reyes", pedidos: 312, propinas: 1840, satisfaccion: 4.8, rol: "Mesero" },
  { name: "Sofia Torres", pedidos: 287, propinas: 1620, satisfaccion: 4.7, rol: "Mesero" },
  { name: "Carlos Mendoza", pedidos: 0, propinas: 0, satisfaccion: 4.6, rol: "Cajero" },
  { name: "Luis García", pedidos: 198, propinas: 0, satisfaccion: 4.9, rol: "Cocina" },
];

export const PAYMENT_DIST: PaymentDist[] = [
  { method: "Efectivo", pct: 48, amount: 32640, color: "#059669" },
  { method: "Tarjeta", pct: 34, amount: 23120, color: "#2563eb" },
  { method: "Transferencia", pct: 18, amount: 12240, color: "#7c3aed" },
];

export const PERIOD_STATS = {
  semana: {
    ventas: 43050,
    pedidos: 183,
    ticket: 235.3,
    clientes: 412,
    growth: 8.4,
  },
  mes: {
    ventas: 148000,
    pedidos: 672,
    ticket: 220.2,
    clientes: 1580,
    growth: 3.1,
  },
  año: {
    ventas: 966000,
    pedidos: 4120,
    ticket: 234.5,
    clientes: 9800,
    growth: 12.7,
  },
};
