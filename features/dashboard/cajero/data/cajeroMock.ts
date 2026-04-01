import React from "react";
import { 
  Banknote, 
  CreditCard, 
  Smartphone 
} from "lucide-react";

export interface Ticket {
  id: string;
  mesa: string;
  items: number;
  total: number;
  estado: 'pendiente' | 'cobrado' | 'anulado';
  tiempo: string;
  cliente: string;
  cobradoAt?: string;
  metodoPago?: string;
}

export interface PaymentMethod {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export const MOCK_TICKETS: Ticket[] = [
  { id: '#9021', mesa: 'Mesa 4', items: 3, total: 48.50, estado: 'pendiente', tiempo: '5 min', cliente: 'Andrés M.' },
  { id: '#9019', mesa: 'Mesa 7', items: 2, total: 32.00, estado: 'pendiente', tiempo: '12 min', cliente: 'Sofía R.' },
  { id: '#9017', mesa: 'Barra 2', items: 5, total: 67.00, estado: 'pendiente', tiempo: '18 min', cliente: 'Carlos V.' },
  { id: '#9015', mesa: 'Mesa 1', items: 1, total: 14.50, estado: 'cobrado', tiempo: '25 min', cliente: 'Laura T.', cobradoAt: '12:30 PM', metodoPago: 'efectivo' },
  { id: '#9012', mesa: 'Mesa 9', items: 4, total: 55.00, estado: 'cobrado', tiempo: '40 min', cliente: 'Pedro G.', cobradoAt: '12:15 PM', metodoPago: 'tarjeta' },
  { id: '#9010', mesa: 'Terraza 1', items: 2, total: 29.00, estado: 'cobrado', tiempo: '52 min', cliente: 'Marta L.', cobradoAt: '12:00 PM', metodoPago: 'transferencia' },
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'efectivo', label: 'Efectivo', icon: React.createElement(Banknote, { size: 20 }) },
  { id: 'tarjeta', label: 'Tarjeta', icon: React.createElement(CreditCard, { size: 20 }) },
  { id: 'transferencia', label: 'Transfer.', icon: React.createElement(Smartphone, { size: 20 }) },
];

export const PAYMENT_STATS = [
  { label: 'Efectivo', pct: 55, color: 'bg-emerald-500' },
  { label: 'Tarjeta', pct: 35, color: 'bg-blue-500' },
  { label: 'Transferencia', pct: 10, color: 'bg-purple-500' },
];
