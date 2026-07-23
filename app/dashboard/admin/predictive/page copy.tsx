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
  BarChart,
  Bar,
  Cell,
  ReferenceLine,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Coffee,
  DollarSign,
  BarChart3,
  Calculator,
  Sigma,
  Percent,
  Hash,
  PieChart,
  Activity,
  AlertCircle,
  ChevronRight,
  Zap,
  Award,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Loader2,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type Granularidad = "diaria" | "semanal" | "mensual";
type Clasificacion = "Alta demanda" | "Demanda media" | "Baja demanda";

interface Platillo {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  estado: string;
}

interface SerieDato {
  periodo: number;
  label: string;
  unidades: number;
}

interface ResultadoPredictivo {
  platillo_id: string;
  platillo_nombre: string;
  categoria: string;
  precio: number;
  P0: number;
  P1_promedio: number;
  t1: number;
  k: number;
  t_siguiente: number;
  P_proyectado: number;
  crecimiento_pct: number;
  clasificacion: Clasificacion;
  total_ventas: number;
  promedio: number;
  mediana: number;
  moda: number;
  serie_real: SerieDato[];
  serie_modelo: SerieDato[];
  alerta_coherencia: string | null;
  error?: string;
}

interface RankingData {
  ranking: ResultadoPredictivo[];
  platillo_mayor_crecimiento: ResultadoPredictivo | null;
  platillo_mayor_decrecimiento: ResultadoPredictivo | null;
  periodo: { fecha_inicio: string; fecha_fin: string; granularidad: string };
}

// ─────────────────────────────────────────────────────────────────────────────
// Modelo de Regresión (lags + estacionalidad semanal) — fuente adicional,
// consume /inventory/predictive/* del backend real (no es mock).
// ─────────────────────────────────────────────────────────────────────────────
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
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const USE_MOCK = true;

