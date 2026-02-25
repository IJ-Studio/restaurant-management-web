"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from "next-themes";

// --- ICONOS (SVG) ---
const ShoppingBag = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
);
const Star = ({ size = 20, fill = false, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
);
const Clock = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);
const Utensils = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></svg>
);
const ChevronRight = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="9 18 15 12 9 6" /></svg>
);
const Sun = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
);
const Moon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
);
const Settings = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
);

export default function HomePage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evitar error de hidratación
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f0f0f] text-black dark:text-white transition-colors duration-500 selection:bg-orange-500/30">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-8 lg:px-24 py-4 bg-white/80 dark:bg-[#0f0f0f]/80 backdrop-blur-md border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-4">
          <Image src="/assets/logo.png" alt="Logo" width={45} height={45} className="rounded-lg" />
          <span className="text-xl font-black tracking-tighter uppercase">Restaurante<span className="text-orange-500"> El Quijote</span></span>
        </div>

        <div className="hidden md:flex gap-8 text-sm font-medium text-gray-500 dark:text-gray-400">
          <Link href="#" className="hover:text-orange-500 transition-colors">Menú</Link>
          <Link href="#" className="hover:text-orange-500 transition-colors">Promociones</Link>
          <Link href="#" className="hover:text-orange-500 transition-colors">Nosotros</Link>
        </div>

        <div className="flex items-center gap-3">
          {/* APARTADO CONFIGURACIÓN */}
          <div className="group relative">
            <button className="p-2.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-all text-gray-400 border border-transparent">
              <Settings size={20} />
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 rounded-2xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-2xl z-50">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold px-3 py-2 text-left">Apariencia</p>
              
              <button 
                onClick={() => setTheme('dark')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left ${theme === 'dark' ? 'text-orange-500 bg-orange-500/5' : 'text-gray-500 hover:bg-black/5 dark:hover:bg-white/5'}`}
              >
                <Moon size={16} /> Modo Oscuro
              </button>
              
              <button 
                onClick={() => setTheme('light')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left ${theme === 'light' ? 'text-orange-500 bg-orange-500/5' : 'text-gray-500 hover:bg-black/5 dark:hover:bg-white/5'}`}
              >
                <Sun size={16} /> Modo Claro
              </button>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-black/10 dark:bg-white/10 mx-2"></div>

          <Link href="/login" className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-orange-900/20">
            Entrar
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex items-center px-8 lg:px-24 overflow-hidden pt-20">
        <div className="z-10 max-w-3xl text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-bold uppercase tracking-widest mb-6">
            Abierto ahora
          </div>
          <h1 className="text-6xl md:text-8xl font-black mb-6 leading-[0.9] tracking-tighter">
            SABORES QUE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-yellow-600 uppercase">
              Trascienden
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg md:text-xl mb-10 max-w-lg leading-relaxed">
            Descubre una experiencia gastronómica de alta gama desde tu hogar. Calidad premium y entrega rápida.
          </p>
          <div className="flex flex-wrap gap-5">
            <Link href="/login" className="group bg-orange-600 hover:bg-orange-700 text-white px-10 py-5 rounded-2xl font-bold transition-all flex items-center gap-3 shadow-xl shadow-orange-900/20">
              Pedir Ahora <ShoppingBag size={22} />
            </Link>
          </div>
        </div>

        {/* Imagen Hero Giratoria */}
        <div className="absolute right-[-5%] top-1/2 -translate-y-1/2 hidden xl:block w-[700px] h-[700px]">
          <div className="relative w-full h-full animate-spin-slow">
             <Image 
              src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop"
              alt="Plato Gourmet"
              fill
              className="object-cover rounded-full border-[20px] border-black/5 dark:border-white/5 shadow-2xl"
              priority
            />
          </div>
        </div>
      </section>

      {/* --- CATEGORÍAS --- */}
      <section className="py-24 px-8 lg:px-24">
        <div className="flex justify-between items-end mb-16">
          <div className="text-left">
            <h2 className="text-4xl font-bold mb-2">Categorías</h2>
            <div className="h-1.5 w-20 bg-orange-500 rounded-full"></div>
          </div>
          <button className="group text-orange-500 flex items-center gap-2 font-bold">
            Ver todas <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-left">
          {['Hamburguesas', 'Pizzas', 'Ensaladas', 'Postres'].map((cat) => (
            <div key={cat} className="group bg-gray-50 dark:bg-[#161616] p-10 rounded-[2.5rem] border border-black/5 dark:border-white/5 hover:border-orange-500/40 transition-all cursor-pointer">
              <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-6 text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all">
                <Utensils />
              </div>
              <h3 className="text-xl font-bold">{cat}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* --- PLATOS POPULARES --- */}
      <section className="py-24 bg-gray-100 dark:bg-[#0a0a0a] px-8 lg:px-24 rounded-[4rem] mx-4 md:mx-8 border border-black/5 dark:border-white/5">
        <h2 className="text-4xl font-black mb-16 text-center tracking-tight uppercase">Más Vendidos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { name: 'Royal Cheese Burger', price: '$14.00', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800' },
            { name: 'Pepperoni Supreme', price: '$18.50', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800' },
            { name: 'Salmon Poke Bowl', price: '$16.00', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800' },
          ].map((dish, i) => (
            <div key={i} className="group bg-white dark:bg-[#161616] rounded-[2.5rem] overflow-hidden border border-black/5 dark:border-white/5 hover:shadow-2xl transition-all duration-500 text-left">
              <div className="relative h-72">
                <Image src={dish.img} alt={dish.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-5 right-5 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full font-bold text-orange-400">{dish.price}</div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-3">{dish.name}</h3>
                <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-8 font-medium">
                  <span className="flex items-center gap-1.5"><Star size={16} fill className="text-yellow-500" /> 4.9</span>
                  <span className="flex items-center gap-1.5"><Clock size={16} /> 15-25 min</span>
                </div>
                <button className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black hover:bg-orange-500 hover:text-white transition-all transform active:scale-95">
                  AÑADIR AL CARRITO
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="py-12 text-center text-gray-500 text-sm">
        <p>© 2026 Restaurante el Quijote. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}