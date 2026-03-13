"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import ExportModal from "@/components/admin/ExportModal"; // ← importar

import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  Users,
  Settings,
  LogOut,
  Package,
  DollarSign,
  BarChart2,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
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

const fmt = (n: number) =>
  n.toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// ─── Mock chart data ──────────────────────────────────────────────────────────
const WEEKLY_SALES = [
  { day: "Lun", ventas: 4250, pedidos: 18 },
  { day: "Mar", ventas: 3800, pedidos: 15 },
  { day: "Mié", ventas: 5100, pedidos: 22 },
  { day: "Jue", ventas: 4700, pedidos: 20 },
  { day: "Vie", ventas: 7200, pedidos: 31 },
  { day: "Sáb", ventas: 9400, pedidos: 40 },
  { day: "Dom", ventas: 8600, pedidos: 37 },
];

const MONTHLY_TREND = [
  { mes: "Sep", total: 142000 },
  { mes: "Oct", total: 158000 },
  { mes: "Nov", total: 134000 },
  { mes: "Dic", total: 195000 },
  { mes: "Ene", total: 121000 },
  { mes: "Feb", total: 148000 },
  { mes: "Mar", total: 67000 },
];

const TOP_PRODUCTS = [
  { name: "Filete de res al vino", ventas: 312, ingreso: 93600, trend: 8.2 },
  { name: "Paella valenciana", ventas: 278, ingreso: 83400, trend: 5.1 },
  { name: "Costillas BBQ", ventas: 241, ingreso: 60250, trend: -2.3 },
  { name: "Pizza española", ventas: 198, ingreso: 39600, trend: 12.4 },
  { name: "Crema de champiñones", ventas: 187, ingreso: 28050, trend: 3.7 },
  { name: "Tiramisú casero", ventas: 165, ingreso: 24750, trend: 18.1 },
];

const STAFF_METRICS = [
  {
    name: "Ana Reyes",
    pedidos: 312,
    propinas: 1840,
    satisfaccion: 4.8,
    rol: "Mesero",
  },
  {
    name: "Sofia Torres",
    pedidos: 287,
    propinas: 1620,
    satisfaccion: 4.7,
    rol: "Mesero",
  },
  {
    name: "Carlos Mendoza",
    pedidos: 0,
    propinas: 0,
    satisfaccion: 4.6,
    rol: "Cajero",
  },
  {
    name: "Luis García",
    pedidos: 198,
    propinas: 0,
    satisfaccion: 4.9,
    rol: "Cocina",
  },
];

const PAYMENT_DIST = [
  { method: "Efectivo", pct: 48, amount: 32640, color: "#059669" },
  { method: "Tarjeta", pct: 34, amount: 23120, color: "#2563eb" },
  { method: "Transferencia", pct: 18, amount: 12240, color: "#7c3aed" },
];

// ─── Mini bar chart ───────────────────────────────────────────────────────────
function BarChart({
  data,
  valueKey,
  maxVal,
  color = "#e85d04",
}: {
  data: { [k: string]: any }[];
  valueKey: string;
  maxVal: number;
  color?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 6,
        height: 100,
        width: "100%",
      }}
    >
      {data.map((d, i) => {
        const pct = (d[valueKey] / maxVal) * 100;
        const isToday = i === data.length - 1;
        return (
          <div
            key={i}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
            }}
          >
            <div
              style={{
                width: "100%",
                flex: 1,
                display: "flex",
                alignItems: "flex-end",
              }}
            >
              <div
                style={{
                  width: "100%",
                  borderRadius: "4px 4px 0 0",
                  transition: "height .3s",
                  height: `${pct}%`,
                  background: isToday ? color : `${color}60`,
                }}
              />
            </div>
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: T.textMut,
                textTransform: "uppercase",
              }}
            >
              {d.day || d.mes}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Trend sparkline ──────────────────────────────────────────────────────────
