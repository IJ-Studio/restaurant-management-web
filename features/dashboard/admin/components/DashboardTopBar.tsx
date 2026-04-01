"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, RefreshCw } from "lucide-react";
import { NOTIFS } from "../data/mockData";
import type { SessionUser } from "@/types/auth";

interface DashboardTopBarProps {
  user: SessionUser;
}

export function DashboardTopBar({ user }: DashboardTopBarProps) {
  const router = useRouter();
  const [now, setNow] = useState("");
  const [searchFocus, setSearchFocus] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    setNow(
      new Date().toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
    
    // Auto-refresh the clock every minute
    const interval = setInterval(() => {
        setNow(
            new Date().toLocaleTimeString("es-MX", {
              hour: "2-digit",
              minute: "2-digit",
            })
          );
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Cierra notificaciones si hay clics fuera (simplificado para el ejemplo)
  useEffect(() => {
    const handleOutsideClick = () => setNotifOpen(false);
    if (notifOpen) {
      document.addEventListener("click", handleOutsideClick);
    }
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [notifOpen]);

  return (
    <header className="flex justify-between items-center mb-6">
      {/* Search */}
      <div className="relative w-72">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
        />
        <input
          placeholder="Buscar pedidos, clientes..."
          onFocus={() => setSearchFocus(true)}
          onBlur={() => setSearchFocus(false)}
          className={`w-full pl-9 pr-3 py-2 rounded-xl text-[13px] font-body text-text bg-surface outline-none border transition-all duration-150 
            ${searchFocus ? "border-brand shadow-[0_0_0_3px_rgba(232,93,4,0.1)]" : "border-border"}`}
        />
      </div>

      <div className="flex items-center gap-2.5">
        {/* Live status */}
        <div className="px-3.5 py-1.5 bg-surface border border-border rounded-xl text-xs font-bold text-text-sec flex items-center gap-1.5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
          En línea · {now}
        </div>

        {/* Refresh */}
        <button
          onClick={() => {
            setRefreshing(true);
            setTimeout(() => setRefreshing(false), 1200);
          }}
          className="p-2 bg-surface text-text-sec border border-border rounded-xl cursor-pointer hover:bg-surface-alt transition-colors shadow-sm"
        >
          <RefreshCw size={15} className={refreshing ? "animate-[spin_1s_linear_infinite]" : ""} />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setNotifOpen((prev) => !prev);
            }}
            className="p-2 bg-surface text-text-sec border border-border rounded-xl cursor-pointer hover:bg-surface-alt transition-colors shadow-sm relative"
          >
            <Bell size={15} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600 border-2 border-surface" />
          </button>

          {notifOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-[calc(100%+8px)] z-50 bg-surface rounded-2xl border border-border shadow-xl min-w-[300px] overflow-hidden"
            >
              <div className="px-4 py-3.5 border-b border-border flex justify-between items-center">
                <span className="text-[13px] font-extrabold text-text">Notificaciones</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-50 text-red-600">
                  {NOTIFS.length} nuevas
                </span>
              </div>
              {NOTIFS.map((n, i) => (
                <div
                  key={i}
                  className={`px-4 py-3 flex gap-2.5 cursor-pointer hover:bg-surface-alt transition-colors ${
                    i < NOTIFS.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <span className="text-[15px] shrink-0">{n.icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-text mb-0.5">{n.text}</p>
                    <p className="text-[10px] text-text-muted m-0">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-7 bg-border mx-1" />

        {/* User chip */}
        <div
          className="flex items-center gap-2.5 p-1.5 pr-3.5 bg-surface border border-border rounded-full cursor-pointer hover:bg-surface-alt transition-colors shadow-sm"
          onClick={() => router.push("/dashboard/admin/users")}
        >
          <div className="w-7 h-7 rounded-full bg-brand/10 flex items-center justify-center text-[11px] font-black text-brand">
            {user.name?.[0]}
            {user.lastname?.[0]}
          </div>
          <div>
            <p className="text-xs font-bold text-text m-0 leading-tight">
              {user.name} {user.lastname}
            </p>
            <p className="text-[9px] font-extrabold text-brand uppercase tracking-[0.1em] m-0 leading-tight">
              Administrador
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
