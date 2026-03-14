"use client";
import React, { useState } from "react";
import {
  Download,
  X,
  FileText,
  Table,
  File,
  Calendar,
  Hash,
  ChevronRight,
  Loader2,
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
  danger: "#dc2626",
};

const BASE_URL = "http://localhost:10000";

type ExportType = "dishes" | "daily";
type ExportFormat = "csv" | "xlsx" | "pdf";

interface ExportModalProps {
  onClose: () => void;
}

const REPORT_TYPES: { value: ExportType; label: string; desc: string }[] = [
  {
    value: "dishes",
    label: "Ventas por platillo",
    desc: "Ranking de platillos con unidades vendidas e ingresos",
  },
  {
    value: "daily",
    label: "Ventas por día",
    desc: "Resumen diario de órdenes, ventas y ticket promedio",
  },
];

const FORMATS: {
  value: ExportFormat;
  label: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  { value: "csv", label: "CSV", icon: <Table size={18} />, color: "#059669" },
  {
    value: "xlsx",
    label: "Excel",
    icon: <FileText size={18} />,
    color: "#2563eb",
  },
  { value: "pdf", label: "PDF", icon: <File size={18} />, color: "#dc2626" },
];

function today() {
  return new Date().toISOString().slice(0, 10);
}
function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export default function ExportModal({ onClose }: ExportModalProps) {
  const [type, setType] = useState<ExportType>("dishes");
  const [format, setFormat] = useState<ExportFormat>("xlsx");
  const [startDate, setStartDate] = useState(daysAgo(30));
  const [endDate, setEndDate] = useState(today());
  const [limit, setLimit] = useState<string>("50");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setError(null);
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type,
        format,
        startDate,
        endDate,
      });
      if (limit) params.set("limit", limit);

      const res = await fetch(`${BASE_URL}/export?${params}`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Error ${res.status}`);
      }

      const blob = await res.blob();
      const contentDisposition = res.headers.get("Content-Disposition") || "";
      const match = contentDisposition.match(/filename="(.+?)"/);
      const filename = match ? match[1] : `reporte.${format}`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      onClose();
    } catch (e: any) {
      setError(e.message ?? "Error al exportar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 40,
          background: "rgba(26,18,8,0.45)",
          backdropFilter: "blur(4px)",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          zIndex: 50,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(520px, 96vw)",
          background: T.surface,
          borderRadius: 24,
          border: `1px solid ${T.border}`,
          boxShadow: "0 24px 64px rgba(26,18,8,0.18)",
          fontFamily: T.fontB,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "22px 24px 18px",
            borderBottom: `1px solid ${T.border}`,
            background: T.elevated,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: `${T.brand}15`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: T.brand,
              }}
            >
              <Download size={17} />
            </div>
            <div>
              <h2
                style={{
                  fontFamily: T.fontD,
                  fontWeight: 900,
                  fontSize: 18,
                  color: T.text,
                  margin: 0,
                }}
              >
                Exportar reporte
              </h2>
              <p style={{ fontSize: 11, color: T.textMut, margin: 0 }}>
                Configura y descarga el archivo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: `1px solid ${T.border}`,
              background: T.surface,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: T.textMut,
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: "22px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* Tipo de reporte */}
          <div>
            <Label>Tipo de reporte</Label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {REPORT_TYPES.map((rt) => (
                <button
                  key={rt.value}
                  onClick={() => setType(rt.value)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: `2px solid ${type === rt.value ? T.brand : T.border}`,
                    background: type === rt.value ? `${T.brand}08` : T.surface,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all .15s",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: T.text,
                        margin: "0 0 2px",
                      }}
                    >
                      {rt.label}
                    </p>
                    <p style={{ fontSize: 11, color: T.textMut, margin: 0 }}>
                      {rt.desc}
                    </p>
                  </div>
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      border: `2px solid ${type === rt.value ? T.brand : T.borderMed}`,
                      background: type === rt.value ? T.brand : "transparent",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {type === rt.value && (
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "#fff",
                        }}
                      />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Formato */}
          <div>
            <Label>Formato de archivo</Label>
            <div style={{ display: "flex", gap: 8 }}>
              {FORMATS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFormat(f.value)}
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: `2px solid ${format === f.value ? f.color : T.border}`,
                    background: format === f.value ? `${f.color}10` : T.surface,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 5,
                    transition: "all .15s",
                    color: format === f.value ? f.color : T.textMut,
                  }}
                >
                  {f.icon}
                  <span style={{ fontSize: 11, fontWeight: 800 }}>
                    {f.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Fechas */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              <Label icon={<Calendar size={11} />}>Fecha inicio</Label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <Label icon={<Calendar size={11} />}>Fecha fin</Label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Límite */}
          <div>
            <Label icon={<Hash size={11} />}>
              Límite de registros{" "}
              <span style={{ fontWeight: 400, color: T.textMut }}>
                (opcional)
              </span>
            </Label>
            <input
              type="number"
              value={limit}
              min={1}
              max={1000}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="100"
              style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
            />
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                background: "#fef2f2",
                border: "1px solid #fecaca",
                fontSize: 12,
                fontWeight: 600,
                color: T.danger,
              }}
            >
              {error}
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleExport}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "13px 20px",
              borderRadius: 14,
              border: "none",
              background: loading ? `${T.brand}80` : T.brand,
              color: "#fff",
              fontSize: 14,
              fontWeight: 800,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : "0 4px 14px rgba(232,93,4,.30)",
              transition: "all .15s",
            }}
          >
            {loading ? (
              <>
                <Loader2
                  size={16}
                  style={{ animation: "spin 1s linear infinite" }}
                />{" "}
                Generando...
              </>
            ) : (
              <>
                <Download size={16} /> Descargar {format.toUpperCase()}
              </>
            )}
          </button>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 10,
  border: `1.5px solid #e8e1d8`,
  background: "#faf9f7",
  fontSize: 13,
  fontWeight: 600,
  color: "#1a1208",
  outline: "none",
  fontFamily: "'DM Sans', system-ui, sans-serif",
  boxSizing: "border-box",
};

function Label({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <p
      style={{
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: ".08em",
        textTransform: "uppercase",
        color: "#a89880",
        margin: "0 0 7px",
        display: "flex",
        alignItems: "center",
        gap: 4,
      }}
    >
      {icon}
      {children}
    </p>
  );
}
