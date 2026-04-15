"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
  Truck,
  FileText,
  Info,
  ChevronDown,
  Database,
} from "lucide-react";

const T = {
  brand: "#e85d04",
  surface: "#ffffff",
  elevated: "#f5f3ef",
  text: "#1a1208",
  textSec: "#6b5e4e",
  textMut: "#a89880",
  border: "#e8e1d8",
  fontD: "'Fraunces', Georgia, serif",
  fontB: "'DM Sans', system-ui, sans-serif",
};

function NavBtn({
  icon,
  label,
  active = false,
  indent = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  indent?: boolean;
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
        padding: indent ? "8px 14px 8px 30px" : "10px 14px",
        borderRadius: 14,
        fontSize: indent ? 13 : 14,
        fontWeight: 600,
        border: "none",
        cursor: "pointer",
        width: "100%",
        textAlign: "left",
        fontFamily: T.fontB,
        transition: "all .15s",
        background: active ? T.brand : h ? T.elevated : "transparent",
        color: active ? "#fff" : h ? T.text : T.textSec,
        boxShadow: active ? "0 4px 14px rgba(232,93,4,.25)" : "none",
      }}
    >
      <span style={{ flexShrink: 0, opacity: indent ? 0.7 : 1 }}>{icon}</span>
      <span
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
    </button>
  );
}

function Group({
  icon,
  label,
  children,
  childActive = false,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  childActive?: boolean;
}) {
  const [open, setOpen] = useState(childActive);
  const [h, setH] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
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
          fontFamily: T.fontB,
          transition: "all .15s",
          background:
            childActive && !open
              ? `${T.brand}12`
              : h
                ? T.elevated
                : "transparent",
          color: childActive ? T.brand : h ? T.text : T.textSec,
        }}
      >
        <span style={{ flexShrink: 0 }}>{icon}</span>
        <span
          style={{
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>
        <ChevronDown
          size={13}
          style={{
            flexShrink: 0,
            opacity: 0.5,
            transition: "transform .2s",
            transform: open ? "rotate(0deg)" : "rotate(-90deg)",
          }}
        />
      </button>
      {open && <div style={{ paddingBottom: 4 }}>{children}</div>}
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <p
      style={{
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: ".15em",
        textTransform: "uppercase",
        color: T.textMut,
        padding: "0 10px",
        margin: "18px 0 6px",
        fontFamily: T.fontB,
      }}
    >
      {label}
    </p>
  );
}

export interface AdminSidebarProps {
  /** Current page key — used to highlight the active item */
  activePage?: string;
  user?: { name?: string; lastname?: string } | null;
  onLogout?: () => void;
}

/**
 * AdminSidebar — shared across all admin pages.
 *
 * Usage:
 *   import AdminSidebar from '@/components/admin/AdminSidebar';
 *   ...
 *   <AdminSidebar activePage="dashboard" user={user} onLogout={handleLogout} />
 *
 * Place it as the first child of a flex container that has `marginLeft: 260`.
 */
