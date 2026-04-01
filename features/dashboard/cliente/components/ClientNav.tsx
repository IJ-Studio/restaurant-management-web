"use client";

import React from "react";
import { LogOut, Bell, ShoppingBag } from "lucide-react";
import { SettingsService } from "@/features/shared/services/dataService";

interface ClientNavProps {
  user: any;
  itemsCount: number;
  onOpenCart: () => void;
  onLogout: () => void;
}

export function ClientNav({ user, itemsCount, onOpenCart, onLogout }: ClientNavProps) {
  const settings = SettingsService.getSettings();

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-border px-6 py-4 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <div className="w-10 h-10 bg-brand rounded-2xl flex items-center justify-center font-display font-black text-white text-xl shadow-lg shadow-brand/20 group-hover:scale-110 transition-transform">
          {settings.shortName}
        </div>
        <div>
           <span className="font-display font-black text-[17px] tracking-tight text-text leading-none">{settings.restaurantName}</span>
           <p className="text-[9px] font-black text-brand uppercase tracking-[0.2em] leading-none mt-1">{settings.tagline}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Cart Trigger */}
        <button
          onClick={onOpenCart}
          className="relative flex items-center gap-3 bg-brand text-white px-5 py-2.5 rounded-2xl font-display font-black text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-brand/20 hover:shadow-brand/30 hover:-translate-y-1 active:translate-y-0 active:scale-95 group"
        >
          <ShoppingBag size={18} className="group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline">Carrito</span>
          {itemsCount > 0 && (
            <span className="bg-white text-brand text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center ml-1 animate-in zoom-in">
              {itemsCount}
            </span>
          )}
        </button>

        {/* User Badge */}
        <div className="hidden md:flex items-center gap-3 bg-surface-alt/50 border border-border/40 rounded-2xl px-4 py-2 hover:bg-surface-alt transition-colors">
          <div className="w-8 h-8 bg-brand/10 text-brand rounded-xl flex items-center justify-center font-display font-black text-xs border border-brand/10">
            {user?.name?.[0]}{user?.lastname?.[0] || 'C'}
          </div>
          <div>
             <p className="text-[13px] font-black text-text leading-none mb-0.5">{user?.name || 'Invitado'}</p>
             <p className="text-[9px] font-black text-text-muted uppercase tracking-widest leading-none">Miembro VIP</p>
          </div>
        </div>

        {/* Notifications & Logout */}
        <div className="flex items-center gap-2">
           <button className="p-2.5 text-text-muted hover:text-brand hover:bg-brand/5 rounded-xl transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-brand rounded-full border-2 border-white ring-1 ring-brand/20"></span>
           </button>
           <div className="w-px h-6 bg-border mx-1 hidden sm:block"></div>
           <button 
             onClick={onLogout} 
             className="p-2.5 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-xl transition-all group"
           >
              <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
           </button>
        </div>
      </div>
    </nav>
  );
}
