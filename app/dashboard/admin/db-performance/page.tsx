"use client";
/**
 * ============================================================
 *  Rendimiento de Base de Datos — Panel Administrativo
 *  Ruta sugerida: app/dashboard/admin/db-performance/page.tsx
 * ============================================================
 *
 *  ENDPOINTS REQUERIDOS (NestJS):
 *  ──────────────────────────────
 *  GET /api/db-metrics/cpu          → DBCpuMetrics
 *  GET /api/db-metrics/rw-ratio     → DBRWRatio
 *  GET /api/db-metrics/autovacuum   → DBAutovacuumTable[]
 *  GET /api/db-metrics/storage      → DBStorageMetrics
 *  GET /api/db-metrics/hot-tables   → DBHotTable[]
 *  GET /api/db-metrics/latency      → DBLatencyMetrics
 *  GET /api/db-metrics/connections  → DBConnectionMetrics
 *  GET /api/db-metrics/wait-events  → DBWaitEvent[]
 *
 *  Todos los endpoints pueden recibir ?period=5s|10s|1m|5m|15m
 *  para controlar la granularidad histórica.
 *
 *  El hook usePolling() re-fetcha cada N segundos automáticamente.
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import {
  Activity,
  Database,
  HardDrive,
  Layers,
  Zap,
  RefreshCw,
  AlertTriangle,
  Clock,
  Server,
  BarChart3,
  GitBranch,
  Wifi,
} from "lucide-react";

// ─── Design tokens (consistentes con el resto del panel) ───────────────────────
const T = {
  brand:   "#e85d04",
  bg:      "#faf9f7",
  surface: "#ffffff",
  elevated:"#f5f3ef",
  subtle:  "#ede9e3",
  text:    "#1a1208",
  textSec: "#6b5e4e",
  textMut: "#a89880",
  border:  "#e8e1d8",
  borderMed:"#d4c8bc",
  shadow:  "0 2px 16px rgba(26,18,8,0.07)",
  shadowHov:"0 8px 32px rgba(26,18,8,0.12)",
  fontD:   "'Fraunces', Georgia, serif",
  fontB:   "'DM Sans', system-ui, sans-serif",
  ok:      "#059669",
  warn:    "#d97706",
  danger:  "#dc2626",
  info:    "#2563eb",
};

// ─── API base ──────────────────────────────────────────────────────────────────
const RAW_API = process.env.NEXT_PUBLIC_API_URL?.trim();
const API     = (RAW_API && RAW_API.length > 0 ? RAW_API : "/api").replace(/\/$/, "");

/** Construye la URL completa del endpoint */
function endpoint(path: string) {
  return `${API}${path.startsWith("/") ? path : `/${path}`}`;
}

// ════════════════════════════════════════════════════════════
//  TIPOS — mapean 1:1 con la respuesta de NestJS
// ════════════════════════════════════════════════════════════
interface DBCpuMetrics {
  totalPct:      number;   // CPU total %
  postgresPct:   number;   // CPU solo proceso postgres %
  loadAvg1m:     number;   // load average 1 minuto
  iowaitPct:     number;   // iowait %
  userPct:       number;   // CPU user % (tooltip)
  systemPct:     number;   // CPU system % (tooltip)
  idlePct:       number;   // CPU idle % (tooltip)
  history:       { ts: string; totalPct: number; postgresPct: number }[];
}

interface DBRWRatio {
  reads:   number;   // tup_returned + tup_fetched
  writes:  number;   // tup_inserted + tup_updated + tup_deleted
  readPct: number;
  writePct:number;
}

interface DBAutovacuumTable {
  tableName:         string;
  lastAutovacuum:    string | null;  // ISO timestamp
  lastAutoanalyze:   string | null;
  deadTuples:        number;
  liveTuples:        number;
  deadPct:           number;         // porcentaje dead tuples
  vacuumRunning:     boolean;
  minutesSinceVacuum:number | null;
}

interface DBStorageMetrics {
  totalMB:         number;
  tablesMB:        number;
  indexesMB:       number;
  toastMB:         number;
  growth24hMB:     number;
  history:         { ts: string; totalMB: number }[];
}

interface DBHotTable {
  tableName:    string;
  seqScan:      number;
  idxScan:      number;
  tupReturned:  number;
  tupModified:  number;   // inserted + updated + deleted
  totalOps:     number;
  sizeMB:       number;
}

interface DBLatencyEntry {
  avgMs: number;
  p95Ms: number;
  p99Ms: number;
}
interface DBLatencyMetrics {
  SELECT: DBLatencyEntry;
  INSERT: DBLatencyEntry;
  UPDATE: DBLatencyEntry;
  DELETE: DBLatencyEntry;
  history: { ts: string; SELECT: number; INSERT: number; UPDATE: number; DELETE: number }[];
}

interface DBConnectionMetrics {
  active:          number;
  idle:            number;
  idleInTx:        number;
  waiting:         number;
  total:           number;
  maxConnections:  number;
  usagePct:        number;
  history:         { ts: string; total: number; active: number }[];
}

interface DBWaitEvent {
  category: string;  // CPU | IO | Lock | LWLock | Client
  pct:      number;  // % del tiempo total
  count:    number;
}

// Estado unificado de todas las métricas
interface DBMetricsState {
  cpu:         DBCpuMetrics       | null;
  rwRatio:     DBRWRatio          | null;
  autovacuum:  DBAutovacuumTable[]| null;
  storage:     DBStorageMetrics   | null;
  hotTables:   DBHotTable[]       | null;
  latency:     DBLatencyMetrics   | null;
  connections: DBConnectionMetrics| null;
  waitEvents:  DBWaitEvent[]      | null;
  lastUpdated: Date | null;
  error:       string | null;
  loading:     boolean;
  isVacuuming: boolean; // Estado para el botón manual
}

// ════════════════════════════════════════════════════════════
//  HOOK — Polling de todas las métricas
// ════════════════════════════════════════════════════════════

/**
 * useDBMetrics
 * Fetcha todos los endpoints en paralelo y rota cada `intervalMs`.
 * Si NEXT_PUBLIC_API_URL no está configurado, retorna loading=false y error=null
 * para que el UI muestre el estado vacío (0s) limpiamente.
 */
