"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { useInventory, type Supplier, type PurchaseOrder, type OrderStatus, type OrderItem } from "@/hooks/useInventory";


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
  Package,
  TrendingDown,
  X,
  Search,
  Truck,
  Phone,
  Mail,
  Globe,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShoppingCart,
  MoreVertical,
  ChevronRight,
  FileText,
  ArrowLeft,
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


const ORDER_STATUS: Record<
  OrderStatus,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  borrador: {
    label: "Borrador",
    color: "#64748b",
    bg: "#f1f5f9",
    icon: <FileText size={12} />,
  },
  enviada: {
    label: "Enviada",
    color: T.info,
    bg: "#eff6ff",
    icon: <Truck size={12} />,
  },
  confirmada: {
    label: "Confirmada",
    color: T.warn,
    bg: "#fffbeb",
    icon: <CheckCircle2 size={12} />,
  },
  en_camino: {
    label: "En camino",
    color: "#7c3aed",
    bg: "#faf5ff",
    icon: <Truck size={12} />,
  },
  recibida: {
    label: "Recibida",
    color: T.ok,
    bg: "#ecfdf5",
    icon: <CheckCircle2 size={12} />,
  },
  cancelada: {
    label: "Cancelada",
    color: T.danger,
    bg: "#fef2f2",
    icon: <X size={12} />,
  },
};

// ─── Components ───────────────────────────────────────────────────────────────

// ─── Components ───────────────────────────────────────────────────────────────
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
  border: `1px solid ${T.borderMed}`,
  borderRadius: 10,
  fontSize: 13,
  color: T.text,
  background: T.surface,
  outline: "none",
  boxSizing: "border-box",
};
const lbl: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  color: T.textSec,
  marginBottom: 5,
};

