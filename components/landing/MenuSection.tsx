"use client";

import { useState } from "react";
import { Star, Clock, Plus, ChevronDown } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image: string;
  tag?: string;
  rating: number;
  prepTime: string;
}

interface MenuSectionProps {
  items: MenuItem[];
  categories: { id: string; name: string }[];
  activeCategory: string;
  onSelectCategory: (id: string) => void;
  onAddToCart: (item: MenuItem) => void;
  onSelectItem: (item: MenuItem) => void;
  loading: boolean;
}

// Cuántos items mostrar inicialmente (3 filas × 4 columnas = 12)
const COLS = 4;
const ROWS_INITIAL = 3;
const INITIAL_COUNT = COLS * ROWS_INITIAL;

export default function MenuSection({
  items,
  categories,
  activeCategory,
  onSelectCategory,
  onAddToCart,
  onSelectItem,
}: MenuSectionProps) {
  const [expanded, setExpanded] = useState(false);

  const visibleItems = expanded ? items : items.slice(0, INITIAL_COUNT);
  const hasMore = items.length > INITIAL_COUNT;

  return (
    <section id="menu" className="py-24 px-8 lg:px-24">
      {/* Encabezado + filtros de categoría */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h2 className="text-4xl font-black mb-2 tracking-tight">Nuestro Menú</h2>
          <div className="h-1.5 w-20 bg-[var(--color-brand)] rounded-full" />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                onSelectCategory(cat.id);
                setExpanded(false); // Resetear al cambiar de categoría
              }}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                activeCategory === cat.id
                  ? "bg-[var(--color-brand)] text-white border-[var(--color-brand)] shadow-lg shadow-[var(--color-brand)]/30"
                  : "bg-transparent border-[var(--color-border)] text-[var(--color-text-sec)] hover:border-[var(--color-brand)]/50 hover:text-[var(--color-brand)]"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de platillos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {visibleItems.map((item) => (
          <div
            key={item.id}
            className="menu-card group"
            onClick={() => onSelectItem(item)}
          >
            {/* Imagen / placeholder */}
            <div className="menu-card-image">
              <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                <span className="text-4xl">🍽️</span>
              </div>
              {item.tag && <span className="menu-card-tag">{item.tag}</span>}
              <div className="menu-card-price">${item.price.toLocaleString()}</div>
            </div>

            <div className="menu-card-content">
              <p className="menu-card-category">{item.category}</p>
              <h3 className="menu-card-title">{item.name}</h3>
              <p className="menu-card-desc">{item.description}</p>
              <div className="menu-card-footer">
                <div className="menu-card-rating">
                  <Star size={12} fill="var(--color-brand)" className="text-[var(--color-brand)]" />{" "}
                  {item.rating}
                  <span className="mx-1">·</span>
                  <Clock size={12} /> {item.prepTime}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(item);
                  }}
                  className="menu-card-add"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Botón Ver más / Ver menos */}
      {hasMore && (
        <div className="mt-12 flex justify-center">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="group flex items-center gap-2 px-8 py-3.5 rounded-2xl border-2 border-[var(--color-brand)] text-[var(--color-brand)] font-bold text-sm hover:bg-[var(--color-brand)] hover:text-white transition-all duration-300 shadow-lg shadow-[var(--color-brand)]/10"
          >
            {expanded ? (
              <>
                Ver menos
                <ChevronDown size={18} className="rotate-180 transition-transform duration-300" />
              </>
            ) : (
              <>
                Ver más platillos
                <ChevronDown size={18} className="group-hover:translate-y-0.5 transition-transform duration-300" />
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
}