function useDBMetrics(intervalMs = 10_000) {
  const [state, setState] = useState<DBMetricsState>({
    cpu: null, rwRatio: null, autovacuum: null, storage: null,
    hotTables: null, latency: null, connections: null, waitEvents: null,
    lastUpdated: null, error: null, loading: true, isVacuuming: false
  });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAll = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      // ══════════════════════════════════════════════════
      //  LLAMADAS A ENDPOINTS — cada URL apunta a NestJS
      // ══════════════════════════════════════════════════
      const [
        resCpu, resRW, resVacuum, resStorage,
        resHot, resLatency, resConn, resWait,
      ] = await Promise.all([
        fetch(endpoint("/db-metrics/cpu")),          // 1) CPU
        fetch(endpoint("/db-metrics/rw-ratio")),     // 2) Lectura/Escritura
        fetch(endpoint("/db-metrics/autovacuum")),   // 3) Autovacuum
        fetch(endpoint("/db-metrics/storage")),      // 4) Almacenamiento
        fetch(endpoint("/db-metrics/hot-tables")),   // 5) Tablas calientes
        fetch(endpoint("/db-metrics/latency")),      // 6) Latencia SQL
        fetch(endpoint("/db-metrics/connections")),  // 7) Conexiones
        fetch(endpoint("/db-metrics/wait-events")),  // 8) Wait events
      ]);

      if (!resCpu.ok || !resRW.ok || !resVacuum.ok || !resStorage.ok ||
          !resHot.ok || !resLatency.ok || !resConn.ok || !resWait.ok) {
        throw new Error("Uno o más endpoints respondieron con error");
      }

      const [cpu, rwRatio, autovacuum, storage, hotTables, latency, connections, waitEvents] =
        await Promise.all([
          resCpu.json(), resRW.json(), resVacuum.json(), resStorage.json(),
          resHot.json(), resLatency.json(), resConn.json(), resWait.json(),
        ]);

      setState({
        cpu, rwRatio, autovacuum, storage, hotTables, latency,
        connections, waitEvents, lastUpdated: new Date(),
        error: null, loading: false,
      });
    } catch (err: any) {
      setState(s => ({
        ...s, loading: false,
        error: err?.message ?? "No se pudo conectar con el backend",
      }));
    }
  }, []);

  const runManualVacuum = useCallback(async () => {
    setState(s => ({ ...s, isVacuuming: true }));
    try {
      const res = await fetch(endpoint("/db-metrics/vacuum-manual"), { method: "POST" });
      if (!res.ok) throw new Error("Error al iniciar limpieza");
      alert("La limpieza (Vacuum) ha comenzado en segundo plano. Esto mejorará el rendimiento de las tablas.");
      fetchAll();
    } catch (err: any) {
      alert("No se pudo iniciar la limpieza: " + err.message);
    } finally {
      setState(s => ({ ...s, isVacuuming: false }));
    }
  }, [fetchAll]);

  useEffect(() => {
    fetchAll();
    timerRef.current = setInterval(fetchAll, intervalMs);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [fetchAll, intervalMs]);

  return { ...state, refetch: fetchAll, runManualVacuum };
}

// ════════════════════════════════════════════════════════════
//  UTILIDADES UI
// ════════════════════════════════════════════════════════════
function fmt(n: number | null | undefined, decimals = 1): string {
  if (n === null || n === undefined) return "—";
  return n.toFixed(decimals);
}
function fmtMB(mb: number | null | undefined): string {
  if (mb === null || mb === undefined) return "—";
  if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
  return `${mb.toFixed(1)} MB`;
}
function statusColor(pct: number) {
  if (pct >= 85) return T.danger;
  if (pct >= 60) return T.warn;
  return T.ok;
}

// ─── Minigrafica de linea SVG (inline, sin deps) ──────────────────────────────
function SparkLine({
  data,
  color = T.brand,
  height = 48,
  width = 180,
  yLabel = "",
}: {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  yLabel?: string;
}) {
  if (!data || data.length < 2) {
    return <svg width={width} height={height} />;
  }
  const max  = Math.max(...data, 10);
  const min  = Math.min(...data);
  const span = max - min || 1;
  const padX = 40; // Espacio para etiquetas eje Y
  const padY = 20; // Espacio para etiquetas eje X
  const pts  = data.map((v, i) => {
    const x = padX + (i / (data.length - 1)) * (width - padX - 10);
    const y = (height - padY) - ((v - min) / span) * (height - padY - 10);
    return `${x},${y}`;
  });
  const area = [
    `M ${pts[0]}`,
    ...pts.slice(1).map(p => `L ${p}`),
    `L ${padX + (width - padX - 10)},${height - padY}`,
    `L ${padX},${height - padY}`,
    "Z",
  ].join(" ");

  return (
    <svg width="100%" height={height} style={{ overflow: "visible" }}>
      {/* Ejes */}
      <line x1={padX} y1={height - padY} x2={width} y2={height - padY} stroke={T.borderMed} strokeWidth={1} />
      <line x1={padX} y1={0} x2={padX} y2={height - padY} stroke={T.borderMed} strokeWidth={1} />

      {/* Etiquetas Eje Y */}
      <text x={padX - 5} y={height - padY} fontSize="9" textAnchor="end" fill={T.textMut}>0</text>
      <text x={padX - 5} y={10} fontSize="9" textAnchor="end" fill={T.textMut}>{max.toFixed(0)}{yLabel}</text>

      {/* Etiquetas Eje X */}
      <text x={padX} y={height - 5} fontSize="9" fill={T.textMut}>Antiguo</text>
      <text x={width} y={height - 5} fontSize="9" textAnchor="end" fill={T.textMut}>Ahora</text>

      <path d={area} fill={`${color}18`} />
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Punto final destacado */}
      {pts.length > 0 && (
        <circle
          cx={+pts[pts.length - 1].split(",")[0]}
          cy={+pts[pts.length - 1].split(",")[1]}
          r={3}
          fill={color}
        />
      )}
    </svg>
  );
}

// ─── Donut SVG ────────────────────────────────────────────────────────────────
function DonutChart({
  segments,
  size = 120,
  stroke = 22,
}: {
  segments: { pct: number; color: string; label: string }[];
  size?: number;
  stroke?: number;
}) {
  const r   = (size - stroke) / 2;
  const cx  = size / 2;
  const cy  = size / 2;
  const circ = 2 * Math.PI * r;
  let cumulative = 0;

  return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.border} strokeWidth={stroke} />
      {segments.map((s, i) => {
        const offset = circ * (1 - cumulative / 100);
        const dash   = circ * (s.pct / 100);
        cumulative  += s.pct;
        return (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        );
      })}
    </svg>
  );
}

