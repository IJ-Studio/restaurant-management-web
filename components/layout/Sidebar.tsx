"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ChevronDown, LogOut } from "lucide-react";
import { restaurantConfig } from "@/config/restaurant.config";
import { SettingsService } from "@/features/shared/services/dataService";
import type { SessionUser } from "@/types/auth";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface NavItem {
  key:      string;
  label:    string;
  icon:     React.ReactNode;
  href?:    string;
  /** Nested children — renders as a collapsible group */
  children?: NavItem[];
}

export interface SidebarSection {
  label:    string;
  items:    NavItem[];
}

export interface SidebarProps {
  /** Navigation sections to render */
  sections:    SidebarSection[];
  /** Key of the currently active navigation item (optional, auto-detected from URL if omitted) */
  activePage?: string;
  /** Authenticated user info */
  user?:       Pick<SessionUser, "name" | "lastname" | "roleName"> | null;
  /** Custom logout handler. Falls back to POST /api/auth/logout */
  onLogout?:   () => void | Promise<void>;
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="px-2.5 mb-1.5 mt-5 text-[10px] font-extrabold uppercase tracking-[.15em] text-text-muted first:mt-0">
      {label}
    </p>
  );
}

function NavButton({
  icon,
  label,
  active = false,
  indent = false,
  onClick,
}: {
  icon:     React.ReactNode;
  label:    string;
  active?:  boolean;
  indent?:  boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex w-full items-center gap-2.5 rounded-2xl border-none text-left font-semibold transition-all duration-150 cursor-pointer",
        indent ? "py-2 pl-8 pr-3.5 text-[13px]" : "px-3.5 py-2.5 text-sm",
        active
          ? "bg-brand text-white shadow-[0_4px_14px_rgba(232,93,4,.25)]"
          : "bg-transparent text-text-sec hover:bg-surface-alt hover:text-text",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className={["shrink-0", indent ? "opacity-70" : ""].join(" ")}>
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </button>
  );
}

function NavGroup({
  icon,
  label,
  children,
  childActive = false,
}: {
  icon:         React.ReactNode;
  label:        string;
  children:     React.ReactNode;
  childActive?: boolean;
}) {
  const [open, setOpen] = useState(childActive);

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className={[
          "flex w-full items-center gap-2.5 rounded-2xl border-none px-3.5 py-2.5 text-sm font-semibold transition-all duration-150 cursor-pointer",
          childActive && !open
            ? "bg-brand/5 text-brand"
            : "bg-transparent text-text-sec hover:bg-surface-alt hover:text-text",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span className="shrink-0">{icon}</span>
        <span className="flex-1 truncate text-left">{label}</span>
        <ChevronDown
          size={13}
          className={[
            "shrink-0 opacity-50 transition-transform duration-200",
            open ? "rotate-0" : "-rotate-90",
          ].join(" ")}
        />
      </button>

      {open && <div className="pb-1">{children}</div>}
    </div>
  );
}

// ─── Main Sidebar ────────────────────────────────────────────────────────────

/**
 * Sidebar — generic, role-agnostic navigation sidebar.
 *
 * Props drive all content: sections, nav items, user info.
 * The sidebar itself has zero knowledge of the restaurant name,
 * colors, or specific routes — those come from outside.
 *
 * @example
 * ```tsx
 * <Sidebar
 *   sections={ADMIN_NAV_SECTIONS}
 *   activePage="dashboard"
 *   user={session.user}
 * />
 * ```
 */
export function Sidebar({ sections, activePage, user, onLogout }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const settings = SettingsService.getSettings();
  
  const is = (key: string, href?: string) => {
    if (activePage) return activePage === key;
    if (href) return pathname === href || pathname.startsWith(`${href}/`);
    return false;
  };

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout();
      return;
    }
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* silent */
    }
    if (typeof window !== "undefined") localStorage.removeItem("user");
    router.push("/login");
  };

  const renderItem = (item: NavItem) => {
    if (item.children && item.children.length > 0) {
      const childActive = item.children.some((c) => is(c.key, c.href));
      return (
        <NavGroup
          key={item.key}
          icon={item.icon}
          label={item.label}
          childActive={childActive}
        >
          {item.children.map((child) => (
            <NavButton
              key={child.key}
              icon={child.icon}
              label={child.label}
              indent
              active={is(child.key, child.href)}
              onClick={() => child.href && router.push(child.href)}
            />
          ))}
        </NavGroup>
      );
    }

    return (
      <NavButton
        key={item.key}
        icon={item.icon}
        label={item.label}
        active={is(item.key, item.href)}
        onClick={() => item.href && router.push(item.href)}
      />
    );
  };

  // ── Resolve role label from config ────────────────────────────────────────
  const roleLabel = user?.roleName
    ? restaurantConfig.roles[user.roleName]?.label ?? user.roleName
    : null;

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-[var(--sidebar-width)] flex-col border-r border-border bg-surface shadow-[2px_0_20px_rgba(26,18,8,0.05)]">

      {/* ── Brand header ───────────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center gap-3 border-b border-border px-5 py-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand font-[family-name:var(--font-display)] text-xl font-black text-white shadow-[0_4px_14px_rgba(232,93,4,.35)]">
          {settings.shortName}
        </div>
        <span className="font-[family-name:var(--font-display)] text-[17px] font-black tracking-tight text-text">
          {settings.restaurantName}
          <span className="text-brand"> Admin</span>
        </span>
      </div>

      {/* ── Scrollable navigation ───────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3">
        {sections.map((section) => (
          <div key={section.label}>
            <SectionLabel label={section.label} />
            <div className="space-y-0.5">
              {section.items.map(renderItem)}
            </div>
          </div>
        ))}
      </nav>

      {/* ── User card + logout ──────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-border p-3">
        {user && (
          <div className="mb-1.5 flex items-center gap-2.5 rounded-xl bg-surface-alt px-3 py-2.5">
            {/* Avatar initials */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-[11px] font-black text-brand">
              {user.name?.[0]}
              {user.lastname?.[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-bold text-text">
                {user.name} {user.lastname}
              </p>
              {roleLabel && (
                <p className="text-[9px] font-extrabold uppercase tracking-[.1em] text-brand">
                  {roleLabel}
                </p>
              )}
            </div>
          </div>
        )}

        <NavButton
          icon={<LogOut size={17} />}
          label="Cerrar Sesión"
          onClick={handleLogout}
        />
      </div>
    </aside>
  );
}
