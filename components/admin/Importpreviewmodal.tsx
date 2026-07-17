"use client";
/**
 * ImportPreviewModal.tsx → components/admin/ImportPreviewModal.tsx
 *
 * Endpoints del backend que usa:
 *   POST /platillos/import.csv?mode=upsert   (form-data: file)
 *   POST /platillos/import.json?mode=upsert  (body: array)
 *   POST /import/platillos/excel?mode=upsert (form-data: file)
 */
import React, { useEffect, useMemo, useState } from "react";
import {
  X,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Upload,
  Eye,
  EyeOff,
  Search,
  Loader2,
  FileCheck,
} from "lucide-react";

// ─── Design tokens ─────────────────────────────────────────────────────────
const T = {
  brand: "#e85d04",
  surface: "#ffffff",
  elevated: "#f5f3ef",
  subtle: "#ede9e3",
  text: "#1a1208",
  textSec: "#6b5e4e",
  textMut: "#a89880",
  border: "#e8e1d8",
  borderMed: "#d4c8bc",
  shadowLg: "0 24px 64px rgba(26,18,8,0.20)",
  fontD: "'Fraunces', Georgia, serif",
  fontB: "'DM Sans', system-ui, sans-serif",
  added: {
    bg: "#f0fdf4",
    border: "#86efac",
    text: "#15803d",
    badge: "#dcfce7",
  },
  modified: {
    bg: "#fffbeb",
    border: "#fcd34d",
    text: "#92400e",
    badge: "#fef3c7",
  },
  unchanged: {
    bg: "#ffffff",
    border: "#e8e1d8",
    text: "#6b5e4e",
    badge: "#f5f3ef",
  },
  deleted: {
    bg: "#fef2f2",
    border: "#fca5a5",
    text: "#991b1b",
    badge: "#fee2e2",
  },
};

// ─── Columnas del backend que mostramos en el diff ─────────────────────────
const DISPLAY_FIELDS: Record<string, string> = {
  nombre: "Nombre",
  descripcion_corta: "Desc. corta",
  descripcion: "Descripción",
  precio: "Precio ($)",
  precio_costo: "Costo ($)",
  disponible: "Disponible",
  es_popular: "Popular",
  es_vegano: "Vegano",
  es_picante: "Picante",
  es_sin_gluten: "Sin gluten",
  tiempo_preparacion: "Prep (min)",
  categoria_id: "ID Categoría",
};

// ─── Tipos ─────────────────────────────────────────────────────────────────
type DiffKind = "added" | "modified" | "unchanged";

interface FieldDiff {
  field: string;
  label: string;
  before: string;
  after: string;
  changed: boolean;
}

interface RowDiff {
  kind: DiffKind;
  name: string;
  category: string;
  raw: Record<string, unknown>;
  fields: FieldDiff[];
  selected: boolean;
  _idx: number;
}

// ─── Helpers ───────────────────────────────────────────────────────────────
function fmtVal(key: string, val: unknown): string {
  if (val === null || val === undefined || val === "") return "—";
  if (typeof val === "boolean") return val ? "Sí" : "No";
  if (key.startsWith("es_") || key === "disponible") {
    const s = String(val).toLowerCase().trim();
    if (["1", "true", "si", "sí", "yes", "t"].includes(s)) return "Sí";
    if (["0", "false", "no", "n", "f"].includes(s)) return "No";
  }
  if (key === "precio" || key === "precio_costo") {
    const n = parseFloat(String(val));
    return isNaN(n) ? String(val) : `$${n.toFixed(2)}`;
  }
  return String(val);
}

function computeDiff(
  incoming: Record<string, unknown>[],
  dbRows: Record<string, unknown>[],
): RowDiff[] {
  const dbByName = new Map<string, Record<string, unknown>>();
  for (const row of dbRows) {
    const key = String(row.nombre ?? "")
      .trim()
      .toLowerCase();
    if (key) dbByName.set(key, row);
  }

  return incoming.map((raw, idx) => {
    const name = String(raw.nombre ?? raw.name ?? "").trim();
    const nameKey = name.toLowerCase();
    const category = String(raw.categoria_id ?? raw.category ?? "").trim();
    const current = dbByName.get(nameKey) ?? null;

    // Solo comparamos columnas que el archivo trae Y están en DISPLAY_FIELDS
    const fileKeys = Object.keys(raw).filter((k) => DISPLAY_FIELDS[k]);
    const fields: FieldDiff[] = fileKeys.map((k) => {
      const before = fmtVal(k, current?.[k] ?? null);
      const after = fmtVal(k, raw[k]);
      return {
        field: k,
        label: DISPLAY_FIELDS[k] ?? k,
        before,
        after,
        changed: before !== after,
      };
    });

    const kind: DiffKind = !current
      ? "added"
      : fields.some((f) => f.changed)
        ? "modified"
        : "unchanged";

    return {
      kind,
      name: name || `Fila ${idx + 1}`,
      category,
      raw,
      fields,
      selected: kind !== "unchanged",
      _idx: idx,
    };
  });
}

