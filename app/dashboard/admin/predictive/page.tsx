"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { api, APIError } from "@/lib/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Sigma,
  Percent,
  Activity,
  AlertCircle,
  Award,
  Loader2,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Tipos (solo los necesarios para el modelo de regresión)
// ─────────────────────────────────────────────────────────────────────────────
type Clasificacion = "Alta demanda" | "Demanda media" | "Baja demanda";

interface RegresionPlatillo {
  platilloId: number;
  nombre: string;
  categoria: string;
  unidadesUltimos7: number;
  unidadesPredichas7: number;
  variacionPct: number;
  clasificacion: Clasificacion;
}

type RegresionRankingResponse =
  | {
      disponible: true;
      horizonteDias: number;
      wapeModelo: number;
      wapeBaseline: number;
      mejoraPct: number;
      platilloMayorCrecimiento: RegresionPlatillo | null;
      platilloMayorDecrecimiento: RegresionPlatillo | null;
      platillos: RegresionPlatillo[];
    }
  | { disponible: false; motivo: string };

type RegresionDetalleResponse =
  | {
      disponible: true;
      platillo: { id: number; nombre: string; categoria: string; precio: number };
      wapeModelo: number;
      wapeBaseline: number;
      serieHistorica: { fecha: string; unidades: number }[];
      pronostico: { fecha: string; unidadesPredichas: number }[];
    }
  | { disponible: false; motivo: string };

// ─────────────────────────────────────────────────────────────────────────────
// Constantes de clasificación (adaptadas a Tailwind)
// ─────────────────────────────────────────────────────────────────────────────
const CLASIFICACION_CONFIG: Record<
  Clasificacion,
  { colorClass: string; bgClass: string; borderClass: string; icon: React.ElementType }
> = {
  "Alta demanda": {
    colorClass: "text-emerald-600 dark:text-emerald-400",
    bgClass: "bg-emerald-50 dark:bg-emerald-400/10",
    borderClass: "border-emerald-200 dark:border-emerald-400/30",
    icon: TrendingUp,
  },
  "Demanda media": {
    colorClass: "text-amber-600 dark:text-amber-400",
    bgClass: "bg-amber-50 dark:bg-amber-400/10",
    borderClass: "border-amber-200 dark:border-amber-400/30",
    icon: TrendingDown,
  },
  "Baja demanda": {
    colorClass: "text-red-600 dark:text-red-400",
    bgClass: "bg-red-50 dark:bg-red-400/10",
    borderClass: "border-red-200 dark:border-red-400/30",
    icon: TrendingDown,
  },
};

const fmtPct = (p: number) => `${p >= 0 ? "+" : ""}${p.toFixed(2)}%`;

