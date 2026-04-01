import React from "react";
import { FileText, Truck, CheckCircle2, X } from "lucide-react";

export interface Supplier {
  id: number;
  name: string;
  contact: string;
  email: string;
  phone: string;
  website?: string;
  category: string;
  products: string[];
  paymentTerms: string;
  deliveryDays: number;
  active: boolean;
  notes?: string;
}

export type OrderStatus =
  | "borrador"
  | "enviada"
  | "confirmada"
  | "en_camino"
  | "recibida"
  | "cancelada";

export interface OrderItem {
  productName: string;
  quantity: number;
  unit: string;
  unitCost: number;
}

export interface PurchaseOrder {
  id: number;
  folio: string;
  supplierId: number;
  supplierName: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  createdAt: string;
  expectedAt: string;
  receivedAt?: string;
  notes?: string;
}

export const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: 1,
    name: "Carnicería El Sol",
    contact: "Roberto Martínez",
    email: "elsol@carnicerias.mx",
    phone: "771-111-2233",
    category: "Carnes y embutidos",
    products: ["Filete de res", "Pollo entero", "Costillas", "Chorizo"],
    paymentTerms: "Contado",
    deliveryDays: 1,
    active: true,
    notes: "Entrega de lunes a viernes antes de las 10am.",
  },
  {
    id: 2,
    name: "Mercado Central HJL",
    contact: "Doña Carmen López",
    email: "mercadocentral@hjl.mx",
    phone: "771-222-3344",
    category: "Frutas y verduras",
    products: ["Tomate", "Cebolla", "Chiles", "Hierbas frescas", "Limones"],
    paymentTerms: "Crédito 7 días",
    deliveryDays: 1,
    active: true,
  },
  {
    id: 3,
    name: "Lácteos del Norte",
    contact: "Ing. Pedraza",
    email: "ventas@lacteosnorte.mx",
    phone: "771-333-4455",
    website: "www.lacteosnorte.mx",
    category: "Lácteos",
    products: ["Queso manchego", "Crema ácida", "Mantequilla", "Leche entera"],
    paymentTerms: "Crédito 15 días",
    deliveryDays: 2,
    active: true,
  },
  {
    id: 4,
    name: "Distribuidora Pureza",
    contact: "Carlos Vega",
    email: "pureza@distribuidora.mx",
    phone: "771-444-5566",
    category: "Bebidas",
    products: ["Agua mineral", "Refrescos", "Jugos", "Cervezas"],
    paymentTerms: "Contado",
    deliveryDays: 2,
    active: true,
  },
  {
    id: 5,
    name: "Mayorista HJL",
    contact: "Lic. Fuentes",
    email: "mayorista@hjl.com",
    phone: "771-555-6677",
    website: "www.mayoristahujutla.com",
    category: "Abarrotes",
    products: ["Arroz", "Frijol", "Aceite", "Condimentos", "Especias", "Harinas"],
    paymentTerms: "Crédito 30 días",
    deliveryDays: 3,
    active: true,
  },
  {
    id: 6,
    name: "Proveedor Anterior S.A.",
    contact: "Sin contacto",
    email: "",
    phone: "",
    category: "Varios",
    products: ["Varios"],
    paymentTerms: "—",
    deliveryDays: 0,
    active: false,
  },
];

export const ORDER_STATUS: Record<
  OrderStatus,
  { label: string; textClass: string; bgClass: string; icon: React.ReactNode }
> = {
  borrador: {
    label: "Borrador",
    textClass: "text-slate-500",
    bgClass: "bg-slate-100",
    icon: <FileText size={12} />,
  },
  enviada: {
    label: "Enviada",
    textClass: "text-blue-600",
    bgClass: "bg-blue-50",
    icon: <Truck size={12} />,
  },
  confirmada: {
    label: "Confirmada",
    textClass: "text-amber-600",
    bgClass: "bg-amber-50",
    icon: <CheckCircle2 size={12} />,
  },
  en_camino: {
    label: "En camino",
    textClass: "text-purple-600",
    bgClass: "bg-purple-50",
    icon: <Truck size={12} />,
  },
  recibida: {
    label: "Recibida",
    textClass: "text-emerald-600",
    bgClass: "bg-emerald-50",
    icon: <CheckCircle2 size={12} />,
  },
  cancelada: {
    label: "Cancelada",
    textClass: "text-red-600",
    bgClass: "bg-red-50",
    icon: <X size={12} />,
  },
};

export const MOCK_ORDERS: PurchaseOrder[] = [
  {
    id: 1,
    folio: "OC-2026-001",
    supplierId: 1,
    supplierName: "Carnicería El Sol",
    status: "recibida",
    createdAt: "2026-02-28",
    expectedAt: "2026-03-01",
    receivedAt: "2026-03-01",
    total: 2800,
    notes: "Pedido semanal regular.",
    items: [{ productName: "Filete de res", quantity: 10, unit: "kg", unitCost: 280 }],
  },
  {
    id: 2,
    folio: "OC-2026-002",
    supplierId: 5,
    supplierName: "Mayorista HJL",
    status: "recibida",
    createdAt: "2026-02-28",
    expectedAt: "2026-03-02",
    receivedAt: "2026-03-02",
    total: 1560,
    items: [
      { productName: "Arroz extra largo", quantity: 20, unit: "kg", unitCost: 28 },
      { productName: "Frijol negro", quantity: 15, unit: "kg", unitCost: 32 },
      { productName: "Aceite de oliva", quantity: 5, unit: "l", unitCost: 185 },
      { productName: "Chipotle en adobo", quantity: 24, unit: "pza", unitCost: 35 },
    ],
  },
  {
    id: 3,
    folio: "OC-2026-003",
    supplierId: 1,
    supplierName: "Carnicería El Sol",
    status: "en_camino",
    createdAt: "2026-03-03",
    expectedAt: "2026-03-04",
    total: 3990,
    notes: "URGENTE: stock crítico de pollo.",
    items: [
      { productName: "Pollo entero", quantity: 30, unit: "kg", unitCost: 95 },
      { productName: "Filete de res", quantity: 8, unit: "kg", unitCost: 280 },
    ],
  },
  {
    id: 4,
    folio: "OC-2026-004",
    supplierId: 4,
    supplierName: "Distribuidora Pureza",
    status: "confirmada",
    createdAt: "2026-03-03",
    expectedAt: "2026-03-05",
    total: 2880,
    items: [{ productName: "Refresco cola 355ml", quantity: 12, unit: "caja", unitCost: 240 }],
  },
  {
    id: 5,
    folio: "OC-2026-005",
    supplierId: 2,
    supplierName: "Mercado Central HJL",
    status: "borrador",
    createdAt: "2026-03-04",
    expectedAt: "2026-03-05",
    total: 440,
    items: [
      { productName: "Tomate bola", quantity: 10, unit: "kg", unitCost: 22 },
      { productName: "Cebolla blanca", quantity: 10, unit: "kg", unitCost: 18 },
      { productName: "Chipotle en adobo", quantity: 6, unit: "pza", unitCost: 35 },
    ],
  },
];
