"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useSelector } from "react-redux";

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
  Wifi,
  WifiOff,
  HardDrive,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Shield,
  Download,
  Plus,
  Trash2,
  X,
  Eye,
  EyeOff,
  ChevronRight,
  Zap,
  Database,
  Cloud,
  Lock,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

// By default this page calls Next.js API routes (/api). If NEXT_PUBLIC_API_URL
// is set, it will call an external backend instead (for example: http://localhost:3001).
const RAW_API_BASE = process.env.NEXT_PUBLIC_API_URL?.trim();
const API = (RAW_API_BASE && RAW_API_BASE.length > 0 ? RAW_API_BASE : "/api").replace(/\/$/, "");
const IS_EXTERNAL_BACKUP_API = API.startsWith("http");

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

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

// ─── Toggle switch ─────────────────────────────────────────────────────────────
function Toggle({
  value,
  onChange,
  color = T.brand,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  color?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      style={{
        width: 48,
        height: 26,
        borderRadius: 99,
        border: "none",
        cursor: "pointer",
        transition: "all .2s",
        position: "relative",
        flexShrink: 0,
        background: value ? color : T.borderMed,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          borderRadius: "50%",
          width: 20,
          height: 20,
          background: "#fff",
          transition: "all .2s",
          boxShadow: "0 1px 4px rgba(0,0,0,.25)",
          left: value ? "calc(100% - 23px)" : 3,
        }}
      />
    </button>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────
function Section({
  icon,
  title,
  subtitle,
  color = "#e85d04",
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: T.surface,
        borderRadius: 24,
        border: `1px solid ${T.border}`,
        boxShadow: T.shadow,
        overflow: "hidden",
        marginBottom: 20,
      }}
    >
      <div
        style={{
          padding: "20px 24px",
          borderBottom: `1px solid ${T.border}`,
          display: "flex",
          alignItems: "center",
          gap: 14,
          background: T.elevated,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: `${color}18`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div>
          <h2
            style={{
              fontFamily: T.fontD,
              fontWeight: 900,
              fontSize: 17,
              color: T.text,
              margin: "0 0 2px",
            }}
          >
            {title}
          </h2>
          <p style={{ fontSize: 12, color: T.textMut, margin: 0 }}>
            {subtitle}
          </p>
        </div>
      </div>
      <div style={{ padding: "22px 24px" }}>{children}</div>
    </div>
  );
}

// ─── Setting row ──────────────────────────────────────────────────────────────
function SettingRow({
  label,
  description,
  children,
  border = true,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
  border?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        paddingBottom: border ? 16 : 0,
        marginBottom: border ? 16 : 0,
        borderBottom: border ? `1px solid ${T.border}` : "none",
      }}
    >
      <div style={{ flex: 1 }}>
        <p
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: T.text,
            margin: "0 0 2px",
          }}
        >
          {label}
        </p>
        {description && (
          <p style={{ fontSize: 11, color: T.textMut, margin: 0 }}>
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── Backup item ──────────────────────────────────────────────────────────────
interface Backup {
  id: number;
  name: string;
  sizeBytes: number;  // antes era size: string
  driveUrl?: string;
  type: 'auto' | 'manual';
  status: 'ok' | 'error';
  createdAt: string;
}

// ─── Gateway ──────────────────────────────────────────────────────────────────
interface Gateway {
  id: number;
  name: string;
  logo: string;
  status: "activo" | "inactivo" | "prueba";
  apiKey: string;
  commission: number;
  methods: string[];
}
const GATEWAYS_DEFAULT: Gateway[] = [
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

const inp: React.CSSProperties = {
  padding: "9px 12px",
  border: `1px solid ${T.borderMed}`,
  borderRadius: 10,
  fontSize: 13,
  color: T.text,
  background: T.surface,
  outline: "none",
  fontFamily: T.fontB,
};

export default function SettingsPage() {
  const router = useRouter();

  // ── Offline mode state ────────────────────────────────────────────────────
  const [offline, setOffline] = useState(false);
  const [offlineSync, setOfflineSync] = useState(true);
  const [offlinePedidos, setOfflinePedidos] = useState(true);
  const [offlineCaja, setOfflineCaja] = useState(true);
  const [offlineMenu, setOfflineMenu] = useState(false);
  const [syncStatus, setSyncStatus] = useState<
    "synced" | "syncing" | "pending"
  >("synced");
  const [pendingOps] = useState(0);

  // ── Backups state ────────────────────────────────────────────────────────
  const [backups, setBackups] = useState<Backup[]>([]);
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupFreq, setBackupFreq] = useState("diario");
  const [backupTime, setBackupTime] = useState("23:00");
  const [backupCloud, setBackupCloud] = useState(true);
  const [backupRetain, setBackupRetain] = useState("30");
  const [syncing, setSyncing] = useState(false);

  // ── Gateways state ───────────────────────────────────────────────────────
  const [gateways, setGateways] = useState<Gateway[]>(GATEWAYS_DEFAULT);
  const [showKeys, setShowKeys] = useState<Record<number, boolean>>({});
  const [gwModal, setGwModal] = useState<Gateway | null>(null);

    //const user = useSelector((state) => state.auth.user);
  const user = useSelector((state: any) => state.auth.user);

  // Cargar al montar
  useEffect(() => {
    fetch(`${API}/backups`)
      .then((r) => r.json())
      .then((data) => {
        // Forzamos que sea un arreglo, si llega un objeto vacío {} o algo inesperado, lo convertimos a []
        setBackups(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Error de red:", err);
        setBackups([]); // Si hay error de fetch, mantenemos la lista vacía
      });
  }, []);

  function toggleGwStatus(id: number) {
    setGateways((gs) =>
      gs.map((g) =>
        g.id !== id
          ? g
          : {
              ...g,
              status: g.status === "activo" ? "inactivo" : "activo",
            },
      ),
    );
  }

  function handleManualBackup() {
    setSyncing(true);
    const res = fetch(`${API}/backups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      .then(r => r.json())
      .then(newB => {
        setBackups(bs => [newB, ...bs]);
        setSyncing(false);
      })
      .catch(() => setSyncing(false));
  }

  // Eliminar real — en el botón Trash2 de cada backup:
  async function handleDelete(id: number) {
    const url = IS_EXTERNAL_BACKUP_API
      ? `${API}/backups/${id}`
      : `${API}/backups?id=${id}`;
    await fetch(url, { method: 'DELETE' });
    setBackups(bs => bs.filter(x => x.id !== id));
  }

  const STATUS_CFG: Record<
    string,
    { label: string; color: string; bg: string }
  > = {
    activo: { label: "Activo", color: T.ok, bg: "#ecfdf5" },
    inactivo: { label: "Inactivo", color: T.textMut, bg: T.elevated },
    prueba: { label: "Prueba", color: T.warn, bg: "#fffbeb" },
  };
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
        <AdminSidebar
          activePage="settings"
          user={user}
          onLogout={handleLogout}
        />

        <main style={{ flex: 1, marginLeft: 260, padding: "40px 48px" }}>
          <header style={{ marginBottom: 32 }}>
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
              Configuración del sistema
            </h1>
            <p style={{ fontSize: 14, color: T.textMut, margin: 0 }}>
              Modo sin conexión, respaldos y pasarelas de pago
            </p>
          </header>

          {/* ── 1. MODO OFFLINE ─────────────────────────────────────────────── */}
          <Section
            icon={offline ? <WifiOff size={20} /> : <Wifi size={20} />}
            title="Modo sin conexión (Offline)"
            subtitle="Permite operar el sistema sin internet y sincronizar al reconectarse"
            color={offline ? T.warn : T.ok}
          >
            {/* Status banner */}
            <div
              style={{
                padding: "14px 18px",
                borderRadius: 16,
                marginBottom: 20,
                background: offline ? "#fffbeb" : "#ecfdf5",
                border: `1px solid ${offline ? "#fde68a" : "#86efac"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: offline ? T.warn : T.ok,
                    boxShadow: offline
                      ? `0 0 0 4px #fde68a`
                      : `0 0 0 4px #86efac`,
                  }}
                />
                <div>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: offline ? T.warn : T.ok,
                      margin: 0,
                    }}
                  >
                    {offline
                      ? "Sistema en modo sin conexión"
                      : "Sistema en línea"}
                  </p>
                  <p
                    style={{
                      fontSize: 11,
                      color: T.textSec,
                      margin: "2px 0 0",
                    }}
                  >
                    {offline
                      ? `${pendingOps} operaciones pendientes de sincronizar`
                      : "Última sincronización: hace 2 minutos"}
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {offline && (
                  <button
                    onClick={() => {
                      setSyncStatus("syncing");
                      setTimeout(() => {
                        setOffline(false);
                        setSyncStatus("synced");
                      }, 2000);
                    }}
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
                      background: T.ok,
                      color: "#fff",
                    }}
                  >
                    <RefreshCw
                      size={13}
                      style={{
                        animation:
                          syncStatus === "syncing"
                            ? "spin 1s linear infinite"
                            : undefined,
                      }}
                    />{" "}
                    Sincronizar ahora
                  </button>
                )}
                <Toggle value={offline} onChange={setOffline} color={T.warn} />
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: offline ? T.warn : T.ok,
                  }}
                >
                  {offline ? "Activado" : "Desactivado"}
                </span>
              </div>
            </div>

            <SettingRow
              label="Sincronización automática al reconectarse"
              description="Los datos se sincronizan automáticamente cuando recupera conexión"
            >
              <Toggle value={offlineSync} onChange={setOfflineSync} />
            </SettingRow>

            <p
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: T.textMut,
                letterSpacing: ".12em",
                textTransform: "uppercase",
                margin: "4px 0 14px",
              }}
            >
              Módulos disponibles sin conexión
            </p>

            {[
              {
                label: "Pedidos en mesa",
                desc: "Toma y gestión de pedidos sin internet",
                val: offlinePedidos,
                set: setOfflinePedidos,
              },
              {
                label: "Caja y cobros",
                desc: "Registro de pagos y movimientos de caja",
                val: offlineCaja,
                set: setOfflineCaja,
              },
              {
                label: "Catálogo menú",
                desc: "Visualización del menú para tomar pedidos",
                val: offlineMenu,
                set: setOfflineMenu,
              },
            ].map((r, i, arr) => (
              <SettingRow
                key={r.label}
                label={r.label}
                description={r.desc}
                border={i < arr.length - 1}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: r.val ? T.ok : T.textMut,
                    }}
                  >
                    {r.val ? "Habilitado" : "Deshabilitado"}
                  </span>
                  <Toggle value={r.val} onChange={r.set} />
                </div>
              </SettingRow>
            ))}

            <div
              style={{
                marginTop: 16,
                padding: "12px 16px",
                background: T.elevated,
                borderRadius: 12,
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
              }}
            >
              <AlertTriangle
                size={14}
                style={{ color: T.warn, flexShrink: 0, marginTop: 1 }}
              />
              <p style={{ fontSize: 11, color: T.textSec, margin: 0 }}>
                En modo offline, las facturas electrónicas y consultas de
                inventario avanzadas no están disponibles. Las órdenes de compra
                se enviarán automáticamente al reconectarse.
              </p>
            </div>
          </Section>

          {/* ── 2. BACKUPS ──────────────────────────────────────────────────── */}
          <Section
            icon={<HardDrive size={20} />}
            title="Respaldos de datos"
            subtitle="Configuración de copias de seguridad automáticas y manuales"
            color={T.info}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                marginBottom: 20,
              }}
            >
              {/* Config */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                <SettingRow
                  label="Respaldo automático"
                  description="Genera copias de seguridad en el horario definido"
                >
                  <Toggle
                    value={autoBackup}
                    onChange={setAutoBackup}
                    color={T.info}
                  />
                </SettingRow>

                {autoBackup && (
                  <>
                    <SettingRow label="Frecuencia" border={false}>
                      <select
                        value={backupFreq}
                        onChange={(e) => setBackupFreq(e.target.value)}
                        style={{ ...inp, padding: "7px 12px" }}
                      >
                        {["diario", "semanal", "mensual"].map((f) => (
                          <option key={f} value={f}>
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                          </option>
                        ))}
                      </select>
                    </SettingRow>
                    <SettingRow label="Hora de ejecución" border={false}>
                      <input
                        type="time"
                        value={backupTime}
                        onChange={(e) => setBackupTime(e.target.value)}
                        style={{ ...inp, padding: "7px 12px" }}
                      />
                    </SettingRow>
                  </>
                )}

                <div
                  style={{ borderTop: `1px solid ${T.border}`, paddingTop: 14 }}
                >
                  <SettingRow
                    label="Guardar en la nube"
                    description="Google Drive / servidor remoto"
                  >
                    <Toggle
                      value={backupCloud}
                      onChange={setBackupCloud}
                      color={T.info}
                    />
                  </SettingRow>
                  <SettingRow label="Retener por (días)" border={false}>
                    <input
                      type="number"
                      min={7}
                      max={365}
                      value={backupRetain}
                      onChange={(e) => setBackupRetain(e.target.value)}
                      style={{ ...inp, padding: "7px 12px", width: 80 }}
                    />
                  </SettingRow>
                </div>
              </div>

              {/* Stats */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {[
                  {
                    l: "Total respaldos",
                    v: Array.isArray(backups) ? backups.filter((b) => b.status === "ok").length : 0,
                    c: T.info,
                    icon: <Database size={16} />,
                  },
                  {
                    l: "Último respaldo",
                    v: "Hoy 23:00",
                    c: T.ok,
                    icon: <CheckCircle2 size={16} />,
                  },
                  {
                    l: "Tamaño promedio",
                    v: "41.2 MB",
                    c: T.brand,
                    icon: <HardDrive size={16} />,
                  },
                  {
                    l: "Almacenamiento",
                    v: backupCloud ? "Nube + Local" : "Solo local",
                    c: "#7c3aed",
                    icon: <Cloud size={16} />,
                  },
                ].map((s) => (
                  <div
                    key={s.l}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 14px",
                      background: T.elevated,
                      borderRadius: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 9,
                        background: `${s.c}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: s.c,
                      }}
                    >
                      {s.icon}
                    </div>
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
                        {s.l}
                      </p>
                      <p
                        style={{
                          fontSize: 14,
                          fontWeight: 800,
                          color: s.c,
                          margin: 0,
                        }}
                      >
                        {s.v}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Manual backup */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 18px",
                background: "#eff6ff",
                borderRadius: 14,
                border: "1px solid #93c5fd",
                marginBottom: 20,
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: T.info,
                    margin: "0 0 2px",
                  }}
                >
                  Respaldo manual ahora
                </p>
                <p style={{ fontSize: 11, color: T.textSec, margin: 0 }}>
                  Genera una copia completa de la base de datos inmediatamente
                </p>
              </div>
              <button
                onClick={handleManualBackup}
                disabled={syncing}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "9px 18px",
                  borderRadius: 11,
                  fontSize: 13,
                  fontWeight: 700,
                  border: "none",
                  cursor: syncing ? "wait" : "pointer",
                  background: T.info,
                  color: "#fff",
                  boxShadow: "0 4px 12px rgba(37,99,235,.25)",
                }}
              >
                {syncing ? (
                  <>
                    <RefreshCw
                      size={14}
                      style={{ animation: "spin 1s linear infinite" }}
                    />{" "}
                    Generando...
                  </>
                ) : (
                  <>
                    <Database size={14} /> Respaldar ahora
                  </>
                )}
              </button>
            </div>

            {/* Backup list */}
            <p
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: T.textMut,
                letterSpacing: ".12em",
                textTransform: "uppercase",
                margin: "0 0 12px",
              }}
            >
              Historial de respaldos
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {Array.isArray(backups) && backups.map((b) => (
                <div
                  key={b.id || Math.random()}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "11px 14px",
                    background: T.elevated,
                    borderRadius: 12,
                    border: `1px solid ${b.status === "error" ? T.danger : T.border}`,
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 9,
                      background: b.status === "ok" ? "#ecfdf5" : "#fef2f2",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {b.status === "ok" ? (
                      <CheckCircle2 size={16} style={{ color: T.ok }} />
                    ) : (
                      <AlertTriangle size={16} style={{ color: T.danger }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <p
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: T.text,
                          margin: "0 0 2px",
                          fontFamily: "monospace",
                        }}
                      >
                        {b.name}
                      </p>
                      {b.driveUrl && (
                        <a
                          href={b.driveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: T.brand }}
                        >
                          <Cloud size={14} />
                        </a>
                      )}
                    </div>
                    <p style={{ fontSize: 10, color: T.textMut, margin: 0 }}>
                      {b.createdAt} · {formatSize(b.sizeBytes)}
                      <span
                        style={{
                          marginLeft: 8,
                          padding: "1px 6px",
                          borderRadius: 99,
                          fontSize: 9,
                          fontWeight: 800,
                          background: b.type === "auto" ? T.elevated : T.subtle,
                          color: T.textMut,
                        }}
                      >
                        {b.type === "auto" ? "AUTO" : "MANUAL"}
                      </span>
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {b.status === "ok" && (
                      <button
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "5px 10px",
                          borderRadius: 8,
                          fontSize: 11,
                          fontWeight: 700,
                          border: `1px solid ${T.border}`,
                          background: T.surface,
                          cursor: "pointer",
                          color: T.textSec,
                        }}
                      >
                        <Download size={11} /> Descargar
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(b.id)}
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
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* ── 3. PASARELAS DE PAGO ─────────────────────────────────────────── */}
          <Section
            icon={<CreditCard size={20} />}
            title="Pasarelas de pago"
            subtitle="Integración con plataformas de cobro con tarjeta y transferencia"
            color="#7c3aed"
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              {gateways.map((gw) => {
                const sc = STATUS_CFG[gw.status];
                const keyVisible = showKeys[gw.id];
                return (
                  <div
                    key={gw.id}
                    style={{
                      background: T.elevated,
                      borderRadius: 18,
                      border: `1.5px solid ${gw.status === "activo" ? T.ok : T.border}`,
                      padding: "18px 20px",
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
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <span style={{ fontSize: 28 }}>{gw.logo}</span>
                        <div>
                          <p
                            style={{
                              fontSize: 15,
                              fontWeight: 800,
                              color: T.text,
                              margin: "0 0 2px",
                            }}
                          >
                            {gw.name}
                          </p>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "2px 8px",
                              borderRadius: 99,
                              fontSize: 10,
                              fontWeight: 800,
                              color: sc.color,
                              background: sc.bg,
                            }}
                          >
                            {sc.label}
                          </span>
                        </div>
                      </div>
                      <Toggle
                        value={gw.status === "activo"}
                        onChange={() => toggleGwStatus(gw.id)}
                      />
                    </div>

                    {/* Commission */}
                    <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                      <div
                        style={{
                          flex: 1,
                          padding: "8px 10px",
                          background: T.surface,
                          borderRadius: 10,
                        }}
                      >
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
                          Comisión
                        </p>
                        <p
                          style={{
                            fontSize: 14,
                            fontWeight: 900,
                            color: T.brand,
                            margin: 0,
                          }}
                        >
                          {gw.commission}%
                        </p>
                      </div>
                      <div
                        style={{
                          flex: 2,
                          padding: "8px 10px",
                          background: T.surface,
                          borderRadius: 10,
                        }}
                      >
                        <p
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            color: T.textMut,
                            textTransform: "uppercase",
                            letterSpacing: ".1em",
                            margin: "0 0 4px",
                          }}
                        >
                          Métodos
                        </p>
                        <div
                          style={{ display: "flex", flexWrap: "wrap", gap: 3 }}
                        >
                          {gw.methods.map((m) => (
                            <span
                              key={m}
                              style={{
                                fontSize: 9,
                                fontWeight: 700,
                                padding: "2px 5px",
                                borderRadius: 5,
                                background: T.elevated,
                                color: T.textSec,
                              }}
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* API Key */}
                    <div
                      style={{
                        padding: "8px 12px",
                        background: T.surface,
                        borderRadius: 10,
                        border: `1px solid ${T.border}`,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 12,
                      }}
                    >
                      <Lock
                        size={12}
                        style={{ color: T.textMut, flexShrink: 0 }}
                      />
                      <code
                        style={{
                          flex: 1,
                          fontSize: 11,
                          color: T.textSec,
                          letterSpacing: ".04em",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {keyVisible ? gw.apiKey.replace(/•/g, "x") : gw.apiKey}
                      </code>
                      <button
                        onClick={() =>
                          setShowKeys((sk) => ({ ...sk, [gw.id]: !sk[gw.id] }))
                        }
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          color: T.textMut,
                          padding: 2,
                        }}
                      >
                        {keyVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>

                    <button
                      onClick={() => setGwModal(gw)}
                      style={{
                        width: "100%",
                        padding: "8px",
                        borderRadius: 10,
                        fontSize: 12,
                        fontWeight: 700,
                        border: `1px solid ${T.border}`,
                        background: T.surface,
                        cursor: "pointer",
                        color: T.textSec,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 5,
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = T.border)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = T.surface)
                      }
                    >
                      <Settings size={12} /> Configurar
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                width: "100%",
                marginTop: 16,
                padding: "12px",
                borderRadius: 14,
                fontSize: 13,
                fontWeight: 700,
                border: `2px dashed ${T.borderMed}`,
                background: "none",
                cursor: "pointer",
                color: T.textMut,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = T.brand;
                e.currentTarget.style.color = T.brand;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = T.borderMed;
                e.currentTarget.style.color = T.textMut;
              }}
            >
              <Plus size={15} /> Agregar nueva pasarela
            </button>
          </Section>
        </main>

      {/* Gateway config modal */}
      {gwModal && (
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
              maxWidth: 480,
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
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 24 }}>{gwModal.logo}</span>
                <h3
                  style={{
                    fontFamily: T.fontD,
                    fontWeight: 900,
                    fontSize: 18,
                    color: T.text,
                    margin: 0,
                  }}
                >
                  Configurar {gwModal.name}
                </h3>
              </div>
              <button
                onClick={() => setGwModal(null)}
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
                padding: "20px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 700,
                    color: T.textSec,
                    marginBottom: 5,
                  }}
                >
                  API Key
                </label>
                <input
                  defaultValue={gwModal.apiKey}
                  style={{
                    ...inp,
                    width: "100%",
                    boxSizing: "border-box",
                    fontFamily: "monospace",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 700,
                    color: T.textSec,
                    marginBottom: 5,
                  }}
                >
                  Secret Key
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••••••"
                  style={{ ...inp, width: "100%", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 700,
                    color: T.textSec,
                    marginBottom: 5,
                  }}
                >
                  Webhook URL
                </label>
                <input
                  defaultValue={`https://quijote.mx/api/webhooks/${gwModal.name.toLowerCase()}`}
                  style={{ ...inp, width: "100%", boxSizing: "border-box" }}
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 11,
                      fontWeight: 700,
                      color: T.textSec,
                      marginBottom: 5,
                    }}
                  >
                    Entorno
                  </label>
                  <select style={{ ...inp, width: "100%" }}>
                    <option>Producción</option>
                    <option>Sandbox (pruebas)</option>
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 11,
                      fontWeight: 700,
                      color: T.textSec,
                      marginBottom: 5,
                    }}
                  >
                    Moneda
                  </label>
                  <select style={{ ...inp, width: "100%" }}>
                    <option>MXN – Peso mexicano</option>
                  </select>
                </div>
              </div>
              <div
                style={{
                  padding: "10px 14px",
                  background: "#ecfdf5",
                  borderRadius: 10,
                  border: "1px solid #86efac",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <CheckCircle2 size={14} style={{ color: T.ok }} />
                <p
                  style={{
                    fontSize: 11,
                    color: T.ok,
                    fontWeight: 700,
                    margin: 0,
                  }}
                >
                  Conexión verificada · Última prueba hace 5 min
                </p>
              </div>
            </div>
            <div
              style={{
                padding: "14px 24px",
                borderTop: `1px solid ${T.border}`,
                background: T.elevated,
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <button
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  border: `1px solid ${T.border}`,
                  background: T.surface,
                  cursor: "pointer",
                  color: T.textSec,
                }}
              >
                Probar conexión
              </button>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setGwModal(null)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 10,
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
                  onClick={() => setGwModal(null)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    background: T.brand,
                    color: "#fff",
                  }}
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
