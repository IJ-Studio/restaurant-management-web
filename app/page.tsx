"use client";

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from "next-themes";

// ─── ICONOS SVG ───────────────────────────────────────────────────────────────
const ShoppingBag = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
);
const Star = ({ size = 20, fill = false, className = "" }: { size?: number; fill?: boolean; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
);
const Clock = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);
const Utensils = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
);
const ChevronRight = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="9 18 15 12 9 6" /></svg>
);
const ChevronLeft = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
);
const Sun = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
);
const Moon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
);
const Settings = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
);
const X = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);
const Plus = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
);
const Calendar = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
);
const Tag = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
);

// ─── TIPOS ────────────────────────────────────────────────────────────────────
type Category = 'todo' | 'entrantes' | 'sopas' | 'principales' | 'postres' | 'bebidas';

interface Dish {
  id: number;
  name: string;
  cat: Category;
  desc: string;
  price: string;
  numPrice: number;
  tag?: string;
  rating: number;
  time: string;
  img: string;
}

interface Promo {
  id: number;
  badge: string;
  title: string;
  desc: string;
  originalPrice: string;
  price: string;
  color: string;
}

interface CartItem extends Dish {
  qty: number;
}

// ─── DATOS ────────────────────────────────────────────────────────────────────
const DISHES: Dish[] = [
  { id: 1, name: 'Tostadas de Atún Rojo', cat: 'entrantes', desc: 'Atún aleta amarilla sellado, aguacate, mayonesa de wasabi, huevas de salmón y microverdes.', price: '$245', numPrice: 245, tag: "Chef's Pick", rating: 4.9, time: '10-15 min', img: 'https://images.unsplash.com/photo-1604909052743-94e838986d24?w=600&q=80' },
  { id: 2, name: 'Tiradito de Mero', cat: 'entrantes', desc: 'Mero salvaje, leche de tigre verde con chile serrano, pepino y aceite de cilantro.', price: '$265', numPrice: 265, tag: 'Nuevo', rating: 4.8, time: '10 min', img: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80' },
  { id: 3, name: 'Guacamole de Molcajete', cat: 'entrantes', desc: 'Aguacate hass, jitomate, cebolla, cilantro, chile serrano y jugo de limón. Preparado en mesa.', price: '$195', numPrice: 195, rating: 4.7, time: '5 min', img: 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=600&q=80' },
  { id: 4, name: 'Sopa de Lima Yucateca', cat: 'sopas', desc: 'Caldo de pollo de rancho, lima asada, tortilla crujiente, rábano, cilantro y habanero al gusto.', price: '$185', numPrice: 185, tag: 'Favorito', rating: 4.9, time: '15 min', img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80' },
  { id: 5, name: 'Crema de Chícharo y Epazote', cat: 'sopas', desc: 'Chícharo fresco, crema de rancho, aceite de epazote, pan artesanal tostado.', price: '$165', numPrice: 165, rating: 4.6, time: '12 min', img: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=600&q=80' },
  { id: 6, name: 'Mole Negro Oaxaqueño', cat: 'principales', desc: 'Pecho de pollo de rancho, mole negro con 32 ingredientes, arroz con hierba santa, frijoles ayocotes.', price: '$420', numPrice: 420, tag: 'Icónico', rating: 5.0, time: '25-30 min', img: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&q=80' },
  { id: 7, name: 'Costilla de Res al Mezcal', cat: 'principales', desc: 'Costilla braseada 18 horas, mezcal espadín, jus de huesos, puré de camote morado, salsa borracha.', price: '$580', numPrice: 580, tag: "Chef's Pick", rating: 4.9, time: '20-25 min', img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80' },
  { id: 8, name: 'Tacos de Mariscos', cat: 'principales', desc: 'Tres tacos en tortilla de maíz azul: camarón al ajillo, pulpo al pastor, mejillones en salsa verde.', price: '$340', numPrice: 340, rating: 4.8, time: '20 min', img: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&q=80' },
  { id: 9, name: 'Chiles en Nogada', cat: 'principales', desc: 'Chile poblano relleno de picadillo criollo, nogada de nuez de Castilla, granada y perejil. Temporada.', price: '$395', numPrice: 395, tag: 'Temporada', rating: 4.9, time: '25 min', img: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&q=80' },
  { id: 10, name: 'Tres Leches de Cajeta', cat: 'postres', desc: 'Bizcocho esponjoso empapado en tres leches, cajeta artesanal de Celaya, merengue tostado.', price: '$135', numPrice: 135, tag: 'Favorito', rating: 4.8, time: '5 min', img: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80' },
  { id: 11, name: 'Helado de Maíz Azul', cat: 'postres', desc: 'Helado artesanal de maíz azul, polvo de ceniza de copal, gel de maracuyá, tierra de chocolate.', price: '$125', numPrice: 125, tag: 'Nuevo', rating: 4.7, time: '5 min', img: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=600&q=80' },
  { id: 12, name: 'Mezcal Negroni', cat: 'bebidas', desc: 'Mezcal joven, Campari, vermut rosso. Servido en copa esfera con naranja deshidratada y sal de gusano.', price: '$210', numPrice: 210, rating: 4.9, time: '5 min', img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&q=80' },
];

const PROMOS: Promo[] = [
  { id: 1, badge: 'Lunes a Miércoles', title: 'Menú del Día', desc: 'Sopa del día + plato fuerte + postre + agua fresca. Cambia cada semana con ingredientes de temporada.', originalPrice: '$450', price: '$280', color: 'from-orange-500/20 to-yellow-500/10' },
  { id: 2, badge: 'Viernes y Sábados', title: 'Maridaje de Fin de Semana', desc: 'Menú degustación de 5 tiempos con maridaje de vinos y mezcales artesanales de Oaxaca.', originalPrice: '$1,800', price: '$1,350', color: 'from-purple-500/20 to-pink-500/10' },
  { id: 3, badge: 'Todos los domingos', title: 'Brunch Familiar', desc: 'Brunch buffet con 30+ platillos, estación de chilaquiles en vivo y micheladas artesanales.', originalPrice: '$520', price: '$380', color: 'from-green-500/20 to-teal-500/10' },
  { id: 4, badge: '2×1 · Martes', title: 'Noche de Mezcal', desc: 'Dos mezcales artesanales al precio de uno. Acompañados de tabla de botanas y sal de gusano.', originalPrice: '$320', price: '$160', color: 'from-amber-500/20 to-orange-500/10' },
];

const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'todo', label: 'Todo' },
  { key: 'entrantes', label: 'Entrantes' },
  { key: 'sopas', label: 'Sopas' },
  { key: 'principales', label: 'Principales' },
  { key: 'postres', label: 'Postres' },
  { key: 'bebidas', label: 'Bebidas' },
];

const CAT_ICONS: Record<string, string> = {
  'Entrantes': '🥗', 'Sopas': '🍲', 'Principales': '🍽️', 'Postres': '🍮', 'Bebidas': '🍹'
};

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function HomePage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Menú
  const [activeCategory, setActiveCategory] = useState<Category>('todo');
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);

  // Carrito
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Carrusel de promos
  const [promoIndex, setPromoIndex] = useState(0);
  const promoRef = useRef<HTMLDivElement>(null);

  // Reserva
  const [reservaData, setReservaData] = useState({ nombre: '', email: '', fecha: '', hora: '', personas: '' });
  const [reservaOk, setReservaOk] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Toast auto-hide
  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); }
  }, [toast]);

  if (!mounted) return null;

  // ── Helpers ──
  const filteredDishes = activeCategory === 'todo' ? DISHES : DISHES.filter(d => d.cat === activeCategory);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.numPrice * i.qty, 0);

  function addToCart(dish: Dish) {
    setCart(prev => {
      const ex = prev.find(i => i.id === dish.id);
      if (ex) return prev.map(i => i.id === dish.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...dish, qty: 1 }];
    });
    setToast(`✓ ${dish.name} agregado`);
  }

  function removeFromCart(id: number) {
    setCart(prev => {
      const ex = prev.find(i => i.id === id);
      if (ex && ex.qty > 1) return prev.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i);
      return prev.filter(i => i.id !== id);
    });
  }

  function handlePromoNext() {
    setPromoIndex(i => Math.min(i + 1, PROMOS.length - 1));
  }
  function handlePromoPrev() {
    setPromoIndex(i => Math.max(i - 1, 0));
  }

  function handleReserva(e: React.FormEvent) {
    e.preventDefault();
    setReservaOk(true);
    setToast('🎉 ¡Reservación confirmada! Revisa tu correo.');
    setTimeout(() => setReservaOk(false), 4000);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white dark:bg-[#0f0f0f] text-black dark:text-white transition-colors duration-500 selection:bg-orange-500/30">

      {/* ─── TOAST ─── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-orange-500 text-white px-6 py-3.5 rounded-2xl font-bold text-sm shadow-2xl shadow-orange-500/30 animate-bounce-once">
          {toast}
        </div>
      )}

      {/* ─── MODAL PLATILLO ─── */}
      {selectedDish && (
        <div
          className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedDish(null)}
        >
          <div
            className="bg-white dark:bg-[#161616] rounded-[2.5rem] overflow-hidden max-w-lg w-full border border-black/10 dark:border-white/10 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative h-64">
              <Image src={selectedDish.img} alt={selectedDish.name} fill className="object-cover" />
              {selectedDish.tag && (
                <span className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">{selectedDish.tag}</span>
              )}
              <button
                onClick={() => setSelectedDish(null)}
                className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white p-2 rounded-full hover:bg-black/80 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-8">
              <p className="text-xs uppercase tracking-widest text-orange-500 font-bold mb-1">{selectedDish.cat}</p>
              <h3 className="text-2xl font-black mb-2">{selectedDish.name}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <span className="flex items-center gap-1"><Star size={14} fill className="text-yellow-500" /> {selectedDish.rating}</span>
                <span className="flex items-center gap-1"><Clock size={14} /> {selectedDish.time}</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">{selectedDish.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-orange-500">{selectedDish.price}</span>
                <button
                  onClick={() => { addToCart(selectedDish); setSelectedDish(null); }}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3.5 rounded-2xl font-black transition-all flex items-center gap-2 active:scale-95"
                >
                  <Plus size={18} /> Agregar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── CARRITO LATERAL ─── */}
      {cartOpen && (
        <div className="fixed inset-0 z-[150] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
          <div className="relative z-10 w-full max-w-md bg-white dark:bg-[#161616] h-full flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-black/5 dark:border-white/5">
              <h2 className="text-xl font-black">Mi Pedido <span className="text-orange-500">({cartCount})</span></h2>
              <button onClick={() => setCartOpen(false)} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-colors"><X /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center text-gray-400 mt-20">
                  <div className="text-5xl mb-4">🍽️</div>
                  <p className="font-medium">Tu pedido está vacío</p>
                </div>
              ) : cart.map(item => (
                <div key={item.id} className="flex items-center gap-4 bg-gray-50 dark:bg-[#1a1a1a] p-4 rounded-2xl">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                    <Image src={item.img} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{item.name}</p>
                    <p className="text-orange-500 font-black">{item.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#2a2a2a] font-black text-lg flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors">−</button>
                    <span className="font-black w-4 text-center">{item.qty}</span>
                    <button onClick={() => addToCart(item)} className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#2a2a2a] font-black text-lg flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors">+</button>
                  </div>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div className="p-6 border-t border-black/5 dark:border-white/5">
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>Subtotal</span><span>${cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-black text-lg mb-6">
                  <span>Total</span><span className="text-orange-500">${(cartTotal * 1.16).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-xl shadow-orange-500/30">
                  Confirmar Pedido
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-8 lg:px-24 py-4 bg-white/80 dark:bg-[#0f0f0f]/80 backdrop-blur-md border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-4">
          <Image src="/assets/logo.png" alt="Logo" width={45} height={45} className="rounded-lg" />
          <span className="text-xl font-black tracking-tighter uppercase">
            Restaurante<span className="text-orange-500"> El Quijote</span>
          </span>
        </div>

        <div className="hidden md:flex gap-8 text-sm font-medium text-gray-500 dark:text-gray-400">
          <a href="#promociones" className="hover:text-orange-500 transition-colors">Promociones</a>
          <a href="#menu" className="hover:text-orange-500 transition-colors">Menú</a>
          <a href="#nosotros" className="hover:text-orange-500 transition-colors">Nosotros</a>
          <a href="#reserva" className="hover:text-orange-500 transition-colors">Reservas</a>
        </div>

        <div className="flex items-center gap-3">
          {/* Configuración */}
          <div className="group relative">
            <button className="p-2.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-all text-gray-400 border border-transparent">
              <Settings size={20} />
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 rounded-2xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-2xl z-50">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold px-3 py-2">Apariencia</p>
              <button onClick={() => setTheme('dark')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left ${theme === 'dark' ? 'text-orange-500 bg-orange-500/5' : 'text-gray-500 hover:bg-black/5 dark:hover:bg-white/5'}`}>
                <Moon size={16} /> Modo Oscuro
              </button>
              <button onClick={() => setTheme('light')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left ${theme === 'light' ? 'text-orange-500 bg-orange-500/5' : 'text-gray-500 hover:bg-black/5 dark:hover:bg-white/5'}`}>
                <Sun size={16} /> Modo Claro
              </button>
            </div>
          </div>

          {/* Carrito */}
          <button
            onClick={() => setCartOpen(true)}
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
          <Link href="/login" className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-orange-900/20">
            Entrar
          </Link>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center px-8 lg:px-24 overflow-hidden pt-20">
        <div className="z-10 max-w-3xl text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-bold uppercase tracking-widest mb-6">
            Abierto ahora · Lun–Dom
          </div>
          <h1 className="text-6xl md:text-8xl font-black mb-6 leading-[0.9] tracking-tighter">
            SABORES QUE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-yellow-600 uppercase">
              Trascienden
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg md:text-xl mb-10 max-w-lg leading-relaxed">
            Cocina mexicana de alta gama. Ingredientes de temporada, técnica contemporánea, sabor de siempre.
          </p>
          <div className="flex flex-wrap gap-5">
            <a href="#menu" className="group bg-orange-600 hover:bg-orange-700 text-white px-10 py-5 rounded-2xl font-bold transition-all flex items-center gap-3 shadow-xl shadow-orange-900/20">
              Ver Menú <Utensils size={20} />
            </a>
            <a href="#reserva" className="group border-2 border-black/10 dark:border-white/10 hover:border-orange-500 px-10 py-5 rounded-2xl font-bold transition-all flex items-center gap-3">
              Reservar Mesa <Calendar size={20} />
            </a>
          </div>

          {/* Stats rápidos */}
          <div className="flex gap-10 mt-14 pt-10 border-t border-black/10 dark:border-white/10">
            {[['16+', 'Años'], ['80+', 'Platillos'], ['4.9★', 'Calificación']].map(([n, l]) => (
              <div key={l}>
                <p className="text-3xl font-black text-orange-500">{n}</p>
                <p className="text-xs uppercase tracking-widest text-gray-500 mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Imagen giratoria */}
        <div className="absolute right-[-5%] top-1/2 -translate-y-1/2 hidden xl:block w-[680px] h-[680px]">
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

      {/* ─── CATEGORÍAS ─── */}
      <section className="py-20 px-8 lg:px-24">
        <div className="flex justify-between items-end mb-12">
          <div className="text-left">
            <h2 className="text-4xl font-black mb-2 tracking-tight">Categorías</h2>
            <div className="h-1.5 w-20 bg-orange-500 rounded-full" />
          </div>
          <a href="#menu" className="group text-orange-500 flex items-center gap-2 font-bold">
            Ver menú completo <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
          {CATEGORIES.filter(c => c.key !== 'todo').map((cat) => (
            <button
              key={cat.key}
              onClick={() => { setActiveCategory(cat.key); document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="group bg-gray-50 dark:bg-[#161616] p-8 rounded-[2rem] border border-black/5 dark:border-white/5 hover:border-orange-500/50 transition-all cursor-pointer text-left"
            >
              <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-5 text-2xl group-hover:bg-orange-500 group-hover:scale-110 transition-all">
                {CAT_ICONS[cat.label]}
              </div>
              <h3 className="text-lg font-bold">{cat.label}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {DISHES.filter(d => d.cat === cat.key).length} platillos
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* ─── PROMOCIONES ─── */}
      <section id="promociones" className="py-20 bg-gray-50 dark:bg-[#0a0a0a] px-8 lg:px-24 rounded-[4rem] mx-4 md:mx-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <p className="text-xs uppercase tracking-widest text-orange-500 font-bold mb-1 flex items-center gap-1.5">
              <Tag size={12} /> Ofertas especiales
            </p>
            <h2 className="text-4xl font-black tracking-tight">Nuestras Promociones</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={handlePromoPrev} disabled={promoIndex === 0} className="w-10 h-10 rounded-xl border border-black/10 dark:border-white/10 flex items-center justify-center hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronLeft size={18} />
            </button>
            <button onClick={handlePromoNext} disabled={promoIndex >= PROMOS.length - 1} className="w-10 h-10 rounded-xl border border-black/10 dark:border-white/10 flex items-center justify-center hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-hidden" ref={promoRef}>
          <div
            className="flex gap-6 transition-transform duration-500 ease-out"
            style={{ transform: `translateX(calc(-${promoIndex} * (min(360px, 85vw) + 24px)))` }}
          >
            {PROMOS.map((promo) => (
              <div
                key={promo.id}
                className={`min-w-[min(360px,85vw)] bg-gradient-to-br ${promo.color} border border-black/5 dark:border-white/5 rounded-[2.5rem] p-8 flex-shrink-0 hover:-translate-y-1 transition-all cursor-pointer`}
              >
                <span className="inline-block bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">{promo.badge}</span>
                <h3 className="text-2xl font-black mb-3">{promo.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">{promo.desc}</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-black text-orange-500">{promo.price}</span>
                  <span className="text-gray-400 line-through text-lg">{promo.originalPrice}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div className="flex gap-2 mt-6 justify-center">
          {PROMOS.map((_, i) => (
            <button
              key={i}
              onClick={() => setPromoIndex(i)}
              className={`rounded-full transition-all ${i === promoIndex ? 'w-6 h-2 bg-orange-500' : 'w-2 h-2 bg-gray-300 dark:bg-gray-600'}`}
            />
          ))}
        </div>
      </section>

      {/* ─── MENÚ ─── */}
      <section id="menu" className="py-24 px-8 lg:px-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h2 className="text-4xl font-black mb-2 tracking-tight">Nuestro Menú</h2>
            <div className="h-1.5 w-20 bg-orange-500 rounded-full" />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                  activeCategory === cat.key
                    ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/30'
                    : 'bg-transparent border-black/10 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-orange-500/50 hover:text-orange-500'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDishes.map((dish) => (
            <div
              key={dish.id}
              onClick={() => setSelectedDish(dish)}
              className="group bg-gray-50 dark:bg-[#161616] rounded-[2.5rem] overflow-hidden border border-black/5 dark:border-white/5 hover:border-orange-500/30 hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div className="relative h-52">
                <Image src={dish.img} alt={dish.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                {dish.tag && (
                  <span className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {dish.tag}
                  </span>
                )}
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full font-black text-orange-400 text-sm">
                  {dish.price}
                </div>
              </div>
              <div className="p-6">
                <p className="text-xs uppercase tracking-widest text-orange-500 font-bold mb-1">{dish.cat}</p>
                <h3 className="text-lg font-black mb-2 leading-tight">{dish.name}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed mb-4 line-clamp-2">{dish.desc}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Star size={12} fill className="text-yellow-500" /> {dish.rating}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {dish.time}</span>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); addToCart(dish); }}
                    className="w-9 h-9 bg-orange-500 hover:bg-orange-600 text-white rounded-xl flex items-center justify-center transition-all active:scale-90 shadow-md shadow-orange-500/30"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── NOSOTROS ─── */}
      <section id="nosotros" className="py-24 bg-gray-50 dark:bg-[#0a0a0a] px-8 lg:px-24 rounded-[4rem] mx-4 md:mx-8">

        {/* Fila 1: Fotos + texto */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">

          {/* Galería de fotos reales */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative h-72 rounded-[2rem] overflow-hidden col-span-2">
              <Image
                src="https://lh3.googleusercontent.com/places/ANXAkqE6SwHydIngTNzQ_Rmc8pP8AXaOkj4X5F6w4I47jNOtpLi8AchhHJQ8iGYLNGGnYxcaaMb2uWLh6em28ZC4Q002P7PurJMnZg8=s4800-w800-h600"
                alt="Restaurante El Quijote interior"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                ⭐ 4.3 · 51 reseñas en Google
              </div>
            </div>
            <div className="relative h-44 rounded-[1.5rem] overflow-hidden">
              <Image
                src="https://lh3.googleusercontent.com/places/ANXAkqH9cuEBmlN7WPf6ZXAFmuDdNARol6-ENmXLgbDpVJxs_0gM2YEnHUd6FSGdNxJaxD2RN968QwI5gXUBnmkci3M9HdJAqn4y_q4=s4800-w800-h600"
                alt="Platillos El Quijote"
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="relative h-44 rounded-[1.5rem] overflow-hidden">
              <Image
                src="https://lh3.googleusercontent.com/places/ANXAkqFTum8ygee60BCkXU4Mv2eCCWcLUYmXBZoFzYzJcp-iokkz9VntBOXi4QI_4NjCZhBp5C56tqNqhFd0rQlmXsoFU9JoziAXQNo=s4800-w800-h600"
                alt="Ambiente El Quijote"
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Texto real */}
          <div>
            <p className="text-xs uppercase tracking-widest text-orange-500 font-bold mb-3">Quiénes somos</p>
            <h2 className="text-4xl font-black mb-6 tracking-tight leading-tight">
              Cocina Nacional e Internacional <span className="text-orange-500">en Huejutla</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              Restaurante El Quijote es un espacio gastronómico ubicado en el corazón de Huejutla de Reyes, Hidalgo. Ofrecemos una amplia variedad de preparaciones culinarias nacionales e internacionales, así como una selección de bebidas para todos los gustos.
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
              Desde entradas y ensaladas hasta cortes americanos, mariscos y postres, nuestra carta está diseñada para ofrecer una experiencia completa en un ambiente cómodo, tranquilo y acogedor. Un lugar ideal para compartir en familia o con amigos.
            </p>

            {/* Info de contacto real */}
            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-white dark:bg-[#161616] p-4 rounded-2xl border border-black/5 dark:border-white/5">
                <span className="text-xl">📍</span>
                <div>
                  <p className="font-black text-sm">Dirección</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Pzla. Hidalgo 5-1, Centro, Huejutla de Reyes, Hgo., C.P. 43000</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white dark:bg-[#161616] p-4 rounded-2xl border border-black/5 dark:border-white/5">
                <span className="text-xl">🕐</span>
                <div>
                  <p className="font-black text-sm">Horario</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Lunes a Domingo · 1:00 PM – 11:00 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white dark:bg-[#161616] p-4 rounded-2xl border border-black/5 dark:border-white/5">
                <span className="text-xl">📞</span>
                <div>
                  <p className="font-black text-sm">Teléfono</p>
                  <a href="tel:+527717028172" className="text-xs text-orange-500 font-bold hover:underline">+52 771 702 8172</a>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <a
                href="https://www.facebook.com/ElQuijote.Huejutla"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#1877F2] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#166fe5] transition-colors"
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Facebook
              </a>
              <a
                href="https://maps.google.com/?cid=9162171458926916171"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 border border-black/10 dark:border-white/10 px-5 py-2.5 rounded-xl text-sm font-bold hover:border-orange-500 hover:text-orange-500 transition-colors"
              >
                🗺️ Ver en Maps
              </a>
            </div>
          </div>
        </div>

        {/* Fila 2: Reseñas reales de clientes */}
        <div>
          <p className="text-xs uppercase tracking-widest text-orange-500 font-bold mb-3 text-center">Lo que dicen nuestros clientes</p>
          <h3 className="text-2xl font-black text-center mb-8 tracking-tight">Reseñas <span className="text-orange-500">Verificadas</span> de Google</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { text: 'Excelente lugar. Muy tranquilo y agradable, con deliciosa comida y bebidas. Altamente recomendado.', stars: 5 },
              { text: 'Lo que buscaba. Excelente restaurante. Recomiendo el molcajete Mar y Tierra estilo Quijote, con vino tinto.', stars: 5 },
              { text: 'Buen restaurante donde disfrutas platillos variados, desde papas rellenas hasta pizza. Tienen juegos de mesa mientras esperas.', stars: 4 },
            ].map((review, i) => (
              <div key={i} className="bg-white dark:bg-[#161616] p-6 rounded-[2rem] border border-black/5 dark:border-white/5">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={s < review.stars ? '#f59e0b' : '#d1d5db'} stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  ))}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed italic">&ldquo;{review.text}&rdquo;</p>
                <div className="flex items-center gap-2 mt-4">
                  <div className="w-7 h-7 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-xs font-black text-orange-500">G</div>
                  <p className="text-xs font-bold text-gray-500">Reseña de Google Maps</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* ─── RESERVA ─── */}
      <section id="reserva" className="py-24 px-8 lg:px-24">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs uppercase tracking-widest text-orange-500 font-bold mb-3">Mesa disponible</p>
          <h2 className="text-4xl font-black mb-4 tracking-tight">Reserva tu Mesa</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-12 leading-relaxed">
            Vive una experiencia gastronómica única. Disponible martes a domingo de 14:00 a 23:00.
          </p>

          {reservaOk ? (
            <div className="bg-green-500/10 border border-green-500/20 rounded-[2.5rem] p-12">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-2xl font-black text-green-500 mb-2">¡Reservación confirmada!</h3>
              <p className="text-gray-500">Revisa tu correo para los detalles.</p>
            </div>
          ) : (
            <form onSubmit={handleReserva} className="bg-gray-50 dark:bg-[#161616] p-8 md:p-10 rounded-[2.5rem] border border-black/5 dark:border-white/5 text-left space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-widest font-bold text-gray-500 block mb-2">Nombre</label>
                  <input
                    required
                    value={reservaData.nombre}
                    onChange={e => setReservaData(p => ({ ...p, nombre: e.target.value }))}
                    className="w-full bg-white dark:bg-[#0f0f0f] border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-orange-500 transition-colors"
                    placeholder="Tu nombre completo"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest font-bold text-gray-500 block mb-2">Correo</label>
                  <input
                    required type="email"
                    value={reservaData.email}
                    onChange={e => setReservaData(p => ({ ...p, email: e.target.value }))}
                    className="w-full bg-white dark:bg-[#0f0f0f] border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-orange-500 transition-colors"
                    placeholder="tu@correo.com"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest font-bold text-gray-500 block mb-2">Fecha</label>
                  <input
                    required type="date"
                    value={reservaData.fecha}
                    onChange={e => setReservaData(p => ({ ...p, fecha: e.target.value }))}
                    className="w-full bg-white dark:bg-[#0f0f0f] border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest font-bold text-gray-500 block mb-2">Hora</label>
                  <select
                    required
                    value={reservaData.hora}
                    onChange={e => setReservaData(p => ({ ...p, hora: e.target.value }))}
                    className="w-full bg-white dark:bg-[#0f0f0f] border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-orange-500 transition-colors appearance-none"
                  >
                    <option value="">Seleccionar hora</option>
                    {['14:00', '15:00', '16:00', '19:00', '20:00', '21:00', '22:00'].map(h => <option key={h}>{h}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest font-bold text-gray-500 block mb-2">Número de personas</label>
                <div className="flex gap-3">
                  {['1-2', '3-4', '5-6', '7+'].map(p => (
                    <button
                      key={p} type="button"
                      onClick={() => setReservaData(prev => ({ ...prev, personas: p }))}
                      className={`flex-1 py-3 rounded-2xl text-sm font-bold border transition-all ${reservaData.personas === p ? 'bg-orange-500 text-white border-orange-500' : 'border-black/10 dark:border-white/10 hover:border-orange-500/50'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-orange-500/20 active:scale-[.98] mt-2"
              >
                Confirmar Reservación
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-black/5 dark:border-white/5 px-8 lg:px-24 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Image src="/assets/logo.png" alt="Logo" width={40} height={40} className="rounded-lg" />
              <span className="text-xl font-black tracking-tighter">Restaurante<span className="text-orange-500"> El Quijote</span></span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-xs">
              Preparación culinaria nacional e internacional, así como bebidas. En el centro de Huejutla de Reyes, Hidalgo. Abiertos todos los días.
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest font-bold text-orange-500 mb-4">Visítanos</p>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li>Pzla. Hidalgo 5-1, Centro</li>
              <li>Huejutla de Reyes, Hgo. 43000</li>
              <li>Lun–Dom: 1:00 PM – 11:00 PM</li>
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest font-bold text-orange-500 mb-4">Contacto</p>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><a href="tel:+527717028172" className="hover:text-orange-500 transition-colors">+52 771 702 8172</a></li>
              <li><a href="https://www.facebook.com/ElQuijote.Huejutla" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors">Facebook</a></li>
              <li><a href="https://www.instagram.com/elquijotehuejutla/" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors">@elquijotehuejutla</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p>© 2026 Restaurante El Quijote. Todos los derechos reservados.</p>
          <p>Diseño & Desarrollo · Estudio Raíz</p>
        </div>
      </footer>

    </div>
  );
}