// ─── KindBadge ─────────────────────────────────────────────────────────────
function KindBadge({ kind }: { kind: DiffKind }) {
  const MAP = {
    added: { label: "+ Nuevo", icon: <Plus size={10} />, c: T.added },
    modified: {
      label: "~ Modificado",
      icon: <RefreshCw size={10} />,
      c: T.modified,
    },
    unchanged: { label: "· Sin cambio", icon: null, c: T.unchanged },
  };
  const { label, icon, c } = MAP[kind];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 9px",
        borderRadius: 99,
        fontSize: 10,
        fontWeight: 800,
        color: c.text,
        background: c.badge,
      }}
    >
      {icon}
      {label}
    </span>
  );
}

// ─── DiffRow ───────────────────────────────────────────────────────────────
function DiffRow({ diff, onToggle }: { diff: RowDiff; onToggle: () => void }) {
  const [expanded, setExpanded] = useState(diff.kind === "modified");
  const cfg = T[diff.kind];
  const changed = diff.fields.filter((f) => f.changed).length;

  return (
    <div
      style={{
        border: `1.5px solid ${diff.selected ? cfg.border : T.border}`,
        borderRadius: 12,
        overflow: "hidden",
        transition: "border-color .15s",
        opacity: diff.kind === "unchanged" && !diff.selected ? 0.52 : 1,
      }}
    >
      {/* Cabecera de fila */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          background: diff.selected ? cfg.bg : T.elevated,
          cursor: "pointer",
          userSelect: "none",
        }}
        onClick={() => setExpanded((e) => !e)}
      >
        {/* Checkbox */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          style={{
            width: 17,
            height: 17,
            borderRadius: 5,
            flexShrink: 0,
            border: `2px solid ${diff.selected ? cfg.text : T.borderMed}`,
            background: diff.selected ? cfg.text : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all .12s",
          }}
        >
          {diff.selected && (
            <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
              <path
                d="M1 3.5L3.5 6L8 1"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>

        {/* Barra color */}
        <div
          style={{
            width: 3,
            height: 34,
            borderRadius: 99,
            flexShrink: 0,
            background: diff.selected ? cfg.text : T.borderMed,
            transition: "background .15s",
          }}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
              {diff.name}
            </span>
            <KindBadge kind={diff.kind} />
          </div>
          <p style={{ fontSize: 11, color: T.textMut, margin: "1px 0 0" }}>
            {diff.category ? `cat_id: ${diff.category}` : "sin categoría"}
            {changed > 0 &&
              ` · ${changed} campo${changed > 1 ? "s" : ""} cambiado${changed > 1 ? "s" : ""}`}
          </p>
        </div>

        <span style={{ color: T.textMut, flexShrink: 0 }}>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </div>

      {/* Tabla de campos */}
      {expanded && diff.fields.length > 0 && (
        <div style={{ borderTop: `1px solid ${T.border}` }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}
          >
            <thead>
              <tr style={{ background: T.elevated }}>
                {["Campo", "Valor en DB", "Valor entrante"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "6px 14px",
                      textAlign: "left",
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: ".08em",
                      textTransform: "uppercase",
                      color: T.textMut,
                      borderBottom: `1px solid ${T.border}`,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {diff.fields.map((f) => (
                <tr
                  key={f.field}
                  style={{
                    background: f.changed
                      ? diff.kind === "added"
                        ? T.added.bg
                        : T.modified.bg
                      : T.surface,
                  }}
                >
                  <td
                    style={{
                      padding: "7px 14px",
                      fontWeight: 700,
                      color: T.textSec,
                      borderBottom: `1px solid ${T.border}`,
                      fontFamily: "monospace",
                      fontSize: 11,
                    }}
                  >
                    {f.label}
                  </td>
                  <td
                    style={{
                      padding: "7px 14px",
                      color: f.changed ? T.deleted.text : T.textMut,
                      textDecoration:
                        f.changed && diff.kind !== "added"
                          ? "line-through"
                          : "none",
                      borderBottom: `1px solid ${T.border}`,
                      fontFamily: f.changed ? "monospace" : T.fontB,
                    }}
                  >
                    {f.before}
                  </td>
                  <td
                    style={{
                      padding: "7px 14px",
                      color: f.changed ? T.added.text : T.textMut,
                      fontWeight: f.changed ? 700 : 400,
                      borderBottom: `1px solid ${T.border}`,
                      fontFamily: f.changed ? "monospace" : T.fontB,
                    }}
                  >
                    {f.after}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Props ─────────────────────────────────────────────────────────────────
export interface ImportPreviewModalProps {
  file: File;
  parsedRows: Array<Record<string, unknown>>;
  /** Filas actuales de DB — vienen de GET /platillos/export.json */
  dbRows: Array<Record<string, unknown>>;
  apiBase: string;
  onClose: () => void;
  onSuccess: (result: { inserted: number; updated: number }) => void;
}

// ─── Modal principal ───────────────────────────────────────────────────────
export default function ImportPreviewModal({
  file,
  parsedRows,
  dbRows,
  apiBase,
  onClose,
  onSuccess,
}: ImportPreviewModalProps) {
  const [diffs, setDiffs] = useState<RowDiff[]>([]);
  const [search, setSearch] = useState("");
  const [filterKind, setFilterKind] = useState<DiffKind | "all">("all");
  const [showUnchanged, setShowUnchanged] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    setDiffs(
      computeDiff(parsedRows, dbRows).map((d, i) => ({ ...d, _idx: i })),
    );
  }, []);

  const toggle = (idx: number) =>
    setDiffs((p) =>
      p.map((d) => (d._idx === idx ? { ...d, selected: !d.selected } : d)),
    );
  const toggleAll = (val: boolean) =>
    setDiffs((p) => p.map((d) => ({ ...d, selected: val })));

  const stats = useMemo(
    () => ({
      total: diffs.length,
      added: diffs.filter((d) => d.kind === "added").length,
      modified: diffs.filter((d) => d.kind === "modified").length,
      unchanged: diffs.filter((d) => d.kind === "unchanged").length,
      selected: diffs.filter((d) => d.selected).length,
    }),
    [diffs],
  );

  const visible = useMemo(
    () =>
      diffs.filter((d) => {
        if (!showUnchanged && d.kind === "unchanged") return false;
        if (filterKind !== "all" && d.kind !== filterKind) return false;
        if (search) {
          const q = search.toLowerCase();
          return (
            d.name.toLowerCase().includes(q) ||
            d.category.toLowerCase().includes(q)
          );
        }
        return true;
      }),
    [diffs, search, filterKind, showUnchanged],
  );

  // ── Subir al backend ──────────────────────────────────────────────────────
  async function handleUpload() {
    setUploadError(null);
    setUploading(true);
    const selectedRaws = diffs.filter((d) => d.selected).map((d) => d.raw);
    if (!selectedRaws.length) {
      setUploading(false);
      return;
    }

    const lower = file.name.toLowerCase();
    const isXlsx = lower.endsWith(".xlsx");
    const isJson = lower.endsWith(".json");

    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    const authHeader: Record<string, string> = token
      ? { Authorization: `Bearer ${token}` }
      : {};

    try {
      let res: Response;

      if (isJson) {
        // POST /platillos/import.json — body array
        res = await fetch(`${apiBase}/platillos/import.json?mode=upsert`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeader },
          body: JSON.stringify(selectedRaws),
        });
      } else if (isXlsx) {
        // Reconstruir XLSX con SheetJS (solo filas seleccionadas)
        const XLSX = await import("xlsx");
        const ws = XLSX.utils.json_to_sheet(selectedRaws);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Platillos");
        const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
        const blob = new Blob([buf], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const fd = new FormData();
        fd.append("file", blob, file.name);
        // POST /import/platillos/excel
        res = await fetch(`${apiBase}/import/platillos/excel?mode=upsert`, {
          method: "POST",
          headers: authHeader,
          body: fd,
        });
      } else {
        // CSV — reconstruir desde filas seleccionadas
        const headers = Object.keys(selectedRaws[0]);
        const esc = (v: unknown) => {
          const s = String(v ?? "");
          return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        };
        const csv = [
          headers.join(","),
          ...selectedRaws.map((r) => headers.map((h) => esc(r[h])).join(",")),
        ].join("\n");
        const blob = new Blob(["\uFEFF" + csv], {
          type: "text/csv;charset=utf-8",
        });
        const fd = new FormData();
        fd.append("file", blob, file.name);
        // POST /platillos/import.csv
        res = await fetch(`${apiBase}/platillos/import.csv?mode=upsert`, {
          method: "POST",
          headers: authHeader,
          body: fd,
        });
      }

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        try {
          const j = JSON.parse(text);
          throw new Error(j.message ?? j.error ?? text);
        } catch {
          throw new Error(text || `Error ${res.status}`);
        }
      }

      const result = await res
        .json()
        .catch(() => ({ inserted: 0, updated: 0 }));
      onSuccess({
        inserted: result.inserted ?? 0,
        updated: result.updated ?? 0,
      });
    } catch (e: any) {
      setUploadError(e?.message ?? "Error al importar");
    } finally {
      setUploading(false);
    }
  }

  const ext = file.name.split(".").pop()?.toUpperCase() ?? "FILE";
  const extColor =
    ext === "CSV" ? T.added.text : ext === "JSON" ? "#7c3aed" : "#2563eb";

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 60,
          background: "rgba(26,18,8,0.52)",
          backdropFilter: "blur(5px)",
        }}
      />

      <div
        style={{
          position: "fixed",
          zIndex: 61,
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: "min(920px,96vw)",
          height: "min(88vh,750px)",
          background: T.surface,
          borderRadius: 24,
          border: `1px solid ${T.border}`,
          boxShadow: T.shadowLg,
          display: "flex",
          flexDirection: "column",
          fontFamily: T.fontB,
          overflow: "hidden",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            padding: "20px 26px 16px",
            borderBottom: `1px solid ${T.border}`,
            background: T.elevated,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: `${extColor}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 900,
                  color: extColor,
                }}
              >
                {ext}
              </div>
              <div>
                <h2
                  style={{
                    fontFamily: T.fontD,
                    fontWeight: 900,
                    fontSize: 20,
                    color: T.text,
                    margin: "0 0 2px",
                  }}
                >
                  Vista previa de importación
                </h2>
                <p
                  style={{
                    fontSize: 11,
                    color: T.textMut,
                    margin: 0,
                    fontFamily: "monospace",
                  }}
                >
                  {file.name} &nbsp;·&nbsp; {parsedRows.length} filas leídas
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

          {/* Pills de filtro */}
          <div
            style={{
              display: "flex",
              gap: 6,
              marginTop: 14,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {(
              [
                {
                  kind: "all" as const,
                  label: `${stats.total} total`,
                  bg: T.subtle,
                  color: T.textSec,
                },
                {
                  kind: "added" as const,
                  label: `+${stats.added} nuevos`,
                  bg: T.added.badge,
                  color: T.added.text,
                },
                {
                  kind: "modified" as const,
                  label: `~${stats.modified} modificados`,
                  bg: T.modified.badge,
                  color: T.modified.text,
                },
                {
                  kind: "unchanged" as const,
                  label: `${stats.unchanged} sin cambio`,
                  bg: T.unchanged.badge,
                  color: T.unchanged.text,
                },
              ] as const
            ).map((s) => (
              <button
                key={s.kind}
                onClick={() => setFilterKind(s.kind)}
                style={{
                  padding: "4px 12px",
                  borderRadius: 99,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  border: `1.5px solid ${filterKind === s.kind ? s.color : "transparent"}`,
                  background: s.bg,
                  color: s.color,
                  transition: "all .12s",
                }}
              >
                {s.label}
              </button>
            ))}
            <button
              onClick={() => setShowUnchanged((v) => !v)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "4px 11px",
                borderRadius: 99,
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                border: `1.5px solid ${showUnchanged ? T.brand : T.border}`,
                background: showUnchanged ? `${T.brand}12` : T.surface,
                color: showUnchanged ? T.brand : T.textMut,
                marginLeft: "auto",
              }}
            >
              {showUnchanged ? <Eye size={11} /> : <EyeOff size={11} />}
              {showUnchanged ? "Ocultar sin cambio" : "Mostrar sin cambio"}
            </button>
          </div>

          {/* Búsqueda + controles */}
          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 12,
              alignItems: "center",
            }}
          >
            <div style={{ position: "relative", flex: 1 }}>
              <Search
                size={13}
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: T.textMut,
                  pointerEvents: "none",
                }}
              />
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  paddingLeft: 30,
                  paddingRight: 12,
                  paddingTop: 7,
                  paddingBottom: 7,
                  borderRadius: 9,
                  fontSize: 12,
                  fontFamily: T.fontB,
                  border: `1px solid ${T.border}`,
                  background: T.surface,
                  color: T.text,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <button onClick={() => toggleAll(true)} style={pill}>
              Seleccionar todo
            </button>
            <button
              onClick={() => toggleAll(false)}
              style={{ ...pill, color: T.textMut }}
            >
              Limpiar
            </button>
          </div>
        </div>

        {/* LISTA */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 26px" }}>
          {visible.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 0",
                color: T.textMut,
              }}
            >
              <FileCheck
                size={32}
                style={{ opacity: 0.35, marginBottom: 12 }}
              />
              <p style={{ fontSize: 14, fontWeight: 700, margin: "0 0 4px" }}>
                {stats.unchanged > 0 && !showUnchanged
                  ? "Todos los platillos están al día"
                  : "Sin resultados"}
              </p>
              <p style={{ fontSize: 12, margin: 0 }}>
                {stats.unchanged > 0 && !showUnchanged
                  ? 'Activa "Mostrar sin cambio" para ver las filas idénticas'
                  : "Ajusta el filtro o la búsqueda"}
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {visible.map((d) => (
                <DiffRow
                  key={d._idx}
                  diff={d}
                  onToggle={() => toggle(d._idx)}
                />
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div
          style={{
            padding: "14px 26px",
            borderTop: `1px solid ${T.border}`,
            background: T.elevated,
            flexShrink: 0,
          }}
        >
          {uploadError && (
            <div
              style={{
                marginBottom: 10,
                padding: "8px 12px",
                borderRadius: 9,
                background: "#fef2f2",
                border: "1px solid #fca5a5",
                fontSize: 12,
                fontWeight: 600,
                color: T.deleted.text,
                display: "flex",
                alignItems: "flex-start",
                gap: 6,
              }}
            >
              <AlertTriangle
                size={14}
                style={{ flexShrink: 0, marginTop: 1 }}
              />
              {uploadError}
            </div>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {stats.selected > 0 ? (
                <CheckCircle2 size={15} style={{ color: T.added.text }} />
              ) : (
                <AlertTriangle size={15} style={{ color: T.modified.text }} />
              )}
              <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
                {stats.selected} de {stats.total} filas seleccionadas
              </span>
              {stats.selected === 0 && (
                <span style={{ fontSize: 12, color: T.modified.text }}>
                  — selecciona al menos una
                </span>
              )}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={onClose}
                style={{
                  padding: "10px 20px",
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  background: T.subtle,
                  color: T.textSec,
                }}
              >
                Descartar
              </button>
              <button
                onClick={handleUpload}
                disabled={stats.selected === 0 || uploading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "10px 22px",
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 700,
                  border: "none",
                  cursor:
                    stats.selected === 0 || uploading
                      ? "not-allowed"
                      : "pointer",
                  color: "#fff",
                  background: stats.selected === 0 ? "#d1c9c0" : T.brand,
                  boxShadow:
                    stats.selected > 0 && !uploading
                      ? "0 4px 14px rgba(232,93,4,.28)"
                      : "none",
                  opacity: uploading ? 0.8 : 1,
                  transition: "all .15s",
                }}
              >
                {uploading ? (
                  <>
                    <Loader2
                      size={14}
                      style={{ animation: "spin .8s linear infinite" }}
                    />{" "}
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload size={14} /> Importar {stats.selected} fila
                    {stats.selected !== 1 ? "s" : ""}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}

const pill: React.CSSProperties = {
  padding: "6px 12px",
  borderRadius: 8,
  fontSize: 11,
  fontWeight: 700,
  border: `1px solid #e8e1d8`,
  background: "#ffffff",
  color: "#6b5e4e",
  cursor: "pointer",
  whiteSpace: "nowrap",
  flexShrink: 0,
};
