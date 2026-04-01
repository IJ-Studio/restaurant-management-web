"use client";

export interface Backup {
  id: number;
  name: string;
  sizeBytes: number;
  driveUrl?: string;
  type: "auto" | "manual";
  status: "ok" | "error";
  createdAt: string;
}

export interface Gateway {
  id: number;
  name: string;
  logo: string;
  status: "activo" | "inactivo" | "prueba";
  apiKey: string;
  commission: number;
  methods: string[];
}

export const GATEWAYS_DEFAULT: Gateway[] = [
  {
    id: 1,
    name: "Stripe",
    logo: "💳",
    status: "activo",
    apiKey: "sk_live_••••••••••••••2H4k",
    commission: 2.9,
    methods: ["Visa", "Mastercard", "AMEX"],
  },
  {
    id: 2,
    name: "Conekta",
    logo: "🏦",
    status: "activo",
    apiKey: "key_••••••••••••••bX9p",
    commission: 2.5,
    methods: ["Visa", "Mastercard", "OXXO Pay"],
  },
  {
    id: 3,
    name: "Mercado Pago",
    logo: "🟣",
    status: "inactivo",
    apiKey: "APP_USR-••••••••••••",
    commission: 3.3,
    methods: ["Tarjeta", "Transferencia", "QR"],
  },
  {
    id: 4,
    name: "Clip",
    logo: "📱",
    status: "prueba",
    apiKey: "clip_test_••••••",
    commission: 3.6,
    methods: ["Visa", "Mastercard"],
  },
];

export const STATUS_CFG: Record<
  string,
  { label: string; colorClass: string; bgClass: string }
> = {
  activo: { 
    label: "Activo", 
    colorClass: "text-emerald-600", 
    bgClass: "bg-emerald-50 border-emerald-100" 
  },
  inactivo: { 
    label: "Inactivo", 
    colorClass: "text-text-muted", 
    bgClass: "bg-surface-alt border-border" 
  },
  prueba: { 
    label: "Prueba", 
    colorClass: "text-amber-600", 
    bgClass: "bg-amber-50 border-amber-100" 
  },
};
