"use client";

import React from "react";

export type Category =
  | "carnes"
  | "vegetales"
  | "lacteos"
  | "bebidas"
  | "granos"
  | "condimentos"
  | "utensilios";

export type Unit = "kg" | "g" | "l" | "ml" | "pza" | "caja" | "bolsa";

export interface Product {
  id: number;
  name: string;
  sku: string;
  category: Category;
  unit: Unit;
  stock: number;
  minStock: number;
  maxStock: number;
  costPerUnit: number;
  supplier: string;
  lastUpdated: string;
  active: boolean;
}

export interface Merma {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unit: Unit;
  reason: "caducidad" | "accidente" | "calidad" | "coccion" | "otro";
  justification: string;
  reportedBy: string;
  date: string;
  cost: number;
}

export const CATEGORIES: Record<
  Category,
  { label: string; icon: string; colorClass: string; bgClass: string }
> = {
  carnes: { label: "Carnes", icon: "🥩", colorClass: "text-red-600", bgClass: "bg-red-50" },
  vegetales: { label: "Vegetales", icon: "🥬", colorClass: "text-emerald-600", bgClass: "bg-emerald-50" },
  lacteos: { label: "Lácteos", icon: "🧀", colorClass: "text-amber-600", bgClass: "bg-amber-50" },
  bebidas: { label: "Bebidas", icon: "🥤", colorClass: "text-sky-600", bgClass: "bg-sky-50" },
  granos: { label: "Granos", icon: "🌾", colorClass: "text-orange-800", bgClass: "bg-orange-50" },
  condimentos: { label: "Condimentos", icon: "🧂", colorClass: "text-violet-600", bgClass: "bg-violet-50" },
  utensilios: { label: "Utensilios", icon: "🍴", colorClass: "text-slate-600", bgClass: "bg-slate-50" },
};

export const MERMA_REASONS: Record<
  Merma["reason"],
  { label: string; colorClass: string; bgClass: string }
> = {
  caducidad: { label: "Caducidad", colorClass: "text-red-600", bgClass: "bg-red-50" },
  accidente: { label: "Accidente", colorClass: "text-amber-600", bgClass: "bg-amber-50" },
  calidad: { label: "Baja calidad", colorClass: "text-violet-600", bgClass: "bg-violet-50" },
  coccion: { label: "Merma cocción", colorClass: "text-sky-600", bgClass: "bg-sky-50" },
  otro: { label: "Otro", colorClass: "text-slate-600", bgClass: "bg-slate-50" },
};

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Filete de res",
    sku: "CARN-001",
    category: "carnes",
    unit: "kg",
    stock: 12,
    minStock: 5,
    maxStock: 30,
    costPerUnit: 280,
    supplier: "Carnicería El Sol",
    lastUpdated: "2026-03-03",
    active: true,
  },
  {
    id: 2,
    name: "Pollo entero",
    sku: "CARN-002",
    category: "carnes",
    unit: "kg",
    stock: 3,
    minStock: 8,
    maxStock: 40,
    costPerUnit: 95,
    supplier: "Carnicería El Sol",
    lastUpdated: "2026-03-03",
    active: true,
  },
  {
    id: 3,
    name: "Tomate bola",
    sku: "VEG-001",
    category: "vegetales",
    unit: "kg",
    stock: 18,
    minStock: 5,
    maxStock: 20,
    costPerUnit: 22,
    supplier: "Mercado Central",
    lastUpdated: "2026-03-02",
    active: true,
  },
  {
    id: 4,
    name: "Cebolla blanca",
    sku: "VEG-002",
    category: "vegetales",
    unit: "kg",
    stock: 4,
    minStock: 5,
    maxStock: 15,
    costPerUnit: 18,
    supplier: "Mercado Central",
    lastUpdated: "2026-03-02",
    active: true,
  },
  {
    id: 5,
    name: "Queso manchego",
    sku: "LACT-001",
    category: "lacteos",
    unit: "kg",
    stock: 6,
    minStock: 3,
    maxStock: 12,
    costPerUnit: 180,
    supplier: "Lácteos del Norte",
    lastUpdated: "2026-03-01",
    active: true,
  },
  {
    id: 6,
    name: "Crema ácida",
    sku: "LACT-002",
    category: "lacteos",
    unit: "l",
    stock: 8,
    minStock: 4,
    maxStock: 16,
    costPerUnit: 45,
    supplier: "Lácteos del Norte",
    lastUpdated: "2026-03-01",
    active: true,
  },
  {
    id: 7,
    name: "Agua mineral",
    sku: "BEB-001",
    category: "bebidas",
    unit: "caja",
    stock: 24,
    minStock: 10,
    maxStock: 60,
    costPerUnit: 120,
    supplier: "Distribuidora Pureza",
    lastUpdated: "2026-03-03",
    active: true,
  },
  {
    id: 8,
    name: "Refresco cola 355ml",
    sku: "BEB-002",
    category: "bebidas",
    unit: "caja",
    stock: 8,
    minStock: 12,
    maxStock: 48,
    costPerUnit: 240,
    supplier: "Distribuidora Pureza",
    lastUpdated: "2026-03-02",
    active: true,
  },
  {
    id: 9,
    name: "Arroz extra largo",
    sku: "GRAN-001",
    category: "granos",
    unit: "kg",
    stock: 22,
    minStock: 10,
    maxStock: 50,
    costPerUnit: 28,
    supplier: "Mayorista HJL",
    lastUpdated: "2026-02-28",
    active: true,
  },
  {
    id: 10,
    name: "Frijol negro",
    sku: "GRAN-002",
    category: "granos",
    unit: "kg",
    stock: 15,
    minStock: 8,
    maxStock: 40,
    costPerUnit: 32,
    supplier: "Mayorista HJL",
    lastUpdated: "2026-02-28",
    active: true,
  },
  {
    id: 11,
    name: "Aceite de oliva",
    sku: "COND-001",
    category: "condimentos",
    unit: "l",
    stock: 5,
    minStock: 2,
    maxStock: 10,
    costPerUnit: 185,
    supplier: "Mayorista HJL",
    lastUpdated: "2026-03-01",
    active: true,
  },
  {
    id: 12,
    name: "Chipotle en adobo",
    sku: "COND-002",
    category: "condimentos",
    unit: "pza",
    stock: 2,
    minStock: 5,
    maxStock: 20,
    costPerUnit: 35,
    supplier: "Mayorista HJL",
    lastUpdated: "2026-02-25",
    active: false,
  },
];

