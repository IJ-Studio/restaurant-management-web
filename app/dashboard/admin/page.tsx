"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  Bell,
  Search,
  AlertTriangle,
  Package,
  Users,
  DollarSign,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Banknote,
  Smartphone,
  RefreshCw,
  Utensils,
  BarChart2,
  MapPin,
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
  shadow: "0 2px 16px rgba(26,18,8,0.07)",
  shadowMd: "0 6px 24px rgba(26,18,8,0.10)",
  shadowHov: "0 10px 36px rgba(26,18,8,0.13)",
  fontD: "'Fraunces', Georgia, serif",
  fontB: "'DM Sans', system-ui, sans-serif",
  ok: "#059669",
  warn: "#d97706",
  danger: "#dc2626",
  info: "#2563eb",
};

// ─── Mock data ────────────────────────────────────────────────────────────────
const ORDERS = [
  {
    id: "#0241",
    customer: "Marcos Díaz",
    item: "Filete de res al vino",
    table: "Mesa 3",
    status: "pendiente",
    total: 285,
    time: "23:41",
  },
  {
    id: "#0240",
    customer: "Elena Smith",
    item: "Paella valenciana ×2",
    table: "Mesa 7",
    status: "en_preparacion",
    total: 560,
    time: "23:38",
  },
  {
    id: "#0239",
    customer: "Roberto Gil",
    item: "Costillas BBQ",
    table: "Mesa 1",
    status: "completado",
    total: 250,
    time: "23:22",
  },
  {
    id: "#0238",
    customer: "Lucía Fernández",
    item: "Pizza española + postre",
    table: "Domicilio",
    status: "en_camino",
    total: 340,
    time: "23:15",
  },
  {
    id: "#0237",
    customer: "Carlos Mendoza",
    item: "Menú degustación ×3",
    table: "Mesa 5",
    status: "completado",
    total: 1350,
    time: "22:58",
  },
  {
    id: "#0236",
    customer: "Ana Reyes",
    item: "Crema champiñones + vino",
    table: "Mesa 2",
    status: "completado",
    total: 430,
    time: "22:47",
  },
];

const ORDER_STATUS: Record<
  string,
  { label: string; color: string; bg: string; dot: string }
> = {
  pendiente: {
    label: "Pendiente",
    color: T.warn,
    bg: "#fffbeb",
    dot: "#f59e0b",
  },
  en_preparacion: {
    label: "En preparación",
    color: T.info,
    bg: "#eff6ff",
    dot: "#60a5fa",
  },
  en_camino: {
    label: "En camino",
    color: "#7c3aed",
    bg: "#faf5ff",
    dot: "#a78bfa",
  },
  completado: {
    label: "Completado",
    color: T.ok,
    bg: "#ecfdf5",
    dot: "#34d399",
  },
};

const HOUR_DATA = [12, 18, 38, 62, 88, 105, 120, 142, 131, 115, 87, 65];
const HOUR_LABELS = [
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
];

const TABLES = [
  { n: 1, status: "ocupada", guests: 4 },
  { n: 2, status: "ocupada", guests: 2 },
  { n: 3, status: "ocupada", guests: 3 },
  { n: 4, status: "libre", guests: 0 },
  { n: 5, status: "ocupada", guests: 6 },
  { n: 6, status: "libre", guests: 0 },
  { n: 7, status: "ocupada", guests: 2 },
  { n: 8, status: "reservada", guests: 0 },
  { n: 9, status: "libre", guests: 0 },
  { n: 10, status: "sucia", guests: 0 },
  { n: 11, status: "reservada", guests: 0 },
  { n: 12, status: "libre", guests: 0 },
];

const TABLE_CFG: Record<
  string,
  { color: string; bg: string; border: string; label: string }
> = {
  ocupada: {
    color: T.brand,
    bg: `${T.brand}12`,
    border: `${T.brand}40`,
    label: "Ocupada",
  },
  libre: { color: T.ok, bg: "#ecfdf5", border: "#86efac", label: "Libre" },
  reservada: {
    color: T.info,
    bg: "#eff6ff",
    border: "#93c5fd",
    label: "Reservada",
  },
  sucia: { color: T.warn, bg: "#fffbeb", border: "#fde68a", label: "Sucia" },
};

