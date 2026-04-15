'use client';

import React from "react";

import type { CartItem, CategoryKey, Combo, Dish, MenuCategory, Promo, ReservaData } from "./types";
import AboutSection from "./sections/AboutSection";
import CartDrawer from "./sections/CartDrawer";
import CategoriesSection from "./sections/CategoriesSection";
import DishModal from "./sections/DishModal";
import Footer from "./sections/Footer";
import HeroSection from "./sections/HeroSection";
import MenuSection from "./sections/MenuSection";
import Navbar from "./sections/Navbar";
import PackagesSection from "./sections/PackagesSection";
import PromotionsSection from "./sections/PromotionsSection";
import ReservaSection from "./sections/ReservaSection";
import Toast from "./sections/Toast";

type Props = {
  // Ya no necesitamos theme ni setTheme porque forzamos el diseño oscuro unificado
  toast: string | null;

  selectedDish: Dish | null;
  setSelectedDish: (dish: Dish | null) => void;

  cart: CartItem[];
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  cartCount: number;
  cartTotal: number;

  addToCart: (dish: Dish) => void;
  removeFromCart: (id: number) => void;

  PROMOS: Promo[];
  promoIndex: number;
  setPromoIndex: (idx: number) => void;
  promoRef: React.RefObject<HTMLDivElement>;
  handlePromoPrev: () => void;
  handlePromoNext: () => void;
  combos: Combo[];

  dishes: Dish[];
  categories: MenuCategory[];
  activeCategory: CategoryKey;
  setActiveCategory: (key: CategoryKey) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  filteredDishes: Dish[];
  totalInPool: number;
  visibleCount: number;
  setVisibleCount: React.Dispatch<React.SetStateAction<number>>;
  canShowMore: boolean;
  MENU_PAGE_SIZE: number;

  reservaData: ReservaData;
  setReservaData: React.Dispatch<React.SetStateAction<ReservaData>>;
  reservaOk: boolean;
  handleReserva: (e: React.FormEvent) => void;
};

export default function HomePageView(props: Props) {
  const {
    toast,
    selectedDish,
    setSelectedDish,
    cart,
    cartOpen,
    setCartOpen,
    cartCount,
    cartTotal,
    addToCart,
    removeFromCart,
    PROMOS,
    promoIndex,
    setPromoIndex,
    promoRef,
    handlePromoPrev,
    handlePromoNext,
    combos,
    dishes,
    categories,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    filteredDishes,
    totalInPool,
    visibleCount,
    setVisibleCount,
    canShowMore,
    MENU_PAGE_SIZE,
    reservaData,
    setReservaData,
    reservaOk,
    handleReserva,
  } = props;

  const distinctImageDishes = React.useMemo(() => {
    const seen = new Set<string>();
    return dishes.filter((dish) => {
      if (!dish.img) return false;
      let key = dish.img.trim();
      try {
        const url = new URL(key);
        key = `${url.origin}${url.pathname}`;
      } catch {
        key = key.toLowerCase();
      }
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [dishes]);

  return (
    <div className="min-h-screen bg-[#0c0a09] text-white transition-colors duration-500 selection:bg-amber-500/30">
      {/* Google Fonts globales - aplican a toda la página */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,700&family=DM+Sans:wght@400;500;600;700&display=swap');
        
        /* Aplica las fuentes por defecto a todo el documento */
        body {
          font-family: 'DM Sans', sans-serif;
        }
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Playfair Display', Georgia, serif;
        }
      `}</style>

      <Toast toast={toast} />

      <DishModal
        dish={selectedDish}
        onClose={() => setSelectedDish(null)}
        onAddToCart={addToCart}
      />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        cartCount={cartCount}
        cartTotal={cartTotal}
        onRemove={removeFromCart}
        onAdd={(item: CartItem) => addToCart(item)}
      />

      {/* Navbar: se le pasa un theme fijo "dark" para que se adapte */}
      <Navbar
        theme="dark"
        setTheme={() => {}} // No-op, ya no cambiamos tema
        cartCount={cartCount}
        onOpenCart={() => setCartOpen(true)}
      />

      <HeroSection />

      {/* ─── GALERÍA DE PLATILLOS (mantiene su diseño, ahora integrado) ─── */}
      <section className="relative py-24 px-6 lg:px-16 overflow-hidden">
        {/* Fondo con textura sutil (misma textura que antes) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff'%3E%3Crect x='19' y='19' width='2' height='2'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mb-14">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.4em] text-amber-400 font-bold mb-4">
                Galería de platillos
              </p>
              <h2 className="text-5xl lg:text-6xl font-bold leading-[1.1]">
                Cada plato,{" "}
                <em className="text-amber-400 not-italic">una obra</em>
              </h2>
              <p className="mt-4 text-base text-stone-400 leading-relaxed">
                {/* texto opcional */}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span aria-hidden="true" className="h-px w-10 bg-amber-400/30" />
              <span className="text-sm text-stone-400">
                {distinctImageDishes.length} platillos únicos
              </span>
            </div>
          </div>

          {/* Grid de platillos */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {distinctImageDishes.map((dish) => (
              <button
                key={dish.id}
                type="button"
                onClick={() => setSelectedDish(dish)}
                className="group relative overflow-hidden rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <div className="relative h-56 sm:h-64">
                  <img
                    src={dish.img}
                    alt={dish.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <div className="absolute inset-0 bg-amber-400/0 group-hover:bg-amber-400/6 transition-colors duration-300" />

                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <span className="inline-flex rounded-full bg-white/10 border border-white/20 backdrop-blur-sm px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80">
                      {dish.catLabel}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <span className="inline-flex rounded-full bg-amber-400 px-3 py-1 text-[10px] font-bold text-stone-900">
                      Ver
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-[#161310]">
                  <h3 className="text-base font-bold text-white line-clamp-2 leading-snug">
                    {dish.name}
                  </h3>
                  <p className="mt-1.5 text-xs text-stone-500 line-clamp-2 leading-relaxed">
                    {dish.desc || "Platillo delicioso del menú."}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-base font-bold text-amber-400">
                      {dish.price}
                    </span>
                    <span className="rounded-full bg-amber-400/10 border border-amber-400/30 px-3 py-1 text-xs font-semibold text-amber-400 group-hover:bg-amber-400 group-hover:text-stone-900 transition-colors duration-200">
                      Ver
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* El resto de secciones ahora heredan el fondo y tipografía oscura */}
      <CategoriesSection
        categories={categories}
        dishes={dishes}
        onSelectCategory={setActiveCategory}
      />

      <PromotionsSection
        PROMOS={PROMOS}
        promoIndex={promoIndex}
        setPromoIndex={setPromoIndex}
        promoRef={promoRef}
        handlePromoPrev={handlePromoPrev}
        handlePromoNext={handlePromoNext}
      />

      <PackagesSection combos={combos} />

      <MenuSection
        dishes={dishes}
        categories={categories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredDishes={filteredDishes}
        totalInPool={totalInPool}
        visibleCount={visibleCount}
        setVisibleCount={setVisibleCount}
        canShowMore={canShowMore}
        MENU_PAGE_SIZE={MENU_PAGE_SIZE}
        onSelectDish={setSelectedDish}
        onAddToCart={addToCart}
      />

      <AboutSection />

      <ReservaSection
        reservaData={reservaData}
        setReservaData={setReservaData}
        reservaOk={reservaOk}
        handleReserva={handleReserva}
      />

      <Footer />
    </div>
  );
}