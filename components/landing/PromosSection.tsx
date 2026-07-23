"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Tag } from "lucide-react";
import { type Promotion } from "@/features/shared/data/promotions";

export default function PromosSection({
  promos,
  loading,
}: {
  promos: Promotion[];
  loading?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  // Ancho de la card + gap
  const CARD_W = 360;
  const GAP = 24;

  const goTo = (i: number) => {
    const clamped = Math.max(0, Math.min(i, promos.length - 1));
    setIndex(clamped);
    trackRef.current?.scrollTo({ left: clamped * (CARD_W + GAP), behavior: "smooth" });
  };

  // Sincronizar el estado de dot con el scroll real (arrastre táctil)
  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const newIndex = Math.round(el.scrollLeft / (CARD_W + GAP));
    setIndex(newIndex);
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [promos]);

  if (!loading && promos.length === 0) return null;

  return (
    <section
      id="promociones"
      className="py-20 bg-[var(--color-surface-alt)] px-8 lg:px-24 rounded-[4rem] mx-4 md:mx-8"
    >
      {/* Encabezado */}
      <div className="flex justify-between items-end mb-12">
        <div>
          <p className="text-xs uppercase tracking-widest text-[var(--color-brand)] font-bold mb-1 flex items-center gap-1.5">
            <Tag size={12} /> Ofertas especiales
          </p>
          <h2 className="text-4xl font-black tracking-tight">Nuestras Promociones</h2>
        </div>
        {/* Flechas */}
        <div className="flex gap-2">
          <button
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
            className="w-10 h-10 rounded-xl border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-brand)] hover:text-white hover:border-[var(--color-brand)] transition-all disabled:opacity-30"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => goTo(index + 1)}
            disabled={index >= promos.length - 1}
            className="w-10 h-10 rounded-xl border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-brand)] hover:text-white hover:border-[var(--color-brand)] transition-all disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Track con scroll-snap */}
      <div
        ref={trackRef}
        className="flex gap-6 overflow-x-auto pb-2"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          scrollSnapType: "x mandatory",
        }}
      >
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                style={{ minWidth: "min(360px, 85vw)", scrollSnapAlign: "start" }}
                className="promo-card bg-[var(--color-border)]/30 animate-pulse flex-shrink-0"
              />
            ))
          : promos.map((promo) => (
              <div
                key={promo.id}
                style={{ minWidth: "min(360px, 85vw)", scrollSnapAlign: "start" }}
                className={`promo-card relative overflow-hidden bg-gradient-to-br ${promo.color} flex-shrink-0`}
              >
                {promo.imageUrl && (
                  <img
                    src={promo.imageUrl}
                    alt={promo.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-30"
                  />
                )}
                {!promo.imageUrl && promo.emoji && (
                  <span className="absolute right-2 top-2 text-7xl opacity-20 rotate-12">
                    {promo.emoji}
                  </span>
                )}
                <div className="relative z-10">
                  {promo.badge && <span className="promo-badge">{promo.badge}</span>}
                  <h3 className="promo-title">{promo.title}</h3>
                  <p className="promo-desc">{promo.description}</p>
                  {(promo.discountedPrice != null || promo.originalPrice != null) && (
                    <div className="promo-price">
                      {promo.discountedPrice != null && (
                        <span className="promo-price-new">
                          ${promo.discountedPrice.toLocaleString()}
                        </span>
                      )}
                      {promo.originalPrice != null && (
                        <span className="promo-price-old">
                          ${promo.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}
                  {promo.endDate && (
                    <p className="text-xs text-[var(--color-text-sec)] mt-3 font-semibold">
                      Válido hasta {promo.endDate}
                    </p>
                  )}
                </div>
              </div>
            ))}
      </div>

      {/* Dots */}
      <div className="flex gap-2 mt-6 justify-center">
        {promos.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all ${
              i === index
                ? "w-6 h-2 bg-[var(--color-brand)]"
                : "w-2 h-2 bg-[var(--color-border)]"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
