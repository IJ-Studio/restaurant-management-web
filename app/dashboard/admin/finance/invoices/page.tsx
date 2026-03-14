"use client";
import React, { useState } from "react";
import AdminSidebar from '@/components/admin/AdminSidebar';
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
  Plus,
  X,
  Search,
  FileText,
  DollarSign,
  Package,
  Download,
  Send,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronRight,
  ArrowLeft,
  Printer,
  MoreVertical,
  CreditCard,
  Banknote,
  Smartphone,
  User,
  Trash2,
} from "lucide-react";

const T = {
  brand: "#e85d04",
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
  ok: "#059669",
  warn: "#d97706",
  danger: "#dc2626",
  info: "#2563eb",
};

type InvStatus = "emitida" | "pagada" | "cancelada" | "pendiente";
type PayMethod = "efectivo" | "tarjeta" | "transferencia";
type CfdiUse = "G03" | "G01" | "P01" | "D10" | "S01";

interface InvoiceItem {
  description: string;
  qty: number;
  unitPrice: number;
}
interface Invoice {
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

const CFDI_USES: Record<CfdiUse, string> = {
  G03: "G03 – Gastos en general",
  G01: "G01 – Adquisición de mercancias",
  P01: "P01 – Por definir",
  D10: "D10 – Pagos por servicios educativos",
  S01: "S01 – Sin efectos fiscales",
};
const PAY_FORMS = [
  "01 – Efectivo",
  "02 – Cheque nominativo",
  "03 – Transferencia",
  "04 – Tarjeta de crédito",
  "28 – Tarjeta de débito",
];

const STATUS_CFG: Record<
  InvStatus,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  emitida: {
    label: "Emitida",
    color: T.info,
    bg: "#eff6ff",
    icon: <Clock size={11} />,
  },
  pagada: {
    label: "Pagada",
    color: T.ok,
    bg: "#ecfdf5",
    icon: <CheckCircle2 size={11} />,
  },
  cancelada: {
    label: "Cancelada",
    color: T.danger,
    bg: "#fef2f2",
    icon: <XCircle size={11} />,
  },
  pendiente: {
    label: "Pendiente",
    color: T.warn,
    bg: "#fffbeb",
    icon: <Clock size={11} />,
  },
};

const PAY_CFG: Record<PayMethod, { label: string; color: string; bg: string }> =
  {
    efectivo: { label: "Efectivo", color: T.ok, bg: "#ecfdf5" },
    tarjeta: { label: "Tarjeta", color: T.info, bg: "#eff6ff" },
    transferencia: { label: "Transferencia", color: "#7c3aed", bg: "#faf5ff" },
  };

const MOCK_INVOICES: Invoice[] = [
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

const inp: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  border: `1px solid ${T.borderMed}`,
  borderRadius: 10,
  fontSize: 13,
  color: T.text,
  background: T.surface,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: T.fontB,
};
const lbl: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  color: T.textSec,
  marginBottom: 5,
};
const fmt = (n: number) =>
  n.toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

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