export default function AdminSidebar({
  activePage,
  user,
  onLogout,
}: AdminSidebarProps) {
  const router = useRouter();
  const is = (k: string) => activePage === k;

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
      return;
    }
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* */
    }
    if (typeof window !== "undefined") localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <aside
      style={{
        width: 260,
        flexShrink: 0,
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        background: T.surface,
        borderRight: `1px solid ${T.border}`,
        boxShadow: "2px 0 20px rgba(26,18,8,0.05)",
        fontFamily: T.fontB,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "22px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderBottom: `1px solid ${T.border}`,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: T.brand,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: T.fontD,
            fontWeight: 900,
            fontSize: 20,
            color: "#fff",
            boxShadow: "0 4px 14px rgba(232,93,4,.35)",
          }}
        >
          Q
        </div>
        <span
          style={{
            fontFamily: T.fontD,
            fontWeight: 900,
            fontSize: 18,
            letterSpacing: "-.03em",
            color: T.text,
          }}
        >
          Quijote<span style={{ color: T.brand }}>Admin</span>
        </span>
      </div>

      {/* ── Scrollable nav ─────────────────────────────────────────────── */}
      <nav
        style={{
          flex: 1,
          padding: "14px 12px",
          overflowY: "auto",
          overflowX: "hidden",
          /* Custom scrollbar — light theme */
          scrollbarWidth: "thin",
          scrollbarColor: `${T.border} transparent`,
        }}
      >
        <SectionLabel label="Menú Principal" />

        <NavBtn
          icon={<LayoutDashboard size={17} />}
          label="Dashboard"
          active={is("dashboard")}
          onClick={() => router.push("/dashboard/admin")}
        />

        {/* <NavBtn
          icon={<ClipboardList size={17} />}
          label="Pedidos"
          active={is("orders")}
          onClick={() => router.push("/dashboard/admin/orders")}
        /> */}

        <NavBtn
          icon={<UtensilsCrossed size={17} />}
          label="Catálogo Menú"
          active={is("menu")}
          onClick={() => router.push("/dashboard/admin/menu")}
        />

        <NavBtn
          icon={<Users size={17} />}
          label="Personal"
          active={is("users")}
          onClick={() => router.push("/dashboard/admin/users")}
        />

        <Group
          icon={<Package size={17} />}
          label="Inventario"
          childActive={is("inventory") || is("suppliers")}
        >
          <NavBtn
            icon={<Package size={15} />}
            label="Productos & Stock"
            indent
            active={is("inventory")}
            onClick={() => router.push("/dashboard/admin/inventory")}
          />
          <NavBtn
            icon={<Truck size={15} />}
            label="Proveedores"
            indent
            active={is("suppliers")}
            onClick={() => router.push("/dashboard/admin/inventory/suppliers")}
          />
        </Group>

        <Group
          icon={<DollarSign size={17} />}
          label="Finanzas & Caja"
          childActive={is("finance") || is("invoices")}
        >
          <NavBtn
            icon={<DollarSign size={15} />}
            label="Caja & Propinas"
            indent
            active={is("finance")}
            onClick={() => router.push("/dashboard/admin/finance")}
          />
          <NavBtn
            icon={<FileText size={15} />}
            label="Facturas"
            indent
            active={is("invoices")}
            onClick={() => router.push("/dashboard/admin/finance/invoices")}
          />
        </Group>

        <NavBtn
          icon={<BarChart2 size={17} />}
          label="Reportes"
          active={is("reports")}
          onClick={() => router.push("/dashboard/admin/reports")}
        />

        <SectionLabel label="Sistema" />

        <NavBtn
          icon={<Database size={17} />}
          label="Prediccion"
          active={is("predictive")}
          onClick={() => router.push("/dashboard/admin/predictive")}
        />

        <NavBtn
          icon={<Database size={17} />}
          label="Base de datos"
          active={is("performance")}
          onClick={() => router.push("/dashboard/admin/db-performance")}
        />

        <NavBtn
          icon={<Settings size={17} />}
          label="Configuración"
          active={is("settings")}
          onClick={() => router.push("/dashboard/admin/settings")}
        />

        <NavBtn
          icon={<Info size={17} />}
          label="Acerca del restaurante"
          active={is("about")}
          onClick={() => router.push("/dashboard/admin/about")}
        />
      </nav>

      {/* ── User + logout (always visible) ─────────────────────────────── */}
      <div
        style={{
          padding: "10px 12px",
          borderTop: `1px solid ${T.border}`,
          flexShrink: 0,
        }}
      >
        {user && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              marginBottom: 6,
              background: T.elevated,
              borderRadius: 12,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: `${T.brand}20`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 900,
                color: T.brand,
                flexShrink: 0,
              }}
            >
              {user.name?.[0]}
              {user.lastname?.[0]}
            </div>
            <div style={{ overflow: "hidden", flex: 1 }}>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: T.text,
                  margin: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
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
        )}
        <NavBtn
          icon={<LogOut size={17} />}
          label="Cerrar Sesión"
          onClick={handleLogout}
        />
      </div>
    </aside>
  );
}
