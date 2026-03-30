import React from "react";
import Image from "next/image";
import Link from "next/link";

import { Moon, Settings, ShoppingBag, Sun } from "../icons";

type Props = {
  theme: string | undefined;
  setTheme: (theme: string) => void;
  cartCount: number;
  onOpenCart: () => void;
};

export default function Navbar({ theme, setTheme, cartCount, onOpenCart }: Props) {
  return (
    <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-8 lg:px-24 py-4 bg-white/80 dark:bg-[#0f0f0f]/80 backdrop-blur-md border-b border-black/5 dark:border-white/5">
      <div className="flex items-center gap-4">
        <Image
          src="/assets/logo.png"
          alt="Logo"
          width={45}
          height={45}
          className="rounded-lg"
        />
        <span className="text-xl font-black tracking-tighter uppercase">
          Restaurante<span className="text-orange-500"> El Quijote</span>
        </span>
      </div>

      <div className="hidden md:flex gap-8 text-sm font-medium text-gray-500 dark:text-gray-400">
        <a href="#promociones" className="hover:text-orange-500 transition-colors">
          Promociones
        </a>
        <a href="#menu" className="hover:text-orange-500 transition-colors">
          Menú
        </a>
        <a href="#nosotros" className="hover:text-orange-500 transition-colors">
          Nosotros
        </a>
        <a href="#reserva" className="hover:text-orange-500 transition-colors">
          Reservas
        </a>
      </div>

      <div className="flex items-center gap-3">
        <div className="group relative">
          <button className="p-2.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-all text-gray-400 border border-transparent">
            <Settings size={20} />
          </button>
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 rounded-2xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-2xl z-50">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold px-3 py-2">
              Apariencia
            </p>
            <button
              onClick={() => setTheme("dark")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left ${
                theme === "dark"
                  ? "text-orange-500 bg-orange-500/5"
                  : "text-gray-500 hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <Moon size={16} /> Modo Oscuro
            </button>
            <button
              onClick={() => setTheme("light")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left ${
                theme === "light"
                  ? "text-orange-500 bg-orange-500/5"
                  : "text-gray-500 hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <Sun size={16} /> Modo Claro
            </button>
          </div>
        </div>

        <button
          onClick={onOpenCart}
          className="relative p-2.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-all text-gray-600 dark:text-gray-300"
        >
          <ShoppingBag size={20} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>

        <div className="h-6 w-[1px] bg-black/10 dark:bg-white/10 mx-2" />
        <Link
          href="/login"
          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-orange-900/20"
        >
          Entrar
        </Link>
      </div>
    </nav>
  );
}