// ─── Supplier Modal ───────────────────────────────────────────────────────────
function SupplierModal({
  supplier,
  onClose,
  onSave,
}: {
  supplier: Supplier | null;
  onClose: () => void;
  onSave: (s: Supplier) => void;
}) {
  const blank: Supplier = {
    id: 0,
    name: "",
    contact: "",
    email: "",
    phone: "",
    category: "",
    products: [],
    paymentTerms: "Contado",
    deliveryDays: 1,
    active: true,
  };
  const [form, setForm] = useState<Supplier>(supplier ?? blank);
  const [prodInput, setProdInput] = useState("");

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
              {supplier ? "Editar proveedor" : "Nuevo proveedor"}
            </h2>
            <p style={{ fontSize: 12, color: T.textMut, margin: 0 }}>
              Datos de contacto y condiciones comerciales
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
            maxHeight: "62vh",
            overflowY: "auto",
          }}
        >
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              <label style={lbl}>Nombre del proveedor *</label>
              <input
                style={inp}
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Empresa o persona"
              />
            </div>
            <div>
              <label style={lbl}>Persona de contacto</label>
              <input
                style={inp}
                value={form.contact}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contact: e.target.value }))
                }
                placeholder="Nombre completo"
              />
            </div>
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              <label style={lbl}>Correo electrónico</label>
              <input
                type="email"
                style={inp}
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="ventas@proveedor.mx"
              />
            </div>
            <div>
              <label style={lbl}>Teléfono</label>
              <input
                style={inp}
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                placeholder="771-000-0000"
              />
            </div>
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              <label style={lbl}>Categoría de productos</label>
              <input
                style={inp}
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
                placeholder="Ej. Carnes y embutidos"
              />
            </div>
            <div>
              <label style={lbl}>Sitio web</label>
              <input
                style={inp}
                value={form.website ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, website: e.target.value }))
                }
                placeholder="www.proveedor.com"
              />
            </div>
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              <label style={lbl}>Términos de pago</label>
              <select
                style={inp}
                value={form.paymentTerms}
                onChange={(e) =>
                  setForm((f) => ({ ...f, paymentTerms: e.target.value }))
                }
              >
                {[
                  "Contado",
                  "Crédito 7 días",
                  "Crédito 15 días",
                  "Crédito 30 días",
                  "Crédito 60 días",
                ].map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={lbl}>Días de entrega estimados</label>
              <input
                type="number"
                min={0}
                style={inp}
                value={form.deliveryDays}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    deliveryDays: Number(e.target.value),
                  }))
                }
              />
            </div>
          </div>

          <div>
            <label style={lbl}>Productos que suministra</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input
                style={{ ...inp, flex: 1 }}
                value={prodInput}
                onChange={(e) => setProdInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && prodInput.trim()) {
                    setForm((f) => ({
                      ...f,
                      products: [...f.products, prodInput.trim()],
                    }));
                    setProdInput("");
                  }
                }}
                placeholder="Escribe y presiona Enter para agregar"
              />
              <button
                type="button"
                onClick={() => {
                  if (prodInput.trim()) {
                    setForm((f) => ({
                      ...f,
                      products: [...f.products, prodInput.trim()],
                    }));
                    setProdInput("");
                  }
                }}
                style={{
                  padding: "9px 14px",
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  background: T.brand,
                  color: "#fff",
                }}
              >
                <Plus size={14} />
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {form.products.map((p, i) => (
                <span
                  key={i}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "4px 10px",
                    borderRadius: 99,
                    fontSize: 11,
                    fontWeight: 600,
                    background: T.elevated,
                    color: T.textSec,
                    border: `1px solid ${T.border}`,
                  }}
                >
                  {p}
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        products: f.products.filter((_, j) => j !== i),
                      }))
                    }
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      padding: 0,
                      color: T.textMut,
                    }}
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label style={lbl}>Notas adicionales</label>
            <textarea
              style={{ ...inp, resize: "none" }}
              rows={2}
              value={form.notes ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              placeholder="Horarios de entrega, condiciones especiales, etc."
            />
          </div>

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
            <p
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: T.text,
                margin: 0,
              }}
            >
              Proveedor activo
            </p>
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
              onSave({ ...form, id: form.id || 0 });
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
            {supplier ? "Guardar cambios" : "Agregar proveedor"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Order Modal ──────────────────────────────────────────────────────────────
function OrderModal({
  suppliers,
  order,
  onClose,
  onSave,
}: {
  suppliers: Supplier[];
  order: PurchaseOrder | null;
  onClose: () => void;
  onSave: (o: PurchaseOrder) => void;
}) {
  const active = suppliers.filter((s) => s.active);
  const [suppId, setSuppId] = useState(order?.supplierId ?? active[0]?.id ?? 0);
  const [items, setItems] = useState<OrderItem[]>(
    order?.items ?? [{ productName: "", quantity: 1, unit: "kg", unitCost: 0 }],
  );
  const [expectedAt, setExpectedAt] = useState(order?.expectedAt ?? "");
  const [notes, setNotes] = useState(order?.notes ?? "");
  const [status, setStatus] = useState<OrderStatus>(
    order?.status ?? "borrador",
  );

  const total = items.reduce((s, i) => s + i.quantity * i.unitCost, 0);
  const supp = suppliers.find((s) => s.id === suppId);

  function addItem() {
    setItems((is) => [
      ...is,
      { productName: "", quantity: 1, unit: "kg", unitCost: 0 },
    ]);
  }
  function removeItem(i: number) {
    setItems((is) => is.filter((_, j) => j !== i));
  }
  function updateItem(i: number, field: keyof OrderItem, val: string | number) {
    setItems((is) =>
      is.map((item, j) => (j !== i ? item : { ...item, [field]: val })),
    );
  }

  const STATUS_FLOW: OrderStatus[] = [
    "borrador",
    "enviada",
    "confirmada",
    "en_camino",
    "recibida",
  ];

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
          maxWidth: 680,
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
              {order ? `Orden ${order.folio}` : "Nueva orden de compra"}
            </h2>
            <p style={{ fontSize: 12, color: T.textMut, margin: 0 }}>
              Reabastecimiento de inventario
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
            padding: "20px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            maxHeight: "62vh",
            overflowY: "auto",
          }}
        >
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              <label style={lbl}>Proveedor *</label>
              <select
                style={inp}
                value={suppId}
                onChange={(e) => setSuppId(Number(e.target.value))}
              >
                {active.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {supp && (
                <p
                  style={{ fontSize: 10, color: T.textMut, margin: "4px 0 0" }}
                >
                  Entrega estimada: {supp.deliveryDays} día(s) ·{" "}
                  {supp.paymentTerms}
                </p>
              )}
            </div>
            <div>
              <label style={lbl}>Fecha esperada de entrega</label>
              <input
                type="date"
                style={inp}
                value={expectedAt}
                onChange={(e) => setExpectedAt(e.target.value)}
              />
            </div>
          </div>

          {order && (
            <div>
              <label style={lbl}>Estado de la orden</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {STATUS_FLOW.map((s) => {
                  const sc = ORDER_STATUS[s];
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "5px 12px",
                        borderRadius: 99,
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                        border: `1.5px solid ${status === s ? sc.color : T.border}`,
                        background: status === s ? sc.bg : T.surface,
                        color: status === s ? sc.color : T.textMut,
                      }}
                    >
                      {sc.icon} {sc.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Items */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <label style={{ ...lbl, marginBottom: 0 }}>
                Productos a ordenar
              </label>
              <button
                type="button"
                onClick={addItem}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "4px 10px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  background: `${T.brand}15`,
                  color: T.brand,
                }}
              >
                <Plus size={12} /> Agregar
              </button>
            </div>

            {/* Header row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 80px 70px 90px 30px",
                gap: 6,
                marginBottom: 6,
                padding: "0 4px",
              }}
            >
              {["Producto", "Cant.", "Unidad", "Costo/u", ""].map((h) => (
                <span
                  key={h}
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: T.textMut,
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                  }}
                >
                  {h}
                </span>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {items.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 80px 70px 90px 30px",
                    gap: 6,
                    alignItems: "center",
                  }}
                >
                  <input
                    style={inp}
                    value={item.productName}
                    onChange={(e) =>
                      updateItem(i, "productName", e.target.value)
                    }
                    placeholder="Nombre del producto"
                  />
                  <input
                    type="number"
                    min={1}
                    style={inp}
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(i, "quantity", Number(e.target.value))
                    }
                  />
                  <select
                    style={inp}
                    value={item.unit}
                    onChange={(e) => updateItem(i, "unit", e.target.value)}
                  >
                    {["kg", "g", "l", "ml", "pza", "caja", "bolsa"].map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={0}
                    style={inp}
                    value={item.unitCost}
                    onChange={(e) =>
                      updateItem(i, "unitCost", Number(e.target.value))
                    }
                    placeholder="$0"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    disabled={items.length === 1}
                    style={{
                      padding: 4,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: items.length === 1 ? T.border : T.danger,
                      display: "flex",
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 16px",
              background: T.elevated,
              borderRadius: 12,
              border: `1px solid ${T.border}`,
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 700, color: T.textSec }}>
              Total estimado
            </span>
            <span
              style={{
                fontFamily: T.fontD,
                fontSize: 22,
                fontWeight: 900,
                color: T.brand,
              }}
            >
              ${total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div>
            <label style={lbl}>Notas</label>
            <textarea
              style={{ ...inp, resize: "none" }}
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Instrucciones especiales de entrega, urgencias, etc."
            />
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
            disabled={items.some((i) => !i.productName) || !suppId}
            onClick={() => {
              const s = suppliers.find((s) => s.id === suppId);
              const folio =
                order?.folio ??
                `OC-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`;
              onSave({
                id: order?.id ?? 0,
                folio,
                supplierId: suppId,
                supplierName: s?.name ?? "",
                status,
                items,
                total,
                createdAt:
                  order?.createdAt ?? new Date().toISOString().split("T")[0],
                expectedAt,
                notes,
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
                !items.some((i) => !i.productName) && suppId ? T.brand : "#ccc",
              boxShadow:
                !items.some((i) => !i.productName) && suppId
                  ? "0 4px 12px rgba(232,93,4,.3)"
                  : "none",
            }}
          >
            {order ? "Actualizar orden" : "Crear orden"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Supplier Card ────────────────────────────────────────────────────────────
function SupplierCard({
  supplier,
  orderCount,
  onEdit,
  onOrder,
}: {
  supplier: Supplier;
  orderCount: number;
  onEdit: () => void;
  onOrder: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: T.surface,
        borderRadius: 20,
        border: `1px solid ${T.border}`,
        padding: "20px 22px",
        boxShadow: hover ? T.shadowHov : T.shadow,
        transition: "all .2s",
        opacity: supplier.active ? 1 : 0.65,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 12,
        }}
      >
        <div>
          <p
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: T.text,
              margin: "0 0 3px",
            }}
          >
            {supplier.name}
          </p>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 99,
              background: T.elevated,
              color: T.textSec,
            }}
          >
            {supplier.category}
          </span>
        </div>
        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            padding: "3px 9px",
            borderRadius: 99,
            background: supplier.active ? "#ecfdf5" : "#f1f5f9",
            color: supplier.active ? T.ok : "#64748b",
          }}
        >
          {supplier.active ? "Activo" : "Inactivo"}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          marginBottom: 12,
        }}
      >
        {supplier.contact && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: T.textSec,
            }}
          >
            <Users size={11} style={{ color: T.textMut }} />
            {supplier.contact}
          </span>
        )}
        {supplier.phone && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: T.textSec,
            }}
          >
            <Phone size={11} style={{ color: T.textMut }} />
            {supplier.phone}
          </span>
        )}
        {supplier.email && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: T.textSec,
            }}
          >
            <Mail size={11} style={{ color: T.textMut }} />
            {supplier.email}
          </span>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <div
          style={{
            flex: 1,
            padding: "8px 10px",
            background: T.elevated,
            borderRadius: 10,
            textAlign: "center",
          }}
        >
          <p
            style={{ fontSize: 16, fontWeight: 900, color: T.brand, margin: 0 }}
          >
            {supplier.deliveryDays}d
          </p>
          <p
            style={{
              fontSize: 9,
              color: T.textMut,
              margin: "2px 0 0",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: ".05em",
            }}
          >
            Entrega
          </p>
        </div>
        <div
          style={{
            flex: 1,
            padding: "8px 10px",
            background: T.elevated,
            borderRadius: 10,
            textAlign: "center",
          }}
        >
          <p
            style={{ fontSize: 16, fontWeight: 900, color: T.text, margin: 0 }}
          >
            {orderCount}
          </p>
          <p
            style={{
              fontSize: 9,
              color: T.textMut,
              margin: "2px 0 0",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: ".05em",
            }}
          >
            Órdenes
          </p>
        </div>
        <div
          style={{
            flex: 2,
            padding: "8px 10px",
            background: T.elevated,
            borderRadius: 10,
            textAlign: "center",
          }}
        >
          <p
            style={{ fontSize: 12, fontWeight: 700, color: T.text, margin: 0 }}
          >
            {supplier.paymentTerms}
          </p>
          <p
            style={{
              fontSize: 9,
              color: T.textMut,
              margin: "2px 0 0",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: ".05em",
            }}
          >
            Pago
          </p>
        </div>
      </div>

      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 14 }}
      >
        {supplier.products.slice(0, 3).map((p, i) => (
          <span
            key={i}
            style={{
              fontSize: 10,
              fontWeight: 600,
              padding: "2px 7px",
              borderRadius: 99,
              background: T.elevated,
              color: T.textSec,
              border: `1px solid ${T.border}`,
            }}
          >
            {p}
          </span>
        ))}
        {supplier.products.length > 3 && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              padding: "2px 7px",
              borderRadius: 99,
              background: T.elevated,
              color: T.textMut,
            }}
          >
            +{supplier.products.length - 3}
          </span>
        )}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={onEdit}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            padding: "8px",
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            border: `1px solid ${T.border}`,
            background: T.surface,
            color: T.textSec,
            transition: "all .15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = T.elevated)}
          onMouseLeave={(e) => (e.currentTarget.style.background = T.surface)}
        >
          <Pencil size={12} /> Editar
        </button>
        <button
          onClick={onOrder}
          disabled={!supplier.active}
          style={{
            flex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            padding: "8px",
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            border: "none",
            background: supplier.active ? T.brand : "#ccc",
            color: "#fff",
            boxShadow: supplier.active
              ? "0 3px 10px rgba(232,93,4,.25)"
              : "none",
          }}
        >
          <ShoppingCart size={12} /> Nueva orden
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SuppliersPage() {
  const router = useRouter();
  const {
    suppliers,
    orders,
    loading,
    error,
    saveSupplier,
    deleteSupplier,
    saveOrder,
    deleteOrder,
  } = useInventory();

  const [tab, setTab] = useState<"proveedores" | "ordenes">("proveedores");
  const [suppModal, setSuppModal] = useState<Supplier | null | "new">(null);
  const [orderModal, setOrderModal] = useState<PurchaseOrder | null | "new">(
    null,
  );
  const [preselSupp, setPreselSupp] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [searchFocus, setSearchFocus] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const user = useSelector((state: RootState) => state.auth.user);

  // Stats
  const pendingOrders = orders.filter(
    (o) => !["recibida", "cancelada"].includes(o.status),
  );
  const totalOrdered = orders
    .filter((o) => o.status !== "cancelada")
    .reduce((s, o) => s + o.total, 0);

  // Filter
  const filteredOrders = orders.filter((o) => {
    const ms = [o.folio, o.supplierName]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase());
    const mst = statusFilter === "all" || o.status === statusFilter;
    return ms && mst;
  });

  // ── Handlers con manejo de errores ────────────────────────────────────────
  async function handleSaveSupplier(s: Supplier) {
    try {
      await saveSupplier(s);
    } catch {
      setActionError("Error al guardar el proveedor.");
    }
  }

  async function handleDeleteSupplier(id: number) {
    if (!confirm("¿Eliminar proveedor?")) return;
    try {
      await deleteSupplier(id);
    } catch {
      setActionError("Error al eliminar el proveedor.");
    }
    setOpenMenu(null);
  }

  async function handleSaveOrder(o: PurchaseOrder) {
    try {
      await saveOrder(o);
    } catch {
      setActionError("Error al guardar la orden.");
    }
  }

  async function handleDeleteOrder(id: number) {
    if (!confirm("¿Eliminar esta orden?")) return;
    try {
      await deleteOrder(id);
    } catch {
      setActionError("Error al eliminar la orden.");
    }
    setOpenMenu(null);
  }

  function openNewOrder(supplierId?: number) {
    setPreselSupp(supplierId ?? null);
    setOrderModal("new");
  }

  function handleLogout() {}

  // ── Render: loading / error state ─────────────────────────────────────────
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          fontFamily: T.fontB,
          background: T.bg,
        }}
      >
        <AdminSidebar activePage="suppliers" user={user} onLogout={() => {}} />
        <main
          style={{
            flex: 1,
            marginLeft: 260,
            padding: "40px 48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 48,
                height: 48,
                border: `4px solid ${T.border}`,
                borderTopColor: T.brand,
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 16px",
              }}
            />
            <p style={{ color: T.textMut, fontSize: 14 }}>
              Cargando proveedores...
            </p>
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
          activePage="suppliers"
          user={user}
          onLogout={handleLogout}
        />

        <main style={{ flex: 1, marginLeft: 260, padding: "40px 48px" }}>
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
          {/* Breadcrumb */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 20,
              fontSize: 13,
              color: T.textMut,
            }}
          >
            <button
              onClick={() => router.push("/dashboard/admin/inventory")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                background: "none",
                border: "none",
                cursor: "pointer",
                color: T.textMut,
                fontFamily: T.fontB,
                fontSize: 13,
              }}
            >
              <ArrowLeft size={14} /> Inventario
            </button>
            <ChevronRight size={12} />
            <span style={{ fontWeight: 700, color: T.textSec }}>
              Proveedores y Órdenes
            </span>
          </div>

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
                Proveedores
              </h1>
              <p style={{ fontSize: 14, color: T.textMut, margin: 0 }}>
                Gestión de proveedores y órdenes de reabastecimiento
              </p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => openNewOrder()}
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
                <ShoppingCart size={15} /> Nueva orden
              </button>
              <button
                onClick={() => setSuppModal("new")}
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
                <Plus size={15} /> Nuevo proveedor
              </button>
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
                label: "Proveedores activos",
                value: suppliers.filter((s) => s.active).length,
                color: T.brand,
                sub: "en lista",
              },
              {
                label: "Órdenes pendientes",
                value: pendingOrders.length,
                color: T.warn,
                sub: "en proceso",
              },
              {
                label: "En camino",
                value: orders.filter((o) => o.status === "en_camino").length,
                color: "#7c3aed",
                sub: "por recibir",
              },
              {
                label: "Total comprado",
                value: `$${totalOrdered.toLocaleString()}`,
                color: T.ok,
                sub: "este período",
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

          {/* Tabs */}
          <div
            style={{
              display: "flex",
              borderBottom: `1px solid ${T.border}`,
              marginBottom: 24,
            }}
          >
            {[
              {
                k: "proveedores",
                l: "🏭 Proveedores",
                count: suppliers.filter((s) => s.active).length,
              },
              { k: "ordenes", l: "📋 Órdenes de compra", count: orders.length },
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

          {/* ── PROVEEDORES TAB ── */}
          {tab === "proveedores" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
                gap: 18,
              }}
            >
              {suppliers.map((s) => (
                <SupplierCard
                  key={s.id}
                  supplier={s}
                  orderCount={
                    orders.filter((o) => o.supplierId === s.id).length
                  }
                  onEdit={() => setSuppModal(s)}
                  onOrder={() => openNewOrder(s.id)}
                />
              ))}
            </div>
          )}

          {/* ── ÓRDENES TAB ── */}
          {tab === "ordenes" && (
            <>
              <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                <div style={{ position: "relative", flex: 1, maxWidth: 300 }}>
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
                    placeholder="Buscar folio, proveedor..."
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
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
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
                  <option value="all">Todos los estados</option>
                  {Object.entries(ORDER_STATUS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>

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
                        "Folio",
                        "Proveedor",
                        "Productos",
                        "Estado",
                        "Fecha esperada",
                        "Total",
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
                    {filteredOrders.map((o) => {
                      const sc = ORDER_STATUS[o.status];
                      return (
                        <tr
                          key={o.id}
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
                                fontSize: 12,
                                fontWeight: 800,
                                color: T.text,
                                margin: 0,
                                fontFamily: "monospace",
                              }}
                            >
                              {o.folio}
                            </p>
                            <p
                              style={{
                                fontSize: 10,
                                color: T.textMut,
                                margin: "2px 0 0",
                              }}
                            >
                              {o.createdAt}
                            </p>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <p
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: T.text,
                                margin: 0,
                              }}
                            >
                              {o.supplierName}
                            </p>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <p
                              style={{
                                fontSize: 12,
                                color: T.textSec,
                                margin: 0,
                              }}
                            >
                              {o.items.length}{" "}
                              {o.items.length === 1 ? "producto" : "productos"}
                            </p>
                            <p
                              style={{
                                fontSize: 10,
                                color: T.textMut,
                                margin: "2px 0 0",
                              }}
                            >
                              {o.items
                                .slice(0, 2)
                                .map((i) => i.productName)
                                .join(", ")}
                              {o.items.length > 2 ? "…" : ""}
                            </p>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                padding: "4px 10px",
                                borderRadius: 99,
                                fontSize: 11,
                                fontWeight: 800,
                                color: sc.color,
                                background: sc.bg,
                              }}
                            >
                              {sc.icon} {sc.label}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ fontSize: 13, color: T.textSec }}>
                              {o.expectedAt || "—"}
                            </span>
                            {o.receivedAt && (
                              <p
                                style={{
                                  fontSize: 10,
                                  color: T.ok,
                                  margin: "2px 0 0",
                                }}
                              >
                                Recibida: {o.receivedAt}
                              </p>
                            )}
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <span
                              style={{
                                fontSize: 14,
                                fontWeight: 900,
                                color: T.brand,
                              }}
                            >
                              ${o.total.toLocaleString()}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <div
                              style={{ position: "relative" }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() =>
                                  setOpenMenu(openMenu === o.id ? null : o.id)
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
                              {openMenu === o.id && (
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
                                    minWidth: 160,
                                    overflow: "hidden",
                                  }}
                                >
                                  {[
                                    {
                                      icon: <Pencil size={13} />,
                                      l: "Editar orden",
                                      fn: () => {
                                        setOrderModal(o);
                                        setOpenMenu(null);
                                      },
                                    },
                                    {
                                      icon: <Trash2 size={13} />,
                                      l: "Eliminar",
                                      fn: () => handleDeleteOrder(o.id),
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
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </main>

      {/* Modals */}
      {suppModal !== null && (
        <SupplierModal
          supplier={suppModal === "new" ? null : suppModal}
          onClose={() => setSuppModal(null)}
          onSave={handleSaveSupplier}
        />
      )}
      {orderModal !== null && (
        <OrderModal
          suppliers={suppliers}
          order={orderModal === "new" ? null : orderModal}
          onClose={() => {
            setOrderModal(null);
            setPreselSupp(null);
          }}
          onSave={handleSaveOrder}
        />
      )}
    </div>
  );
}
