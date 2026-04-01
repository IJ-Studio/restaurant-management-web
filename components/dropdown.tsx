"use client";

import React, { useState, useEffect, useRef } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface DropdownMenuItem {
  label:          string;
  href?:          string;
  isDestructive?: boolean;
  action?:        (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export interface DropdownProps {
  /** The trigger element — clicking this opens/closes the menu */
  toggleContent: React.ReactNode;
  menuItems:     DropdownMenuItem[];
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Dropdown({ toggleContent, menuItems }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="cursor-pointer"
      >
        {toggleContent}
      </div>

      {isOpen && (
        <div
          className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-xl border border-black/5 bg-white shadow-xl transition duration-200 ease-out"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="py-1" role="none">
            {menuItems.map((item, index) => (
              <a
                key={index}
                href={item.href ?? "#"}
                onClick={(e) => {
                  item.action?.(e);
                  setIsOpen(false);
                }}
                className={`block px-4 py-2 text-sm transition duration-150 ${
                  item.isDestructive
                    ? "text-red-600 hover:bg-red-500 hover:text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                role="menuitem"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}