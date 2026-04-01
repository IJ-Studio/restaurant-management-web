"use client";

import React from "react";
import { Home, UtensilsCrossed, Clock, History } from "lucide-react";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'inicio', icon: <Home size={22}/>, label: 'Inicio' },
    { id: 'menu', icon: <UtensilsCrossed size={22}/>, label: 'Menú' },
    { id: 'pedido', icon: <Clock size={22}/>, label: 'Pedido' },
    { id: 'historial', icon: <History size={22}/>, label: 'Historial' },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-50 bg-surface/90 backdrop-blur-xl border-t border-border px-8 py-3 pb-8 md:pb-3 flex justify-around items-end shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
      {tabs.map(item => {
        const active = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 relative group active:scale-90 ${
              active ? 'text-brand' : 'text-text-muted hover:text-text'
            }`}
          >
            <div className={`p-2 rounded-2xl transition-all duration-500 scale-110 ${active ? 'bg-brand/10 shadow-lg shadow-brand/10' : 'bg-transparent group-hover:bg-surface-alt'}`}>
              {item.icon}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-[0.1em] transition-all ${active ? 'opacity-100 translate-y-0 text-brand' : 'opacity-60 translate-y-1'}`}>
               {item.label}
            </span>
            {active && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand rounded-full animate-pulse shadow-[0_0_8px_var(--color-brand)]" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