const CLASIFICACION_CONFIG = {
  "Alta demanda": {
    color: "#22c55e",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    icon: TrendingUp,
  },
  "Demanda media": {
    color: "#eab308",
    bg: "#fefce8",
    border: "#fef08a",
    icon: Minus,
  },
  "Baja demanda": {
    color: "#ef4444",
    bg: "#fef2f2",
    border: "#fecaca",
    icon: TrendingDown,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const fmtK = (k: number) => `${k >= 0 ? "+" : ""}${k.toFixed(4)}`;
const fmtPct = (p: number) => `${p >= 0 ? "+" : ""}${p.toFixed(2)}%`;

function ClasificacionBadge({ c }: { c: Clasificacion }) {
  const config = CLASIFICACION_CONFIG[c];
  const Icon = config.icon;
  return (
    <span
      className="predictive-badge"
      style={{
        backgroundColor: config.bg,
        color: config.color,
        borderColor: config.border,
      }}
    >
      <Icon size={12} />
      {c}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────
function SummaryCard({
  icon: Icon,
  title,
  nombre,
  valor,
  valorColor,
  clasificacion,
}: {
  icon: React.ElementType;
  title: string;
  nombre: string;
  valor: string;
  valorColor: string;
  clasificacion: Clasificacion;
}) {
  return (
    <div className="predictive-card">
      <div className="predictive-card-icon">
        <Icon size={24} />
      </div>
      <div className="predictive-card-title">{title}</div>
      <div className="predictive-card-name">{nombre}</div>
      <div className="predictive-card-value" style={{ color: valorColor }}>
        k = {valor}
      </div>
      <ClasificacionBadge c={clasificacion} />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  valor,
  color,
}: {
  icon: React.ElementType;
  label: string;
  valor: string;
  color?: string;
}) {
  return (
    <div className="predictive-stat-card">
      <div className="predictive-stat-label">
        <Icon size={12} /> {label}
      </div>
      <div
        className="predictive-stat-value"
        style={{ color: color || "#1e293b" }}
      >
        {valor}
      </div>
    </div>
  );
}

function MathSteps({ r }: { r: ResultadoPredictivo }) {
  const steps = [
    {
      step: "Condición inicial (P₀)",
      formula: "P₀ = ventas[0].unidades",
      result: `${r.P0} unidades`,
    },
    {
      step: "Punto de análisis (P₁)",
      formula: "P₁ = promedio(ventas)",
      result: `${r.P1_promedio} unidades`,
    },
    {
      step: "Períodos transcurridos (t₁)",
      formula: "t₁ = len(ventas) − 1",
      result: `${r.t1} períodos`,
    },
    {
      step: "Tasa de crecimiento (k)",
      formula: `k = ln(${r.P1_promedio} / ${r.P0}) / ${r.t1}`,
      result: fmtK(r.k),
    },
    {
      step: `Proyección P(${r.t_siguiente})`,
      formula: `P₀ · e^(k · ${r.t_siguiente}) = ${r.P0} · e^(${r.k.toFixed(
        4,
      )} × ${r.t_siguiente})`,
      result: `${r.P_proyectado} unidades`,
    },
    {
      step: "Crecimiento porcentual",
      formula: `((${r.P_proyectado} − ${r.P0}) / ${r.P0}) × 100`,
      result: fmtPct(r.crecimiento_pct),
    },
  ];

  return (
    <div className="predictive-math-steps">
      {steps.map((s, i) => (
        <div key={i} className="math-step">
          <div className="math-step-number">{i + 1}</div>
          <div className="math-step-content">
            <div className="math-step-label">{s.step}</div>
            <div className="math-step-formula">{s.formula}</div>
            <div className="math-step-result">= {s.result}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FormulaBar() {
  const formulas = [
    { label: "Ecuación diferencial", expr: "dP/dt = k · P" },
    { label: "Solución general", expr: "P(t) = P₀ · e^(k·t)" },
    { label: "Tasa k", expr: "k = ln(P₁/P₀) / t₁" },
    { label: "Crecimiento%", expr: "((P(t) − P₀) / P₀) × 100" },
  ];
  return (
    <div className="predictive-formula-bar">
      {formulas.map((f) => (
        <div key={f.label} className="formula-item">
          <div className="formula-label">{f.label}</div>
          <div className="formula-expr">{f.expr}</div>
        </div>
      ))}
    </div>
  );
}

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
    <td className={`${className || ""} ${mono ? "mono" : ""}`} style={style}>
      {children}
    </td>
  );
}

function KInterpretacion({ k }: { k: number }) {
  const tabla = [
    {
      rango: "k > 0.05",
      significado: "Crecimiento acelerado",
      operativa: "Asegurar stock de insumos",
      estrategica: "Destacar en menú, incluir en combos",
      activo: k > 0.05,
    },
    {
      rango: "0 < k ≤ 0.05",
      significado: "Crecimiento lento positivo",
      operativa: "Mantener abasto normal",
      estrategica: "Considerar promociones para impulsar",
      activo: k > 0 && k <= 0.05,
    },
    {
      rango: "k ≈ 0",
      significado: "Ventas estables sin tendencia",
      operativa: "Monitorear semanalmente",
      estrategica: "Evaluar si es platillo ancla del menú",
      activo: Math.abs(k) < 0.001,
    },
    {
      rango: "-0.05 ≤ k < 0",
      significado: "Decrecimiento lento",
      operativa: "Reducir compra de insumos",
      estrategica: "Aplicar descuento o cambiar presentación",
      activo: k >= -0.05 && k < 0,
    },
    {
      rango: "k < -0.05",
      significado: "Decrecimiento acelerado",
      operativa: "Minimizar stock, reducir merma",
      estrategica: "Evaluar retiro del menú o rediseño total",
      activo: k < -0.05,
    },
  ];

  return (
    <div className="predictive-interpretation">
      {tabla.map((row) => (
        <div
          key={row.rango}
          className={`interpretation-row ${row.activo ? "active" : ""}`}
        >
          <div className="interpretation-header">
            <code className={`rango ${row.activo ? "active" : ""}`}>
              {row.rango}
            </code>
            {row.activo && <span className="badge">ACTUAL</span>}
          </div>
          <div className="significado">{row.significado}</div>
          {row.activo && (
            <div className="actions">
              <strong>Operativa:</strong> {row.operativa}
              <br />
              <strong>Estratégica:</strong> {row.estrategica}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA (100 platillos reales)
// ─────────────────────────────────────────────────────────────────────────────
const MENU_RAW: Array<{ nombre: string; precio: string }> = [
  { nombre: "Piña Colada", precio: "75.00" },
  { nombre: "Mojito Tamarindo", precio: "75.00" },
  { nombre: "Mojito Frutos Rojos", precio: "75.00" },
  { nombre: "Mojito Kiwi", precio: "75.00" },
  { nombre: "Mojito Mango", precio: "75.00" },
  { nombre: "Daikiri Limón", precio: "75.00" },
  { nombre: "Daikiri Mango", precio: "75.00" },
  { nombre: "Daikiri Fresa", precio: "75.00" },
  { nombre: "Perla Negra", precio: "75.00" },
  { nombre: "Cosmopolitan", precio: "75.00" },
  { nombre: "Tinto de Verano", precio: "75.00" },
  { nombre: "Sangría", precio: "75.00" },
  { nombre: "Azulitoos", precio: "75.00" },
  { nombre: "Mimosa", precio: "75.00" },
  { nombre: "Quemadita", precio: "75.00" },
  { nombre: "Pal Mal", precio: "70.00" },
  { nombre: "Panzón", precio: "125.00" },
  { nombre: "Xantolera", precio: "70.00" },
  { nombre: "Ojos Verdes", precio: "70.00" },
  { nombre: "Fiebre Roja", precio: "70.00" },
  { nombre: "Soul Whisky", precio: "70.00" },
  { nombre: "Quijote 13", precio: "75.00" },
  { nombre: "Martini Rompope", precio: "75.00" },
  { nombre: "Conquistador", precio: "75.00" },
  { nombre: "Baileys Colado", precio: "75.00" },
  { nombre: "Ruso Blanco", precio: "75.00" },
  { nombre: "Bull Cubano", precio: "75.00" },
  { nombre: "Long Island", precio: "75.00" },
  { nombre: "Cantarito Tequila", precio: "75.00" },
  { nombre: "Cantarito Mezcal", precio: "75.00" },
  { nombre: "Paloma Clásica", precio: "75.00" },
  { nombre: "Paloma Fresa", precio: "75.00" },
  { nombre: "Fresada", precio: "75.00" },
  { nombre: "Vampiro", precio: "75.00" },
  { nombre: "Margarita Costa Azul", precio: "75.00" },
  { nombre: "Margarita Endiablada", precio: "75.00" },
  { nombre: "Mezcalita Piña", precio: "75.00" },
  { nombre: "Sunrise", precio: "75.00" },
  { nombre: "Gin Red", precio: "75.00" },
  { nombre: "Gin Bombasa", precio: "75.00" },
  { nombre: "Tom Collins", precio: "75.00" },
  { nombre: "Americano", precio: "35.00" },
  { nombre: "Capuchino", precio: "45.00" },
  { nombre: "Café Frío", precio: "65.00" },
  { nombre: "Café Latte", precio: "55.00" },
  { nombre: "Frappé Moka", precio: "75.00" },
  { nombre: "Frappé Ferrero", precio: "75.00" },
  { nombre: "Frappé Oreo", precio: "75.00" },
  { nombre: "Malteada Vainilla", precio: "70.00" },
  { nombre: "Malteada Fresa", precio: "70.00" },
  { nombre: "Malteada Chocolate", precio: "70.00" },
  { nombre: "Smoothie Fresa", precio: "70.00" },
  { nombre: "Smoothie Limón", precio: "70.00" },
  { nombre: "Smoothie Mango", precio: "70.00" },
  { nombre: "Smoothie Horchata", precio: "70.00" },
  { nombre: "Afogatto", precio: "75.00" },
  { nombre: "Carajillo", precio: "110.00" },
  { nombre: "Cerveza Nacional", precio: "45.00" },
  { nombre: "Cerveza Artesanal", precio: "65.00" },
  { nombre: "Cerveza Importada", precio: "75.00" },
  { nombre: "Michelada Clásica", precio: "55.00" },
  { nombre: "Michelada Jumbo", precio: "110.00" },
  { nombre: "Michelada Master", precio: "150.00" },
  { nombre: "Copa General", precio: "80.00" },
  { nombre: "Copa Premium", precio: "130.00" },
  { nombre: "Clericot Copa", precio: "75.00" },
  { nombre: "Clericot Litro", precio: "150.00" },
  { nombre: "Agua Embotellada", precio: "25.00" },
  { nombre: "Té", precio: "35.00" },
  { nombre: "Agua de Fruta", precio: "40.00" },
  { nombre: "Jarra Agua de Fruta", precio: "90.00" },
  { nombre: "Hamburguesa Pastor", precio: "145.00" },
  { nombre: "Hamburguesa Crispy", precio: "145.00" },
  { nombre: "Hamburguesa Res", precio: "145.00" },
  { nombre: "Pizzeta Arrachera", precio: "135.00" },
  { nombre: "Carpaccio de Pera", precio: "150.00" },
  { nombre: "Kebab Arrachera", precio: "93.00" },
  { nombre: "Kebab Pastor", precio: "93.00" },
  { nombre: "Kebab Pollo", precio: "93.00" },
  { nombre: "Kebab Camarón", precio: "93.00" },
  { nombre: "Taco Árabe", precio: "73.00" },
  { nombre: "Prudentino Champiñones", precio: "75.00" },
  { nombre: "Tacos Clásicos Pastor", precio: "93.00" },
  { nombre: "Tacos Clásicos Chorizo Argentino", precio: "93.00" },
  { nombre: "Tacos Clásicos Chistorra", precio: "93.00" },
  { nombre: "Tacos Clásicos Longaniza", precio: "93.00" },
  { nombre: "Tacos Supremos Camarón", precio: "85.00" },
  { nombre: "Tacos Supremos Arrachera", precio: "85.00" },
  { nombre: "Tacos Supremos Pastor", precio: "85.00" },
  { nombre: "Tacos Supremos Longaniza", precio: "85.00" },
  { nombre: "Papas a la Francesa", precio: "75.00" },
  { nombre: "Extras Arrachera", precio: "90.00" },
  { nombre: "Extras Chorizo Argentino", precio: "90.00" },
  { nombre: "Extras Chistorra", precio: "90.00" },
  { nombre: "Papas Enquijotadas", precio: "120.00" },
  { nombre: "Papas Gajo", precio: "75.00" },
  { nombre: "Mini Prudentinos", precio: "65.00" },
  { nombre: "Nachos", precio: "70.00" },
  { nombre: "Alitas", precio: "85.00" },
  { nombre: "Prudentino Carne con Aceitunas Negras y Queso", precio: "75.00" },
];

function generateId(name: string, index: number): string {
  const prefix = name.substring(0, 4).toUpperCase().replace(/\s/g, "");
  return `${prefix}-${String(index + 1).padStart(3, "0")}`;
}

function inferCategory(name: string): string {
  const lower = name.toLowerCase();
  if (
    lower.includes("café") ||
    lower.includes("capuchino") ||
    lower.includes("frappé") ||
    lower.includes("malteada") ||
    lower.includes("smoothie") ||
    lower.includes("té")
  )
    return "Cafetería";
  if (
    lower.includes("cerveza") ||
    lower.includes("michelada") ||
    lower.includes("copa")
  )
    return "Cervezas y Copas";
  if (
    lower.includes("hamburguesa") ||
    lower.includes("taco") ||
    lower.includes("kebab") ||
    lower.includes("pizza") ||
    lower.includes("papas") ||
    lower.includes("alitas") ||
    lower.includes("nachos")
  )
    return "Alimentos";
  return "Bebidas Preparadas";
}

const mockPlatillos: Platillo[] = MENU_RAW.map((item, idx) => ({
  id: generateId(item.nombre, idx),
  nombre: item.nombre,
  categoria: inferCategory(item.nombre),
  precio: parseFloat(item.precio),
  estado: "activo",
}));

interface VentaDiariaMock {
  fecha: string;
  platillo_id: string;
  unidades: number;
  total: number;
}

function generateDailySales(): VentaDiariaMock[] {
  const startDate = new Date(2026, 0, 1);
  const endDate = new Date(2026, 2, 31);
  const days: Date[] = [];
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }

  const ventas: VentaDiariaMock[] = [];
  const platillos = mockPlatillos;

  const popularityWeights = platillos.map((p) => {
    const name = p.nombre.toLowerCase();
    if (name.includes("cerveza") || name.includes("michelada")) return 3.2;
    if (name.includes("taco") || name.includes("hamburguesa")) return 2.8;
    if (name.includes("café") || name.includes("capuchino")) return 2.0;
    if (name.includes("margarita") || name.includes("mojito")) return 2.5;
    return 1.0 + Math.random() * 0.8;
  });

  const dayFactors = [0.85, 0.65, 0.6, 0.65, 0.8, 1.4, 1.6];

  days.forEach((date) => {
    const dayOfWeek = date.getDay();
    let factor = dayFactors[dayOfWeek] * (0.85 + Math.random() * 0.3);
    // Algunos días aleatorios serán más flojos (demanda media/baja)
    if (Math.random() < 0.12) {
      factor *= 0.55; // día flojo pero no catastrófico
    }
    const dateStr = date.toISOString().split("T")[0];
    const daySales: VentaDiariaMock[] = [];

    platillos.forEach((p, idx) => {
      const baseUnits = Math.max(
        1,
        Math.round(popularityWeights[idx] * factor * (4 + Math.random() * 12)),
      );
      daySales.push({
        fecha: dateStr,
        platillo_id: p.id,
        unidades: baseUnits,
        total: baseUnits * p.precio,
      });
    });

    let dayTotal = daySales.reduce((sum, s) => sum + s.total, 0);
    const targetDaily = 8000;

    if (dayTotal < targetDaily) {
      const deficit = targetDaily - dayTotal;
      const sorted = [...daySales].sort((a, b) => b.total - a.total);
      let remaining = deficit;
      for (let i = 0; i < Math.min(12, sorted.length); i++) {
        const sale = sorted[i];
        const platillo = platillos.find((p) => p.id === sale.platillo_id)!;
        const extraUnits = Math.ceil(remaining / platillo.precio);
        sale.unidades += extraUnits;
        sale.total = sale.unidades * platillo.precio;
        remaining -= extraUnits * platillo.precio;
        if (remaining <= 0) break;
      }
    }

    ventas.push(...daySales);
  });

  // Ajuste semanal mínimo 70,000
  const weekSize = 7;
  for (let w = 0; w < Math.floor(days.length / weekSize); w++) {
    const weekDays = days.slice(w * weekSize, (w + 1) * weekSize);
    const weekVentas = ventas.filter((v) =>
      weekDays.some((d) => d.toISOString().split("T")[0] === v.fecha),
    );
    const weekTotal = weekVentas.reduce((sum, v) => sum + v.total, 0);
    const targetWeekly = 70000;
    if (weekTotal < targetWeekly) {
      const deficit = targetWeekly - weekTotal;
      const lastDay = weekDays[weekDays.length - 1];
      const lastDayStr = lastDay.toISOString().split("T")[0];
      const lastDaySales = ventas.filter((v) => v.fecha === lastDayStr);
      const sorted = [...lastDaySales].sort((a, b) => b.total - a.total);
      let remaining = deficit;
      for (let i = 0; i < Math.min(15, sorted.length); i++) {
        const sale = sorted[i];
        const platillo = platillos.find((p) => p.id === sale.platillo_id)!;
        const extraUnits = Math.ceil(remaining / platillo.precio);
        sale.unidades += extraUnits;
        sale.total = sale.unidades * platillo.precio;
        remaining -= extraUnits * platillo.precio;
        if (remaining <= 0) break;
      }
    }
  }

  return ventas;
}

const mockVentasDiarias = generateDailySales();

function consultarVentasMock(
  platillo_id: string,
  fecha_inicio: string,
  fecha_fin: string,
  granularidad: Granularidad,
): SerieDato[] {
  const filtradas = mockVentasDiarias.filter(
    (v) =>
      v.platillo_id === platillo_id &&
      v.fecha >= fecha_inicio &&
      v.fecha <= fecha_fin,
  );
  if (filtradas.length === 0) return [];

  if (granularidad === "diaria") {
    return filtradas.map((v, i) => ({
      periodo: i,
      label: v.fecha.slice(5),
      unidades: v.unidades,
    }));
  }

  if (granularidad === "semanal") {
    const semanas = new Map<string, { label: string; total: number }>();
    filtradas.forEach((v) => {
      const d = new Date(v.fecha);
      const year = d.getFullYear();
      const start = new Date(year, 0, 1);
      const weekNum = Math.ceil(
        ((d.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7,
      );
      const key = `${year}-W${weekNum}`;
      const label = `Sem ${weekNum}`;
      const prev = semanas.get(key) ?? { label, total: 0 };
      semanas.set(key, { label, total: prev.total + v.unidades });
    });
    return Array.from(semanas.entries()).map(([, val], i) => ({
      periodo: i,
      label: val.label,
      unidades: val.total,
    }));
  }

  if (granularidad === "mensual") {
    const meses = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];
    const mesesMap = new Map<string, { label: string; total: number }>();
    filtradas.forEach((v) => {
      const d = new Date(v.fecha);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0",
      )}`;
      const label = `${meses[d.getMonth()]} ${d.getFullYear()}`;
      const prev = mesesMap.get(key) ?? { label, total: 0 };
      mesesMap.set(key, { label, total: prev.total + v.unidades });
    });
    return Array.from(mesesMap.entries()).map(([, val], i) => ({
      periodo: i,
      label: val.label,
      unidades: val.total,
    }));
  }
  return [];
}

function calcularMediana(valores: number[]): number {
  const sorted = [...valores].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function calcularModa(valores: number[]): number {
  const freq = new Map<number, number>();
  valores.forEach((v) => freq.set(v, (freq.get(v) ?? 0) + 1));
  let maxFreq = 0,
    moda = valores[0];
  freq.forEach((f, val) => {
    if (f > maxFreq) {
      maxFreq = f;
      moda = val;
    }
  });
  return moda;
}

function calcularCrecimientoMock(
  platillo_id: string,
  fecha_inicio: string,
  fecha_fin: string,
  granularidad: Granularidad,
): ResultadoPredictivo | { error: string } {
  const platillo = mockPlatillos.find((p) => p.id === platillo_id);
  if (!platillo) return { error: `Platillo ${platillo_id} no encontrado` };

  const ventas = consultarVentasMock(
    platillo_id,
    fecha_inicio,
    fecha_fin,
    granularidad,
  );
  if (ventas.length < 2)
    return { error: "Datos insuficientes (mínimo 2 períodos)" };

  const unidadesArray = ventas.map((v) => v.unidades);
  const P0 = ventas[0].unidades;
  const P1 = unidadesArray.reduce((a, b) => a + b, 0) / unidadesArray.length;
  const t1 = ventas.length - 1;

  if (P0 <= 0 || P1 <= 0)
    return { error: "Ventas iniciales no pueden ser cero" };

  const k = Math.log(P1 / P0) / t1;
  const t_siguiente = t1 + 1;
  const P_proyectado = Math.round(P0 * Math.exp(k * t_siguiente));
  const crecimiento_pct = parseFloat(
    (((P_proyectado - P0) / P0) * 100).toFixed(2),
  );

  let clasificacion: Clasificacion;
  if (k > 0.05) clasificacion = "Alta demanda";
  else if (k >= -0.05) clasificacion = "Demanda media";
  else clasificacion = "Baja demanda";

  const total_ventas = unidadesArray.reduce((a, b) => a + b, 0);
  const promedio = parseFloat((total_ventas / ventas.length).toFixed(2));
  const mediana = calcularMediana(unidadesArray);
  const moda = calcularModa(unidadesArray);

  let alerta_coherencia: string | null = null;
  if (promedio > mediana * 1.5) {
    alerta_coherencia =
      "El promedio es significativamente mayor que la mediana. Pueden existir períodos atípicos con ventas muy altas.";
  } else if (moda < promedio * 0.5) {
    alerta_coherencia =
      "Alta variabilidad detectada: hay pocos períodos con ventas altas y muchos con ventas bajas.";
  }

  const serie_real: SerieDato[] = ventas.map((v, i) => ({
    periodo: i,
    label: v.label,
    unidades: v.unidades,
  }));
  const serie_modelo: SerieDato[] = ventas.map((v, i) => ({
    periodo: i,
    label: v.label,
    unidades: parseFloat((P0 * Math.exp(k * i)).toFixed(1)),
  }));
  serie_modelo.push({
    periodo: t_siguiente,
    label: `Proy.`,
    unidades: parseFloat((P0 * Math.exp(k * t_siguiente)).toFixed(1)),
  });

  return {
    platillo_id: platillo.id,
    platillo_nombre: platillo.nombre,
    categoria: platillo.categoria,
    precio: platillo.precio,
    P0,
    P1_promedio: parseFloat(P1.toFixed(2)),
    t1,
    k: parseFloat(k.toFixed(6)),
    t_siguiente,
    P_proyectado,
    crecimiento_pct,
    clasificacion,
    total_ventas,
    promedio,
    mediana,
    moda,
    serie_real,
    serie_modelo,
    alerta_coherencia,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page Component
// ─────────────────────────────────────────────────────────────────────────────
export default function ModeloPredictivoPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [vista, setVista] = useState<"exponencial" | "regresion">("exponencial");
  const [platillos, setPlatillos] = useState<Platillo[]>([]);
  const [rankingData, setRankingData] = useState<RankingData | null>(null);
  const [detalle, setDetalle] = useState<ResultadoPredictivo | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");
  const [fechaInicio, setFechaInicio] = useState("2026-01-01");
  const [fechaFin, setFechaFin] = useState("2026-03-31");
  const [granularidad, setGranularidad] = useState<Granularidad>("mensual");
  const [loadingRanking, setLoadingRanking] = useState(false);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modelo de regresión (real, backend Nest)
  const [regresion, setRegresion] = useState<RegresionRankingResponse | null>(null);
  const [regresionLoading, setRegresionLoading] = useState(false);
  const [regresionError, setRegresionError] = useState<string | null>(null);
  const [regresionSelId, setRegresionSelId] = useState<number | null>(null);
  const [regresionDetalle, setRegresionDetalle] = useState<RegresionDetalleResponse | null>(null);
  const [regresionDetalleLoading, setRegresionDetalleLoading] = useState(false);

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

  useEffect(() => {
    if (USE_MOCK) {
      setPlatillos(mockPlatillos);
      return;
    }
    fetch(`${API_BASE}/api/predictivo/platillos`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setPlatillos)
      .catch(() => setError("No se pudo conectar al servidor backend."));
  }, []);

  const cargarRanking = useCallback(async () => {
    setLoadingRanking(true);
    setError(null);
    try {
      if (USE_MOCK) {
        const resultados = mockPlatillos
          .map((p) =>
            calcularCrecimientoMock(p.id, fechaInicio, fechaFin, granularidad),
          )
          .filter((r): r is ResultadoPredictivo => !("error" in r));
        const ranking = resultados.sort((a, b) => b.k - a.k);
        const data: RankingData = {
          ranking,
          platillo_mayor_crecimiento: ranking[0] || null,
          platillo_mayor_decrecimiento: ranking[ranking.length - 1] || null,
          periodo: {
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin,
            granularidad,
          },
        };
        setRankingData(data);
        setLoadingRanking(false);
        return;
      }
      const res = await fetch(`${API_BASE}/api/predictivo/ranking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          granularidad,
        }),
      });
      if (!res.ok) throw new Error("Error en la respuesta del servidor");
      const data: RankingData = await res.json();
      setRankingData(data);
    } catch {
      setError("Error al obtener el ranking. Verifica la conexión.");
    } finally {
      setLoadingRanking(false);
    }
  }, [fechaInicio, fechaFin, granularidad]);

  useEffect(() => {
    cargarRanking();
  }, [cargarRanking]);

  const cargarDetalle = useCallback(
    async (platilloId: string) => {
      if (!platilloId) {
        setDetalle(null);
        return;
      }
      setLoadingDetalle(true);
      try {
        if (USE_MOCK) {
          const result = calcularCrecimientoMock(
            platilloId,
            fechaInicio,
            fechaFin,
            granularidad,
          );
          if ("error" in result) setDetalle(null);
          else setDetalle(result);
          setLoadingDetalle(false);
          return;
        }
        const res = await fetch(`${API_BASE}/api/predictivo/analizar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            platillo_id: platilloId,
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin,
            granularidad,
          }),
        });
        if (!res.ok) throw new Error("Error en la respuesta del servidor");
        const data: ResultadoPredictivo = await res.json();
        setDetalle(data);
      } catch {
        setDetalle(null);
      } finally {
        setLoadingDetalle(false);
      }
    },
    [fechaInicio, fechaFin, granularidad],
  );

  useEffect(() => {
    if (selectedId) cargarDetalle(selectedId);
    else setDetalle(null);
  }, [selectedId, cargarDetalle]);

  const lineData = useMemo(() => {
    if (!detalle) return [];
    const MAX_POINTS = 25;
    const real = detalle.serie_real;
    const step = Math.max(1, Math.ceil(real.length / MAX_POINTS));
    const sampled = real.filter((_, i) => i % step === 0);
    return [
      ...sampled.map((r) => {
        const m = detalle.serie_modelo.find((s) => s.periodo === r.periodo);
        return {
          label: r.label,
          real: r.unidades,
          modelo: m ? m.unidades : null,
        };
      }),
      {
        label: "Proy.",
        real: null,
        modelo: detalle.P_proyectado,
      },
    ];
  }, [detalle]);

  const barData = useMemo(
    () =>
      (rankingData?.ranking ?? []).map((r) => ({
        nombre: r.platillo_nombre.split(" ").slice(0, 2).join(" "),
        total: r.total_ventas,
        k: r.k,
        clasificacion: r.clasificacion,
      })),
    [rankingData],
  );

  const dist = useMemo(
    () => ({
      alta:
        rankingData?.ranking?.filter((r) => r.clasificacion === "Alta demanda")
          .length ?? 0,
      media:
        rankingData?.ranking?.filter((r) => r.clasificacion === "Demanda media")
          .length ?? 0,
      baja:
        rankingData?.ranking?.filter((r) => r.clasificacion === "Baja demanda")
          .length ?? 0,
    }),
    [rankingData],
  );

  return (
    <main className="predictive-main">
        {/* Header */}
        <div className="predictive-header">
          <div className="header-icon">
            <Activity size={24} />
          </div>
          <div>
            <h1 className="header-title">Análisis Predictivo de Ventas</h1>
            <p className="header-subtitle">
              Modelo exponencial{" "}
              <span className="formula-highlight">P(t) = P₀ · e^(k·t)</span>
            </p>
          </div>
        </div>

        <div className="predictive-container">
          {/* Selector de modelo */}
          <div className="predictive-filters" style={{ display: "inline-flex", padding: 6, marginBottom: 28 }}>
            {(
              [
                { k: "exponencial" as const, l: "Modelo Exponencial" },
                { k: "regresion" as const, l: "Modelo de Regresión" },
              ]
            ).map((t) => (
              <button
                key={t.k}
                onClick={() => setVista(t.k)}
                className="predictive-button"
                style={{
                  background: vista === t.k ? "#f97316" : "transparent",
                  color: vista === t.k ? "#fff" : "#64748b",
                  boxShadow: "none",
                }}
              >
                {t.l}
              </button>
            ))}
          </div>

          {vista === "exponencial" && (
          <>
          {error && (
            <div className="error-banner">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* Filtros */}
          <div className="predictive-filters">
            {[
              {
                label: "Fecha inicio",
                el: (
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="predictive-input"
                  />
                ),
              },
              {
                label: "Fecha fin",
                el: (
                  <input
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="predictive-input"
                  />
                ),
              },
              {
                label: "Granularidad",
                el: (
                  <select
                    value={granularidad}
                    onChange={(e) =>
                      setGranularidad(e.target.value as Granularidad)
                    }
                    className="predictive-select"
                  >
                    <option value="diaria">Diaria</option>
                    <option value="semanal">Semanal</option>
                    <option value="mensual">Mensual</option>
                  </select>
                ),
              },
              {
                label: "Platillo",
                el: (
                  <select
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    className="predictive-select"
                  >
                    <option value="">— Seleccionar —</option>
                    {platillos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                ),
              },
            ].map((f) => (
              <div key={f.label} className="filter-group">
                <label>{f.label}</label>
                {f.el}
              </div>
            ))}
            <button
              onClick={cargarRanking}
              disabled={loadingRanking}
              className="predictive-button"
            >
              {loadingRanking ? (
                <>
                  <Loader2 size={14} className="spinner" /> Calculando…
                </>
              ) : (
                <>
                  <BarChart3 size={14} /> Analizar
                </>
              )}
            </button>
          </div>

          {/* Tarjetas resumen */}
          {rankingData && (
            <div className="summary-grid">
              {rankingData.platillo_mayor_crecimiento && (
                <SummaryCard
                  icon={TrendingUp}
                  title="Mayor crecimiento"
                  nombre={
                    rankingData.platillo_mayor_crecimiento.platillo_nombre
                  }
                  valor={fmtK(rankingData.platillo_mayor_crecimiento.k)}
                  valorColor="#22c55e"
                  clasificacion={
                    rankingData.platillo_mayor_crecimiento.clasificacion
                  }
                />
              )}
              {rankingData.platillo_mayor_decrecimiento && (
                <SummaryCard
                  icon={TrendingDown}
                  title="Mayor decrecimiento"
                  nombre={
                    rankingData.platillo_mayor_decrecimiento.platillo_nombre
                  }
                  valor={fmtK(rankingData.platillo_mayor_decrecimiento.k)}
                  valorColor="#ef4444"
                  clasificacion={
                    rankingData.platillo_mayor_decrecimiento.clasificacion
                  }
                />
              )}
              <div className="predictive-card">
                <div className="predictive-card-icon">
                  <Calendar size={24} />
                </div>
                <div className="predictive-card-title">Período analizado</div>
                <div className="periodo-fechas">
                  <span>{rankingData.periodo.fecha_inicio}</span>
                  <ChevronRight size={14} />
                  <span>{rankingData.periodo.fecha_fin}</span>
                </div>
                <div className="periodo-granularidad">
                  {rankingData.periodo.granularidad}
                </div>
              </div>
              <div className="predictive-card">
                <div className="predictive-card-icon">
                  <PieChart size={24} />
                </div>
                <div className="predictive-card-title">Distribución</div>
                <div className="distribucion-list">
                  {[
                    {
                      label: "Alta demanda",
                      count: dist.alta,
                      color: CLASIFICACION_CONFIG["Alta demanda"].color,
                    },
                    {
                      label: "Demanda media",
                      count: dist.media,
                      color: CLASIFICACION_CONFIG["Demanda media"].color,
                    },
                    {
                      label: "Baja demanda",
                      count: dist.baja,
                      color: CLASIFICACION_CONFIG["Baja demanda"].color,
                    },
                  ].map((d) => (
                    <div key={d.label} className="distribucion-item">
                      <span
                        className="distribucion-dot"
                        style={{ backgroundColor: d.color }}
                      />
                      <span className="distribucion-label">{d.label}</span>
                      <span
                        className="distribucion-count"
                        style={{ color: d.color }}
                      >
                        {d.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Gráficos */}
          <div className={`charts-row ${detalle ? "two-cols" : ""}`}>
            {rankingData && (
              <div className="chart-card">
                <h3>
                  <BarChart3 size={16} /> Ranking por volumen de ventas
                </h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={barData}
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="nombre" tick={{ fill: "#64748b" }} />
                    <YAxis tick={{ fill: "#64748b" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: 8,
                      }}
                    />
                    <Bar dataKey="total" name="Unidades" radius={[4, 4, 0, 0]}>
                      {barData.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={
                            CLASIFICACION_CONFIG[
                              entry.clasificacion as Clasificacion
                            ].color
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {detalle && (
              <div className="chart-card">
                <h3>
                  <Activity size={16} /> Curva de proyección:{" "}
                  {detalle.platillo_nombre}
                </h3>
                {loadingDetalle ? (
                  <div className="chart-loader">
                    <Loader2 size={24} className="spinner" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart
                      data={lineData}
                      margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="label" tick={{ fill: "#64748b" }} />
                      <YAxis tick={{ fill: "#64748b" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e2e8f0",
                          borderRadius: 8,
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="real"
                        name="Ventas reales"
                        stroke="#f97316"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="modelo"
                        name="Modelo P(t)"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ r: 3 }}
                      />
                      <ReferenceLine
                        x="Proy."
                        stroke="#8b5cf6"
                        strokeDasharray="3 3"
                        label={{ value: "Proyección", fill: "#8b5cf6" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            )}
          </div>

          {/* Panel matemático */}
          {detalle && !loadingDetalle && !detalle.error && (
            <div className="math-panel">
              <div className="math-panel-header">
                <h3>
                  <Sigma size={16} /> Detalle del modelo ·{" "}
                  {detalle.platillo_nombre}
                </h3>
                <span className="math-panel-sub">
                  {detalle.categoria} · ${detalle.precio.toFixed(2)}
                </span>
              </div>

              {detalle.alerta_coherencia && (
                <div className="alerta-coherencia">
                  <AlertCircle size={14} /> {detalle.alerta_coherencia}
                </div>
              )}

              <div className="math-grid">
                <div>
                  <div className="section-title">
                    <Calculator size={14} /> Proceso de cálculo
                  </div>
                  <MathSteps r={detalle} />
                </div>
                <div>
                  <div className="section-title">
                    <Hash size={14} /> Estadísticas del período
                  </div>
                  <div className="stats-grid">
                    <StatCard
                      icon={DollarSign}
                      label="Total vendido"
                      valor={`${detalle.total_ventas} uds.`}
                    />
                    <StatCard
                      icon={Activity}
                      label="Promedio"
                      valor={`${detalle.promedio} uds.`}
                    />
                    <StatCard
                      icon={Sigma}
                      label="Mediana"
                      valor={`${detalle.mediana} uds.`}
                    />
                    <StatCard
                      icon={Award}
                      label="Moda"
                      valor={`${detalle.moda} uds.`}
                    />
                    <StatCard
                      icon={Percent}
                      label="Crecimiento"
                      valor={fmtPct(detalle.crecimiento_pct)}
                      color={
                        detalle.crecimiento_pct >= 0 ? "#22c55e" : "#ef4444"
                      }
                    />
                    <StatCard
                      icon={Coffee}
                      label="Precio unitario"
                      valor={`$${detalle.precio.toFixed(2)}`}
                      color="#f97316"
                    />
                  </div>
                </div>
                <div>
                  <div className="section-title">
                    <Zap size={14} /> Interpretación
                  </div>
                  <KInterpretacion k={detalle.k} />
                </div>
              </div>
            </div>
          )}

          {/* Tabla ranking */}
          {rankingData && (
            <div className="ranking-table-wrapper">
              <h3>
                <Award size={16} /> Ranking completo · ordenado por tasa k
              </h3>
              <div className="table-container">
                <table className="ranking-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Platillo</th>
                      <th>Cat.</th>
                      <th>P₀</th>
                      <th>P₁ prom</th>
                      <th>t₁</th>
                      <th>k</th>
                      <th>Proy.</th>
                      <th>Crec.</th>
                      <th>Total</th>
                      <th>Prom</th>
                      <th>Med</th>
                      <th>Moda</th>
                      <th>Clasif.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankingData.ranking.map((p, i) => {
                      const isSelected = selectedId === p.platillo_id;
                      return (
                        <tr
                          key={p.platillo_id}
                          onClick={() => setSelectedId(p.platillo_id)}
                          className={isSelected ? "selected" : ""}
                        >
                          <Td style={{ fontWeight: 700 }}>{i + 1}</Td>
                          <Td style={{ fontWeight: 600 }}>
                            {p.platillo_nombre}
                          </Td>
                          <Td>{p.categoria}</Td>
                          <Td mono>{p.P0}</Td>
                          <Td mono>{p.P1_promedio}</Td>
                          <Td mono>{p.t1}</Td>
                          <Td
                            mono
                            style={{
                              color: p.k >= 0 ? "#22c55e" : "#ef4444",
                              fontWeight: 700,
                            }}
                          >
                            {fmtK(p.k)}
                          </Td>
                          <Td mono>{p.P_proyectado}</Td>
                          <Td
                            mono
                            style={{
                              color:
                                p.crecimiento_pct >= 0 ? "#22c55e" : "#ef4444",
                              fontWeight: 700,
                            }}
                          >
                            {fmtPct(p.crecimiento_pct)}
                          </Td>
                          <Td mono>{p.total_ventas}</Td>
                          <Td mono>{p.promedio}</Td>
                          <Td mono>{p.mediana}</Td>
                          <Td mono>{p.moda}</Td>
                          <Td>
                            <ClasificacionBadge c={p.clasificacion} />
                          </Td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <FormulaBar />
          </>
          )}

          {vista === "regresion" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div className="header-icon" style={{ width: 36, height: 36 }}>
                <Sigma size={18} />
              </div>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: "#0f172a" }}>
                  Modelo de Regresión · Lags + Estacionalidad
                </h2>
                <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
                  Fuente de predicción adicional (no reemplaza el modelo exponencial): mínimos
                  cuadrados sobre día de la semana, ventas de hace 1 y 7 días, media móvil,
                  popularidad del platillo y tendencia — datos reales de <code>orden_items</code>.
                </p>
              </div>
            </div>

            {regresionLoading && (
              <div className="predictive-card" style={{ textAlign: "center", padding: 32 }}>
                Entrenando el modelo con el historial real...
              </div>
            )}

            {!regresionLoading && regresionError && (
              <div className="error-banner">
                <AlertCircle size={16} /> {regresionError}
              </div>
            )}

            {!regresionLoading && !regresionError && regresion && !regresion.disponible && (
              <div className="predictive-card" style={{ textAlign: "center", padding: 32, color: "#64748b" }}>
                {regresion.motivo}
              </div>
            )}

            {!regresionLoading && !regresionError && regresion?.disponible && (
              <>
                <div className="summary-grid">
                  <div className="predictive-card">
                    <div className="predictive-card-title">WAPE del modelo</div>
                    <div className="predictive-card-value" style={{ color: "#3b82f6" }}>
                      {(regresion.wapeModelo * 100).toFixed(1)}%
                    </div>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>
                      vs. {(regresion.wapeBaseline * 100).toFixed(1)}% del baseline ingenuo (lag 7 días)
                    </span>
                  </div>
                  <div className="predictive-card">
                    <div className="predictive-card-title">Mejora sobre el baseline</div>
                    <div
                      className="predictive-card-value"
                      style={{ color: regresion.mejoraPct >= 0 ? "#22c55e" : "#ef4444" }}
                    >
                      {fmtPct(regresion.mejoraPct)}
                    </div>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>menos error absoluto ponderado</span>
                  </div>
                  {regresion.platilloMayorCrecimiento && (
                    <div className="predictive-card">
                      <div className="predictive-card-title">Mayor crecimiento (7 días)</div>
                      <div className="predictive-card-name">{regresion.platilloMayorCrecimiento.nombre}</div>
                      <div className="predictive-card-value" style={{ color: "#22c55e", fontSize: 18 }}>
                        {fmtPct(regresion.platilloMayorCrecimiento.variacionPct)}
                      </div>
                    </div>
                  )}
                  {regresion.platilloMayorDecrecimiento && (
                    <div className="predictive-card">
                      <div className="predictive-card-title">Mayor decrecimiento (7 días)</div>
                      <div className="predictive-card-name">{regresion.platilloMayorDecrecimiento.nombre}</div>
                      <div className="predictive-card-value" style={{ color: "#ef4444", fontSize: 18 }}>
                        {fmtPct(regresion.platilloMayorDecrecimiento.variacionPct)}
                      </div>
                    </div>
                  )}
                </div>

                <div className={`charts-row ${regresionDetalle ? "two-cols" : ""}`}>
                  <div className="ranking-table-wrapper" style={{ marginBottom: 0 }}>
                    <h3>
                      <Award size={16} /> Pronóstico próximos {regresion.horizonteDias} días · click en un
                      platillo para ver su curva
                    </h3>
                    <div className="table-container">
                      <table className="ranking-table">
                        <thead>
                          <tr>
                            <th>Platillo</th>
                            <th>Cat.</th>
                            <th>Últ. 7 días</th>
                            <th>Próx. 7 días</th>
                            <th>Variación</th>
                            <th>Clasif.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {regresion.platillos.map((p) => (
                            <tr
                              key={p.platilloId}
                              onClick={() => setRegresionSelId(p.platilloId)}
                              className={regresionSelId === p.platilloId ? "selected" : ""}
                            >
                              <Td style={{ fontWeight: 600 }}>{p.nombre}</Td>
                              <Td>{p.categoria}</Td>
                              <Td mono>{p.unidadesUltimos7}</Td>
                              <Td mono>{p.unidadesPredichas7}</Td>
                              <Td
                                mono
                                style={{
                                  color: p.variacionPct >= 0 ? "#22c55e" : "#ef4444",
                                  fontWeight: 700,
                                }}
                              >
                                {fmtPct(p.variacionPct)}
                              </Td>
                              <Td>
                                <ClasificacionBadge c={p.clasificacion} />
                              </Td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {regresionDetalle && (
                    <div className="chart-card">
                      <h3>
                        <Activity size={16} />{" "}
                        {regresionDetalle.disponible
                          ? `Real vs. pronóstico: ${regresionDetalle.platillo.nombre}`
                          : "Sin datos suficientes"}
                      </h3>
                      {regresionDetalleLoading ? (
                        <div className="chart-loader">
                          <Loader2 size={24} className="spinner" />
                        </div>
                      ) : regresionDetalle.disponible ? (
                        <ResponsiveContainer width="100%" height={240}>
                          <LineChart data={regresionChartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="label" tick={{ fill: "#64748b" }} />
                            <YAxis tick={{ fill: "#64748b" }} />
                            <Tooltip
                              contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: 8 }}
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
                        <p style={{ fontSize: 12, color: "#64748b" }}>{regresionDetalle.motivo}</p>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          )}
        </div>
    </main>
  );
}
