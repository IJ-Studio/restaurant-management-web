"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { useInventory, type Product, type Merma } from "@/hooks/useInventory";

import {
  Plus,
  TrendingDown,
  Truck,
} from "lucide-react";

// ─── Tokens ───────────────────────────────────────────────────────────────────
const T = {
  brand: "#e85d04",
  brandDark: "#dc2f02",
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
type Category =
  | "carnes"
  | "vegetales"
  | "lacteos"
  | "bebidas"
  | "granos"
  | "condimentos"
  | "utensilios";
type Unit = "kg" | "g" | "l" | "ml" | "pza" | "caja" | "bolsa";



// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES: Record<
  Category,
  { label: string; icon: string; color: string; bg: string }
> = {
  carnes: { label: "Carnes", icon: "🥩", color: "#dc2626", bg: "#fef2f2" },
  vegetales: {
    label: "Vegetales",
    icon: "🥬",
    color: "#16a34a",
    bg: "#f0fdf4",
  },
  lacteos: { label: "Lácteos", icon: "🧀", color: "#d97706", bg: "#fffbeb" },
  bebidas: { label: "Bebidas", icon: "🥤", color: "#0ea5e9", bg: "#f0f9ff" },
  granos: { label: "Granos", icon: "🌾", color: "#92400e", bg: "#fef3c7" },
  condimentos: {
    label: "Condimentos",
    icon: "🧂",
    color: "#7c3aed",
    bg: "#faf5ff",
  },
  utensilios: {
    label: "Utensilios",
    icon: "🍴",
    color: "#475569",
    bg: "#f1f5f9",
  },
};




const MERMA_REASONS: Record<
  string,
  { label: string; icon: string; color: string; bg: string }
> = {
  caducidad: {
    label: "Caducidad",
    icon: "📅",
    color: "#dc2626",
    bg: "#fef2f2",
  },
  accidente: {
    label: "Accidente",
    icon: "💥",
    color: "#d97706",
    bg: "#fffbeb",
  },
  calidad: {
    label: "Calidad",
    icon: "👎",
    color: "#ef4444",
    bg: "#fef2f2",
  },
  coccion: {
    label: "Cocción",
    icon: "🍳",
    color: "#0ea5e9",
    bg: "#f0f9ff",
  },
  otro: { label: "Otro", icon: "❓", color: "#64748b", bg: "#f1f5f9" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function stockStatus(p: Product): "ok" | "low" | "critical" | "over" {
  if (p.stock <= 0) return "critical";
  if (p.stock < p.minStock)
    return p.stock < p.minStock * 0.5 ? "critical" : "low";
  if (p.stock > p.maxStock) return "over";
  return "ok";
}
const STATUS_CFG = {
  ok: { label: "OK", color: T.ok, bg: "#ecfdf5" },
  low: { label: "Bajo", color: T.warn, bg: "#fffbeb" },
  critical: { label: "Crítico", color: T.danger, bg: "#fef2f2" },
  over: { label: "Exceso", color: T.info, bg: "#eff6ff" },
};

function handleLogout() { }

// ─── Shared Components ────────────────────────────────────────────────────────
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

const inp: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  border: `1px solid #d4c8bc`,
  borderRadius: 10,
  fontSize: 13,
  color: "#1a1208",
  background: "#fff",
  outline: "none",
  boxSizing: "border-box",
};
const lbl: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  color: "#6b5e4e",
  marginBottom: 5,
};

// ─── Product Modal ────────────────────────────────────────────────────────────
function ProductModal({
  product,
  onClose,
  onSave,
}: {
  product: Product | null;
  onClose: () => void;
  onSave: (p: Product) => void;
}) {
  const blank: Product = {
    id: 0,
    name: "",
    sku: "",
    category: "vegetales",
    unit: "kg",
    stock: 0,
    minStock: 0,
    maxStock: 100,
    costPerUnit: 0,
    supplier: "",
    lastUpdated: "",
    active: true,
  };
  const [form, setForm] = useState<Product>(product ?? blank);

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
          maxWidth: 580,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "24px 28px 20px",
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
                margin: "0 0 4px",
              }}
            >
              {product ? "Editar producto" : "Nuevo producto"}
            </h2>
            <p style={{ fontSize: 12, color: T.textMut, margin: 0 }}>
              Control de inventario
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
            <X size={16} style={{ color: T.textSec }} />
          </button>
        </div>

        <div
          style={{
            padding: "22px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            maxHeight: "60vh",
            overflowY: "auto",
          }}
        >
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              <label style={lbl}>Nombre del producto *</label>
              <input
                style={inp}
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Ej. Filete de res"
              />
            </div>
            <div>
              <label style={lbl}>SKU / Código</label>
              <input
                style={inp}
                value={form.sku}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sku: e.target.value }))
                }
                placeholder="CARN-001"
              />
            </div>
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              <label style={lbl}>Categoría *</label>
              <select
                style={inp}
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    category: e.target.value as Category,
                  }))
                }
              >
                {Object.entries(CATEGORIES).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.icon} {v.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={lbl}>Unidad de medida</label>
              <select
                style={inp}
                value={form.unit}
                onChange={(e) =>
                  setForm((f) => ({ ...f, unit: e.target.value as Unit }))
                }
              >
                {(["kg", "g", "l", "ml", "pza", "caja", "bolsa"] as Unit[]).map(
                  (u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 12,
            }}
          >
            <div>
              <label style={lbl}>Stock actual</label>
              <input
                type="number"
                min={0}
                style={inp}
                value={form.stock}
                onChange={(e) =>
                  setForm((f) => ({ ...f, stock: Number(e.target.value) }))
                }
              />
            </div>
            <div>
              <label style={lbl}>Mínimo (alerta)</label>
              <input
                type="number"
                min={0}
                style={inp}
                value={form.minStock}
                onChange={(e) =>
                  setForm((f) => ({ ...f, minStock: Number(e.target.value) }))
                }
              />
            </div>
            <div>
              <label style={lbl}>Máximo (capacidad)</label>
              <input
                type="number"
                min={0}
                style={inp}
                value={form.maxStock}
                onChange={(e) =>
                  setForm((f) => ({ ...f, maxStock: Number(e.target.value) }))
                }
              />
            </div>
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              <label style={lbl}>Costo por unidad ($)</label>
              <input
                type="number"
                min={0}
                style={inp}
                value={form.costPerUnit}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    costPerUnit: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div>
              <label style={lbl}>Proveedor principal</label>
              <input
                style={inp}
                value={form.supplier}
                onChange={(e) =>
                  setForm((f) => ({ ...f, supplier: e.target.value }))
                }
                placeholder="Nombre del proveedor"
              />
            </div>
          </div>

          {/* Stock bar preview */}
          {form.maxStock > 0 && (
            <div
              style={{
                padding: "12px 14px",
                background: T.elevated,
                borderRadius: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span
                  style={{ fontSize: 12, fontWeight: 700, color: T.textSec }}
                >
                  Nivel de stock
                </span>
                <span style={{ fontSize: 12, color: T.textMut }}>
                  {form.stock} / {form.maxStock} {form.unit}
                </span>
              </div>
              <div
                style={{
                  height: 8,
                  background: T.border,
                  borderRadius: 99,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    borderRadius: 99,
                    transition: "width .3s",
                    width: `${Math.min(100, (form.stock / form.maxStock) * 100)}%`,
                    background:
                      form.stock < form.minStock
                        ? T.danger
                        : form.stock > form.maxStock
                          ? T.info
                          : T.ok,
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 4,
                }}
              >
                <span style={{ fontSize: 10, color: T.textMut }}>
                  Mín: {form.minStock}
                </span>
                <span style={{ fontSize: 10, color: T.textMut }}>
                  Máx: {form.maxStock}
                </span>
              </div>
            </div>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 14px",
              background: T.elevated,
              borderRadius: 12,
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: T.text,
                  margin: 0,
                }}
              >
                Producto activo
              </p>
              <p style={{ fontSize: 11, color: T.textMut, margin: "2px 0 0" }}>
                Visible en sistema de inventario
              </p>
            </div>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, active: !f.active }))}
              style={{
                width: 44,
                height: 24,
                borderRadius: 99,
                border: "none",
                cursor: "pointer",
                transition: "all .2s",
                position: "relative",
                background: form.active ? T.brand : T.borderMed,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 2,
                  borderRadius: "50%",
                  width: 20,
                  height: 20,
                  background: "#fff",
                  transition: "all .2s",
                  boxShadow: "0 1px 4px rgba(0,0,0,.2)",
                  left: form.active ? "calc(100% - 22px)" : 2,
                }}
              />
            </button>
          </div>
        </div>

        <div
          style={{
            padding: "16px 28px",
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
              padding: "9px 20px",
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
            disabled={!form.name}
            onClick={() => {
              onSave({
                ...form,
                id: form.id || 0,
                lastUpdated: new Date().toISOString().split("T")[0],
              });
              onClose();
            }}
            style={{
              padding: "9px 20px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              color: "#fff",
              background: form.name ? T.brand : "#ccc",
              boxShadow: form.name ? "0 4px 12px rgba(232,93,4,.3)" : "none",
            }}
          >
            {product ? "Guardar cambios" : "Agregar producto"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Merma Modal ──────────────────────────────────────────────────────────────
function MermaModal({
  products,
  onClose,
  onSave,
}: {
  products: Product[];
  onClose: () => void;
  onSave: (m: Merma) => void;
}) {
  const [form, setForm] = useState({
    productId: products[0]?.id ?? 0,
    quantity: 0,
    reason: "caducidad" as Merma["reason"],
    justification: "",
    reportedBy: "",
  });
  const prod = products.find((p) => p.id === form.productId);

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
            padding: "24px 28px 20px",
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
                margin: "0 0 4px",
              }}
            >
              Registrar merma
            </h2>
            <p style={{ fontSize: 12, color: T.textMut, margin: 0 }}>
              Justificación de desperdicio requerida
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
            <X size={16} style={{ color: T.textSec }} />
          </button>
        </div>

        <div
          style={{
            padding: "22px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div>
            <label style={lbl}>Producto *</label>
            <select
              style={inp}
              value={form.productId}
              onChange={(e) =>
                setForm((f) => ({ ...f, productId: Number(e.target.value) }))
              }
            >
              {products
                .filter((p) => p.active)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — Stock: {p.stock} {p.unit}
                  </option>
                ))}
            </select>
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              <label style={lbl}>Cantidad a descontar *</label>
              <input
                type="number"
                min={0.1}
                step={0.1}
                style={inp}
                value={form.quantity}
                onChange={(e) =>
                  setForm((f) => ({ ...f, quantity: Number(e.target.value) }))
                }
                placeholder={`Máx: ${prod?.stock ?? 0} ${prod?.unit ?? ""}`}
              />
            </div>
            <div>
              <label style={lbl}>Causa *</label>
              <select
                style={inp}
                value={form.reason}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    reason: e.target.value as Merma["reason"],
                  }))
                }
              >
                {Object.entries(MERMA_REASONS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={lbl}>Justificación detallada *</label>
            <textarea
              style={{ ...inp, resize: "none" }}
              rows={3}
              value={form.justification}
              onChange={(e) =>
                setForm((f) => ({ ...f, justification: e.target.value }))
              }
              placeholder="Describe qué ocurrió, cuándo y por qué se generó la merma..."
            />
          </div>

          <div>
            <label style={lbl}>Reportado por</label>
            <input
              style={inp}
              value={form.reportedBy}
              onChange={(e) =>
                setForm((f) => ({ ...f, reportedBy: e.target.value }))
              }
              placeholder="Nombre del colaborador"
            />
          </div>

          {/* Cost preview */}
          {form.quantity > 0 && prod && (
            <div
              style={{
                padding: "12px 14px",
                background: "#fef2f2",
                borderRadius: 12,
                border: "1px solid #fecaca",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 700, color: T.danger }}>
                <TrendingDown
                  size={14}
                  style={{ marginRight: 6, verticalAlign: "middle" }}
                />
                Impacto estimado en inventario
              </span>
              <span style={{ fontSize: 16, fontWeight: 900, color: T.danger }}>
                -${(form.quantity * (prod.costPerUnit ?? 0)).toFixed(2)}
              </span>
            </div>
          )}
        </div>

        <div
          style={{
            padding: "16px 28px",
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
              padding: "9px 20px",
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
            disabled={!form.quantity || !form.justification}
            onClick={() => {
              if (!prod) return;
              onSave({
                id: Date.now(),
                productId: form.productId,
                productName: prod.name,
                quantity: form.quantity,
                unit: prod.unit,
                reason: form.reason,
                justification: form.justification,
                reportedBy: form.reportedBy,
                date: new Date().toISOString().split("T")[0],
                cost: form.quantity * prod.costPerUnit,
              });
              onClose();
            }}
            style={{
              padding: "9px 20px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              color: "#fff",
              background:
                form.quantity && form.justification ? T.danger : "#ccc",
            }}
          >
            Registrar merma
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Stock Adjust Modal ───────────────────────────────────────────────────────
function AdjustModal({
  product,
  onClose,
  onSave,
}: {
  product: Product;
  onClose: () => void;
  onSave: (id: number, newStock: number) => void;
}) {
  const [qty, setQty] = useState(0);
  const [mode, setMode] = useState<"add" | "set">("add");
  const newVal = mode === "add" ? product.stock + qty : qty;

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
          maxWidth: 380,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px 24px 16px",
            borderBottom: `1px solid ${T.border}`,
          }}
        >
          <h3
            style={{
              fontFamily: T.fontD,
              fontWeight: 900,
              fontSize: 18,
              color: T.text,
              margin: "0 0 4px",
            }}
          >
            Ajustar stock
          </h3>
          <p style={{ fontSize: 12, color: T.textMut, margin: 0 }}>
            {product.name} · Actual: {product.stock} {product.unit}
          </p>
        </div>
        <div
          style={{
            padding: "18px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 6,
              padding: 4,
              background: T.elevated,
              borderRadius: 10,
            }}
          >
            {[
              { k: "add", l: "Agregar" },
              { k: "set", l: "Establecer" },
            ].map((o) => (
              <button
                key={o.k}
                onClick={() => setMode(o.k as any)}
                style={{
                  flex: 1,
                  padding: "7px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  background: mode === o.k ? T.surface : "transparent",
                  color: mode === o.k ? T.text : T.textMut,
                  boxShadow:
                    mode === o.k ? "0 1px 4px rgba(26,18,8,0.1)" : "none",
                }}
              >
                {o.l}
              </button>
            ))}
          </div>
          <div>
            <label style={lbl}>
              {mode === "add" ? "Cantidad a agregar" : "Nuevo valor de stock"}
            </label>
            <input
              type="number"
              style={inp}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
            />
          </div>
          <div
            style={{
              padding: "10px 14px",
              background: T.elevated,
              borderRadius: 10,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 13, color: T.textSec, fontWeight: 600 }}>
              Resultado:
            </span>
            <span
              style={{
                fontSize: 18,
                fontWeight: 900,
                color: newVal < product.minStock ? T.danger : T.ok,
              }}
            >
              {newVal} {product.unit}
            </span>
          </div>
        </div>
        <div
          style={{
            padding: "14px 24px",
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
            onClick={() => {
              onSave(product.id, newVal);
              onClose();
            }}
            style={{
              padding: "8px 18px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              color: "#fff",
              background: T.brand,
              boxShadow: "0 4px 12px rgba(232,93,4,.3)",
            }}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function InventoryPage() {
  const router = useRouter();
  const {
    products, mermas, loading, error,
    saveProduct, deleteProduct, adjustStock, saveMerma,
  } = useInventory();

  const [tab, setTab] = useState<"productos" | "mermas">("productos");
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [productModal, setProductModal] = useState<Product | null | "new">(null);
  const [mermaModal, setMermaModal] = useState(false);
  const [adjustModal, setAdjustModal] = useState<Product | null>(null);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [searchFocus, setSearchFocus] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const user = useSelector((state: RootState) => state.auth.user);

  // Stats (igual que antes, pero usando el estado del hook)
  const criticals = products.filter((p) => stockStatus(p) === "critical").length;
  const lows = products.filter((p) => stockStatus(p) === "low").length;
  const totalValue = products.reduce((s, p) => s + p.stock * p.costPerUnit, 0);
  const mermaTotal = mermas.reduce((s, m) => s + m.cost, 0);

  // Filter (igual que antes)
  const filtered = products.filter((p) => {
    const ms = [p.name, p.sku, p.supplier]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase());
    const mc = catFilter === "all" || p.category === catFilter;
    const ms2 =
      statusFilter === "all" ||
      (statusFilter === "active" ? p.active : !p.active) ||
      (statusFilter === "low" &&
        (stockStatus(p) === "low" || stockStatus(p) === "critical"));
    return ms && mc && ms2;
  });

  // ── Handlers con manejo de errores ────────────────────────────────────────
  async function handleSaveProduct(p: Product) {
    try {
      await saveProduct(p);
    } catch {
      setActionError("Error al guardar el producto. Intenta de nuevo.");
    }
  }

  async function handleDeleteProduct(id: number) {
    if (!confirm("¿Eliminar producto del inventario?")) return;
    try {
      await deleteProduct(id);
    } catch {
      setActionError("Error al eliminar el producto.");
    }
    setOpenMenu(null);
  }

  async function handleAdjustStock(id: number, newStock: number) {
    try {
      await adjustStock(id, newStock);
    } catch {
      setActionError("Error al ajustar el stock.");
    }
  }

  async function handleSaveMerma(m: Merma) {
    try {
      await saveMerma(m);
    } catch {
      setActionError("Error al registrar la merma.");
    }
  }

  // ── Render: loading / error state ─────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", fontFamily: T.fontB, background: T.bg }}>
        <AdminSidebar activePage="inventory" user={user} onLogout={() => { }} />
        <main style={{ flex: 1, marginLeft: 260, padding: "40px 48px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 48, height: 48, border: `4px solid ${T.border}`, borderTopColor: T.brand, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
            <p style={{ color: T.textMut, fontSize: 14 }}>Cargando inventario...</p>
          </div>
        </main>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

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
        activePage="inventory"
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
              Inventario
            </h1>
            <p style={{ fontSize: 14, color: T.textMut, margin: 0 }}>
              Control de productos, stock y registro de mermas
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() =>
                router.push("/dashboard/admin/inventory/suppliers")
              }
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
              <Truck size={15} /> Proveedores
            </button>
            <button
              onClick={() => setMermaModal(true)}
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
              <TrendingDown size={15} /> Registrar merma
            </button>
            <button
              onClick={() => setProductModal("new")}
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
              <Plus size={15} /> Nuevo producto
            </button>
          </div>
        </header>

        {/* Action Error Banner */}
        {actionError && (
          <div
            style={{
              padding: "12px 18px",
              background: "#fef2f2",
              borderRadius: 12,
              border: "1px solid #fecaca",
              marginBottom: 20,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 13, color: T.danger }}>
              {actionError}
            </span>
            <button
              onClick={() => setActionError(null)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: T.textMut,
              }}
            >
              <X size={14} />
            </button>
          </div>
        )}

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
              label: "Total productos",
              value: products.length,
              color: T.brand,
              sub: "en catálogo",
            },
            {
              label: "Stock crítico",
              value: criticals,
              color: T.danger,
              sub: `${lows} en nivel bajo`,
            },
            {
              label: "Valor inventario",
              value: `$${totalValue.toLocaleString("es-MX")}`,
              color: T.ok,
              sub: "costo total en bodega",
            },
            {
              label: "Mermas del mes",
              value: `$${mermaTotal.toLocaleString("es-MX")}`,
              color: T.warn,
              sub: `${mermas.length} registros`,
            },
          ].map((s) => (
            <div
              key={s.label}
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
                  background: s.color,
                  marginBottom: 14,
                }}
              />
              <p
                style={{
                  fontFamily: T.fontD,
                  fontSize: 26,
                  fontWeight: 900,
                  color: s.color,
                  margin: "0 0 4px",
                  letterSpacing: "-.03em",
                }}
              >
                {s.value}
              </p>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: T.text,
                  margin: "0 0 2px",
                }}
              >
                {s.label}
              </p>
              <p style={{ fontSize: 11, color: T.textMut, margin: 0 }}>
                {s.sub}
              </p>
            </div>
          ))}
        </div>

        {/* Alerts */}
        {(criticals > 0 || lows > 0) && (
          <div
            style={{
              padding: "14px 18px",
              background: "#fef2f2",
              borderRadius: 14,
              border: "1px solid #fecaca",
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <AlertTriangle
              size={18}
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
              <strong>
                {criticals} producto{criticals !== 1 ? "s" : ""} en nivel
                crítico
              </strong>
              {lows > 0 && ` y ${lows} en nivel bajo`}
              {" — "} Se recomienda generar una orden de reabastecimiento.
              <button
                onClick={() =>
                  router.push("/dashboard/admin/inventory/suppliers")
                }
                style={{
                  marginLeft: 8,
                  fontSize: 12,
                  fontWeight: 800,
                  color: T.danger,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Ver proveedores →
              </button>
            </p>
          </div>
        )}

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: 0,
            borderBottom: `1px solid ${T.border}`,
            marginBottom: 24,
          }}
        >
          {[
            { k: "productos", l: "📦 Productos", count: products.length },
            { k: "mermas", l: "📉 Mermas", count: mermas.length },
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

        {/* ── PRODUCTOS TAB ── */}
        {tab === "productos" && (
          <>
            {/* Filters */}
            <div
              style={{
                display: "flex",
                gap: 12,
                marginBottom: 20,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  position: "relative",
                  flex: 1,
                  minWidth: 220,
                  maxWidth: 300,
                }}
              >
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
                  placeholder="Buscar producto, SKU..."
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
              <select
                value={catFilter}
                onChange={(e) => setCatFilter(e.target.value)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  border: `1px solid ${T.border}`,
                  background: T.surface,
                  color: T.textSec,
                  fontFamily: T.fontB,
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="all">Todas las categorías</option>
                {Object.entries(CATEGORIES).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.icon} {v.label}
                  </option>
                ))}
              </select>
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
                {[
                  { k: "all", l: "Todos" },
                  { k: "active", l: "Activos" },
                  { k: "low", l: "Bajo stock" },
                ].map((o) => (
                  <button
                    key={o.k}
                    onClick={() => setStatusFilter(o.k)}
                    style={{
                      padding: "5px 12px",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 700,
                      border: "none",
                      cursor: "pointer",
                      transition: "all .15s",
                      background:
                        statusFilter === o.k ? T.surface : "transparent",
                      color: statusFilter === o.k ? T.text : T.textMut,
                      boxShadow:
                        statusFilter === o.k
                          ? "0 1px 4px rgba(26,18,8,0.1)"
                          : "none",
                    }}
                  >
                    {o.l}
                  </button>
                ))}
              </div>
            </div>

            {/* Category pills summary */}
            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 20,
                flexWrap: "wrap",
              }}
            >
              {Object.entries(CATEGORIES).map(([k, v]) => {
                const count = products.filter((p) => p.category === k).length;
                if (!count) return null;
                return (
                  <button
                    key={k}
                    onClick={() => setCatFilter(catFilter === k ? "all" : k)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "5px 12px",
                      borderRadius: 99,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      border: `1px solid ${catFilter === k ? v.color : T.border}`,
                      background: catFilter === k ? v.bg : T.surface,
                      color: catFilter === k ? v.color : T.textSec,
                      transition: "all .15s",
                    }}
                  >
                    {v.icon} {v.label}{" "}
                    <span style={{ fontWeight: 900 }}>{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Products table */}
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
                      "Producto",
                      "Categoría",
                      "Stock",
                      "Nivel",
                      "Costo unit.",
                      "Proveedor",
                      "Estado",
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
                        No se encontraron productos
                      </td>
                    </tr>
                  ) : (
                    filtered.map((p) => {
                      const st = stockStatus(p);
                      const sc = STATUS_CFG[st];
                      const pct = Math.min(100, (p.stock / p.maxStock) * 100);
                      const cat = CATEGORIES[p.category] ?? { label: "Otro", icon: "📦", color: "#6b7280", bg: "#f3f4f6" };
                      return (
                        <tr
                          key={p.id}
                          style={{
                            borderBottom: `1px solid ${T.border}`,
                            transition: "background .1s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = T.elevated)
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                        >
                          <td style={{ padding: "12px 16px" }}>
                            <p
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: T.text,
                                margin: 0,
                              }}
                            >
                              {p.name}
                            </p>
                            <p
                              style={{
                                fontSize: 10,
                                color: T.textMut,
                                margin: "2px 0 0",
                                fontFamily: "monospace",
                              }}
                            >
                              {p.sku}
                            </p>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                padding: "3px 9px",
                                borderRadius: 99,
                                fontSize: 11,
                                fontWeight: 700,
                                color: cat.color,
                                background: cat.bg,
                              }}
                            >
                              {cat.icon} {cat.label}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <p
                              style={{
                                fontSize: 14,
                                fontWeight: 900,
                                color: sc.color,
                                margin: 0,
                              }}
                            >
                              {p.stock}{" "}
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 600,
                                  color: T.textMut,
                                }}
                              >
                                {p.unit}
                              </span>
                            </p>
                            <p
                              style={{
                                fontSize: 10,
                                color: T.textMut,
                                margin: "2px 0 0",
                              }}
                            >
                              Mín {p.minStock} · Máx {p.maxStock}
                            </p>
                          </td>
                          <td style={{ padding: "12px 16px", minWidth: 100 }}>
                            <div
                              style={{
                                height: 6,
                                background: T.border,
                                borderRadius: 99,
                                overflow: "hidden",
                                marginBottom: 4,
                              }}
                            >
                              <div
                                style={{
                                  height: "100%",
                                  borderRadius: 99,
                                  width: `${pct}%`,
                                  background: sc.color,
                                  transition: "width .3s",
                                }}
                              />
                            </div>
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                color: sc.color,
                              }}
                            >
                              {sc.label}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: T.text,
                              }}
                            >
                              ${p.costPerUnit}
                            </span>
                            <span style={{ fontSize: 10, color: T.textMut }}>
                              {" "}
                              /{p.unit}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ fontSize: 12, color: T.textSec }}>
                              {p.supplier}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                padding: "3px 9px",
                                borderRadius: 99,
                                fontSize: 10,
                                fontWeight: 800,
                                background: p.active ? "#ecfdf5" : "#f1f5f9",
                                color: p.active ? T.ok : "#64748b",
                              }}
                            >
                              {p.active ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <div
                              style={{ position: "relative" }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() =>
                                  setOpenMenu(openMenu === p.id ? null : p.id)
                                }
                                style={{
                                  padding: 6,
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  borderRadius: 8,
                                  display: "flex",
                                  color: T.textMut,
                                }}
                              >
                                <MoreVertical size={15} />
                              </button>
                              {openMenu === p.id && (
                                <div
                                  style={{
                                    position: "absolute",
                                    right: 0,
                                    top: "100%",
                                    zIndex: 10,
                                    background: T.surface,
                                    borderRadius: 12,
                                    border: `1px solid ${T.border}`,
                                    boxShadow: T.shadowHov,
                                    minWidth: 170,
                                    overflow: "hidden",
                                  }}
                                >
                                  {[
                                    {
                                      icon: <Pencil size={13} />,
                                      l: "Editar producto",
                                      fn: () => {
                                        setProductModal(p);
                                        setOpenMenu(null);
                                      },
                                    },
                                    {
                                      icon: <Layers size={13} />,
                                      l: "Ajustar stock",
                                      fn: () => {
                                        setAdjustModal(p);
                                        setOpenMenu(null);
                                      },
                                    },
                                    {
                                      icon: <TrendingDown size={13} />,
                                      l: "Registrar merma",
                                      fn: () => {
                                        setMermaModal(true);
                                        setOpenMenu(null);
                                      },
                                      danger: false,
                                    },
                                    {
                                      icon: <Trash2 size={13} />,
                                      l: "Eliminar",
                                      fn: () => deleteProduct(p.id),
                                      danger: true,
                                    },
                                  ].map((item, i) => (
                                    <button
                                      key={i}
                                      onClick={item.fn}
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                        width: "100%",
                                        padding: "10px 14px",
                                        fontSize: 13,
                                        fontWeight: 600,
                                        border: "none",
                                        cursor: "pointer",
                                        background: "none",
                                        color: (item as any).danger
                                          ? T.danger
                                          : T.textSec,
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
              {filtered.length} de {products.length} productos
            </p>
          </>
        )}

        {/* ── MERMAS TAB ── */}
        {tab === "mermas" && (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <p style={{ fontSize: 13, color: T.textSec, margin: 0 }}>
                Total pérdida registrada:{" "}
                <strong style={{ color: T.danger }}>
                  ${mermaTotal.toLocaleString("es-MX")}
                </strong>
              </p>
              <button
                onClick={() => setMermaModal(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "9px 16px",
                  borderRadius: 11,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  border: `1px solid ${T.danger}30`,
                  background: "#fef2f2",
                  color: T.danger,
                }}
              >
                <Plus size={14} /> Nueva merma
              </button>
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
            >
              {mermas.map((m) => {
                const rc = MERMA_REASONS[m.reason];
                return (
                  <div
                    key={m.id}
                    style={{
                      background: T.surface,
                      borderRadius: 16,
                      border: `1px solid ${T.border}`,
                      padding: "16px 20px",
                      boxShadow: T.shadow,
                      display: "flex",
                      gap: 16,
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        background: "#fef2f2",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <TrendingDown size={20} style={{ color: T.danger }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: 6,
                        }}
                      >
                        <div>
                          <p
                            style={{
                              fontSize: 14,
                              fontWeight: 700,
                              color: T.text,
                              margin: 0,
                            }}
                          >
                            {m.productName}
                            <span
                              style={{
                                marginLeft: 8,
                                fontSize: 12,
                                fontWeight: 600,
                                color: T.textMut,
                              }}
                            >
                              −{m.quantity} {m.unit}
                            </span>
                          </p>
                          <p
                            style={{
                              fontSize: 12,
                              color: T.textMut,
                              margin: "3px 0 0",
                            }}
                          >
                            Reportado por {m.reportedBy || "—"} · {m.date}
                          </p>
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
                              padding: "3px 10px",
                              borderRadius: 99,
                              fontSize: 11,
                              fontWeight: 800,
                              color: rc.color,
                              background: rc.bg,
                            }}
                          >
                            {rc.label}
                          </span>
                          <span
                            style={{
                              fontSize: 15,
                              fontWeight: 900,
                              color: T.danger,
                            }}
                          >
                            -${Number(m.cost).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <p
                        style={{
                          fontSize: 12,
                          color: T.textSec,
                          margin: 0,
                          background: T.elevated,
                          padding: "8px 12px",
                          borderRadius: 8,
                          borderLeft: `3px solid ${T.borderMed}`,
                        }}
                      >
                        {m.justification}
                      </p>
                    </div>
                  </div>
                );
              })}
              {mermas.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "48px 0",
                    color: T.textMut,
                  }}
                >
                  <Archive
                    size={40}
                    style={{ marginBottom: 12, opacity: 0.4 }}
                  />
                  <p style={{ fontSize: 14, margin: 0 }}>
                    Sin mermas registradas
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Modals */}
      {productModal !== null && (
        <ProductModal
          product={productModal === "new" ? null : productModal}
          onClose={() => setProductModal(null)}
          onSave={handleSaveProduct}
        />
      )}
      {mermaModal && (
        <MermaModal
          products={products}
          onClose={() => setMermaModal(false)}
          onSave={handleSaveMerma}
        />
      )}
      {adjustModal && (
        <AdjustModal
          product={adjustModal}
          onClose={() => setAdjustModal(null)}
          onSave={handleAdjustStock}
        />
      )}
    </div>
  );
}