// ─── KPI card ─────────────────────────────────────────────────────────────────
function KpiCard({
  label, value, unit, color, icon, sub,
}: {
  label: string; value: string | number; unit?: string;
  color: string; icon: React.ReactNode; sub?: string;
}) {
  return (
    <div style={{
      background: T.surface, borderRadius: 18,
      border: `1px solid ${T.border}`, padding: "16px 18px",
      boxShadow: T.shadow,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9, background: `${color}18`,
          display: "flex", alignItems: "center", justifyContent: "center", color,
        }}>{icon}</div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ fontFamily: T.fontD, fontSize: 26, fontWeight: 900, color }}>
          {value}
        </span>
        {unit && <span style={{ fontSize: 12, color: T.textMut, fontWeight: 600 }}>{unit}</span>}
      </div>
      <p style={{ fontSize: 12, fontWeight: 700, color: T.text, margin: "2px 0 0" }}>{label}</p>
      {sub && <p style={{ fontSize: 10, color: T.textMut, margin: "2px 0 0" }}>{sub}</p>}
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({
  title, subtitle, icon, color = T.brand, children,
}: {
  title: string; subtitle: string; icon: React.ReactNode;
  color?: string; children: React.ReactNode;
}) {
  return (
    <div style={{
      background: T.surface, borderRadius: 22,
      border: `1px solid ${T.border}`, boxShadow: T.shadow,
      overflow: "hidden",
    }}>
      <div style={{
        padding: "16px 22px",
        borderBottom: `1px solid ${T.border}`,
        background: T.elevated,
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `${color}18`,
          display: "flex", alignItems: "center", justifyContent: "center", color,
        }}>{icon}</div>
        <div>
          <h2 style={{ fontFamily: T.fontD, fontWeight: 900, fontSize: 15, color: T.text, margin: 0 }}>
            {title}
          </h2>
          <p style={{ fontSize: 11, color: T.textMut, margin: 0 }}>{subtitle}</p>
        </div>
      </div>
      <div style={{ padding: "20px 22px" }}>{children}</div>
    </div>
  );
}

// ─── Barra de progreso horizontal ─────────────────────────────────────────────
function ProgressBar({ pct, color, label }: { pct: number; color: string; label?: string }) {
  return (
    <div>
      {label && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.textSec }}>{label}</span>
          <span style={{ fontSize: 11, fontWeight: 800, color }}>{pct.toFixed(1)}%</span>
        </div>
      )}
      <div style={{ height: 6, background: T.border, borderRadius: 99, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 99, background: color,
          width: `${Math.min(100, Math.max(0, pct))}%`,
          transition: "width 0.6s ease",
        }} />
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyMetric({ label }: { label: string }) {
  return (
    <span style={{ fontSize: 13, color: T.textMut, fontStyle: "italic" }}>
      {label}
    </span>
  );
}

