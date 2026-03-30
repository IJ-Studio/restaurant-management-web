import React, { useMemo, useRef, useState } from "react";

import type { Dish, MenuCategory } from "../types";
import { ChevronLeft, ChevronRight, X } from "../icons";

const CAT_ICONS: Record<string, string> = {
  Entrantes: "🥗",
  Sopas: "🍲",
  Principales: "🍽️",
  Postres: "🍮",
  Bebidas: "🍹",
};

type Props = {
  categories: MenuCategory[];
  dishes: Dish[];
  onSelectCategory: (key: string) => void;
};

export default function CategoriesSection({
  categories,
  dishes,
  onSelectCategory,
}: Props) {
  const cats = useMemo(
    () => categories.filter((c) => c.key !== "todo"),
    [categories],
  );
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [openAll, setOpenAll] = useState(false);
  const [query, setQuery] = useState("");

  const filteredCats = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cats;
    return cats.filter((c) => c.label.toLowerCase().includes(q));
  }, [cats, query]);

  function selectAndGo(key: string) {
    onSelectCategory(key);
    setOpenAll(false);
    setQuery("");
    document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
  }

  function scrollBy(delta: number) {
    scrollerRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  }

  return (
    <section className="py-20 px-8 lg:px-24">
      <div className="flex justify-between items-end mb-12">
        <div className="text-left">
          <h2 className="text-4xl font-black mb-2 tracking-tight">Categorías</h2>
          <div className="h-1.5 w-20 bg-orange-500 rounded-full" />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpenAll(true)}
            className="hidden md:inline-flex px-4 py-2 rounded-xl text-sm font-black border border-black/10 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-orange-500/40 hover:text-orange-500 transition-colors"
          >
            Ver todas
          </button>
          <a
            href="#menu"
            className="group text-orange-500 flex items-center gap-2 font-bold"
          >
            Ver menú <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
      <div className="relative">
        <div
          ref={scrollerRef}
          className="no-scrollbar flex gap-6 overflow-x-auto pb-1 snap-x snap-mandatory"
        >
          {cats.map((cat) => (
            <button
              key={cat.key}
              onClick={() => selectAndGo(cat.key)}
              className="snap-start shrink-0 min-w-[240px] md:min-w-[260px] group bg-gray-50 dark:bg-[#161616] p-8 rounded-[2rem] border border-black/5 dark:border-white/5 hover:border-orange-500/50 transition-all cursor-pointer text-left"
            >
              <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-5 text-2xl group-hover:bg-orange-500 group-hover:scale-110 transition-all">
                {cat.icon ?? CAT_ICONS[cat.label] ?? "🍽️"}
              </div>
              <h3 className="text-lg font-bold">{cat.label}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {dishes.filter((d) => d.catKey === cat.key).length} platillos
              </p>
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center justify-between pointer-events-none absolute inset-y-0 -left-3 -right-3">
          <button
            type="button"
            onClick={() => scrollBy(-520)}
            className="pointer-events-auto w-11 h-11 rounded-2xl border border-black/10 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur flex items-center justify-center hover:border-orange-500/40 hover:text-orange-500 transition-all shadow-lg shadow-black/10"
            aria-label="Categorías anteriores"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(520)}
            className="pointer-events-auto w-11 h-11 rounded-2xl border border-black/10 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur flex items-center justify-center hover:border-orange-500/40 hover:text-orange-500 transition-all shadow-lg shadow-black/10"
            aria-label="Categorías siguientes"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white dark:from-[#0f0f0f] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white dark:from-[#0f0f0f] to-transparent" />
      </div>

      {openAll && (
        <div className="fixed inset-0 z-[160] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161616] rounded-[2.5rem] max-w-3xl w-full border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-black/5 dark:border-white/5">
              <div>
                <p className="text-xs uppercase tracking-widest text-orange-500 font-bold mb-1">Categorías</p>
                <h3 className="text-xl font-black">Elige una categoría</h3>
              </div>
              <button
                onClick={() => { setOpenAll(false); setQuery(""); }}
                className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-colors"
                aria-label="Cerrar"
              >
                <X />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar categoría…"
                  className="w-full bg-gray-50 dark:bg-[#0f0f0f] border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto pr-1">
                {filteredCats.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => selectAndGo(cat.key)}
                    className="group flex items-center gap-3 p-4 rounded-2xl border border-black/5 dark:border-white/5 hover:border-orange-500/40 hover:bg-orange-500/5 transition-all text-left"
                  >
                    <div className="w-11 h-11 bg-orange-500/10 rounded-2xl flex items-center justify-center text-xl group-hover:bg-orange-500 group-hover:scale-110 transition-all">
                      {cat.icon ?? CAT_ICONS[cat.label] ?? "🍽️"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-sm truncate">{cat.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {dishes.filter((d) => d.catKey === cat.key).length} platillos
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