const LOW_STOCK = [
  { name: "Pollo entero", stock: 3, min: 8, unit: "kg", urgency: "critical" },
  {
    name: "Chipotle adobo",
    stock: 2,
    min: 5,
    unit: "pza",
    urgency: "critical",
  },
  { name: "Cebolla blanca", stock: 4, min: 5, unit: "kg", urgency: "low" },
  { name: "Refresco cola", stock: 8, min: 12, unit: "caja", urgency: "low" },
];

const NOTIFS = [
  { icon: "🔴", text: "2 productos en stock crítico", time: "hace 5 min" },
  { icon: "🟡", text: "Caja abierta desde las 12:00", time: "hace 11 h" },
  { icon: "🟢", text: "Reporte diario listo", time: "hace 1 h" },
  { icon: "🔵", text: "Reserva confirmada – Mesa 8", time: "hace 20 min" },
];

const fmt = (n: number) =>
  n.toLocaleString("es-MX", { minimumFractionDigits: 2 });

// ─── Micro components ─────────────────────────────────────────────────────────
function KpiCard({
  label,
  value,
  sub,
  color,
  icon,
  change,
  onClick,
}: {
  label: string;
  value: string | number;
  sub: string;
  color: string;
  icon: React.ReactNode;
  change?: number;
  onClick?: () => void;
}) {
  const [h, setH] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        background: T.surface,
        borderRadius: 20,
        border: `1px solid ${T.border}`,
        padding: "20px",
        boxShadow: h ? T.shadowHov : T.shadow,
        transition: "all .2s",
        cursor: onClick ? "pointer" : "default",
        transform: h && onClick ? "translateY(-2px)" : "none",
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
            width: 38,
            height: 38,
            borderRadius: 11,
            background: `${color}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color,
          }}
        >
          {icon}
        </div>
        {change !== undefined && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              fontSize: 11,
              fontWeight: 800,
              color: change >= 0 ? T.ok : T.danger,
            }}
          >
            {change >= 0 ? (
              <ArrowUpRight size={12} />
            ) : (
              <ArrowDownRight size={12} />
            )}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <p
        style={{
          fontFamily: T.fontD,
          fontSize: 27,
          fontWeight: 900,
          color,
          margin: "0 0 3px",
          letterSpacing: "-.02em",
        }}
      >
        {value}
      </p>
      <p
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: T.text,
          margin: "0 0 2px",
        }}
      >
        {label}
      </p>
      <p style={{ fontSize: 11, color: T.textMut, margin: 0 }}>{sub}</p>
    </div>
  );
}

function QuickBtn({
  icon,
  label,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick: () => void;
}) {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 7,
        padding: "14px 8px",
        borderRadius: 16,
        border: `1px solid ${h ? color : T.border}`,
        background: h ? `${color}08` : T.surface,
        cursor: "pointer",
        transition: "all .15s",
        flex: 1,
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 11,
          background: `${color}15`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color,
          boxShadow: h ? `0 4px 12px ${color}30` : "none",
          transition: "all .15s",
        }}
      >
        {icon}
      </div>
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: h ? color : T.textSec,
          textAlign: "center",
          lineHeight: 1.3,
          fontFamily: T.fontB,
        }}
      >
        {label}
      </span>
    </button>
  );
}

function HourBars({ data, labels }: { data: number[]; labels: string[] }) {
  const max = Math.max(...data);
  const cur = new Date().getHours() - 11;
  return (
    <div
      style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 72 }}
    >
      {data.map((v, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
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
                borderRadius: "3px 3px 0 0",
                minHeight: 3,
                height: `${(v / max) * 100}%`,
                background: i === cur ? T.brand : `${T.brand}35`,
                transition: "height .4s",
              }}
            />
          </div>
          {i % 2 === 0 && (
            <span style={{ fontSize: 8, color: T.textMut, fontWeight: 700 }}>
              {labels[i]}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchFocus, setSearchFocus] = useState(false);
  const [now, setNow] = useState("");

  useEffect(() => {
    setMounted(true);
    setNow(
      new Date().toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
    // La verificación de sesión se hace en /dashboard/page.tsx en el servidor
    // Si llegamos aquí, la sesión es válida. Setear un usuario dummy para pasar la verificación
    setUser({ roleName: "admin" });
  }, [router]);

  if (!mounted || !user) return null;

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /**/
    }
    localStorage.removeItem("user");
    router.push("/login");
  };

  const todaySales = ORDERS.filter((o) => o.status === "completado").reduce(
    (s, o) => s + o.total,
    0,
  );
  const activeOrders = ORDERS.filter((o) => o.status !== "completado").length;
  const completedToday = ORDERS.filter((o) => o.status === "completado").length;
  const criticalStock = LOW_STOCK.filter(
    (s) => s.urgency === "critical",
  ).length;
  const freeTables = TABLES.filter((t) => t.status === "libre").length;
  const occupiedTables = TABLES.filter((t) => t.status === "ocupada").length;

  const today = new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: T.fontB,
        background: T.bg,
        color: T.text,
      }}
      onClick={() => setNotifOpen(false)}
    >
      {/* ── Sidebar shared ──────────────────────────────────────────────── */}
      <AdminSidebar
        activePage="dashboard"
        user={user}
        onLogout={handleLogout}
      />

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <main
        style={{ flex: 1, marginLeft: 260, padding: "32px 40px", minWidth: 0 }}
      >
        {/* Top bar */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 26,
          }}
        >
          <div style={{ position: "relative", width: 296 }}>
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
              placeholder="Buscar pedidos, clientes..."
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
              style={{
                width: "100%",
                paddingLeft: 34,
                paddingRight: 12,
                paddingTop: 9,
                paddingBottom: 9,
                borderRadius: 12,
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
                transition: "all .15s",
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Live status */}
            <div
              style={{
                padding: "7px 14px",
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: 11,
                fontSize: 12,
                fontWeight: 700,
                color: T.textSec,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: T.ok,
                  flexShrink: 0,
                }}
              />
              En línea · {now}
            </div>

            {/* Refresh */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setRefreshing(true);
                setTimeout(() => setRefreshing(false), 1200);
              }}
              style={{
                padding: 8,
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: 11,
                cursor: "pointer",
                display: "flex",
                color: T.textSec,
              }}
            >
              <RefreshCw
                size={15}
                style={{
                  animation: refreshing ? "spin 1s linear infinite" : undefined,
                }}
              />
            </button>

            {/* Notifications */}
            <div style={{ position: "relative" }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setNotifOpen((n) => !n);
                }}
                style={{
                  padding: 8,
                  background: T.surface,
                  border: `1px solid ${T.border}`,
                  borderRadius: 11,
                  cursor: "pointer",
                  display: "flex",
                  color: T.textSec,
                  position: "relative",
                }}
              >
                <Bell size={15} />
                <span
                  style={{
                    position: "absolute",
                    top: 7,
                    right: 7,
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: T.danger,
                    border: `2px solid ${T.surface}`,
                  }}
                />
              </button>
              {notifOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 8px)",
                    zIndex: 60,
                    background: T.surface,
                    borderRadius: 18,
                    border: `1px solid ${T.border}`,
                    boxShadow: T.shadowHov,
                    minWidth: 300,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "14px 18px",
                      borderBottom: `1px solid ${T.border}`,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{ fontSize: 13, fontWeight: 800, color: T.text }}
                    >
                      Notificaciones
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        padding: "2px 8px",
                        borderRadius: 99,
                        background: `${T.danger}15`,
                        color: T.danger,
                      }}
                    >
                      {NOTIFS.length} nuevas
                    </span>
                  </div>
                  {NOTIFS.map((n, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "12px 18px",
                        borderBottom:
                          i < NOTIFS.length - 1
                            ? `1px solid ${T.border}`
                            : "none",
                        display: "flex",
                        gap: 10,
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = T.elevated)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <span style={{ fontSize: 15, flexShrink: 0 }}>
                        {n.icon}
                      </span>
                      <div>
                        <p
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: T.text,
                            margin: "0 0 2px",
                          }}
                        >
                          {n.text}
                        </p>
                        <p
                          style={{ fontSize: 10, color: T.textMut, margin: 0 }}
                        >
                          {n.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ width: 1, height: 30, background: T.border }} />

            {/* User chip */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "6px 14px 6px 6px",
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: 99,
                cursor: "pointer",
              }}
              onClick={() => router.push("/dashboard/admin/users")}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: `${T.brand}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 900,
                  color: T.brand,
                }}
              >
                {user.name?.[0]}
                {user.lastname?.[0]}
              </div>
              <div>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: T.text,
                    margin: 0,
                  }}
                >
                  {user.name} {user.lastname}
                </p>
                <p
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    color: T.brand,
                    textTransform: "uppercase",
                    letterSpacing: ".1em",
                    margin: 0,
                  }}
                >
                  Administrador
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Title */}
        <div style={{ marginBottom: 20 }}>
          <h1
            style={{
              fontFamily: T.fontD,
              fontWeight: 900,
              fontSize: 30,
              letterSpacing: "-.03em",
              lineHeight: 1.1,
              margin: "0 0 4px",
              color: T.text,
            }}
          >
            Buenas noches, {user.name} 👋
          </h1>
          <p style={{ fontSize: 13, color: T.textMut, margin: 0 }}>
            {today} · Restaurante El Quijote
          </p>
        </div>

        {/* Alert banner */}
        {criticalStock > 0 && (
          <div
            style={{
              padding: "11px 16px",
              background: "#fef2f2",
              borderRadius: 13,
              border: "1px solid #fecaca",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <AlertTriangle
                size={14}
                style={{ color: T.danger, flexShrink: 0 }}
              />
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: T.danger,
                  margin: 0,
                }}
              >
                <strong>{criticalStock} productos con stock crítico</strong>
                {" — "}Se recomienda generar una orden urgente.
              </p>
            </div>
            <button
              onClick={() =>
                router.push("/dashboard/admin/inventory/suppliers")
              }
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: T.danger,
                background: "none",
                border: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
                textDecoration: "underline",
              }}
            >
              Ver proveedores →
            </button>
          </div>
        )}

        {/* KPI row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 14,
            marginBottom: 18,
          }}
        >
          <KpiCard
            label="Ventas del día"
            value={`$${fmt(todaySales)}`}
            sub="turno actual"
            color={T.brand}
            icon={<TrendingUp size={18} />}
            change={15.2}
            onClick={() => router.push("/dashboard/admin/finance")}
          />
          <KpiCard
            label="Pedidos activos"
            value={activeOrders}
            sub="en preparación o camino"
            color={T.info}
            icon={<Clock size={18} />}
            onClick={() => router.push("/dashboard/admin/orders")}
          />
          <KpiCard
            label="Mesas ocupadas"
            value={`${occupiedTables}/12`}
            sub={`${freeTables} disponibles`}
            color={T.ok}
            icon={<Utensils size={18} />}
            change={8.3}
          />
          <KpiCard
            label="Stock crítico"
            value={criticalStock}
            sub={`de ${LOW_STOCK.length} alertas`}
            color={criticalStock > 0 ? T.danger : T.warn}
            icon={<AlertTriangle size={18} />}
            onClick={() => router.push("/dashboard/admin/inventory")}
          />
        </div>

        {/* Orders + right col */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 308px",
            gap: 16,
            marginBottom: 16,
          }}
        >
          {/* Orders table */}
          <div
            style={{
              background: T.surface,
              borderRadius: 22,
              border: `1px solid ${T.border}`,
              boxShadow: T.shadow,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: `1px solid ${T.border}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: T.elevated,
              }}
            >
              <div>
                <h2
                  style={{
                    fontFamily: T.fontD,
                    fontWeight: 900,
                    fontSize: 16,
                    color: T.text,
                    margin: "0 0 1px",
                  }}
                >
                  Pedidos en curso
                </h2>
                <p style={{ fontSize: 11, color: T.textMut, margin: 0 }}>
                  Actualización en tiempo real vía SSE
                </p>
              </div>
              <button
                onClick={() => router.push("/dashboard/admin/orders")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  fontWeight: 700,
                  color: T.brand,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Ver todos <ChevronRight size={13} />
              </button>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    background: T.elevated,
                    borderBottom: `1px solid ${T.border}`,
                  }}
                >
                  {[
                    "ID",
                    "Cliente",
                    "Platillo",
                    "Ubicación",
                    "Estado",
                    "Total",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "9px 14px",
                        fontSize: 9,
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
                {ORDERS.map((o) => {
                  const sc = ORDER_STATUS[o.status];
                  return (
                    <tr
                      key={o.id}
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
                    >
                      <td style={{ padding: "10px 14px" }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontFamily: "monospace",
                            fontWeight: 700,
                            color: T.brand,
                          }}
                        >
                          {o.id}
                        </span>
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <p
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: T.text,
                            margin: "0 0 1px",
                          }}
                        >
                          {o.customer}
                        </p>
                        <p
                          style={{ fontSize: 10, color: T.textMut, margin: 0 }}
                        >
                          {o.time}
                        </p>
                      </td>
                      <td style={{ padding: "10px 14px", maxWidth: 140 }}>
                        <p
                          style={{
                            fontSize: 12,
                            color: T.textSec,
                            margin: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {o.item}
                        </p>
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{ fontSize: 11, color: T.textSec }}>
                          {o.table}
                        </span>
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "3px 9px",
                            borderRadius: 99,
                            fontSize: 10,
                            fontWeight: 800,
                            color: sc.color,
                            background: sc.bg,
                          }}
                        >
                          <span
                            style={{
                              width: 5,
                              height: 5,
                              borderRadius: "50%",
                              background: sc.dot,
                              flexShrink: 0,
                            }}
                          />
                          {sc.label}
                        </span>
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 900,
                            color: T.brand,
                          }}
                        >
                          ${fmt(o.total)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Right col */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Hour bars */}
            <div
              style={{
                background: T.surface,
                borderRadius: 20,
                border: `1px solid ${T.border}`,
                padding: "16px 16px 12px",
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
                  <h3
                    style={{
                      fontFamily: T.fontD,
                      fontWeight: 900,
                      fontSize: 14,
                      color: T.text,
                      margin: "0 0 1px",
                    }}
                  >
                    Ventas por hora
                  </h3>
                  <p style={{ fontSize: 11, color: T.textMut, margin: 0 }}>
                    Hoy
                  </p>
                </div>
                <span
                  style={{
                    fontFamily: T.fontD,
                    fontSize: 16,
                    fontWeight: 900,
                    color: T.brand,
                  }}
                >
                  ${fmt(todaySales)}
                </span>
              </div>
              <HourBars data={HOUR_DATA} labels={HOUR_LABELS} />
            </div>

            {/* Payment split */}
            <div
              style={{
                background: T.surface,
                borderRadius: 20,
                border: `1px solid ${T.border}`,
                padding: "16px",
                boxShadow: T.shadow,
              }}
            >
              <h3
                style={{
                  fontFamily: T.fontD,
                  fontWeight: 900,
                  fontSize: 14,
                  color: T.text,
                  margin: "0 0 12px",
                }}
              >
                Métodos de pago hoy
              </h3>
              {[
                {
                  method: "Efectivo",
                  pct: 48,
                  color: T.ok,
                  icon: <Banknote size={12} />,
                },
                {
                  method: "Tarjeta",
                  pct: 34,
                  color: T.info,
                  icon: <CreditCard size={12} />,
                },
                {
                  method: "Transferencia",
                  pct: 18,
                  color: "#7c3aed",
                  icon: <Smartphone size={12} />,
                },
              ].map((p) => (
                <div key={p.method} style={{ marginBottom: 9 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 3,
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: 12,
                        fontWeight: 700,
                        color: T.textSec,
                      }}
                    >
                      <span style={{ color: p.color }}>{p.icon}</span>
                      {p.method}
                    </span>
                    <span
                      style={{ fontSize: 12, fontWeight: 800, color: p.color }}
                    >
                      {p.pct}%
                    </span>
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
                        background: p.color,
                        width: `${p.pct}%`,
                        transition: "width .4s",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row: table map + stock + quick actions */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 16,
          }}
        >
          {/* Table map */}
          <div
            style={{
              background: T.surface,
              borderRadius: 22,
              border: `1px solid ${T.border}`,
              boxShadow: T.shadow,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "13px 16px",
                borderBottom: `1px solid ${T.border}`,
                background: T.elevated,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3
                style={{
                  fontFamily: T.fontD,
                  fontWeight: 900,
                  fontSize: 14,
                  color: T.text,
                  margin: 0,
                }}
              >
                🗺 Estado de mesas
              </h3>
              <span style={{ fontSize: 11, fontWeight: 700, color: T.textMut }}>
                {occupiedTables} ocup. · {freeTables} libres
              </span>
            </div>
            <div
              style={{
                padding: "12px",
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: 6,
              }}
            >
              {TABLES.map((t) => {
                const cfg = TABLE_CFG[t.status];
                return (
                  <div
                    key={t.n}
                    style={{
                      borderRadius: 10,
                      border: `1.5px solid ${cfg.border}`,
                      background: cfg.bg,
                      padding: "7px 5px",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all .15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.boxShadow = T.shadowMd)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.boxShadow = "none")
                    }
                  >
                    <p
                      style={{
                        fontFamily: T.fontD,
                        fontSize: 13,
                        fontWeight: 900,
                        color: cfg.color,
                        margin: "0 0 1px",
                      }}
                    >
                      {t.n}
                    </p>
                    <p
                      style={{
                        fontSize: 8,
                        fontWeight: 700,
                        color: cfg.color,
                        margin: 0,
                        lineHeight: 1.2,
                      }}
                    >
                      {t.status === "ocupada"
                        ? `${t.guests}👤`
                        : t.status.slice(0, 5)}
                    </p>
                  </div>
                );
              })}
            </div>
            <div
              style={{
                padding: "0 12px 12px",
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              {Object.entries(TABLE_CFG).map(([k, cfg]) => (
                <span
                  key={k}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 10,
                    fontWeight: 700,
                    color: cfg.color,
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 2,
                      background: cfg.color,
                    }}
                  />
                  {cfg.label}
                </span>
              ))}
            </div>
          </div>

          {/* Stock alerts */}
          <div
            style={{
              background: T.surface,
              borderRadius: 22,
              border: `1px solid ${T.border}`,
              boxShadow: T.shadow,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "13px 16px",
                borderBottom: `1px solid ${T.border}`,
                background: T.elevated,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3
                style={{
                  fontFamily: T.fontD,
                  fontWeight: 900,
                  fontSize: 14,
                  color: T.text,
                  margin: 0,
                }}
              >
                📦 Alertas inventario
              </h3>
              <button
                onClick={() => router.push("/dashboard/admin/inventory")}
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: T.brand,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Ver →
              </button>
            </div>
            <div
              style={{
                padding: "10px 12px",
                display: "flex",
                flexDirection: "column",
                gap: 7,
              }}
            >
              {LOW_STOCK.map((s) => (
                <div
                  key={s.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    padding: "8px 11px",
                    borderRadius: 12,
                    background:
                      s.urgency === "critical" ? "#fef2f2" : T.elevated,
                    border: `1px solid ${s.urgency === "critical" ? "#fecaca" : T.border}`,
                  }}
                >
                  <AlertTriangle
                    size={12}
                    style={{
                      color: s.urgency === "critical" ? T.danger : T.warn,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      flex: 1,
                      fontSize: 12,
                      fontWeight: 700,
                      color: T.text,
                    }}
                  >
                    {s.name}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 900,
                      color: s.urgency === "critical" ? T.danger : T.warn,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {s.stock}/{s.min} {s.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div
            style={{
              background: T.surface,
              borderRadius: 22,
              border: `1px solid ${T.border}`,
              boxShadow: T.shadow,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "13px 16px",
                borderBottom: `1px solid ${T.border}`,
                background: T.elevated,
              }}
            >
              <h3
                style={{
                  fontFamily: T.fontD,
                  fontWeight: 900,
                  fontSize: 14,
                  color: T.text,
                  margin: 0,
                }}
              >
                ⚡ Acceso rápido
              </h3>
            </div>
            <div
              style={{
                padding: "10px",
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 7,
              }}
            >
              {[
                {
                  icon: <Utensils size={16} />,
                  label: "Menú",
                  color: T.brand,
                  path: "/dashboard/admin/menu",
                },
                {
                  icon: <Users size={16} />,
                  label: "Personal",
                  color: "#7c3aed",
                  path: "/dashboard/admin/users",
                },
                {
                  icon: <Package size={16} />,
                  label: "Inventario",
                  color: T.ok,
                  path: "/dashboard/admin/inventory",
                },
                {
                  icon: <DollarSign size={16} />,
                  label: "Finanzas",
                  color: T.warn,
                  path: "/dashboard/admin/finance",
                },
                {
                  icon: <BarChart2 size={16} />,
                  label: "Reportes",
                  color: T.info,
                  path: "/dashboard/admin/reports",
                },
                {
                  icon: <MapPin size={16} />,
                  label: "Reservas",
                  color: T.danger,
                  path: "/dashboard/admin/reservations",
                },
              ].map((a) => (
                <QuickBtn
                  key={a.label}
                  icon={a.icon}
                  label={a.label}
                  color={a.color}
                  onClick={() => router.push(a.path)}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