// ─────────────────────────────────────────────────────────────────────────────
// Badge de clasificación (usado también en la tabla de regresión)
// ─────────────────────────────────────────────────────────────────────────────
function ClasificacionBadge({ c }: { c: Clasificacion }) {
  const config = CLASIFICACION_CONFIG[c];
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${config.bgClass} ${config.colorClass} ${config.borderClass}`}
    >
      <Icon size={12} />
      {c}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente de celda de tabla reutilizable
// ─────────────────────────────────────────────────────────────────────────────
function Td({
  children,
  className,
  mono,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  mono?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <td
      className={`${className || ""} ${mono ? "font-mono" : ""}`}
      style={style}
    >
      {children}
    </td>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Página principal
// ─────────────────────────────────────────────────────────────────────────────
export default function ModeloPredictivoPage() {
  // ── Estados del modelo de regresión ─────────────────────────────────────
  const [regresion, setRegresion] = useState<RegresionRankingResponse | null>(null);
  const [regresionLoading, setRegresionLoading] = useState(false);
  const [regresionError, setRegresionError] = useState<string | null>(null);
  const [regresionSelId, setRegresionSelId] = useState<number | null>(null);
  const [regresionDetalle, setRegresionDetalle] = useState<RegresionDetalleResponse | null>(null);
  const [regresionDetalleLoading, setRegresionDetalleLoading] = useState(false);

  // ── Carga inicial del ranking de regresión ──────────────────────────────
  useEffect(() => {
    setRegresionLoading(true);
    setRegresionError(null);
    api
      .get<RegresionRankingResponse>("/inventory/predictive/ranking?dias=7")
      .then(setRegresion)
      .catch((err: unknown) => {
        const message =
          err instanceof APIError ? err.message : "No se pudo cargar el modelo de regresión.";
        setRegresionError(message);
      })
      .finally(() => setRegresionLoading(false));
  }, []);

  // ── Carga del detalle cuando se selecciona un platillo ──────────────────
  useEffect(() => {
    if (!regresionSelId) {
      setRegresionDetalle(null);
      return;
    }
    setRegresionDetalleLoading(true);
    api
      .get<RegresionDetalleResponse>(`/inventory/predictive/${regresionSelId}?dias=7`)
      .then(setRegresionDetalle)
      .catch(() => setRegresionDetalle(null))
      .finally(() => setRegresionDetalleLoading(false));
  }, [regresionSelId]);

  // ── Datos para el gráfico de línea (histórico + pronóstico) ─────────────
  const regresionChartData = useMemo(() => {
    if (!regresionDetalle || !regresionDetalle.disponible) return [];
    const historico = regresionDetalle.serieHistorica.map((h) => ({
      label: h.fecha.slice(5),
      real: h.unidades,
      pronostico: null as number | null,
    }));
    const futuro = regresionDetalle.pronostico.map((p) => ({
      label: p.fecha.slice(5),
      real: null as number | null,
      pronostico: p.unidadesPredichas,
    }));
    return [...historico, ...futuro];
  }, [regresionDetalle]);

  // ── Renderizado ─────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-surface-muted p-6 md:p-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
          <Activity size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-text">Análisis Predictivo de Ventas</h1>
          <p className="text-sm text-text-muted mt-1">
            Modelo de Regresión · Lags + Estacionalidad
          </p>
        </div>
      </div>

      {/* Descripción del modelo */}
      <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-surface-alt border border-border">
        <Sigma size={18} className="text-brand" />
        <div>
          <h2 className="text-base font-extrabold text-text">
            Modelo de Regresión · Lags + Estacionalidad
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Predicción basada en datos reales de <code className="text-brand">orden_items</code>: mínimos
            cuadrados sobre día de la semana, ventas de hace 1 y 7 días, media móvil,
            popularidad del platillo y tendencia.
          </p>
        </div>
      </div>

      {/* Estados de carga / error */}
      {regresionLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 size={24} className="animate-spin text-brand mr-2" />
          <span className="text-text-muted text-sm">Entrenando el modelo con el historial real...</span>
        </div>
      )}

      {!regresionLoading && regresionError && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-400/10 border border-red-200 dark:border-red-400/30 text-red-600 dark:text-red-400 mb-6">
          <AlertCircle size={16} />
          {regresionError}
        </div>
      )}

      {!regresionLoading && !regresionError && regresion && !regresion.disponible && (
        <div className="text-center py-12 text-text-muted">
          {regresion.motivo}
        </div>
      )}

      {/* Contenido principal: ranking + gráfico */}
      {!regresionLoading && !regresionError && regresion?.disponible && (
        <>
          {/* Tarjetas de resumen (WAPE, mejora, mayor crec./decrec.) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-surface rounded-2xl border border-border p-5 shadow-sm">
              <div className="text-xs font-bold uppercase text-text-muted mb-2">WAPE del modelo</div>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                {(regresion.wapeModelo * 100).toFixed(1)}%
              </div>
              <span className="text-[11px] text-text-muted">
                vs. {(regresion.wapeBaseline * 100).toFixed(1)}% del baseline ingenuo
              </span>
            </div>
            <div className="bg-surface rounded-2xl border border-border p-5 shadow-sm">
              <div className="text-xs font-bold uppercase text-text-muted mb-2">Mejora sobre el baseline</div>
              <div
                className={`text-2xl font-black ${regresion.mejoraPct >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
              >
                {fmtPct(regresion.mejoraPct)}
              </div>
              <span className="text-[11px] text-text-muted">menos error absoluto ponderado</span>
            </div>
            {regresion.platilloMayorCrecimiento && (
              <div className="bg-surface rounded-2xl border border-border p-5 shadow-sm">
                <div className="text-xs font-bold uppercase text-text-muted mb-2">Mayor crecimiento (7 días)</div>
                <div className="text-sm font-bold text-text mb-1">{regresion.platilloMayorCrecimiento.nombre}</div>
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                  {fmtPct(regresion.platilloMayorCrecimiento.variacionPct)}
                </div>
              </div>
            )}
            {regresion.platilloMayorDecrecimiento && (
              <div className="bg-surface rounded-2xl border border-border p-5 shadow-sm">
                <div className="text-xs font-bold uppercase text-text-muted mb-2">Mayor decrecimiento (7 días)</div>
                <div className="text-sm font-bold text-text mb-1">{regresion.platilloMayorDecrecimiento.nombre}</div>
                <div className="text-xl font-black text-red-600 dark:text-red-400">
                  {fmtPct(regresion.platilloMayorDecrecimiento.variacionPct)}
                </div>
              </div>
            )}
          </div>

          {/* Tabla de platillos + gráfico de detalle */}
          <div className={`grid ${regresionDetalle ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"} gap-4 mb-6`}>
            {/* Tabla de ranking */}
            <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="p-4 border-b border-border bg-surface-alt">
                <h3 className="text-sm font-extrabold text-text flex items-center gap-2">
                  <Award size={16} />
                  Pronóstico próximos {regresion.horizonteDias} días · click en un platillo para ver su curva
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-alt border-b border-border">
                      {["Platillo", "Cat.", "Últ. 7 días", "Próx. 7 días", "Variación", "Clasif."].map((h) => (
                        <th key={h} className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-text-muted">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {regresion.platillos.map((p) => (
                      <tr
                        key={p.platilloId}
                        onClick={() => setRegresionSelId(p.platilloId)}
                        className={`cursor-pointer transition-colors hover:bg-surface-muted/50 ${
                          regresionSelId === p.platilloId ? "bg-brand/5 ring-1 ring-brand/30" : ""
                        }`}
                      >
                        <Td className="px-4 py-3 text-sm font-semibold text-text">{p.nombre}</Td>
                        <Td className="px-4 py-3 text-xs text-text-sec">{p.categoria}</Td>
                        <Td className="px-4 py-3 text-sm font-mono text-text">{p.unidadesUltimos7}</Td>
                        <Td className="px-4 py-3 text-sm font-mono text-text">{p.unidadesPredichas7}</Td>
                        <Td
                          className="px-4 py-3 text-sm font-mono font-bold"
                          style={{ color: p.variacionPct >= 0 ? "#22c55e" : "#ef4444" }}
                        >
                          {fmtPct(p.variacionPct)}
                        </Td>
                        <Td className="px-4 py-3">
                          <ClasificacionBadge c={p.clasificacion} />
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Gráfico de detalle */}
            {regresionDetalle && (
              <div className="bg-surface rounded-2xl border border-border shadow-sm p-4">
                <h3 className="text-sm font-extrabold text-text mb-4 flex items-center gap-2">
                  <Activity size={16} />
                  {regresionDetalle.disponible
                    ? `Real vs. pronóstico: ${regresionDetalle.platillo.nombre}`
                    : "Sin datos suficientes"}
                </h3>
                {regresionDetalleLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 size={24} className="animate-spin text-brand" />
                  </div>
                ) : regresionDetalle.disponible ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={regresionChartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="label" tick={{ fill: "var(--color-text-muted)", fontSize: 12 }} />
                      <YAxis tick={{ fill: "var(--color-text-muted)", fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--color-surface)",
                          border: "1px solid var(--color-border)",
                          borderRadius: 8,
                          color: "var(--color-text)",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="real"
                        name="Ventas reales"
                        stroke="#f97316"
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        connectNulls={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="pronostico"
                        name="Pronóstico (regresión)"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ r: 3 }}
                        connectNulls={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-text-muted">{regresionDetalle.motivo}</p>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* =====================================================================
          TODO EL CÓDIGO DEL MODELO EXPONENCIAL HA SIDO COMENTADO
          (datos mock, funciones de cálculo, componentes exclusivos,
          filtros, gráficos, panel matemático, tabla de ranking y
          FormulaBar).  Permanece aquí como documentación / referencia.
          ===================================================================== */}
      {/*
      // ─── CONSTANTES MOCK ─────────────────────────────────────────────────
      const MENU_RAW = [ ... ];
      const mockPlatillos = [ ... ];
      const mockVentasDiarias = generateDailySales();
      function consultarVentasMock(...) { ... }
      function calcularCrecimientoMock(...) { ... }
      function calcularMediana(...) { ... }
      function calcularModa(...) { ... }

      // ─── COMPONENTES EXCLUSIVOS DEL MODELO EXPONENCIAL ───────────────────
      function SummaryCard(...) { ... }
      function StatCard(...) { ... }
      function MathSteps(...) { ... }
      function FormulaBar(...) { ... }
      function KInterpretacion(...) { ... }

      // ─── VISTA EXPONENCIAL (filtros, gráficos, panel matemático, etc.) ───
      {vista === "exponencial" && (
        <>
          ... todo el JSX ...
        </>
      )}
      */}
    </main>
  );
}
