"use client";
import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  Users,
  Settings,
  LogOut,
  Bell,
  Plus,
  Pencil,
  Trash2,
  X,
  Package,
  TrendingDown,
  TrendingUp,
  DollarSign,
  ChevronRight,
  ArrowLeft,
  MoreVertical,
  Search,
  FileText,
  Lock,
  AlertTriangle,
  CheckCircle2,
  Clock,
  CreditCard,
  Banknote,
  Smartphone,
  Receipt,
  Coffee,
  Utensils,
  ChevronDown,
} from "lucide-react";

// ─── Tokens ───────────────────────────────────────────────────────────────────
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

// ─── Types ────────────────────────────────────────────────────────────────────
type MvType = "ingreso" | "egreso";
type PayMethod = "efectivo" | "tarjeta" | "transferencia";

interface CashMovement {
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

interface CashSession {
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

interface Tip {
  id: number;
  waiter: string;
  tableRef: string;
  amount: number;
  payMethod: PayMethod;
  date: string;
  distributed: boolean;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const INGRESO_CATS = [
  "Venta en mesa",
  "Pedido domicilio",
  "Para llevar",
  "Evento privado",
  "Otro ingreso",
];
const EGRESO_CATS = [
  "Insumos cocina",
  "Limpieza",
  "Mantenimiento",
  "Transporte",
  "Papelería",
  "Otro gasto",
];

const MOCK_MOVEMENTS: CashMovement[] = [
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

const MOCK_SESSIONS: CashSession[] = [
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

const MOCK_TIPS: Tip[] = [
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

// ─── Shared ───────────────────────────────────────────────────────────────────
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

const PAY_ICONS: Record<PayMethod, React.ReactNode> = {
  efectivo: <Banknote size={13} />,
  tarjeta: <CreditCard size={13} />,
  transferencia: <Smartphone size={13} />,
};
const PAY_CFG: Record<PayMethod, { label: string; color: string; bg: string }> =
  {
    efectivo: { label: "Efectivo", color: "#059669", bg: "#ecfdf5" },
    tarjeta: { label: "Tarjeta", color: "#2563eb", bg: "#eff6ff" },
    transferencia: { label: "Transferencia", color: "#7c3aed", bg: "#faf5ff" },
  };

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

function fmt(n: number) {
  return n.toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ─── Movement Modal ───────────────────────────────────────────────────────────
function MovementModal({
  type,
  onClose,
  onSave,
}: {
  type: MvType;
  onClose: () => void;
  onSave: (m: CashMovement) => void;
}) {
  const [form, setForm] = useState({
    concept: "",
    category: type === "ingreso" ? INGRESO_CATS[0] : EGRESO_CATS[0],
    amount: 0,
    payMethod: "efectivo" as PayMethod,
    responsible: "",
    notes: "",
  });
  const cats = type === "ingreso" ? INGRESO_CATS : EGRESO_CATS;

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
          maxWidth: 520,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "22px 26px 18px",
            borderBottom: `1px solid ${T.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: type === "ingreso" ? "#ecfdf5" : "#fef2f2",
                color: type === "ingreso" ? T.ok : T.danger,
              }}
            >
              {type === "ingreso" ? (
                <TrendingUp size={18} />
              ) : (
                <TrendingDown size={18} />
              )}
            </div>
            <div>
              <h2
                style={{
                  fontFamily: T.fontD,
                  fontWeight: 900,
                  fontSize: 18,
                  color: T.text,
                  margin: "0 0 2px",
                }}
              >
                Registrar {type === "ingreso" ? "ingreso" : "egreso"}
              </h2>
              <p style={{ fontSize: 11, color: T.textMut, margin: 0 }}>
                Caja chica · {new Date().toLocaleDateString("es-MX")}
              </p>
            </div>
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
            padding: "20px 26px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div>
            <label style={lbl}>Concepto *</label>
            <input
              style={inp}
              value={form.concept}
              onChange={(e) =>
                setForm((f) => ({ ...f, concept: e.target.value }))
              }
              placeholder={
                type === "ingreso"
                  ? "Ej. Venta turno comida"
                  : "Ej. Compra insumos limpieza"
              }
            />
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              <label style={lbl}>Categoría</label>
              <select
                style={inp}
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
              >
                {cats.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={lbl}>Monto ($) *</label>
              <input
                type="number"
                min={0.01}
                step={0.01}
                style={inp}
                value={form.amount || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, amount: Number(e.target.value) }))
                }
                placeholder="0.00"
              />
            </div>
          </div>
          <div>
            <label style={lbl}>Método de pago</label>
            <div style={{ display: "flex", gap: 8 }}>
              {(["efectivo", "tarjeta", "transferencia"] as PayMethod[]).map(
                (m) => {
                  const cfg = PAY_CFG[m];
                  const sel = form.payMethod === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, payMethod: m }))}
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        padding: "8px",
                        borderRadius: 10,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        border: `1.5px solid ${sel ? cfg.color : T.border}`,
                        background: sel ? cfg.bg : T.surface,
                        color: sel ? cfg.color : T.textSec,
                      }}
                    >
                      {PAY_ICONS[m]} {cfg.label}
                    </button>
                  );
                },
              )}
            </div>
          </div>
          <div>
            <label style={lbl}>Responsable</label>
            <input
              style={inp}
              value={form.responsible}
              onChange={(e) =>
                setForm((f) => ({ ...f, responsible: e.target.value }))
              }
              placeholder="Nombre del colaborador"
            />
          </div>
          <div>
            <label style={lbl}>Notas adicionales</label>
            <textarea
              style={{ ...inp, resize: "none" }}
              rows={2}
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              placeholder="Observaciones opcionales..."
            />
          </div>
        </div>

        <div
          style={{
            padding: "14px 26px",
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
            disabled={!form.concept || !form.amount}
            onClick={() => {
              onSave({
                id: Date.now(),
                type,
                concept: form.concept,
                category: form.category,
                amount: form.amount,
                payMethod: form.payMethod,
                responsible: form.responsible,
                date: new Date().toISOString().split("T")[0],
                time: new Date().toLocaleTimeString("es-MX", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
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
              background:
                form.concept && form.amount
                  ? type === "ingreso"
                    ? T.ok
                    : T.danger
                  : "#ccc",
            }}
          >
            Registrar {type === "ingreso" ? "ingreso" : "egreso"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Close Session Modal ──────────────────────────────────────────────────────
function CloseSessionModal({
  session,
  onClose,
  onConfirm,
}: {
  session: CashSession;
  onClose: () => void;
  onConfirm: (counted: number, closedBy: string) => void;
}) {
  const [counted, setCounted] = useState<number>(0);
  const [by, setBy] = useState("");
  const diff = counted - session.expectedBalance;

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
          maxWidth: 460,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "22px 26px 18px",
            borderBottom: `1px solid ${T.border}`,
          }}
        >
          <h2
            style={{
              fontFamily: T.fontD,
              fontWeight: 900,
              fontSize: 20,
              color: T.text,
              margin: "0 0 4px",
            }}
          >
            Cierre de caja
          </h2>
          <p style={{ fontSize: 12, color: T.textMut, margin: 0 }}>
            {session.date} · Apertura {session.openedAt}
          </p>
        </div>
        <div
          style={{
            padding: "20px 26px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {/* Summary */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
          >
            {[
              {
                l: "Saldo apertura",
                v: `$${fmt(session.openingBalance)}`,
                c: T.text,
              },
              { l: "Movimientos", v: session.movements, c: T.text },
              {
                l: "Saldo esperado",
                v: `$${fmt(session.expectedBalance)}`,
                c: T.brand,
              },
            ].map((r) => (
              <div
                key={r.l}
                style={{
                  padding: "10px 12px",
                  background: T.elevated,
                  borderRadius: 10,
                }}
              >
                <p
                  style={{
                    fontSize: 10,
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
                    fontSize: 16,
                    fontWeight: 900,
                    color: r.c as string,
                    margin: 0,
                  }}
                >
                  {r.v}
                </p>
              </div>
            ))}
          </div>
          <div>
            <label style={lbl}>Efectivo contado en caja *</label>
            <input
              type="number"
              min={0}
              step={0.01}
              style={{ ...inp, fontSize: 16, fontWeight: 700 }}
              value={counted || ""}
              onChange={(e) => setCounted(Number(e.target.value))}
              placeholder="0.00"
            />
          </div>
          {counted > 0 && (
            <div
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                background:
                  diff === 0 ? "#ecfdf5" : diff > 0 ? "#eff6ff" : "#fef2f2",
                border: `1px solid ${diff === 0 ? "#86efac" : diff > 0 ? "#93c5fd" : "#fca5a5"}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{ fontSize: 13, fontWeight: 700, color: T.textSec }}
                >
                  Diferencia:
                </span>
                <span
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: diff === 0 ? T.ok : diff > 0 ? T.info : T.danger,
                  }}
                >
                  {diff > 0 ? "+" : ""}${fmt(diff)}
                </span>
              </div>
              <p style={{ fontSize: 11, color: T.textSec, margin: "4px 0 0" }}>
                {diff === 0
                  ? "✓ Cuadre perfecto"
                  : diff > 0
                    ? "Sobrante en caja"
                    : "Faltante en caja"}
              </p>
            </div>
          )}
          <div>
            <label style={lbl}>Cierre realizado por *</label>
            <input
              style={inp}
              value={by}
              onChange={(e) => setBy(e.target.value)}
              placeholder="Nombre del cajero"
            />
          </div>
        </div>
        <div
          style={{
            padding: "14px 26px",
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
            disabled={!counted || !by}
            onClick={() => {
              onConfirm(counted, by);
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
              background: counted && by ? T.brand : "#ccc",
              boxShadow:
                counted && by ? "0 4px 12px rgba(232,93,4,.3)" : "none",
            }}
          >
            Confirmar cierre
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tip Modal ────────────────────────────────────────────────────────────────
function TipModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (t: Tip) => void;
}) {
  const [form, setForm] = useState({
    waiter: "",
    tableRef: "",
    amount: 0,
    payMethod: "efectivo" as PayMethod,
  });
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
          borderRadius: 24,
          boxShadow: "0 24px 64px rgba(26,18,8,0.18)",
          width: "100%",
          maxWidth: 420,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px 24px 16px",
            borderBottom: `1px solid ${T.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
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
            Registrar propina
          </h3>
          <button
            onClick={onClose}
            style={{
              padding: 5,
              background: T.elevated,
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              display: "flex",
            }}
          >
            <X size={14} style={{ color: T.textSec }} />
          </button>
        </div>
        <div
          style={{
            padding: "18px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 13,
          }}
        >
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
          >
            <div>
              <label style={lbl}>Mesero *</label>
              <input
                style={inp}
                value={form.waiter}
                onChange={(e) =>
                  setForm((f) => ({ ...f, waiter: e.target.value }))
                }
                placeholder="Nombre"
              />
            </div>
            <div>
              <label style={lbl}>Mesa / Referencia</label>
              <input
                style={inp}
                value={form.tableRef}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tableRef: e.target.value }))
                }
                placeholder="Mesa 4"
              />
            </div>
          </div>
          <div>
            <label style={lbl}>Monto de propina ($) *</label>
            <input
              type="number"
              min={1}
              style={inp}
              value={form.amount || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, amount: Number(e.target.value) }))
              }
              placeholder="0.00"
            />
          </div>
          <div>
            <label style={lbl}>Método</label>
            <div style={{ display: "flex", gap: 7 }}>
              {(["efectivo", "tarjeta", "transferencia"] as PayMethod[]).map(
                (m) => {
                  const cfg = PAY_CFG[m];
                  const sel = form.payMethod === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, payMethod: m }))}
                      style={{
                        flex: 1,
                        padding: "7px",
                        borderRadius: 9,
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                        border: `1.5px solid ${sel ? cfg.color : T.border}`,
                        background: sel ? cfg.bg : T.surface,
                        color: sel ? cfg.color : T.textSec,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                      }}
                    >
                      {PAY_ICONS[m]} {cfg.label}
                    </button>
                  );
                },
              )}
            </div>
          </div>
        </div>
        <div
          style={{
            padding: "13px 24px",
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
              padding: "8px 16px",
              borderRadius: 9,
              fontSize: 12,
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
            disabled={!form.waiter || !form.amount}
            onClick={() => {
              onSave({
                id: Date.now(),
                waiter: form.waiter,
                tableRef: form.tableRef,
                amount: form.amount,
                payMethod: form.payMethod,
                date: new Date().toISOString().split("T")[0],
                distributed: false,
              });
              onClose();
            }}
            style={{
              padding: "8px 16px",
              borderRadius: 9,
              fontSize: 12,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              color: "#fff",
              background: form.waiter && form.amount ? T.brand : "#ccc",
            }}
          >
            Registrar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FinancePage() {
  const router = useRouter();
  const [movements, setMovements] = useState<CashMovement[]>(MOCK_MOVEMENTS);
  const [sessions, setSessions] = useState<CashSession[]>(MOCK_SESSIONS);
  const [tips, setTips] = useState<Tip[]>(MOCK_TIPS);
  const [tab, setTab] = useState<"caja" | "cierre" | "propinas">("caja");
  const [mvModal, setMvModal] = useState<MvType | null>(null);
  const [closeModal, setCloseModal] = useState<CashSession | null>(null);
  const [tipModal, setTipModal] = useState(false);
  const [dateFilter, setDateFilter] = useState("");
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const todayMvs = movements.filter((m) => m.date === today);
  const todayIn = todayMvs
    .filter((m) => m.type === "ingreso")
    .reduce((s, m) => s + m.amount, 0);
  const todayOut = todayMvs
    .filter((m) => m.type === "egreso")
    .reduce((s, m) => s + m.amount, 0);
  const openSession = sessions.find((s) => s.status === "abierta");

  const displayMvs = (
    dateFilter ? movements.filter((m) => m.date === dateFilter) : movements
  ).sort(
    (a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time),
  );

  const tipsByWaiter = useMemo(() => {
    const map: Record<
      string,
      { total: number; count: number; pending: number }
    > = {};
    tips.forEach((t) => {
      if (!map[t.waiter]) map[t.waiter] = { total: 0, count: 0, pending: 0 };
      map[t.waiter].total += t.amount;
      map[t.waiter].count++;
      if (!t.distributed) map[t.waiter].pending += t.amount;
    });
    return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
  }, [tips]);

  const totalTips = tips.reduce((s, t) => s + t.amount, 0);
  const pendingTips = tips
    .filter((t) => !t.distributed)
    .reduce((s, t) => s + t.amount, 0);

  function closeSession(counted: number, closedBy: string) {
    if (!openSession) return;
    setSessions((ss) =>
      ss.map((s) =>
        s.id !== openSession.id
          ? s
          : {
              ...s,
              status: "cerrada",
              closedAt: new Date().toLocaleTimeString("es-MX", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              countedBalance: counted,
              difference: counted - s.expectedBalance,
              closedBy,
            },
      ),
    );
  }

  function markDistributed(waiterId: string) {
    setTips((ts) =>
      ts.map((t) =>
        t.waiter === waiterId && !t.distributed
          ? { ...t, distributed: true }
          : t,
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
          activePage="finance"
          user={user}
          onLogout={handleLogout}
        />

        <main style={{ flex: 1, marginLeft: 260, padding: "40px 48px" }}>
          {/* Header */}
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
                Finanzas & Caja
              </h1>
              <p style={{ fontSize: 14, color: T.textMut, margin: 0 }}>
                Control de caja chica, cierres y distribución de propinas
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button
                onClick={() => router.push("/dashboard/admin/finance/invoices")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "10px 16px",
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  border: `1px solid ${T.border}`,
                  background: T.surface,
                  color: T.textSec,
                }}
              >
                <FileText size={15} /> Facturas
              </button>
              {tab === "caja" && (
                <>
                  <button
                    onClick={() => setMvModal("egreso")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      padding: "10px 16px",
                      borderRadius: 12,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      border: `1px solid ${T.danger}30`,
                      background: "#fef2f2",
                      color: T.danger,
                    }}
                  >
                    <TrendingDown size={15} /> Egreso
                  </button>
                  <button
                    onClick={() => setMvModal("ingreso")}
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
                      background: T.ok,
                      boxShadow: "0 4px 12px rgba(5,150,105,.25)",
                    }}
                  >
                    <TrendingUp size={15} /> Ingreso
                  </button>
                </>
              )}
              {tab === "propinas" && (
                <button
                  onClick={() => setTipModal(true)}
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
                  <Plus size={15} /> Registrar propina
                </button>
              )}
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
            {[
              {
                l: "Ingresos hoy",
                v: `$${fmt(todayIn)}`,
                c: T.ok,
                s: openSession
                  ? `Caja ${openSession.status}`
                  : "Sin sesión activa",
              },
              {
                l: "Egresos hoy",
                v: `$${fmt(todayOut)}`,
                c: T.danger,
                s: `${todayMvs.filter((m) => m.type === "egreso").length} movimientos`,
              },
              {
                l: "Balance hoy",
                v: `$${fmt(todayIn - todayOut)}`,
                c: T.brand,
                s: "neto del día",
              },
              {
                l: "Propinas pend.",
                v: `$${fmt(pendingTips)}`,
                c: T.warn,
                s: "por distribuir",
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

          {/* Open session banner */}
          {openSession && tab === "caja" && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 18px",
                background: "#ecfdf5",
                borderRadius: 14,
                border: "1px solid #86efac",
                marginBottom: 24,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: T.ok,
                    boxShadow: `0 0 0 4px #86efac`,
                  }}
                />
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: T.ok,
                    margin: 0,
                  }}
                >
                  Caja abierta desde las {openSession.openedAt} · Saldo
                  apertura: ${fmt(openSession.openingBalance)}
                </p>
              </div>
              <button
                onClick={() => setCloseModal(openSession)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 800,
                  border: "none",
                  cursor: "pointer",
                  background: T.ok,
                  color: "#fff",
                }}
              >
                <Lock size={12} /> Cerrar caja
              </button>
            </div>
          )}

          {/* Tabs */}
          <div
            style={{
              display: "flex",
              borderBottom: `1px solid ${T.border}`,
              marginBottom: 24,
            }}
          >
            {[
              { k: "caja", l: "💵 Caja chica", count: movements.length },
              { k: "cierre", l: "🔒 Cierres", count: sessions.length },
              { k: "propinas", l: "💰 Propinas", count: tips.length },
            ].map((t) => (
              <button
                key={t.k}
                onClick={() => setTab(t.k as any)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 20px",
                  fontSize: 13,
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  background: "none",
                  borderBottom:
                    tab === t.k
                      ? `2px solid ${T.brand}`
                      : "2px solid transparent",
                  color: tab === t.k ? T.brand : T.textMut,
                  marginBottom: -1,
                }}
              >
                {t.l}
                <span
                  style={{
                    padding: "1px 7px",
                    borderRadius: 99,
                    fontSize: 10,
                    fontWeight: 800,
                    background: tab === t.k ? `${T.brand}18` : T.elevated,
                    color: tab === t.k ? T.brand : T.textMut,
                  }}
                >
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {/* ── TAB CAJA CHICA ── */}
          {tab === "caja" && (
            <>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  marginBottom: 20,
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    fontSize: 12,
                    color: T.textSec,
                  }}
                >
                  <label style={{ fontWeight: 700 }}>Filtrar por fecha:</label>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    style={{
                      ...inp,
                      width: "auto",
                      padding: "6px 10px",
                      fontSize: 12,
                    }}
                  />
                  {dateFilter && (
                    <button
                      onClick={() => setDateFilter("")}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: T.textMut,
                        display: "flex",
                      }}
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {displayMvs.map((m) => {
                  const isIn = m.type === "ingreso";
                  const pc = PAY_CFG[m.payMethod];
                  return (
                    <div
                      key={m.id}
                      style={{
                        background: T.surface,
                        borderRadius: 16,
                        border: `1px solid ${T.border}`,
                        padding: "14px 18px",
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        boxShadow: T.shadow,
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.boxShadow = T.shadowHov)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.boxShadow = T.shadow)
                      }
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          flexShrink: 0,
                          background: isIn ? "#ecfdf5" : "#fef2f2",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {isIn ? (
                          <TrendingUp size={18} style={{ color: T.ok }} />
                        ) : (
                          <TrendingDown size={18} style={{ color: T.danger }} />
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: 8,
                          }}
                        >
                          <p
                            style={{
                              fontSize: 14,
                              fontWeight: 700,
                              color: T.text,
                              margin: 0,
                            }}
                          >
                            {m.concept}
                          </p>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              padding: "1px 7px",
                              borderRadius: 99,
                              background: T.elevated,
                              color: T.textMut,
                            }}
                          >
                            {m.category}
                          </span>
                        </div>
                        <p
                          style={{
                            fontSize: 11,
                            color: T.textMut,
                            margin: "3px 0 0",
                          }}
                        >
                          {m.responsible && (
                            <>
                              <span style={{ fontWeight: 700 }}>
                                {m.responsible}
                              </span>{" "}
                              ·{" "}
                            </>
                          )}
                          {m.date} {m.time}
                          {m.notes && (
                            <>
                              {" "}
                              · <em>{m.notes}</em>
                            </>
                          )}
                        </p>
                      </div>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "3px 9px",
                          borderRadius: 99,
                          fontSize: 11,
                          fontWeight: 700,
                          color: pc.color,
                          background: pc.bg,
                        }}
                      >
                        {PAY_ICONS[m.payMethod]}
                        {pc.label}
                      </span>
                      <p
                        style={{
                          fontSize: 18,
                          fontWeight: 900,
                          margin: 0,
                          minWidth: 90,
                          textAlign: "right",
                          color: isIn ? T.ok : T.danger,
                        }}
                      >
                        {isIn ? "+" : "-"}${fmt(m.amount)}
                      </p>
                      <div
                        style={{ position: "relative" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() =>
                            setOpenMenu(openMenu === m.id ? null : m.id)
                          }
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
                        {openMenu === m.id && (
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
                              minWidth: 140,
                              overflow: "hidden",
                            }}
                          >
                            <button
                              onClick={() => {
                                setMovements((ms) =>
                                  ms.filter((x) => x.id !== m.id),
                                );
                                setOpenMenu(null);
                              }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 7,
                                width: "100%",
                                padding: "10px 14px",
                                fontSize: 12,
                                fontWeight: 600,
                                border: "none",
                                cursor: "pointer",
                                background: "none",
                                color: T.danger,
                                textAlign: "left",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.background = T.elevated)
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.background = "none")
                              }
                            >
                              <Trash2 size={12} />
                              Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {displayMvs.length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "48px 0",
                      color: T.textMut,
                    }}
                  >
                    <Receipt
                      size={40}
                      style={{ marginBottom: 12, opacity: 0.4 }}
                    />
                    <p style={{ fontSize: 14, margin: 0 }}>
                      Sin movimientos{dateFilter ? ` el ${dateFilter}` : ""}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── TAB CIERRES ── */}
          {tab === "cierre" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {sessions.map((s) => {
                const open = s.status === "abierta";
                const diff = s.difference ?? 0;
                return (
                  <div
                    key={s.id}
                    style={{
                      background: T.surface,
                      borderRadius: 20,
                      border: `1.5px solid ${open ? T.ok : T.border}`,
                      padding: "20px 24px",
                      boxShadow: T.shadow,
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
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            flexShrink: 0,
                            background: open ? T.ok : T.textMut,
                            boxShadow: open ? `0 0 0 4px #86efac` : undefined,
                          }}
                        />
                        <div>
                          <p
                            style={{
                              fontFamily: T.fontD,
                              fontSize: 18,
                              fontWeight: 900,
                              color: T.text,
                              margin: "0 0 2px",
                            }}
                          >
                            {s.date}
                          </p>
                          <p
                            style={{
                              fontSize: 12,
                              color: T.textMut,
                              margin: 0,
                            }}
                          >
                            Apertura: {s.openedAt}
                            {s.closedAt ? ` · Cierre: ${s.closedAt}` : ""}
                            {s.closedBy ? ` · por ${s.closedBy}` : ""}
                          </p>
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            padding: "3px 10px",
                            borderRadius: 99,
                            background: open ? "#ecfdf5" : "#f1f5f9",
                            color: open ? T.ok : "#64748b",
                          }}
                        >
                          {open ? "Abierta" : "Cerrada"}
                        </span>
                        {open && (
                          <button
                            onClick={() => setCloseModal(s)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 5,
                              padding: "7px 14px",
                              borderRadius: 10,
                              fontSize: 12,
                              fontWeight: 800,
                              border: "none",
                              cursor: "pointer",
                              background: T.brand,
                              color: "#fff",
                            }}
                          >
                            <Lock size={12} /> Cerrar caja
                          </button>
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(5,1fr)",
                        gap: 10,
                      }}
                    >
                      {[
                        {
                          l: "Apertura",
                          v: `$${fmt(s.openingBalance)}`,
                          c: T.text,
                        },
                        { l: "Movimientos", v: s.movements, c: T.text },
                        {
                          l: "Saldo esperado",
                          v: `$${fmt(s.expectedBalance)}`,
                          c: T.brand,
                        },
                        {
                          l: "Saldo contado",
                          v:
                            s.countedBalance != null
                              ? `$${fmt(s.countedBalance)}`
                              : "—",
                          c: T.text,
                        },
                        {
                          l: "Diferencia",
                          v:
                            s.difference != null
                              ? diff === 0
                                ? "✓ Cuadre"
                                : (diff > 0 ? "+" : "") + `$${fmt(diff)}`
                              : "—",
                          c: diff === 0 ? T.ok : diff > 0 ? T.info : T.danger,
                        },
                      ].map((r) => (
                        <div
                          key={r.l}
                          style={{
                            padding: "10px 12px",
                            background: T.elevated,
                            borderRadius: 12,
                          }}
                        >
                          <p
                            style={{
                              fontSize: 9,
                              fontWeight: 800,
                              color: T.textMut,
                              margin: "0 0 4px",
                              textTransform: "uppercase",
                              letterSpacing: ".12em",
                            }}
                          >
                            {r.l}
                          </p>
                          <p
                            style={{
                              fontSize: 15,
                              fontWeight: 900,
                              color: r.c as string,
                              margin: 0,
                            }}
                          >
                            {r.v}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── TAB PROPINAS ── */}
          {tab === "propinas" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 340px",
                gap: 24,
              }}
            >
              {/* Log */}
              <div>
                <h3
                  style={{
                    fontFamily: T.fontD,
                    fontWeight: 800,
                    fontSize: 16,
                    color: T.text,
                    margin: "0 0 14px",
                  }}
                >
                  Registro del día
                </h3>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {tips
                    .filter((t) => t.date === today)
                    .concat(tips.filter((t) => t.date !== today))
                    .map((t) => {
                      const pc = PAY_CFG[t.payMethod];
                      return (
                        <div
                          key={t.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "12px 16px",
                            background: T.surface,
                            borderRadius: 14,
                            border: `1px solid ${T.border}`,
                            opacity: t.distributed ? 0.65 : 1,
                          }}
                        >
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 10,
                              background: T.elevated,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 14,
                              flexShrink: 0,
                            }}
                          >
                            💰
                          </div>
                          <div style={{ flex: 1 }}>
                            <p
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: T.text,
                                margin: 0,
                              }}
                            >
                              {t.waiter}
                            </p>
                            <p
                              style={{
                                fontSize: 11,
                                color: T.textMut,
                                margin: "2px 0 0",
                              }}
                            >
                              {t.tableRef} · {t.date}
                            </p>
                          </div>
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              padding: "2px 8px",
                              borderRadius: 99,
                              fontSize: 10,
                              fontWeight: 700,
                              color: pc.color,
                              background: pc.bg,
                            }}
                          >
                            {PAY_ICONS[t.payMethod]}
                            {pc.label}
                          </span>
                          <p
                            style={{
                              fontSize: 16,
                              fontWeight: 900,
                              color: T.brand,
                              margin: 0,
                              minWidth: 60,
                              textAlign: "right",
                            }}
                          >
                            ${fmt(t.amount)}
                          </p>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 800,
                              padding: "2px 8px",
                              borderRadius: 99,
                              background: t.distributed ? "#f1f5f9" : "#fffbeb",
                              color: t.distributed ? "#64748b" : T.warn,
                            }}
                          >
                            {t.distributed ? "Distribuida" : "Pendiente"}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Summary by waiter */}
              <div>
                <h3
                  style={{
                    fontFamily: T.fontD,
                    fontWeight: 800,
                    fontSize: 16,
                    color: T.text,
                    margin: "0 0 14px",
                  }}
                >
                  Por mesero
                </h3>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {tipsByWaiter.map(([waiter, data]) => (
                    <div
                      key={waiter}
                      style={{
                        background: T.surface,
                        borderRadius: 16,
                        border: `1px solid ${T.border}`,
                        padding: "14px 16px",
                        boxShadow: T.shadow,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: 10,
                        }}
                      >
                        <div>
                          <p
                            style={{
                              fontSize: 14,
                              fontWeight: 800,
                              color: T.text,
                              margin: "0 0 2px",
                            }}
                          >
                            {waiter}
                          </p>
                          <p
                            style={{
                              fontSize: 11,
                              color: T.textMut,
                              margin: 0,
                            }}
                          >
                            {data.count} propina{data.count !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <p
                          style={{
                            fontFamily: T.fontD,
                            fontSize: 20,
                            fontWeight: 900,
                            color: T.brand,
                            margin: 0,
                          }}
                        >
                          ${fmt(data.total)}
                        </p>
                      </div>
                      {data.pending > 0 && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "8px 10px",
                            background: "#fffbeb",
                            borderRadius: 9,
                            border: "1px solid #fde68a",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: T.warn,
                            }}
                          >
                            Pendiente: ${fmt(data.pending)}
                          </span>
                          <button
                            onClick={() => markDistributed(waiter)}
                            style={{
                              fontSize: 11,
                              fontWeight: 800,
                              padding: "4px 10px",
                              borderRadius: 7,
                              border: "none",
                              cursor: "pointer",
                              background: T.warn,
                              color: "#fff",
                            }}
                          >
                            Marcar distribuida
                          </button>
                        </div>
                      )}
                      {data.pending === 0 && (
                        <p
                          style={{
                            fontSize: 11,
                            color: T.ok,
                            margin: 0,
                            fontWeight: 700,
                          }}
                        >
                          ✓ Todo distribuido
                        </p>
                      )}
                    </div>
                  ))}

                  <div
                    style={{
                      padding: "14px 16px",
                      background: T.elevated,
                      borderRadius: 14,
                      border: `1px solid ${T.border}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: T.textSec,
                        }}
                      >
                        Total propinas
                      </span>
                      <span
                        style={{
                          fontFamily: T.fontD,
                          fontSize: 18,
                          fontWeight: 900,
                          color: T.brand,
                        }}
                      >
                        ${fmt(totalTips)}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: 4,
                      }}
                    >
                      <span style={{ fontSize: 12, color: T.textMut }}>
                        Pendiente de distribuir
                      </span>
                      <span
                        style={{ fontSize: 14, fontWeight: 800, color: T.warn }}
                      >
                        ${fmt(pendingTips)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

      {/* Modals */}
      {mvModal && (
        <MovementModal
          type={mvModal}
          onClose={() => setMvModal(null)}
          onSave={(m) => {
            setMovements((ms) => [m, ...ms]);
            setMvModal(null);
          }}
        />
      )}
      {closeModal && (
        <CloseSessionModal
          session={closeModal}
          onClose={() => setCloseModal(null)}
          onConfirm={closeSession}
        />
      )}
      {tipModal && (
        <TipModal
          onClose={() => setTipModal(false)}
          onSave={(t) => {
            setTips((ts) => [t, ...ts]);
            setTipModal(false);
          }}
        />
      )}
    </div>
  );
}
