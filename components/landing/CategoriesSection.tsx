"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

interface CategoriesSectionProps {
  categories: Category[];
  onSelectCategory: (id: string) => void;
  activeCategory: string;
  loading?: boolean;
}

export default function CategoriesSection({
  categories,
  onSelectCategory,
  activeCategory,
  loading = false,
}: CategoriesSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  // Ancho de cada card + gap
  const STEP = 220 + 24;

  const scroll = (dir: "prev" | "next") => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "next" ? STEP * 2 : -STEP * 2, behavior: "smooth" });
  };

  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [categories]);

  if (loading) return <div />;

  return (
    <section className="py-20 px-8 lg:px-24">
      {/* Encabezado */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-4xl font-black mb-2 tracking-tight">Categorías</h2>
          <div className="h-1.5 w-20 bg-[var(--color-brand)] rounded-full" />
        </div>
        {/* Flechas */}
        <div className="flex gap-2">
          <button
            onClick={() => scroll("prev")}
            disabled={!canPrev}
            className="w-10 h-10 rounded-xl border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-brand)] hover:text-white hover:border-[var(--color-brand)] transition-all disabled:opacity-30"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll("next")}
            disabled={!canNext}
            className="w-10 h-10 rounded-xl border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-brand)] hover:text-white hover:border-[var(--color-brand)] transition-all disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Track deslizable */}
      <div
        ref={trackRef}
        className="flex gap-6 overflow-x-auto scroll-smooth pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            style={{ minWidth: "220px" }}
            className={`group flex-shrink-0 bg-[var(--color-surface)] p-7 rounded-[2rem] border border-[var(--color-border)] hover:border-[var(--color-brand)]/50 transition-all cursor-pointer text-left ${
              activeCategory === cat.id ? "ring-2 ring-[var(--color-brand)]" : ""
            }`}
          >
            <div className="w-14 h-14 bg-[var(--color-brand)]/10 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-[var(--color-brand)] group-hover:scale-110 transition-all">
              <img src={cat.icon} alt={cat.name} className="w-8 h-8 object-contain" />
            </div>
            <h3 className="text-lg font-bold">{cat.name}</h3>
            <p className="text-xs text-[var(--color-text-sec)] mt-1">{cat.count} platillos</p>
          </button>
        ))}
      </div>
    </section>
  );
}
