"use client";

import React from "react";
import { Search, Filter, ChevronDown } from "lucide-react";
import { ROLES } from "../../data/usersMock";

interface UserFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  roleFilter: string;
  onRoleFilterChange: (v: string) => void;
  statusFilter: "all" | "active" | "inactive";
  onStatusFilterChange: (v: "all" | "active" | "inactive") => void;
}

const inpClass = "w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-[13px] font-black outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all bg-surface shadow-sm";
const selClass = "pl-4 pr-10 py-2.5 rounded-xl border border-border text-[13px] font-black outline-none focus:border-brand bg-surface shadow-sm cursor-pointer appearance-none";

export function UserFilters({
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
}: UserFiltersProps) {
  return (
    <div className="flex flex-col lg:flex-row items-center gap-4 mb-8">
      {/* Search Input */}
      <div className="relative flex-1 group w-full lg:max-w-md">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand transition-colors"
        />
        <input
          type="text"
          placeholder="Buscar por nombre, correo o teléfono..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className={inpClass}
        />
      </div>

      {/* Role Select */}
      <div className="relative w-full lg:w-auto">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
          <Filter size={14} />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => onRoleFilterChange(e.target.value)}
          className={`${selClass} pl-10 w-full`}
        >
          <option value="all">Todos los roles</option>
          {Object.entries(ROLES).map(([k, r]) => (
            <option key={k} value={k}>
              {r.label}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
      </div>

      {/* Status Segmented Control */}
      <div className="flex bg-surface-alt/50 p-1.5 rounded-2xl border border-border/60 shadow-inner w-full lg:w-auto overflow-x-auto">
        {(["all", "active", "inactive"] as const).map((s) => (
          <button
            key={s}
            onClick={() => onStatusFilterChange(s)}
            className={`px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 min-w-[90px] ${
              statusFilter === s
                ? "bg-surface text-text shadow-md ring-1 ring-border"
                : "text-text-muted hover:text-text"
            }`}
          >
            {s === "all" ? "Todos" : s === "active" ? "Activos" : "Inactivos"}
          </button>
        ))}
      </div>
    </div>
  );
}
