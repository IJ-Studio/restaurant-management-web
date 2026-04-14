import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, Tag } from "lucide-react";
import { SkeletonCard } from "./SkeletonCard";

interface Promo {
  id: string;
  badge: string;
  title: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  color: string;
}

export default function PromosSection({
  promos,
  loading,
}: {
  promos: Promo[];
  loading: boolean;
}) {
  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePrev = () => setIndex((i) => Math.max(i - 1, 0));
  const handleNext = () => setIndex((i) => Math.min(i + 1, promos.length - 1));

  if (loading) {
    return (
      <section className="py-20 px-8 lg:px-24">
        <div className="flex justify-between items-end mb-12">
          <div>
            <div className="skeleton-title w-48 h-8" />
          </div>
          <div className="flex gap-2">
            <div className="skeleton w-10 h-10 rounded-xl" />
            <div className="skeleton w-10 h-10 rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      id="promociones"
      className="py-20 bg-[var(--color-surface-alt)] px-8 lg:px-24 rounded-[4rem] mx-4 md:mx-8"
    >
      <div className="flex justify-between items-end mb-12">
        <div>
          <p className="text-xs uppercase tracking-widest text-[var(--color-brand)] font-bold mb-1 flex items-center gap-1.5">
            <Tag size={12} /> Ofertas especiales
          </p>
          <h2 className="text-4xl font-black tracking-tight">
            Nuestras Promociones
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrev}
            disabled={index === 0}
            className="w-10 h-10 rounded-xl border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-brand)] hover:text-white hover:border-[var(--color-brand)] transition-all disabled:opacity-30"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={handleNext}
            disabled={index >= promos.length - 1}
            className="w-10 h-10 rounded-xl border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-brand)] hover:text-white hover:border-[var(--color-brand)] transition-all disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div className="overflow-hidden" ref={containerRef}>
        <div
          className="flex gap-6 transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(calc(-${index} * (min(360px, 85vw) + 24px)))`,
          }}
        >
          {promos.map((promo) => (
            <div
              key={promo.id}
              className={`promo-card bg-gradient-to-br ${promo.color}`}
            >
              <span className="promo-badge">{promo.badge}</span>
              <h3 className="promo-title">{promo.title}</h3>
              <p className="promo-desc">{promo.description}</p>
              <div className="promo-price">
                <span className="promo-price-new">
                  ${promo.discountedPrice.toLocaleString()}
                </span>
                <span className="promo-price-old">
                  ${promo.originalPrice.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-2 mt-6 justify-center">
        {promos.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`rounded-full transition-all ${i === index ? "w-6 h-2 bg-[var(--color-brand)]" : "w-2 h-2 bg-[var(--color-border)]"}`}
          />
        ))}
      </div>
    </section>
  );
}