function Sparkline({
  data,
  color = "#e85d04",
}: {
  data: number[];
  color?: string;
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 28;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Donut mini ───────────────────────────────────────────────────────────────
function DonutChart({
  segments,
}: {
  segments: { pct: number; color: string; method: string; amount: number }[];
}) {
  let cumulative = 0;
  const r = 50;
  const cx = 60;
  const cy = 60;
  const stroke = 18;
  const circum = 2 * Math.PI * r;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <svg width={120} height={120}>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={T.border}
          strokeWidth={stroke}
        />
        {segments.map((s, i) => {
          const offset = circum * (1 - cumulative / 100);
          const dash = circum * (s.pct / 100);
          cumulative += s.pct;
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${circum - dash}`}
              strokeDashoffset={offset}
              transform={`rotate(-90 ${cx} ${cy})`}
              style={{ transition: "stroke-dashoffset .5s" }}
            />
          );
        })}
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          style={{ fontSize: 13, fontWeight: 800, fill: T.text }}
        >
          Pagos
        </text>
        <text
          x={cx}
          y={cy + 12}
          textAnchor="middle"
          style={{ fontSize: 10, fill: T.textMut }}
        >
          distribución
        </text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {segments.map((s, i) => (
          <div
            key={i}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                background: s.color,
                flexShrink: 0,
              }}
            />
            <div>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: T.text,
                  margin: 0,
                }}
              >
                {s.method}
              </p>
              <p style={{ fontSize: 10, color: T.textMut, margin: 0 }}>
                {s.pct}% · ${fmt(s.amount)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const router = useRouter();
  const [period, setPeriod] = useState<"semana" | "mes" | "año">("semana");
  // ← reemplazamos reportOpen por exportModalOpen
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const PERIOD_STATS = {
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
  const stats = PERIOD_STATS[period];
  const monthMax = Math.max(...MONTHLY_TREND.map((m) => m.total));
  const weekMax = Math.max(...WEEKLY_SALES.map((d) => d.ventas));
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
    >
      {/* Export modal */}
      {exportModalOpen && (
        <ExportModal onClose={() => setExportModalOpen(false)} />
      )}

      <AdminSidebar activePage="reports" user={user} onLogout={handleLogout} />

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
              Reportes estadísticos
            </h1>
            <p style={{ fontSize: 14, color: T.textMut, margin: 0 }}>
              Análisis de ventas, productos y desempeño del equipo
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {/* Period selector */}
            <div
              style={{
                display: "flex",
                gap: 4,
                padding: 4,
                borderRadius: 12,
                background: T.elevated,
                border: `1px solid ${T.border}`,
              }}
            >
              {(["semana", "mes", "año"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  style={{
                    padding: "7px 16px",
                    borderRadius: 9,
                    fontSize: 12,
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    background: period === p ? T.surface : "transparent",
                    color: period === p ? T.text : T.textMut,
                    boxShadow: period === p ? T.shadow : "none",
                    transition: "all .15s",
                    textTransform: "capitalize",
                  }}
                >
                  Esta {p}
                </button>
              ))}
            </div>

            {/* ← Botón exportar ahora abre el modal directamente */}
            <button
              onClick={() => setExportModalOpen(true)}
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
                transition: "all .15s",
              }}
            >
              <Download size={15} /> Exportar
            </button>
          </div>
        </header>

        {/* KPI cards */}
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
              l: "Ventas totales",
              v: `$${fmt(stats.ventas)}`,
              c: T.brand,
              icon: <TrendingUp size={16} />,
              change: stats.growth,
            },
            {
              l: "Pedidos",
              v: stats.pedidos,
              c: T.info,
              icon: <ClipboardList size={16} />,
              change: 5.2,
            },
            {
              l: "Ticket promedio",
              v: `$${fmt(stats.ticket)}`,
              c: T.ok,
              icon: <DollarSign size={16} />,
              change: -1.8,
            },
            {
              l: "Clientes únicos",
              v: stats.clientes,
              c: "#7c3aed",
              icon: <Users size={16} />,
              change: stats.growth,
            },
          ].map((s) => (
            <div
              key={s.l}
              style={{
                background: T.surface,
                borderRadius: 20,
                border: `1px solid ${T.border}`,
                padding: "20px",
                boxShadow: T.shadow,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: `${s.c}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: s.c,
                  }}
                >
                  {s.icon}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    fontSize: 11,
                    fontWeight: 800,
                    color: s.change >= 0 ? T.ok : T.danger,
                  }}
                >
                  {s.change >= 0 ? (
                    <ArrowUpRight size={12} />
                  ) : (
                    <ArrowDownRight size={12} />
                  )}
                  {Math.abs(s.change)}%
                </div>
              </div>
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
              <p style={{ fontSize: 10, color: T.textMut, margin: 0 }}>
                vs. período anterior
              </p>
            </div>
          ))}
        </div>

        {/* Charts row 1 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            marginBottom: 20,
          }}
        >
          {/* Weekly sales bar */}
          <div
            style={{
              background: T.surface,
              borderRadius: 20,
              border: `1px solid ${T.border}`,
              padding: "22px",
              boxShadow: T.shadow,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 20,
              }}
            >
              <div>
                <h3
                  style={{
                    fontFamily: T.fontD,
                    fontWeight: 900,
                    fontSize: 16,
                    color: T.text,
                    margin: "0 0 3px",
                  }}
                >
                  Ventas por día
                </h3>
                <p style={{ fontSize: 11, color: T.textMut, margin: 0 }}>
                  Esta semana
                </p>
              </div>
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  fontFamily: T.fontD,
                  color: T.brand,
                }}
              >
                ${fmt(WEEKLY_SALES.reduce((s, d) => s + d.ventas, 0))}
              </span>
            </div>
            <BarChart
              data={WEEKLY_SALES}
              valueKey="ventas"
              maxVal={weekMax}
              color={T.brand}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 14,
                paddingTop: 14,
                borderTop: `1px solid ${T.border}`,
              }}
            >
              {[
                { l: "Mejor día", v: "Sábado $9,400" },
                { l: "Peor día", v: "Martes $3,800" },
                { l: "Promedio", v: `$${fmt(43050 / 7)}` },
              ].map((r) => (
                <div key={r.l}>
                  <p
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: T.textMut,
                      textTransform: "uppercase",
                      letterSpacing: ".1em",
                      margin: "0 0 2px",
                    }}
                  >
                    {r.l}
                  </p>
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: T.text,
                      margin: 0,
                    }}
                  >
                    {r.v}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly trend */}
          <div
            style={{
              background: T.surface,
              borderRadius: 20,
              border: `1px solid ${T.border}`,
              padding: "22px",
              boxShadow: T.shadow,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 20,
              }}
            >
              <div>
                <h3
                  style={{
                    fontFamily: T.fontD,
                    fontWeight: 900,
                    fontSize: 16,
                    color: T.text,
                    margin: "0 0 3px",
                  }}
                >
                  Tendencia mensual
                </h3>
                <p style={{ fontSize: 11, color: T.textMut, margin: 0 }}>
                  Últimos 7 meses
                </p>
              </div>
            </div>
            <BarChart
              data={MONTHLY_TREND}
              valueKey="total"
              maxVal={monthMax}
              color={T.info}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 14,
                paddingTop: 14,
                borderTop: `1px solid ${T.border}`,
              }}
            >
              {[
                { l: "Mejor mes", v: "Diciembre" },
                { l: "MoM actual", v: "+3.1%" },
                { l: "Proyección", v: "$148k" },
              ].map((r) => (
                <div key={r.l}>
                  <p
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: T.textMut,
                      textTransform: "uppercase",
                      letterSpacing: ".1em",
                      margin: "0 0 2px",
                    }}
                  >
                    {r.l}
                  </p>
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: T.text,
                      margin: 0,
                    }}
                  >
                    {r.v}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts row 2 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr",
            gap: 20,
            marginBottom: 20,
          }}
        >
          {/* Top products */}
          <div
            style={{
              background: T.surface,
              borderRadius: 20,
              border: `1px solid ${T.border}`,
              padding: "22px",
              boxShadow: T.shadow,
            }}
          >
            <h3
              style={{
                fontFamily: T.fontD,
                fontWeight: 900,
                fontSize: 16,
                color: T.text,
                margin: "0 0 18px",
              }}
            >
              Platillos más vendidos
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {TOP_PRODUCTS.map((p, i) => {
                const maxV = TOP_PRODUCTS[0].ventas;
                return (
                  <div
                    key={i}
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <span
                      style={{
                        width: 20,
                        fontSize: 12,
                        fontWeight: 900,
                        color: i < 3 ? T.brand : T.textMut,
                        textAlign: "right",
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "baseline",
                          marginBottom: 4,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: T.text,
                          }}
                        >
                          {p.name}
                        </span>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: T.textSec,
                            }}
                          >
                            {p.ventas} uds
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 800,
                              color: p.trend >= 0 ? T.ok : T.danger,
                            }}
                          >
                            {p.trend >= 0 ? "+" : ""}
                            {p.trend}%
                          </span>
                        </div>
                      </div>
                      <div
                        style={{
                          height: 5,
                          background: T.border,
                          borderRadius: 99,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            borderRadius: 99,
                            background: i < 3 ? T.brand : `${T.brand}60`,
                            width: `${(p.ventas / maxV) * 100}%`,
                            transition: "width .4s",
                          }}
                        />
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: T.ok,
                        minWidth: 70,
                        textAlign: "right",
                        flexShrink: 0,
                      }}
                    >
                      ${fmt(p.ingreso)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment distribution */}
          <div
            style={{
              background: T.surface,
              borderRadius: 20,
              border: `1px solid ${T.border}`,
              padding: "22px",
              boxShadow: T.shadow,
            }}
          >
            <h3
              style={{
                fontFamily: T.fontD,
                fontWeight: 900,
                fontSize: 16,
                color: T.text,
                margin: "0 0 18px",
              }}
            >
              Métodos de pago
            </h3>
            <DonutChart segments={PAYMENT_DIST} />
            <div
              style={{
                marginTop: 16,
                padding: "12px 14px",
                background: T.elevated,
                borderRadius: 12,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: T.textMut,
                    textTransform: "uppercase",
                    letterSpacing: ".1em",
                    margin: "0 0 2px",
                  }}
                >
                  Total período
                </p>
                <p
                  style={{
                    fontFamily: T.fontD,
                    fontSize: 18,
                    fontWeight: 900,
                    color: T.brand,
                    margin: 0,
                  }}
                >
                  $68,000
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: T.textMut,
                    textTransform: "uppercase",
                    letterSpacing: ".1em",
                    margin: "0 0 2px",
                  }}
                >
                  Transacciones
                </p>
                <p
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    color: T.text,
                    margin: 0,
                  }}
                >
                  183
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Staff metrics */}
        <div
          style={{
            background: T.surface,
            borderRadius: 20,
            border: `1px solid ${T.border}`,
            padding: "22px",
            boxShadow: T.shadow,
          }}
        >
          <h3
            style={{
              fontFamily: T.fontD,
              fontWeight: 900,
              fontSize: 16,
              color: T.text,
              margin: "0 0 18px",
            }}
          >
            Métricas de personal
          </h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: T.elevated, borderRadius: 10 }}>
                {[
                  "Colaborador",
                  "Rol",
                  "Pedidos atendidos",
                  "Propinas recibidas",
                  "Satisfacción",
                  "Tendencia",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 16px",
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: ".12em",
                      textTransform: "uppercase",
                      color: T.textMut,
                      textAlign: "left",
                      borderBottom: `1px solid ${T.border}`,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {STAFF_METRICS.map((s, i) => {
                const sparkData = [4.2, 4.5, 4.3, 4.7, s.satisfaccion].map(
                  (v) => v + (Math.random() - 0.5) * 0.3,
                );

                return (
                  <tr
                    key={i}
                    style={{ borderBottom: `1px solid ${T.border}` }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = T.elevated)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 10,
                            background: `${T.brand}20`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: 900,
                            color: T.brand,
                          }}
                        >
                          {s.name[0]}
                        </div>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: T.text,
                          }}
                        >
                          {s.name}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "3px 9px",
                          borderRadius: 99,
                          background: T.elevated,
                          color: T.textSec,
                        }}
                      >
                        {s.rol}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 800,
                          color: T.text,
                        }}
                      >
                        {s.pedidos || "—"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 800,
                          color: s.propinas > 0 ? T.ok : T.textMut,
                        }}
                      >
                        {s.propinas > 0 ? `$${fmt(s.propinas)}` : "—"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <div style={{ display: "flex", gap: 1 }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              style={{
                                fontSize: 12,
                                color:
                                  star <= Math.round(s.satisfaccion)
                                    ? "#f59e0b"
                                    : "#e2e8f0",
                              }}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 800,
                            color: T.text,
                          }}
                        >
                          {s.satisfaccion}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Sparkline data={sparkData} color={T.brand} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
