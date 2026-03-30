import React, { useRef } from "react";
import Image from "next/image";

import type { CategoryKey, Dish, MenuCategory } from "../types";
import { Clock, Plus, Star, X } from "../icons";

type Props = {
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
  onSelectDish: (dish: Dish) => void;
  onAddToCart: (dish: Dish) => void;
};

export default function MenuSection({
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
  onSelectDish,
  onAddToCart,
}: Props) {
  const pillsRef = useRef<HTMLDivElement>(null);

  function scrollPills(delta: number) {
    pillsRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  }

  return (
    <section id="menu" className="py-24 px-8 lg:px-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h2 className="text-4xl font-black mb-2 tracking-tight">Nuestro Menú</h2>
          <div className="h-1.5 w-20 bg-orange-500 rounded-full" />
        </div>
      </div>

      <div className="sticky top-20 z-30 bg-white/70 dark:bg-black/40 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[2.5rem] p-5 mb-6 shadow-2xl shadow-black/10">
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Busca por nombre, descripción o categoría…"
              className="w-full bg-gray-50/70 dark:bg-[#161616]/60 border border-black/10 dark:border-white/10 rounded-2xl pl-11 pr-12 py-4 text-base font-semibold outline-none focus:border-orange-500 transition-colors"
            />
            {searchQuery.trim().length > 0 && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                aria-label="Limpiar búsqueda"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <div className="relative">
            <div
              ref={pillsRef}
              className="no-scrollbar flex gap-2 overflow-x-auto flex-nowrap pb-1"
            >
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`shrink-0 px-5 py-2.5 rounded-xl text-sm font-black transition-all border ${
                    activeCategory === cat.key
                      ? "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/30"
                      : "bg-transparent border-black/10 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-orange-500/50 hover:text-orange-500"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center justify-between pointer-events-none absolute inset-y-0 -left-3 -right-3">
              <button
                type="button"
                onClick={() => scrollPills(-520)}
                className="pointer-events-auto w-11 h-11 rounded-2xl border border-black/10 dark:border-white/10 bg-white/30 dark:bg-black/40 backdrop-blur flex items-center justify-center hover:border-orange-500/40 hover:text-orange-500 transition-all shadow-lg shadow-black/10"
                aria-label="Categorías anteriores"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => scrollPills(520)}
                className="pointer-events-auto w-11 h-11 rounded-2xl border border-black/10 dark:border-white/10 bg-white/30 dark:bg-black/40 backdrop-blur flex items-center justify-center hover:border-orange-500/40 hover:text-orange-500 transition-all shadow-lg shadow-black/10"
                aria-label="Categorías siguientes"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white dark:from-[#0f0f0f] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white dark:from-[#0f0f0f] to-transparent" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
          Mostrando {filteredDishes.length} de {totalInPool}{" "}
          {searchQuery.trim() ? "resultados" : "platillos"}
        </p>
        {activeCategory === "todo" &&
          searchQuery.trim().length === 0 &&
          dishes.length > totalInPool && (
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Selección destacada: {totalInPool} de {dishes.length} platillos. Usa
            las categorías para ver el resto.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredDishes.map((dish) => (
          <div
            key={dish.id}
            onClick={() => onSelectDish(dish)}
            className="group bg-gray-50 dark:bg-[#161616] rounded-[2.5rem] overflow-hidden border border-black/5 dark:border-white/5 hover:border-orange-500/30 hover:shadow-xl transition-all duration-300 cursor-pointer"
          >
            <div className="relative h-52">
              <Image
                src={dish.img}
                alt={dish.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
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
              <p className="text-xs uppercase tracking-widest text-orange-500 font-bold mb-1">
                {(dish.catIcon ? `${dish.catIcon} ` : "") + dish.catLabel}
              </p>
              <h3 className="text-lg font-black mb-2 leading-tight">
                {dish.name}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed mb-4 line-clamp-2">
                {dish.desc}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Star size={12} fill className="text-yellow-500" />{" "}
                    {dish.rating}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {dish.time}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(dish);
                  }}
                  className="w-9 h-9 bg-orange-500 hover:bg-orange-600 text-white rounded-xl flex items-center justify-center transition-all active:scale-90 shadow-md shadow-orange-500/30"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(canShowMore || visibleCount > MENU_PAGE_SIZE) && (
        <div className="mt-10 flex flex-col items-center gap-3">
          {canShowMore && (
            <button
              onClick={() =>
                setVisibleCount((c) => Math.min(c + MENU_PAGE_SIZE, totalInPool))
              }
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-orange-500/20 transition-all active:scale-95"
            >
              Mostrar {Math.min(MENU_PAGE_SIZE, totalInPool - visibleCount)} más
            </button>
          )}
          {visibleCount > MENU_PAGE_SIZE && (
            <button
              onClick={() => {
                setVisibleCount(MENU_PAGE_SIZE);
                document
                  .getElementById("menu")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors"
            >
              Mostrar menos
            </button>
          )}
        </div>
      )}
    </section>
  );
}