// ════════════════════════════════════════════════════════════
//  SECCIÓN 1 — CPU
// ════════════════════════════════════════════════════════════
function SectionCPU({ data }: { data: DBCpuMetrics | null }) {
  const cpuColor = data ? statusColor(data.totalPct) : T.textMut;
  const histData = data?.history?.map(h => h.totalPct) ?? [];
  const pgHistData = data?.history?.map(h => h.postgresPct) ?? [];

  return (
    <Section
      title="Cerebro del Sistema (Procesador)"
      subtitle="Representa qué tan ocupado está el motor que procesa tus pedidos y datos."
      icon={<Activity size={18} />}
      color={cpuColor}
    >
      <p style={{ fontSize: 13, color: T.textSec, marginBottom: 15 }}>
        Este gráfico muestra qué tanto esfuerzo está haciendo el servidor. Si el "Uso Total" llega al 100%, el sistema se pondrá lento para todos.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
        <KpiCard
          label="Uso Total General"
          value={data ? fmt(data.totalPct) : "—"}
          unit="%"
          color={data ? statusColor(data.totalPct) : T.textMut}
          icon={<Activity size={16} />}
          sub="Esfuerzo de toda la máquina"
        />
        <KpiCard
          label="Uso por Base de Datos"
          value={data ? fmt(data.postgresPct) : "—"}
          unit="%"
          color={data ? statusColor(data.postgresPct) : T.textMut}
          icon={<Database size={16} />}
          sub="Esfuerzo exclusivo de la BD"
        />
        <KpiCard
          label="Carga de Trabajo"
          value={data ? fmt(data.loadAvg1m, 2) : "—"}
          color={T.info}
          icon={<Layers size={16} />}
          sub="Tareas acumuladas en cola"
        />
        <KpiCard
          label="Espera de Disco"
          value={data ? fmt(data.iowaitPct) : "—"}
          unit="%"
          color={data && data.iowaitPct > 20 ? T.danger : T.warn}
          icon={<HardDrive size={16} />}
          sub="Lentitud causada por el disco"
        />
      </div>

      {/* Gráfica de línea — historial CPU Total y CPU PostgreSQL */}
      <div style={{
        padding: "16px 18px",
        background: T.elevated,
        borderRadius: 14,
        border: `1px solid ${T.border}`,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <p style={{ fontFamily: T.fontD, fontWeight: 800, fontSize: 13, color: T.text, margin: 0 }}>
              Historial de esfuerzo en el tiempo
            </p>
            <p style={{ fontSize: 10, color: T.textMut, margin: "2px 0 0" }}>
              Eje Vertical: Porcentaje (%) · Eje Horizontal: Tiempo (Últimos minutos)
            </p>
          </div>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: T.info }}>
              <span style={{ width: 20, height: 2, background: T.info, borderRadius: 99, display: "inline-block" }} />
              Uso de Base de Datos
            </span>
          </div>
        </div>
        <div style={{ position: "relative", height: 100 }}>
          <SparkLine data={histData} color={T.brand} height={100} width={1000} yLabel="%" />
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%" }}>
            <SparkLine data={pgHistData} color={T.info} height={100} width={1000} />
          </div>
          {histData.length === 0 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: T.textMut, fontSize: 12 }}>
              Esperando datos del backend...
            </div>
          )}
        </div>
      </div>

      {/* Tooltip expandible — user / system / idle */}
      {data && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 14 }}>
          {[
            { label: "Uso por Aplicaciones",   value: data.userPct,   color: "#7c3aed", desc: "Lo que el programa está haciendo" },
            { label: "Uso por el Sistema", value: data.systemPct, color: T.info, desc: "Tareas propias de la computadora" },
            { label: "Capacidad Libre",   value: data.idlePct,   color: T.ok, desc: "Potencia disponible sin usar" },
          ].map(item => (
            <div key={item.label} style={{
              padding: "10px 12px",
              background: T.surface, borderRadius: 10,
              border: `1px solid ${T.border}`,
            }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: T.text, margin: "0 0 2px" }}>
                {item.label}
              </p>
              <p style={{ fontSize: 9, color: T.textMut, margin: "0 0 6px" }}>{item.desc}</p>
              <ProgressBar pct={item.value} color={item.color} />
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

// ════════════════════════════════════════════════════════════
//  SECCIÓN 2 — Lectura vs Escritura (Donut)
// ════════════════════════════════════════════════════════════
function SectionRWRatio({ data }: { data: DBRWRatio | null }) {
  const segments = data ? [
    { pct: data.readPct,  color: T.info,  label: "Lecturas" },
    { pct: data.writePct, color: T.brand, label: "Escrituras" },
  ] : [];

  return (
    <Section
      title="¿Qué está pasando?: Ver vs Cambiar datos"
      subtitle="Compara cuántas veces se consulta información frente a cuántas veces se guarda nueva."
      icon={<GitBranch size={18} />}
      color={T.info}
    >
      <p style={{ fontSize: 13, color: T.textSec, marginBottom: 15 }}>
        Las **Lecturas** ocurren cuando alguien abre el menú o ve un reporte. Las **Escrituras** ocurren cuando creas un pedido o editas un producto.
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <DonutChart segments={segments} size={130} stroke={24} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            {
              label: "Consultas (Lecturas)",
              desc: "Ver datos existentes",
              value: data?.reads,
              pct: data?.readPct ?? 0,
              color: T.info,
            },
            {
              label: "Cambios (Escrituras)",
              desc: "Guardar o borrar información",
              value: data?.writes,
              pct: data?.writePct ?? 0,
              color: T.brand,
            },
          ].map(item => (
            <div key={item.label}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: T.text, margin: 0 }}>{item.label}</p>
                  <p style={{ fontSize: 10, color: T.textMut, margin: "1px 0 0" }}>{item.desc}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontFamily: T.fontD, fontSize: 18, fontWeight: 900, color: item.color, margin: 0 }}>
                    {item.pct.toFixed(1)}%
                  </p>
                  <p style={{ fontSize: 10, color: T.textMut, margin: 0 }}>
                    {item.value !== undefined && item.value !== null
                      ? item.value.toLocaleString("es-MX") + " ops"
                      : "—"}
                  </p>
                </div>
              </div>
              <ProgressBar pct={item.pct} color={item.color} />
            </div>
          ))}
        </div>
      </div>
      {/* Ratio R/W */}
      {data && (
        <div style={{
          marginTop: 16, padding: "10px 14px",
          background: T.elevated, borderRadius: 10,
          border: `1px solid ${T.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: T.textSec }}>
            Por cada cambio, se realizan:
          </span>
          <span style={{ fontFamily: T.fontD, fontSize: 18, fontWeight: 900, color: T.info }}>
            {data.writes > 0 ? (data.reads / data.writes).toFixed(1) : "—"} Lecturas
          </span>
        </div>
      )}
    </Section>
  );
}

// ════════════════════════════════════════════════════════════
//  SECCIÓN 3 — Autovacuum
// ════════════════════════════════════════════════════════════
function SectionAutovacuum({ data, onManual, isRunning }: { data: DBAutovacuumTable[] | null, onManual: () => void, isRunning: boolean }) {
  const [sort, setSort] = useState<"deadPct" | "deadTuples" | "minutesSinceVacuum">("minutesSinceVacuum");

  const sorted = data
    ? [...data].sort((a, b) => {
        if (sort === "minutesSinceVacuum") {
          return (b.minutesSinceVacuum ?? 0) - (a.minutesSinceVacuum ?? 0);
        }
        return b[sort] - a[sort];
      })
    : [];

  function indicator(row: DBAutovacuumTable) {
    if (row.lastAutovacuum === null) return { icon: "●", color: T.danger, title: "Nunca se ejecutó vacuum" };
    if (row.deadPct > 30)            return { icon: "▲", color: T.warn,   title: "% dead tuples elevado" };
    return null;
  }

  const colStyle: React.CSSProperties = {
    padding: "10px 12px", fontSize: 11, textAlign: "left" as const,
    fontWeight: 700, color: T.textMut,
    textTransform: "uppercase", letterSpacing: ".1em",
  };
  const cellStyle: React.CSSProperties = {
    padding: "10px 12px", fontSize: 12, color: T.textSec, verticalAlign: "middle",
  };

  return (
    <Section
      title="Limpieza Automática (Mantenimiento)"
      subtitle="El sistema borra 'basura' interna para recuperar espacio y velocidad."
      icon={<RefreshCw size={18} />}
      color={T.ok}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
        <p style={{ fontSize: 13, color: T.textSec, margin: 0, maxWidth: "70%" }}>
          Cuando borras un producto, queda un hueco vacío. La limpieza (Vacuum) cierra esos huecos para que la base de datos no crezca sin sentido.
        </p>
        <button
          onClick={onManual}
          disabled={isRunning}
          style={{
            padding: "10px 18px", borderRadius: 12, background: T.brand, color: "#fff",
            border: "none", fontWeight: 800, fontSize: 12, cursor: isRunning ? "not-allowed" : "pointer",
            boxShadow: "0 4px 12px rgba(232,93,4,0.2)", opacity: isRunning ? 0.6 : 1,
            display: "flex", alignItems: "center", gap: 8
          }}
        >
          {isRunning ? <RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Zap size={14} />}
          Ejecutar Limpieza Manual
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: T.textMut }}>Ordenar tablas por:</span>
        {[
          { key: "deadPct" as const, label: "% de Basura" },
          { key: "minutesSinceVacuum" as const, label: "Tiempo sin limpiar" },
        ].map(o => (
          <button
            key={o.key}
            onClick={() => setSort(o.key)}
            style={{ padding: "4px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700, border: "none", cursor: "pointer", background: sort === o.key ? T.brand : T.elevated, color: sort === o.key ? "#fff" : T.textSec }}
          >{o.label}</button>
        ))}
      </div>

      <div style={{
        border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden",
        maxHeight: 320, overflowY: "auto"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: T.elevated, borderBottom: `1px solid ${T.border}` }}>
              {["", "Nombre de Tabla", "Última Limpieza", "Registros Basura", "Registros Reales", "% de Basura", "¿Limpiando ahora?", "Hace cuánto"].map((h, i) => (
                <th key={i} style={{ ...colStyle, textAlign: i === 0 ? "center" : "left" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={8} style={{ ...cellStyle, textAlign: "center", color: T.textMut, padding: 32 }}>Esperando datos...</td>
              </tr>
            )}
            {sorted.map((row, i) => {
              const ind = indicator(row);
              const deadColor = row.deadPct > 30 ? T.warn : row.deadPct > 20 ? T.warn : T.ok;
              return (
                <tr
                  key={i}
                  style={{ borderBottom: `1px solid ${T.border}`, transition: "background .1s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = T.elevated)}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ ...cellStyle, textAlign: "center", width: 28 }}>
                    {ind && (
                      <span title={ind.title} style={{ color: ind.color, fontSize: 14 }}>
                        {ind.icon}
                      </span>
                    )}
                  </td>
                  <td style={{ ...cellStyle, fontWeight: 700, color: T.text, fontFamily: "monospace" }}>
                    {row.tableName}
                  </td>
                  <td style={cellStyle}>
                    {row.lastAutovacuum
                      ? new Date(row.lastAutovacuum).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" })
                      : <span style={{ color: T.danger, fontWeight: 700 }}>Nunca</span>}
                  </td>
                  <td style={{ ...cellStyle, color: row.deadTuples > 1000 ? T.warn : T.text, fontWeight: 700 }}>
                    {row.deadTuples.toLocaleString("es-MX")}
                  </td>
                  <td style={cellStyle}>{row.liveTuples.toLocaleString("es-MX")}</td>
                  <td style={cellStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 800, color: deadColor }}>{row.deadPct.toFixed(1)}%</span>
                      <div style={{ width: 60, height: 5, background: T.border, borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ height: "100%", background: deadColor, borderRadius: 99, width: `${Math.min(100, row.deadPct)}%` }} />
                      </div>
                    </div>
                  </td>
                  <td style={cellStyle}>
                    <span style={{
                      display: "inline-flex", alignItems: "center",
                      padding: "2px 9px", borderRadius: 99, fontSize: 10, fontWeight: 800,
                      background: row.vacuumRunning ? "#ecfdf5" : T.elevated,
                      color: row.vacuumRunning ? T.ok : T.textMut,
                    }}>
                      {row.vacuumRunning ? "Sí" : "No"}
                    </span>
                  </td>
                  <td style={{ ...cellStyle, color: (row.minutesSinceVacuum ?? 0) > 1440 ? T.danger : T.text }}>
                    {row.minutesSinceVacuum !== null ? `${row.minutesSinceVacuum} min` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════
//  SECCIÓN 4 — Almacenamiento
// ════════════════════════════════════════════════════════════
function SectionStorage({ data }: { data: DBStorageMetrics | null }) {
  const histData = data?.history?.map(h => h.totalMB) ?? [];

  return (
    <Section
      title="Espacio en el Disco Duro"
      subtitle="Muestra cuánto espacio ocupan tus datos físicos en el servidor."
      icon={<HardDrive size={18} />}
      color={T.info}
    >
      <p style={{ fontSize: 13, color: T.textSec, marginBottom: 15 }}>
        Los **Índices** son como el índice de un libro: ocupan espacio extra pero hacen que las búsquedas sean instantáneas.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 20 }}>
        {[
          { label: "Tamaño total DB",  value: fmtMB(data?.totalMB),    color: T.info },
          { label: "Tablas",           value: fmtMB(data?.tablesMB),    color: T.brand },
          { label: "Índices (Buscadores)", value: fmtMB(data?.indexesMB),   color: "#7c3aed" },
          { label: "Archivos Pesados",     value: fmtMB(data?.toastMB),     color: T.textSec },
          { label: "Crecimiento Diario",  value: fmtMB(data?.growth24hMB), color: data && data.growth24hMB > 100 ? T.danger : T.ok },
        ].map(item => (
          <div key={item.label} style={{
            padding: "12px 14px", background: T.elevated, borderRadius: 12,
            border: `1px solid ${T.border}`, textAlign: "center",
          }}>
            <p style={{ fontFamily: T.fontD, fontSize: 18, fontWeight: 900, color: item.color, margin: "0 0 4px" }}>
              {item.value}
            </p>
            <p style={{ fontSize: 10, fontWeight: 700, color: T.textMut, textTransform: "uppercase", letterSpacing: ".08em", margin: 0 }}>
              {item.label}
            </p>
          </div>
        ))}
      </div>

      {/* Gráfica de crecimiento */}
      <div style={{
        padding: "14px 16px",
        background: T.elevated, borderRadius: 12, border: `1px solid ${T.border}`,
      }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: T.textSec, margin: "0 0 5px" }}>
          Eje Y: Megabytes (MB) · Eje X: Tiempo
        </p>
        <SparkLine data={histData} color={T.info} height={60} width={600} yLabel="MB" />
        {histData.length === 0 && (
          <p style={{ fontSize: 12, color: T.textMut, textAlign: "center", margin: 0 }}>
            Esperando datos del backend...
          </p>
        )}
      </div>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════
//  SECCIÓN 5 — Tablas más leídas / modificadas
// ════════════════════════════════════════════════════════════
function SectionHotTables({ data }: { data: DBHotTable[] | null }) {
  const [sortCol, setSortCol] = useState<keyof DBHotTable>("totalOps");

  const sorted = data
    ? [...data].sort((a, b) => (b[sortCol] as number) - (a[sortCol] as number)).slice(0, 15)
    : [];

  const colStyle: React.CSSProperties = {
    padding: "9px 12px", fontSize: 10, fontWeight: 800, color: T.textMut,
    textTransform: "uppercase", letterSpacing: ".1em", cursor: "pointer",
  };
  const cellStyle: React.CSSProperties = {
    padding: "9px 12px", fontSize: 12, color: T.textSec,
  };
  const sortable = (key: keyof DBHotTable, label: string) => (
    <th
      key={key}
      style={{ ...colStyle, color: sortCol === key ? T.brand : T.textMut }}
      onClick={() => setSortCol(key)}
    >
      {label} {sortCol === key ? "▼" : ""}
    </th>
  );

  return (
    <Section
      title="Tablas con más Movimiento"
      subtitle="Identifica cuáles son las partes del sistema que más se usan."
      icon={<Layers size={18} />}
      color={T.brand}
    >
      <p style={{ fontSize: 13, color: T.textSec, marginBottom: 15 }}>
        Un **Escaneo Lento** significa que la base de datos tuvo que leer toda la tabla fila por fila porque no encontró un buscador (índice) rápido.
      </p>
      <div style={{ border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden", maxHeight: 350, overflowY: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: T.elevated, borderBottom: `1px solid ${T.border}` }}>
              <th style={colStyle}>Tabla</th>
              {sortable("seqScan",     "Lect. Lentas")}
              {sortable("idxScan",     "Lect. Rápidas")}
              {sortable("tupReturned", "Datos leídos")}
              {sortable("tupModified", "Filas modif.")}
              {sortable("totalOps",    "Total ops")}
              {sortable("sizeMB",      "Tamaño")}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={7} style={{ ...cellStyle, textAlign: "center", padding: 32, color: T.textMut }}>
                  Esperando datos del backend...
                </td>
              </tr>
            )}
            {sorted.map((row, i) => (
              <tr
                key={i}
                style={{ borderBottom: `1px solid ${T.border}` }}
                onMouseEnter={e => (e.currentTarget.style.background = T.elevated)}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <td style={{ ...cellStyle, fontWeight: 700, color: T.text, fontFamily: "monospace" }}>
                  {i === 0 && <span style={{ marginRight: 6, color: T.brand }}>●</span>}
                  {row.tableName}
                </td>
                <td style={cellStyle}>{row.seqScan.toLocaleString("es-MX")}</td>
                <td style={cellStyle}>{row.idxScan.toLocaleString("es-MX")}</td>
                <td style={cellStyle}>{row.tupReturned.toLocaleString("es-MX")}</td>
                <td style={cellStyle}>{row.tupModified.toLocaleString("es-MX")}</td>
                <td style={{ ...cellStyle, fontWeight: 800, color: T.brand }}>
                  {row.totalOps.toLocaleString("es-MX")}
                </td>
                <td style={cellStyle}>{fmtMB(row.sizeMB)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════
//  SECCIÓN 6 — Latencia por tipo de operación
// ════════════════════════════════════════════════════════════
function SectionLatency({ data }: { data: DBLatencyMetrics | null }) {
  const OPS  = ["SELECT", "INSERT", "UPDATE", "DELETE"] as const;
  const COLORS = { SELECT: T.info, INSERT: T.ok, UPDATE: T.warn, DELETE: T.danger };
const OPS_MAP: Record<string, string> = {
  SELECT: "Lectura",
  INSERT: "Inserción",
  UPDATE: "Actualización",
  DELETE: "Eliminación",
};
  const histData = data?.history ?? [];
  const maxMs = data
    ? Math.max(
        ...OPS.flatMap(op => [data[op].avgMs, data[op].p95Ms, data[op].p99Ms]),
        1
      )
    : 1;

  return (
    <Section
      title="Latencia por tipo de operación SQL"
      subtitle="Actualización cada 1 min · Fuente: pg_stat_statements"
      icon={<Zap size={18} />}
      color={T.warn}
    >
      {/* KPI por operación */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {OPS.map(op => {
          const entry = data?.[op];
          const color = COLORS[op];
          return (
            <div key={op} style={{
              padding: "14px 16px", background: T.elevated,
              borderRadius: 14, border: `1px solid ${T.border}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{
                  fontSize: 11, fontWeight: 900, fontFamily: "monospace",
                  padding: "2px 8px", borderRadius: 6,
                  background: `${color}18`, color,
                }}>{OPS_MAP[op]}</span>
              </div>
              {[
                { label: "Tiempo Promedio", value: entry?.avgMs, important: true },
                { label: "Casos Lentos",      value: entry?.p95Ms },
                { label: "Peor Caso",      value: entry?.p99Ms },
              ].map(row => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 10, color: T.textMut, fontWeight: 600 }}>{row.label}</span>
                  <span style={{
                    fontSize: row.important ? 14 : 11,
                    fontWeight: row.important ? 900 : 700,
                    color: row.value !== undefined && row.value > 100 ? T.danger
                          : row.value !== undefined && row.value > 50 ? T.warn
                          : color,
                  }}>
                    {row.value !== undefined ? `${row.value.toFixed(1)} ms` : "—"}
                  </span>
                </div>
              ))}
              {/* Mini barra proporcional avg vs max */}
              {entry && (
                <div style={{ marginTop: 8 }}>
                  <ProgressBar pct={(entry.avgMs / maxMs) * 100} color={color} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Gráfica de líneas multi-op */}
      <div style={{ padding: "14px 16px", background: T.elevated, borderRadius: 12, border: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: T.textSec, margin: 0 }}>
            Tendencia de latencia promedio (ms)
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            {OPS.map(op => (
              <span key={op} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, color: COLORS[op] }}>
                <span style={{ width: 14, height: 2, background: COLORS[op], borderRadius: 99, display: "inline-block" }} />
                {op}
              </span>
            ))}
          </div>
        </div>
        <div style={{ position: "relative", height: 60 }}>
          {histData.length > 0 ? OPS.map(op => (
            <div key={op} style={{ position: "absolute", top: 0, left: 0, width: "100%" }}>
              <SparkLine
                data={histData.map(h => h[op])}
                color={COLORS[op]}
                height={60}
                width={1200}
              />
            </div>
          )) : (
            <p style={{ fontSize: 12, color: T.textMut, textAlign: "center", lineHeight: "60px", margin: 0 }}>
              Esperando datos del backend...
            </p>
          )}
        </div>
      </div>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════