export const MOCK_MERMAS: Merma[] = [
  {
    id: 1,
    productId: 1,
    productName: "Filete de res",
    quantity: 0.8,
    unit: "kg",
    reason: "caducidad",
    justification: "Quedó fuera de refrigeración durante el corte de luz del martes.",
    reportedBy: "Luis García",
    date: "2026-03-01",
    cost: 224,
  },
  {
    id: 2,
    productId: 3,
    productName: "Tomate bola",
    quantity: 3,
    unit: "kg",
    reason: "calidad",
    justification: "Llegaron con moho del proveedor, se rechazaron 3kg de la entrega.",
    reportedBy: "Ana Reyes",
    date: "2026-03-02",
    cost: 66,
  },
  {
    id: 3,
    productId: 5,
    productName: "Queso manchego",
    quantity: 0.5,
    unit: "kg",
    reason: "accidente",
    justification: "Caída del refrigerador durante limpieza profunda.",
    reportedBy: "Carlos Mendoza",
    date: "2026-03-03",
    cost: 90,
  },
  {
    id: 4,
    productId: 9,
    productName: "Arroz extra largo",
    quantity: 2,
    unit: "kg",
    reason: "coccion",
    justification: "Merma normal del proceso de cocción y colado.",
    reportedBy: "Luis García",
    date: "2026-03-03",
    cost: 56,
  },
];

export function getStockStatus(p: Product): "ok" | "low" | "critical" | "over" {
  if (p.stock <= 0) return "critical";
  if (p.stock < p.minStock) return p.stock < p.minStock * 0.5 ? "critical" : "low";
  if (p.stock > p.maxStock) return "over";
  return "ok";
}

export const STOCK_STATUS_CONFIG = {
  ok: { label: "OK", colorClass: "text-emerald-600", bgClass: "bg-emerald-50", barClass: "bg-emerald-500" },
  low: { label: "Bajo", colorClass: "text-amber-600", bgClass: "bg-amber-50", barClass: "bg-amber-500" },
  critical: { label: "Crítico", colorClass: "text-red-600", bgClass: "bg-red-50", barClass: "bg-red-500" },
  over: { label: "Exceso", colorClass: "text-sky-600", bgClass: "bg-sky-50", barClass: "bg-sky-500" },
};