// ─── Invoice Detail Drawer ────────────────────────────────────────────────────
function InvoiceDrawer({
  inv,
  onClose,
  onStatusChange,
}: {
  inv: Invoice;
  onClose: () => void;
  onStatusChange: (id: number, s: InvStatus) => void;
}) {
  const sc = STATUS_CFG[inv.status];
  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 90, display: "flex" }}
      onClick={onClose}
    >
      <div style={{ flex: 1, background: "rgba(26,18,8,0.3)" }} />
      <div
        style={{
          width: 440,
          background: T.surface,
          height: "100%",
          overflowY: "auto",
          boxShadow: "-8px 0 40px rgba(26,18,8,.12)",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "24px 24px 18px",
            borderBottom: `1px solid ${T.border}`,
            background: T.elevated,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 12,
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: T.textMut,
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  margin: "0 0 4px",
                }}
              >
                Factura
              </p>
              <h2
                style={{
                  fontFamily: T.fontD,
                  fontWeight: 900,
                  fontSize: 24,
                  color: T.text,
                  margin: "0 0 2px",
                }}
              >
                {inv.series}
                {inv.folio}
              </h2>
              <p style={{ fontSize: 12, color: T.textMut, margin: 0 }}>
                {inv.issuedAt}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                padding: 6,
                background: T.subtle,
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                display: "flex",
              }}
            >
              <X size={15} style={{ color: T.textSec }} />
            </button>
          </div>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "4px 12px",
              borderRadius: 99,
              fontSize: 12,
              fontWeight: 800,
              color: sc.color,
              background: sc.bg,
            }}
          >
            {sc.icon} {sc.label}
          </span>
        </div>

        <div
          style={{
            flex: 1,
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <div>
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: T.textMut,
                letterSpacing: ".12em",
                textTransform: "uppercase",
                margin: "0 0 10px",
              }}
            >
              Cliente
            </p>
            <div
              style={{
                background: T.elevated,
                borderRadius: 12,
                padding: "12px 14px",
              }}
            >
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: T.text,
                  margin: "0 0 4px",
                }}
              >
                {inv.clientName}
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: T.textSec,
                  margin: "0 0 2px",
                  fontFamily: "monospace",
                  fontWeight: 700,
                }}
              >
                RFC: {inv.clientRFC}
              </p>
              {inv.clientEmail && (
                <p style={{ fontSize: 12, color: T.textSec, margin: 0 }}>
                  {inv.clientEmail}
                </p>
              )}
            </div>
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
          >
            {[
              { l: "Uso CFDI", v: CFDI_USES[inv.cfdiUse] },
              { l: "Forma pago", v: inv.payForm },
              { l: "Método", v: PAY_CFG[inv.payMethod].label },
              { l: "Referencia", v: inv.orderRef || "—" },
            ].map((r) => (
              <div
                key={r.l}
                style={{
                  padding: "9px 11px",
                  background: T.elevated,
                  borderRadius: 10,
                }}
              >
                <p
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: T.textMut,
                    margin: "0 0 3px",
                    textTransform: "uppercase",
                    letterSpacing: ".1em",
                  }}
                >
                  {r.l}
                </p>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: T.text,
                    margin: 0,
                  }}
                >
                  {r.v}
                </p>
              </div>
            ))}
          </div>

          <div>
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: T.textMut,
                letterSpacing: ".12em",
                textTransform: "uppercase",
                margin: "0 0 10px",
              }}
            >
              Conceptos
            </p>
            <div
              style={{
                border: `1px solid ${T.border}`,
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: T.elevated }}>
                    {["Descripción", "Cant.", "P.Unit", "Importe"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "8px 12px",
                          fontSize: 10,
                          fontWeight: 700,
                          color: T.textMut,
                          textAlign: h === "Descripción" ? "left" : "right",
                          letterSpacing: ".1em",
                          textTransform: "uppercase",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {inv.items.map((item, i) => (
                    <tr key={i} style={{ borderTop: `1px solid ${T.border}` }}>
                      <td
                        style={{
                          padding: "10px 12px",
                          fontSize: 13,
                          color: T.text,
                        }}
                      >
                        {item.description}
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          fontSize: 13,
                          color: T.textSec,
                          textAlign: "right",
                        }}
                      >
                        {item.qty}
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          fontSize: 13,
                          color: T.textSec,
                          textAlign: "right",
                        }}
                      >
                        ${fmt(item.unitPrice)}
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          fontSize: 13,
                          fontWeight: 700,
                          color: T.text,
                          textAlign: "right",
                        }}
                      >
                        ${fmt(item.qty * item.unitPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div
            style={{
              background: T.elevated,
              borderRadius: 12,
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {[
              { l: "Subtotal", v: `$${fmt(inv.subtotal)}` },
              { l: "IVA (16%)", v: `$${fmt(inv.iva)}` },
            ].map((r) => (
              <div
                key={r.l}
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <span style={{ fontSize: 12, color: T.textSec }}>{r.l}</span>
                <span style={{ fontSize: 12, color: T.textSec }}>{r.v}</span>
              </div>
            ))}
            <div
              style={{
                borderTop: `1px solid ${T.border}`,
                paddingTop: 8,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 800, color: T.text }}>
                Total
              </span>
              <span
                style={{
                  fontFamily: T.fontD,
                  fontSize: 22,
                  fontWeight: 900,
                  color: T.brand,
                }}
              >
                ${fmt(inv.total)}
              </span>
            </div>
          </div>

          {inv.notes && (
            <div
              style={{
                padding: "10px 12px",
                background: "#fffbeb",
                borderRadius: 10,
                border: "1px solid #fde68a",
                fontSize: 12,
                color: T.warn,
              }}
            >
              <strong>Nota:</strong> {inv.notes}
            </div>
          )}

          {inv.status !== "cancelada" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: T.textMut,
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                Acciones
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { icon: <Download size={13} />, l: "PDF" },
                  { icon: <Send size={13} />, l: "Enviar" },
                  { icon: <Printer size={13} />, l: "Imprimir" },
                ].map((a) => (
                  <button
                    key={a.l}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 5,
                      padding: "9px",
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 700,
                      border: `1px solid ${T.border}`,
                      background: T.surface,
                      cursor: "pointer",
                      color: T.textSec,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = T.elevated)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = T.surface)
                    }
                  >
                    {a.icon}
                    {a.l}
                  </button>
                ))}
              </div>
              {inv.status === "emitida" && (
                <button
                  onClick={() => {
                    onStatusChange(inv.id, "pagada");
                    onClose();
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    padding: "10px",
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    background: T.ok,
                    color: "#fff",
                    boxShadow: "0 4px 12px rgba(5,150,105,.25)",
                  }}
                >
                  <CheckCircle2 size={14} /> Marcar como pagada
                </button>
              )}
              <button
                onClick={() => {
                  if (confirm("¿Cancelar esta factura?")) {
                    onStatusChange(inv.id, "cancelada");
                    onClose();
                  }
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                  padding: "8px",
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  border: `1px solid ${T.danger}30`,
                  background: "#fef2f2",
                  color: T.danger,
                }}
              >
                <XCircle size={12} /> Cancelar factura
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── New Invoice Modal ────────────────────────────────────────────────────────
function InvoiceModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (inv: Invoice) => void;
}) {
  const [form, setForm] = useState({
    clientName: "",
    clientRFC: "",
    clientEmail: "",
    cfdiUse: "G03" as CfdiUse,
    payMethod: "efectivo" as PayMethod,
    payForm: "01 – Efectivo",
    notes: "",
  });
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", qty: 1, unitPrice: 0 },
  ]);
  const subtotal = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const iva = subtotal * 0.16;
  const total = subtotal + iva;
  function updateItem(
    i: number,
    field: keyof InvoiceItem,
    val: string | number,
  ) {
    setItems((is) =>
      is.map((item, j) => (j !== i ? item : { ...item, [field]: val })),
    );
  }
  const valid = !!(
    form.clientName &&
    form.clientRFC &&
    items.every((i) => i.description && i.qty > 0 && i.unitPrice > 0)
  );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
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
          maxWidth: 680,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "22px 28px 18px",
            borderBottom: `1px solid ${T.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: T.fontD,
                fontWeight: 900,
                fontSize: 20,
                color: T.text,
                margin: "0 0 3px",
              }}
            >
              Nueva factura electrónica
            </h2>
            <p style={{ fontSize: 12, color: T.textMut, margin: 0 }}>
              CFDI 4.0 · El Quijote · RFC: EQRE001010XXX
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
            <X size={15} style={{ color: T.textSec }} />
          </button>
        </div>

        <div
          style={{
            padding: "20px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            maxHeight: "62vh",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              padding: "14px 16px",
              background: T.elevated,
              borderRadius: 14,
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: T.textMut,
                letterSpacing: ".12em",
                textTransform: "uppercase",
                margin: "0 0 12px",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <User size={12} /> Datos del receptor
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              <div>
                <label style={lbl}>Nombre / Razón social *</label>
                <input
                  style={inp}
                  value={form.clientName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, clientName: e.target.value }))
                  }
                  placeholder="Empresa S.A. de C.V."
                />
              </div>
              <div>
                <label style={lbl}>RFC *</label>
                <input
                  style={{ ...inp, fontFamily: "monospace", fontWeight: 700 }}
                  value={form.clientRFC}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      clientRFC: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="XAXX010101000"
                  maxLength={13}
                />
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={lbl}>Correo electrónico</label>
                <input
                  type="email"
                  style={inp}
                  value={form.clientEmail}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, clientEmail: e.target.value }))
                  }
                  placeholder="facturacion@empresa.mx"
                />
              </div>
            </div>
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              <label style={lbl}>Uso de CFDI *</label>
              <select
                style={inp}
                value={form.cfdiUse}
                onChange={(e) =>
                  setForm((f) => ({ ...f, cfdiUse: e.target.value as CfdiUse }))
                }
              >
                {Object.entries(CFDI_USES).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={lbl}>Forma de pago *</label>
              <select
                style={inp}
                value={form.payForm}
                onChange={(e) =>
                  setForm((f) => ({ ...f, payForm: e.target.value }))
                }
              >
                {PAY_FORMS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: T.textMut,
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                Conceptos
              </p>
              <button
                type="button"
                onClick={() =>
                  setItems((is) => [
                    ...is,
                    { description: "", qty: 1, unitPrice: 0 },
                  ])
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "4px 10px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  background: `${T.brand}15`,
                  color: T.brand,
                }}
              >
                <Plus size={12} /> Agregar
              </button>
            </div>
            <div
              style={{
                border: `1px solid ${T.border}`,
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 70px 100px 24px",
                  gap: 0,
                  background: T.elevated,
                  padding: "8px 12px",
                }}
              >
                {["Descripción", "Cant.", "P. Unitario", ""].map((h) => (
                  <span
                    key={h}
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: T.textMut,
                      textTransform: "uppercase",
                      letterSpacing: ".1em",
                    }}
                  >
                    {h}
                  </span>
                ))}
              </div>
              {items.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 70px 100px 24px",
                    gap: 8,
                    padding: "10px 12px",
                    borderTop: `1px solid ${T.border}`,
                    alignItems: "center",
                  }}
                >
                  <input
                    style={inp}
                    value={item.description}
                    onChange={(e) =>
                      updateItem(i, "description", e.target.value)
                    }
                    placeholder="Descripción del servicio"
                  />
                  <input
                    type="number"
                    min={1}
                    style={inp}
                    value={item.qty}
                    onChange={(e) =>
                      updateItem(i, "qty", Number(e.target.value))
                    }
                  />
                  <input
                    type="number"
                    min={0.01}
                    step={0.01}
                    style={inp}
                    value={item.unitPrice || ""}
                    onChange={(e) =>
                      updateItem(i, "unitPrice", Number(e.target.value))
                    }
                    placeholder="0.00"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setItems((is) => is.filter((_, j) => j !== i))
                    }
                    disabled={items.length === 1}
                    style={{
                      padding: 2,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: items.length === 1 ? T.border : T.danger,
                      display: "flex",
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              background: T.elevated,
              borderRadius: 12,
              padding: "12px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {[
              { l: "Subtotal", v: `$${fmt(subtotal)}` },
              { l: "IVA (16%)", v: `$${fmt(iva)}` },
            ].map((r) => (
              <div
                key={r.l}
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <span style={{ fontSize: 12, color: T.textSec }}>{r.l}</span>
                <span style={{ fontSize: 12, color: T.textSec }}>{r.v}</span>
              </div>
            ))}
            <div
              style={{
                borderTop: `1px solid ${T.border}`,
                paddingTop: 8,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 800, color: T.text }}>
                Total a facturar
              </span>
              <span
                style={{
                  fontFamily: T.fontD,
                  fontSize: 20,
                  fontWeight: 900,
                  color: T.brand,
                }}
              >
                ${fmt(total)}
              </span>
            </div>
          </div>

          <div>
            <label style={lbl}>Notas internas</label>
            <textarea
              style={{ ...inp, resize: "none" }}
              rows={2}
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              placeholder="Referencia de pedido, observaciones..."
            />
          </div>
        </div>

        <div
          style={{
            padding: "14px 28px",
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
              padding: "8px 18px",
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
            disabled={!valid}
            onClick={() => {
              const folio = String(Date.now()).slice(-4).padStart(4, "0");
              onSave({
                id: Date.now(),
                folio,
                series: "A",
                clientName: form.clientName,
                clientRFC: form.clientRFC,
                clientEmail: form.clientEmail,
                cfdiUse: form.cfdiUse,
                payMethod: form.payMethod,
                payForm: form.payForm,
                items,
                subtotal,
                iva,
                total,
                status: "emitida",
                issuedAt: new Date().toISOString().split("T")[0],
                notes: form.notes || undefined,
              });
              onClose();
            }}
            style={{
              padding: "8px 20px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              color: "#fff",
              background: valid ? T.brand : "#ccc",
              boxShadow: valid ? "0 4px 12px rgba(232,93,4,.3)" : "none",
            }}
          >
            Emitir factura
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [newModal, setNewModal] = useState(false);
  const [drawer, setDrawer] = useState<Invoice | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [searchFocus, setSearchFocus] = useState(false);

  const filtered = invoices.filter((inv) => {
    const ms = [inv.folio, inv.clientName, inv.clientRFC]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase());
    const mst = statusFilter === "all" || inv.status === statusFilter;
    return ms && mst;
  });

  const totalEmitido = invoices
    .filter((i) => i.status !== "cancelada")
    .reduce((s, i) => s + i.total, 0);
  const totalPagado = invoices
    .filter((i) => i.status === "pagada")
    .reduce((s, i) => s + i.total, 0);
  const totalPend = invoices
    .filter((i) => ["emitida", "pendiente"].includes(i.status))
    .reduce((s, i) => s + i.total, 0);

  function changeStatus(id: number, status: InvStatus) {
    setInvoices((is) =>
      is.map((i) =>
        i.id !== id
          ? i
          : {
              ...i,
              status,
              paidAt:
                status === "pagada"
                  ? new Date().toISOString().split("T")[0]
                  : i.paidAt,
            },
      ),
    );
  }
  const user = useSelector((state: RootState) => state.auth.user);
  
    function handleLogout() {}

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
        <AdminSidebar
          activePage="invoices"
          user={user}
          onLogout={handleLogout}
        />

        <main style={{ flex: 1, marginLeft: 260, padding: "40px 48px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 20,
              fontSize: 13,
              color: T.textMut,
            }}
          >
            <button
              onClick={() => router.push("/dashboard/admin/finance")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                background: "none",
                border: "none",
                cursor: "pointer",
                color: T.textMut,
                fontFamily: T.fontB,
                fontSize: 13,
              }}
            >
              <ArrowLeft size={14} /> Finanzas
            </button>
            <ChevronRight size={12} />
            <span style={{ fontWeight: 700, color: T.textSec }}>
              Facturas electrónicas
            </span>
          </div>

          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 32,
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
                Facturas electrónicas
              </h1>
              <p style={{ fontSize: 14, color: T.textMut, margin: 0 }}>
                Emisión de CFDI 4.0 · RFC emisor: EQRE001010XXX
              </p>
            </div>
            <button
              onClick={() => setNewModal(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
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
              <Plus size={15} /> Nueva factura
            </button>
          </header>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 16,
              marginBottom: 28,
            }}
          >
            {[
              {
                l: "Total emitido",
                v: `$${fmt(totalEmitido)}`,
                c: T.brand,
                s: `${invoices.length} facturas`,
              },
              {
                l: "Cobrado",
                v: `$${fmt(totalPagado)}`,
                c: T.ok,
                s: `${invoices.filter((i) => i.status === "pagada").length} pagadas`,
              },
              {
                l: "Por cobrar",
                v: `$${fmt(totalPend)}`,
                c: T.warn,
                s: `${invoices.filter((i) => ["emitida", "pendiente"].includes(i.status)).length} pendientes`,
              },
              {
                l: "Canceladas",
                v: invoices.filter((i) => i.status === "cancelada").length,
                c: T.danger,
                s: "este período",
              },
            ].map((s) => (
              <div
                key={s.l}
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
                    background: s.c,
                    marginBottom: 14,
                  }}
                />
                <p
                  style={{
                    fontFamily: T.fontD,
                    fontSize: 26,
                    fontWeight: 900,
                    color: s.c,
                    margin: "0 0 4px",
                  }}
                >
                  {s.v}
                </p>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: T.text,
                    margin: "0 0 2px",
                  }}
                >
                  {s.l}
                </p>
                <p style={{ fontSize: 11, color: T.textMut, margin: 0 }}>
                  {s.s}
                </p>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 20,
              alignItems: "center",
            }}
          >
            <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
              <Search
                size={14}
                style={{
                  position: "absolute",
                  left: 11,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: T.textMut,
                  pointerEvents: "none",
                }}
              />
              <input
                placeholder="Buscar folio, cliente, RFC..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchFocus(true)}
                onBlur={() => setSearchFocus(false)}
                style={{
                  width: "100%",
                  paddingLeft: 34,
                  paddingRight: 12,
                  paddingTop: 8,
                  paddingBottom: 8,
                  borderRadius: 10,
                  fontSize: 13,
                  fontFamily: T.fontB,
                  color: T.text,
                  background: T.surface,
                  outline: "none",
                  boxSizing: "border-box",
                  border: `1px solid ${searchFocus ? T.brand : T.border}`,
                  boxShadow: searchFocus
                    ? "0 0 0 3px rgba(232,93,4,.10)"
                    : "none",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                gap: 4,
                padding: 4,
                borderRadius: 10,
                background: T.elevated,
                border: `1px solid ${T.border}`,
              }}
            >
              {["all", "emitida", "pagada", "pendiente", "cancelada"].map(
                (s) => {
                  const cfg =
                    s === "all"
                      ? { label: "Todas" }
                      : STATUS_CFG[s as InvStatus];
                  return (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      style={{
                        padding: "5px 12px",
                        borderRadius: 8,
                        fontSize: 11,
                        fontWeight: 700,
                        border: "none",
                        cursor: "pointer",
                        background:
                          statusFilter === s ? T.surface : "transparent",
                        color: statusFilter === s ? T.text : T.textMut,
                        boxShadow:
                          statusFilter === s
                            ? "0 1px 4px rgba(26,18,8,0.1)"
                            : "none",
                      }}
                    >
                      {cfg.label}
                    </button>
                  );
                },
              )}
            </div>
          </div>

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
                    background: T.elevated,
                    borderBottom: `1px solid ${T.border}`,
                  }}
                >
                  {[
                    "Folio",
                    "Cliente",
                    "RFC",
                    "Conceptos",
                    "Total",
                    "Estado",
                    "Fecha",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "11px 16px",
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
                      colSpan={8}
                      style={{
                        padding: 40,
                        textAlign: "center",
                        color: T.textMut,
                        fontSize: 14,
                      }}
                    >
                      No se encontraron facturas
                    </td>
                  </tr>
                ) : (
                  filtered.map((inv) => {
                    const sc = STATUS_CFG[inv.status];
                    return (
                      <tr
                        key={inv.id}
                        style={{
                          borderBottom: `1px solid ${T.border}`,
                          cursor: "pointer",
                          transition: "background .1s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = T.elevated)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                        onClick={() => setDrawer(inv)}
                      >
                        <td style={{ padding: "13px 16px" }}>
                          <p
                            style={{
                              fontSize: 13,
                              fontWeight: 900,
                              color: T.brand,
                              margin: 0,
                              fontFamily: "monospace",
                            }}
                          >
                            {inv.series}
                            {inv.folio}
                          </p>
                        </td>
                        <td style={{ padding: "13px 16px", maxWidth: 180 }}>
                          <p
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: T.text,
                              margin: 0,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {inv.clientName}
                          </p>
                        </td>
                        <td style={{ padding: "13px 16px" }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontFamily: "monospace",
                              fontWeight: 700,
                              color: T.textSec,
                            }}
                          >
                            {inv.clientRFC}
                          </span>
                        </td>
                        <td style={{ padding: "13px 16px" }}>
                          <p
                            style={{
                              fontSize: 12,
                              color: T.textSec,
                              margin: 0,
                            }}
                          >
                            {inv.items.length}{" "}
                            {inv.items.length === 1 ? "concepto" : "conceptos"}
                          </p>
                          <p
                            style={{
                              fontSize: 10,
                              color: T.textMut,
                              margin: "2px 0 0",
                            }}
                          >
                            {inv.items[0].description.length > 30
                              ? inv.items[0].description.slice(0, 30) + "…"
                              : inv.items[0].description}
                          </p>
                        </td>
                        <td style={{ padding: "13px 16px" }}>
                          <span
                            style={{
                              fontSize: 15,
                              fontWeight: 900,
                              color: T.brand,
                            }}
                          >
                            ${fmt(inv.total)}
                          </span>
                        </td>
                        <td style={{ padding: "13px 16px" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              padding: "4px 10px",
                              borderRadius: 99,
                              fontSize: 11,
                              fontWeight: 800,
                              color: sc.color,
                              background: sc.bg,
                            }}
                          >
                            {sc.icon} {sc.label}
                          </span>
                        </td>
                        <td style={{ padding: "13px 16px" }}>
                          <span style={{ fontSize: 12, color: T.textSec }}>
                            {inv.issuedAt}
                          </span>
                          {inv.paidAt && (
                            <p
                              style={{
                                fontSize: 10,
                                color: T.ok,
                                margin: "2px 0 0",
                              }}
                            >
                              Pagada: {inv.paidAt}
                            </p>
                          )}
                        </td>
                        <td
                          style={{ padding: "13px 16px" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div style={{ position: "relative" }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenu(
                                  openMenu === inv.id ? null : inv.id,
                                );
                              }}
                              style={{
                                padding: 5,
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                borderRadius: 7,
                                display: "flex",
                                color: T.textMut,
                              }}
                            >
                              <MoreVertical size={14} />
                            </button>
                            {openMenu === inv.id && (
                              <div
                                style={{
                                  position: "absolute",
                                  right: 0,
                                  top: "100%",
                                  zIndex: 10,
                                  background: T.surface,
                                  borderRadius: 11,
                                  border: `1px solid ${T.border}`,
                                  boxShadow: T.shadowHov,
                                  minWidth: 165,
                                  overflow: "hidden",
                                }}
                              >
                                {[
                                  {
                                    icon: <Eye size={12} />,
                                    l: "Ver detalle",
                                    fn: () => {
                                      setDrawer(inv);
                                      setOpenMenu(null);
                                    },
                                  },
                                  {
                                    icon: <Download size={12} />,
                                    l: "Descargar PDF",
                                    fn: () => setOpenMenu(null),
                                  },
                                  {
                                    icon: <Send size={12} />,
                                    l: "Enviar por email",
                                    fn: () => setOpenMenu(null),
                                  },
                                  ...(inv.status === "emitida"
                                    ? [
                                        {
                                          icon: <CheckCircle2 size={12} />,
                                          l: "Marcar pagada",
                                          fn: () => {
                                            changeStatus(inv.id, "pagada");
                                            setOpenMenu(null);
                                          },
                                        },
                                      ]
                                    : []),
                                  {
                                    icon: <Trash2 size={12} />,
                                    l: "Eliminar",
                                    fn: () => {
                                      if (confirm("¿Eliminar?"))
                                        setInvoices((is) =>
                                          is.filter((i) => i.id !== inv.id),
                                        );
                                      setOpenMenu(null);
                                    },
                                    danger: true,
                                  },
                                ].map((item: any, i) => (
                                  <button
                                    key={i}
                                    onClick={item.fn}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 8,
                                      width: "100%",
                                      padding: "10px 14px",
                                      fontSize: 12,
                                      fontWeight: 600,
                                      border: "none",
                                      cursor: "pointer",
                                      background: "none",
                                      color: item.danger ? T.danger : T.textSec,
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
                                    {item.l}
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
          <p
            style={{
              fontSize: 12,
              color: T.textMut,
              marginTop: 12,
              textAlign: "right",
            }}
          >
            {filtered.length} de {invoices.length} facturas
          </p>
        </main>

      {newModal && (
        <InvoiceModal
          onClose={() => setNewModal(false)}
          onSave={(inv) => {
            setInvoices((is) => [inv, ...is]);
            setNewModal(false);
          }}
        />
      )}
      {drawer && (
        <InvoiceDrawer
          inv={drawer}
          onClose={() => setDrawer(null)}
          onStatusChange={changeStatus}
        />
      )}
    </div>
  );
}
