"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export interface DropdownMenuItem {
  label: string;
  href?: string;
  isDestructive?: boolean;
  icon?: React.ReactNode;
  action?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export interface DropdownProps {
  toggleContent: React.ReactNode;
  menuItems: DropdownMenuItem[];
}

export default function Dropdown({ toggleContent, menuItems }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div
        onClick={(e) => {
          e.stopPropagation(); // Evita burbujeos raros
          setIsOpen(!isOpen);
        }}
        className="cursor-pointer"
      >
        {toggleContent}
      </div>

      {isOpen && (
        <div
          // 👇 CLASES ACTUALIZADAS: bg-surface/80 + backdrop-blur-md + animación de entrada suave
          className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-xl border border-[var(--color-border)] bg-surface/80 backdrop-blur-md p-1.5 shadow-xl transition-all duration-200"
          role="menu"
        >
          <div className="flex flex-col gap-0.5" role="none">
            {menuItems.map((item, index) => {
              const baseClass = `w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition duration-150 text-left font-medium cursor-pointer`;

              const themeClass = item.isDestructive
                ? "text-red-500 hover:bg-red-500/10"
                : "text-[var(--color-text-sec)] hover:text-[var(--color-text)] hover:bg-[var(--color-border)]/30";

              return (
                <button
                  key={index}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation(); // 👈 IMPORTANTE: Detiene eventos del padre

                    if (item.href) {
                      router.push(item.href);
                      setIsOpen(false);
                    } else if (item.action) {
                      item.action(e);
                      if (!item.label.includes("Tema:")) {
                        setIsOpen(false);
                      }
                    }
                  }}
                  className={`${baseClass} ${themeClass}`}
                  role="menuitem"
                >
                  {item.icon && (
                    <span className="w-4 h-4 flex items-center justify-center shrink-0 text-current">
                      {item.icon}
                    </span>
                  )}
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
