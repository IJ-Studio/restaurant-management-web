"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
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
  CalendarDays,
  Wallet,
  Tag,
} from "lucide-react";
import { INITIAL_SETTINGS } from "@/features/shared/data/restaurantData";
import { useTheme } from "@/hooks/useTheme";

// Solo la tipografía queda fija — los colores ahora salen de var(--color-*),
// que ya cambian solos con el tema (mismo mecanismo que Footer.tsx).
const fontD = "'Fraunces', Georgia, serif";
const fontB = "'DM Sans', system-ui, sans-serif";

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
  return (
    <button
      onClick={onClick}
      style={{ fontFamily: fontB }}
      className={`w-full flex items-center gap-2.5 text-left rounded-2xl font-semibold transition-all
        ${indent ? "py-2 pl-[30px] pr-3.5 text-[13px]" : "py-2.5 px-3.5 text-sm"}
        ${
          active
            ? "bg-[var(--color-brand)] text-white shadow-[0_4px_14px_rgba(232,93,4,0.25)]"
            : "text-[var(--color-text-sec)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text)]"
        }`}
    >
      <span className={`flex-shrink-0 ${indent ? "opacity-70" : ""}`}>{icon}</span>
      {/* ← Sin overflow-hidden, text-ellipsis ni whitespace-nowrap; ahora el texto puede expandirse en una línea */}
      <span className="whitespace-nowrap">{label}</span>
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
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ fontFamily: fontB }}
        className={`w-full flex items-center gap-2.5 py-2.5 px-3.5 rounded-2xl text-sm font-semibold text-left transition-all
          ${
            childActive && !open
              ? "bg-[var(--color-surface-alt)] text-[var(--color-brand)]"
              : "text-[var(--color-text-sec)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text)]"
          }`}
      >
        <span className="flex-shrink-0">{icon}</span>
        <span className="flex-1 whitespace-nowrap">{label}</span>
        <ChevronDown
          size={13}
          className={`flex-shrink-0 opacity-50 transition-transform duration-200 ${open ? "rotate-0" : "-rotate-90"}`}
        />
      </button>
      {open && <div className="pb-1">{children}</div>}
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <p
      style={{ fontFamily: fontB }}
      className="text-[10px] font-extrabold tracking-[0.15em] uppercase text-[var(--color-text-muted)] px-2.5 mt-[18px] mb-1.5"
    >
      {label}
    </p>
  );
}

export interface AdminSidebarProps {
  activePage?: string; // opcional, si no se pasa se calcula de la URL
  user?: { name?: string; lastname?: string } | null;
  onLogout?: () => void;
}

export default function AdminSidebar({ activePage, user, onLogout }: AdminSidebarProps) {
  const router = useRouter();
  const isDark = useTheme();
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLElement>(null);

  // Si activePage no se pasó por prop, lo tomamos del último segmento de la URL
  const page = activePage || pathname?.split('/').pop() || '';
  const is = (k: string) => page === k;

  const currentLogo = isDark
    ? INITIAL_SETTINGS.restaurantLogo_light
    : INITIAL_SETTINGS.restaurantLogo_dark;

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* */
    }
    if (typeof window !== "undefined") localStorage.removeItem("user");
    if (onLogout) onLogout();
    router.push("/login");
  };

  // Efecto para medir el ancho real del sidebar y pasarlo como variable CSS
  useEffect(() => {
    const el = sidebarRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      // Sumamos 2px para el borde derecho y un mínimo de 260px como respaldo
      document.documentElement.style.setProperty('--sidebar-width', `${Math.max(width + 2, 260)}px`);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <aside
      ref={sidebarRef}
      style={{ fontFamily: fontB }}
      // Quitamos w-[260px] fijo → el ancho lo dicta el contenido
      className="fixed top-0 left-0 h-screen z-50 flex flex-col
        bg-[var(--color-surface)] border-r border-[var(--color-border)] shadow-xl"
    >
      {/* Logo — ahora ocupa todo el ancho con padding y se ajusta sin deformarse */}
      <div className="px-4 py-2 border-b border-[var(--color-border)] flex-shrink-0">
        <div className="w-full h-20">
          <img
            src={currentLogo}
            alt="El Quijote"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* ── Scrollable nav ─────────────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-3.5 overflow-y-auto overflow-x-hidden [scrollbar-width:thin]">
        <SectionLabel label="Menú Principal" />

        <NavBtn
          icon={<LayoutDashboard size={17} />}
          label="Dashboard"
          active={is("dashboard")}
          onClick={() => router.push("/dashboard/admin")}
        />

        <NavBtn
          icon={<UtensilsCrossed size={17} />}
          label="Catálogo Menú"
          active={is("menu")}
          onClick={() => router.push("/dashboard/admin/menu")}
        />

        <NavBtn
          icon={<CalendarDays size={17} />}
          label="Reservaciones"
          active={is("reservations")}
          onClick={() => router.push("/dashboard/admin/reservations")}
        />

        <NavBtn
          icon={<Tag size={17} />}
          label="Promociones"
          active={is("promociones")}
          onClick={() => router.push("/dashboard/admin/promociones")}
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
          childActive={is("finance") || is("invoices") || is("payroll")}
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
          <NavBtn
            icon={<Wallet size={15} />}
            label="Nómina"
            indent
            active={is("payroll")}
            onClick={() => router.push("/dashboard/admin/payroll")}
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
          label="Predicción"
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
      <div className="px-3 py-2.5 border-t border-[var(--color-border)] flex-shrink-0">
        {user && (
          <div className="flex items-center gap-2.5 px-3 py-2.5 mb-1.5 rounded-xl bg-[var(--color-surface-alt)]">
            <div
              style={{ backgroundColor: "color-mix(in srgb, var(--color-brand) 18%, transparent)" }}
              className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-xs font-black text-[var(--color-brand)] flex-shrink-0"
            >
              {user.name?.[0]}
              {user.lastname?.[0]}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-[13px] font-bold text-[var(--color-text)] m-0 whitespace-nowrap">
                {user.name} {user.lastname}
              </p>
              <p className="text-[9px] font-extrabold text-[var(--color-brand)] uppercase tracking-[0.1em] m-0">
                Administrador
              </p>
            </div>
          </div>
        )}
        <NavBtn icon={<LogOut size={17} />} label="Cerrar Sesión" onClick={handleLogout} />
      </div>
    </aside>
  );
}