//  SECCIÓN 7 — Conexiones activas
// ════════════════════════════════════════════════════════════
function SectionConnections({ data }: { data: DBConnectionMetrics | null }) {
  const histTotal  = data?.history?.map(h => h.total)  ?? [];
  const histActive = data?.history?.map(h => h.active) ?? [];
  const connColor  = data ? statusColor(data.usagePct) : T.textMut;

  const states = data ? [
    { label: "Activas",          value: data.active,     color: T.ok,    desc: "active" },
    { label: "Idle",             value: data.idle,       color: T.info,  desc: "idle" },
    { label: "Idle in Tx",       value: data.idleInTx,   color: T.warn,  desc: "idle in transaction" },
    { label: "En espera",        value: data.waiting,    color: T.danger, desc: "waiting" },
  ] : [];

  return (
    <Section
      title="Usuarios Conectados"
      subtitle="Muestra cuántas 'puertas' de entrada están abiertas hacia la base de datos."
      icon={<Wifi size={18} />}
      color={connColor}
    >
      <p style={{ fontSize: 13, color: T.textSec, marginBottom: 15 }}>
        Cada conexión es una vía de comunicación. Si llegas al límite, nadie más podrá entrar al sistema. Las conexiones "En Espera" son peligrosas porque indican un atasco.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* KPIs izquierda */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* % uso vs max_connections */}
          <div style={{
            padding: "16px 18px", background: T.elevated,
            borderRadius: 14, border: `1px solid ${T.border}`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <p style={{ fontFamily: T.fontD, fontWeight: 800, fontSize: 13, color: T.text, margin: 0 }}>
                Capacidad de entrada ocupada
              </p>
              <span style={{ fontFamily: T.fontD, fontSize: 22, fontWeight: 900, color: connColor }}>
                {data ? `${data.usagePct.toFixed(1)}%` : "—"}
              </span>
            </div>
            <ProgressBar pct={data?.usagePct ?? 0} color={connColor} />
            <p style={{ fontSize: 10, color: T.textMut, margin: "6px 0 0" }}>
              {data ? `${data.total} abiertas de ${data.maxConnections} permitidas` : "Esperando datos..."}
            </p>
          </div>

          {/* Total */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div style={{ padding: "10px 12px", background: T.elevated, borderRadius: 10, border: `1px solid ${T.border}`, textAlign: "center" }}>
              <p style={{ fontFamily: T.fontD, fontSize: 22, fontWeight: 900, color: T.brand, margin: 0 }}>
                {data?.total ?? "—"}
              </p>
              <p style={{ fontSize: 9, fontWeight: 700, color: T.textMut, textTransform: "uppercase", letterSpacing: ".1em", margin: "2px 0 0" }}>
                Total
              </p>
            </div>
            <div style={{ padding: "10px 12px", background: T.elevated, borderRadius: 10, border: `1px solid ${T.border}`, textAlign: "center" }}>
              <p style={{ fontFamily: T.fontD, fontSize: 22, fontWeight: 900, color: T.ok, margin: 0 }}>
                {data?.active ?? "—"}
              </p>
              <p style={{ fontSize: 9, fontWeight: 700, color: T.textMut, textTransform: "uppercase", letterSpacing: ".1em", margin: "2px 0 0" }}>
                Activas
              </p>
            </div>
          </div>

          {/* Desglose por estado */}
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {states.map(s => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: T.surface, borderRadius: 9, border: `1px solid ${T.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.textSec }}>{s.label}</span>
                  <span style={{ fontSize: 9, color: T.textMut, fontFamily: "monospace" }}>({s.desc})</span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 900, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfica derecha */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ padding: "14px 16px", background: T.elevated, borderRadius: 12, border: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: T.textSec, margin: 0 }}>
                Eje Y: Cantidad · Eje X: Tiempo
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: T.brand, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 14, height: 2, background: T.brand, borderRadius: 99, display: "inline-block" }} />
                  Total
                </span>
                <span style={{ fontSize: 10, fontWeight: 700, color: T.ok, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 14, height: 2, background: T.ok, borderRadius: 99, display: "inline-block" }} />
                  Activas
                </span>
              </div>
            </div>
            <div style={{ position: "relative", height: 80 }}>
              <SparkLine data={histTotal} color={T.brand} height={80} width={400} />
              <div style={{ position: "absolute", top: 0, left: 0, width: "100%" }}>
                <SparkLine data={histActive} color={T.ok} height={80} width={400} />
              </div>
              {histTotal.length === 0 && (
                <p style={{ fontSize: 12, color: T.textMut, textAlign: "center", lineHeight: "80px", margin: 0 }}>
                  Esperando datos del backend...
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════
//  SECCIÓN 8 — Wait Events (barra apilada horizontal)
// ════════════════════════════════════════════════════════════
function SectionWaitEvents({ data }: { data: DBWaitEvent[] | null }) {
  const WAIT_COLORS: Record<string, string> = {
    CPU:     T.brand,
    IO:      T.info,
    Lock:    T.danger,
    LWLock:  T.warn,
    Client:  "#7c3aed",
  };

  const sorted = data ? [...data].sort((a, b) => b.pct - a.pct) : [];
  const total  = sorted.reduce((s, e) => s + e.pct, 0);

  return (
    <Section
      title="Causas de Retraso (Atascos)"
      subtitle="Muestra por qué la base de datos se detiene a esperar."
      icon={<Clock size={18} />}
      color={T.danger}
    >
      <p style={{ fontSize: 13, color: T.textSec, marginBottom: 15 }}>
        Lo ideal es que la mayoría del tiempo sea **Procesamiento**. Si el "Bloqueo" es alto, significa que una tarea está impidiendo que las demás avancen.
      </p>
      {/* Barra apilada */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: T.textMut, margin: "0 0 5px" }}>
          Eje X: Porcentaje del tiempo total (%)
        </p>
        <div style={{ display: "flex", height: 28, borderRadius: 8, overflow: "hidden", border: `1px solid ${T.border}` }}>
          {sorted.length > 0 ? sorted.map((event, i) => (
            <div
              key={i}
              title={`${event.category}: ${event.pct.toFixed(1)}%`}
              style={{
                width: `${event.pct}%`,
                background: WAIT_COLORS[event.category] ?? T.textMut,
                transition: "width 0.5s ease",
                position: "relative",
              }}
            />
          )) : (
            <div style={{ flex: 1, background: T.border }} />
          )}
        </div>
        {sorted.length === 0 && (
          <p style={{ fontSize: 12, color: T.textMut, textAlign: "center", marginTop: 8 }}>
            Esperando datos del backend...
          </p>
        )}
      </div>

      {/* Detalle por categoría */}
      <div style={{ display: "flex", flexDirection: "column", gap: 9, maxHeight: 300, overflowY: "auto" }}>
        {sorted.length > 0 ? sorted.map((event, i) => {
          const color = WAIT_COLORS[event.category] ?? T.textMut;
          const isCritical = event.category === "Lock" && event.pct > 20;
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "12px 14px",
              background: isCritical ? "#fef2f2" : T.elevated,
              borderRadius: 12,
              border: `1px solid ${isCritical ? "#fecaca" : T.border}`,
            }}>
              <div style={{
                width: 12, height: 12, borderRadius: 3,
                background: color, flexShrink: 0,
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
                    {event.category}
                    {isCritical && (
                      <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 800, color: T.danger }}>
                        SISTEMA BLOQUEADO
                      </span>
                    )}
                  </span>
                  <span style={{ fontFamily: T.fontD, fontSize: 16, fontWeight: 900, color }}>
                    {event.pct.toFixed(1)}%
                  </span>
                </div>
                <ProgressBar pct={event.pct} color={color} />
              </div>
              <span style={{ fontSize: 11, color: T.textMut, minWidth: 70, textAlign: "right" }}>
                {event.count.toLocaleString("es-MX")} veces
              </span>
            </div>
          );
        }) : (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ height: 52, background: T.elevated, borderRadius: 12, border: `1px solid ${T.border}` }} />
          ))
        )}
      </div>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════
//  PÁGINA PRINCIPAL
// ════════════════════════════════════════════════════════════
export default function DBPerformancePage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [pollInterval, setPollInterval] = useState(10_000);

  const {
    cpu, rwRatio, autovacuum, storage, hotTables,
    latency, connections, waitEvents,
    lastUpdated, error, loading, refetch, runManualVacuum, isVacuuming
  } = useDBMetrics(pollInterval);

  function handleLogout() {}

  const lastUpdatedStr = lastUpdated
    ? lastUpdated.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "—";

  // Detectar si hay alertas activas
  const hasAlerts = (
    (cpu?.totalPct ?? 0) > 85 ||
    (connections?.usagePct ?? 0) > 80 ||
    (waitEvents?.find(e => e.category === "Lock")?.pct ?? 0) > 20
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: T.fontB, background: T.bg, color: T.text }}>
      {/*
        ──────────────────────────────────────────────────────
        NOTA: Añade "performance" como activePage en AdminSidebar.
        En components/admin/AdminSidebar.tsx agrega un NavItem con:
          key: "performance"
          label: "Rendimiento BD"
          icon: <Database size={16} />
          path: "/dashboard/admin/db-performance"
        ──────────────────────────────────────────────────────
      */}
      <AdminSidebar activePage="performance" user={user} onLogout={handleLogout} />

      <main style={{ flex: 1, marginLeft: 260, padding: "32px 44px", minWidth: 0 }}>

        {/* ── Header ── */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <h1 style={{
              fontFamily: T.fontD, fontWeight: 900, fontSize: 30,
              letterSpacing: "-.03em", lineHeight: 1.1, margin: "0 0 5px", color: T.text,
            }}>
              Rendimiento de base de datos
            </h1>
            <p style={{ fontSize: 13, color: T.textMut, margin: 0 }}>
              PostgreSQL · Métricas en tiempo real · última actualización: {lastUpdatedStr}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Selector de frecuencia de polling */}
            <div style={{
              display: "flex", gap: 3, padding: 4,
              background: T.elevated, borderRadius: 10, border: `1px solid ${T.border}`,
            }}>
              {[
                { label: "5 s", value: 5_000 },
                { label: "10 s", value: 10_000 },
                { label: "30 s", value: 30_000 },
                { label: "1 m",  value: 60_000 },
              ].map(o => (
                <button
                  key={o.value}
                  onClick={() => setPollInterval(o.value)}
                  style={{
                    padding: "4px 10px", borderRadius: 7, fontSize: 11, fontWeight: 700,
                    border: "none", cursor: "pointer",
                    background: pollInterval === o.value ? T.surface : "transparent",
                    color: pollInterval === o.value ? T.text : T.textMut,
                    boxShadow: pollInterval === o.value ? T.shadow : "none",
                  }}
                >{o.label}</button>
              ))}
            </div>

            {/* Estado en línea + refresh */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "7px 14px", background: T.surface,
              border: `1px solid ${T.border}`, borderRadius: 11,
              fontSize: 12, fontWeight: 700, color: T.textSec,
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: "50%",
                background: error ? T.danger : T.ok,
                boxShadow: error ? `0 0 0 3px ${T.danger}30` : `0 0 0 3px #86efac`,
              }} />
              {error ? "Error de conexión" : loading ? "Actualizando..." : "En línea"}
            </div>

            <button
              onClick={refetch}
              disabled={loading}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 11,
                fontSize: 12, fontWeight: 700,
                border: `1px solid ${T.border}`, background: T.surface,
                cursor: loading ? "not-allowed" : "pointer",
                color: T.textSec, opacity: loading ? 0.7 : 1,
              }}
            >
              <RefreshCw size={13} style={{ animation: loading ? "spin 1s linear infinite" : undefined }} />
              Actualizar
            </button>
          </div>
        </header>

        {/* ── Banner de error ── */}
        {error && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "12px 16px", marginBottom: 20,
            background: "#fef2f2", borderRadius: 12,
            border: "1px solid #fecaca",
          }}>
            <AlertTriangle size={14} style={{ color: T.danger, flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: T.danger, margin: 0 }}>
                No se pudo obtener métricas del backend
              </p>
              <p style={{ fontSize: 11, color: T.textSec, margin: "2px 0 0" }}>
                {error} — Verifica que NestJS esté corriendo y que NEXT_PUBLIC_API_URL esté configurado correctamente.
              </p>
            </div>
          </div>
        )}

        {/* ── Banner de alerta activa ── */}
        {hasAlerts && !error && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px", marginBottom: 20,
            background: "#fffbeb", borderRadius: 12,
            border: "1px solid #fde68a",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <AlertTriangle size={14} style={{ color: T.warn, flexShrink: 0 }} />
              <p style={{ fontSize: 13, fontWeight: 700, color: T.warn, margin: 0 }}>
                Se detectaron condiciones de rendimiento degradado — revisa las secciones marcadas
              </p>
            </div>
          </div>
        )}

        {/* ── Resumen rápido — KPIs globales ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
          <KpiCard
            label="CPU Total"
            value={cpu ? `${fmt(cpu.totalPct)}` : "—"}
            unit="%"
            color={cpu ? statusColor(cpu.totalPct) : T.textMut}
            icon={<Server size={16} />}
            sub="Servidor PostgreSQL"
          />
          <KpiCard
            label="Conexiones activas"
            value={connections?.active ?? "—"}
            color={connections ? statusColor(connections.usagePct) : T.textMut}
            icon={<Wifi size={16} />}
            sub={connections ? `${connections.usagePct.toFixed(0)}% de max_connections` : "—"}
          />
          <KpiCard
            label="Latencia SELECT p95"
            value={latency ? `${fmt(latency.SELECT.p95Ms)}` : "—"}
            unit="ms"
            color={latency && latency.SELECT.p95Ms > 100 ? T.danger : T.ok}
            icon={<Zap size={16} />}
            sub="Percentil 95"
          />
          <KpiCard
            label="Tamaño total DB"
            value={storage ? fmtMB(storage.totalMB) : "—"}
            color={T.info}
            icon={<HardDrive size={16} />}
            sub={storage ? `+${fmtMB(storage.growth24hMB)} en 24h` : "—"}
          />
        </div>

        {/* ── Grid principal de métricas ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Fila 1: CPU (ancho completo) */}
          <SectionCPU data={cpu} />

          {/* Fila 2: R/W Ratio + Storage */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <SectionRWRatio data={rwRatio} />
            <SectionStorage data={storage} />
          </div>

          {/* Fila 3: Conexiones (ancho completo) */}
          <SectionConnections data={connections} />

          {/* Fila 4: Latencia (ancho completo) */}
          <SectionLatency data={latency} />

          {/* Fila 5: Wait Events + Hot Tables */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 20 }}>
            <SectionWaitEvents data={waitEvents} />
            <SectionHotTables data={hotTables} />
          </div>

          {/* Fila 6: Autovacuum (ancho completo) */}
          <SectionAutovacuum data={autovacuum} onManual={runManualVacuum} isRunning={isVacuuming} />

        </div>

        <p style={{ fontSize: 11, color: T.textMut, marginTop: 24, textAlign: "right" }}>
          Rendimiento BD · El Quijote Admin · Polling cada {pollInterval / 1000}s
        </p>
      </main>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      `}</style>
    </div>
  );
}
