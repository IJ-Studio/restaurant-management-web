import React from "react";
import { Clock, CheckCircle2, XCircle } from "lucide-react";

export type InvStatus = "emitida" | "pagada" | "cancelada" | "pendiente";
export type PayMethod = "efectivo" | "tarjeta" | "transferencia";
export type CfdiUse = "G03" | "G01" | "P01" | "D10" | "S01";

export interface InvoiceItem {
  description: string;
  qty: number;
  unitPrice: number;
}
export interface Invoice {
  id: number;
  folio: string;
  series: string;
  clientName: string;
  clientRFC: string;
  clientEmail: string;
  cfdiUse: CfdiUse;
  payMethod: PayMethod;
  payForm: string;
  items: InvoiceItem[];
  subtotal: number;
  iva: number;
  total: number;
  status: InvStatus;
  issuedAt: string;
  paidAt?: string;
  orderRef?: string;
  notes?: string;
}

export const CFDI_USES: Record<CfdiUse, string> = {
  G03: "G03 – Gastos en general",
  G01: "G01 – Adquisición de mercancias",
  P01: "P01 – Por definir",
  D10: "D10 – Pagos por servicios educativos",
  S01: "S01 – Sin efectos fiscales",
};
export const PAY_FORMS = [
  "01 – Efectivo",
  "02 – Cheque nominativo",
  "03 – Transferencia",
  "04 – Tarjeta de crédito",
  "28 – Tarjeta de débito",
];

export const STATUS_CFG: Record<
  InvStatus,
  { label: string; colorClass: string; bgClass: string; icon: React.ReactNode }
> = {
  emitida: {
    label: "Emitida",
    colorClass: "text-blue-600",
    bgClass: "bg-blue-50 border-blue-200",
    icon: <Clock size={11} />,
  },
  pagada: {
    label: "Pagada",
    colorClass: "text-emerald-600",
    bgClass: "bg-emerald-50 border-emerald-200",
    icon: <CheckCircle2 size={11} />,
  },
  cancelada: {
    label: "Cancelada",
    colorClass: "text-red-600",
    bgClass: "bg-red-50 border-red-200",
    icon: <XCircle size={11} />,
  },
  pendiente: {
    label: "Pendiente",
    colorClass: "text-amber-600",
    bgClass: "bg-amber-50 border-amber-200",
    icon: <Clock size={11} />,
  },
};

export const PAY_CFG: Record<PayMethod, { label: string }> = {
  efectivo: { label: "Efectivo" },
  tarjeta: { label: "Tarjeta" },
  transferencia: { label: "Transferencia" },
};

export const MOCK_INVOICES: Invoice[] = [
  {
    id: 1,
    folio: "0001",
    series: "A",
    clientName: "Constructora Hidalgo S.A. de C.V.",
    clientRFC: "CHI910312AB3",
    clientEmail: "admin@constructorahidalgo.mx",
    cfdiUse: "G03",
    payMethod: "transferencia",
    payForm: "03 – Transferencia",
    items: [
      {
        description: "Servicio de banquete – evento corporativo",
        qty: 1,
        unitPrice: 12500,
      },
    ],
    subtotal: 12500,
    iva: 2000,
    total: 14500,
    status: "pagada",
    issuedAt: "2026-03-01",
    paidAt: "2026-03-01",
    orderRef: "EVT-012",
  },
  {
    id: 2,
    folio: "0002",
    series: "A",
    clientName: "Adriana Fuentes Morales",
    clientRFC: "FUMA850520HA1",
    clientEmail: "adriana@gmail.com",
    cfdiUse: "G03",
    payMethod: "tarjeta",
    payForm: "04 – Tarjeta de crédito",
    items: [
      {
        description: "Comida para 4 personas – Mesa 5",
        qty: 4,
        unitPrice: 285,
      },
      { description: "Vinos y bebidas", qty: 1, unitPrice: 680 },
    ],
    subtotal: 1820,
    iva: 291.2,
    total: 2111.2,
    status: "pagada",
    issuedAt: "2026-03-02",
    paidAt: "2026-03-02",
  },
  {
    id: 3,
    folio: "0003",
    series: "A",
    clientName: "Ferretería El Clavo S.A.",
    clientRFC: "FCL001108JK5",
    clientEmail: "contabilidad@ferreteria.mx",
    cfdiUse: "G03",
    payMethod: "efectivo",
    payForm: "01 – Efectivo",
    items: [
      {
        description: "Servicio de alimentos – almuerzo de trabajo",
        qty: 8,
        unitPrice: 220,
      },
    ],
    subtotal: 1760,
    iva: 281.6,
    total: 2041.6,
    status: "emitida",
    issuedAt: "2026-03-04",
    orderRef: "PED-089",
  },
  {
    id: 4,
    folio: "0004",
    series: "A",
    clientName: "Roberto Ávalos Cruz",
    clientRFC: "AACR770315PQ9",
    clientEmail: "roberto.avalos@empresa.mx",
    cfdiUse: "S01",
    payMethod: "efectivo",
    payForm: "01 – Efectivo",
    items: [
      { description: "Cena para 2 – menú degustación", qty: 2, unitPrice: 450 },
    ],
    subtotal: 900,
    iva: 144,
    total: 1044,
    status: "pendiente",
    issuedAt: "2026-03-04",
  },
  {
    id: 5,
    folio: "0005",
    series: "A",
    clientName: "Sin nombre (cancelada)",
    clientRFC: "XAXX010101000",
    clientEmail: "",
    cfdiUse: "S01",
    payMethod: "efectivo",
    payForm: "01 – Efectivo",
    items: [{ description: "Consumo cancelado", qty: 1, unitPrice: 350 }],
    subtotal: 350,
    iva: 56,
    total: 406,
    status: "cancelada",
    issuedAt: "2026-03-03",
    notes: "Cliente solicitó cancelación por error en datos.",
  },
];
