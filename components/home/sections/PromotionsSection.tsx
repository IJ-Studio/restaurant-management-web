import React from "react";

import type { Promo } from "../types";
import { ChevronLeft, ChevronRight, Tag } from "../icons";

type Props = {
  PROMOS: Promo[];
  promoIndex: number;
  setPromoIndex: (idx: number) => void;
  promoRef: React.RefObject<HTMLDivElement>;
  handlePromoPrev: () => void;
  handlePromoNext: () => void;
};

export default function PromotionsSection({
  PROMOS,
  promoIndex,
  setPromoIndex,
  promoRef,
  handlePromoPrev,
  handlePromoNext,
}: Props) {
  return (
    <section
      id="promociones"
      className="py-20 bg-gray-50 dark:bg-[#0a0a0a] px-8 lg:px-24 rounded-[4rem] mx-4 md:mx-8"
    >
      <div className="flex justify-between items-end mb-12">
        <div>
          <p className="text-xs uppercase tracking-widest text-orange-500 font-bold mb-1 flex items-center gap-1.5">
            <Tag size={12} /> Ofertas especiales
          </p>
          <h2 className="text-4xl font-black tracking-tight">
            Nuestras Promociones
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePromoPrev}
            disabled={promoIndex === 0}
            className="w-10 h-10 rounded-xl border border-black/10 dark:border-white/10 flex items-center justify-center hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={handlePromoNext}
            disabled={promoIndex >= PROMOS.length - 1}
            className="w-10 h-10 rounded-xl border border-black/10 dark:border-white/10 flex items-center justify-center hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="overflow-hidden" ref={promoRef}>
        <div
          className="flex gap-6 transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(calc(-${promoIndex} * (min(360px, 85vw) + 24px)))`,
          }}
        >
          {PROMOS.map((promo) => (
            <div
              key={promo.id}
              className={`min-w-[min(360px,85vw)] bg-gradient-to-br ${promo.color} border border-black/5 dark:border-white/5 rounded-[2.5rem] p-8 flex-shrink-0 hover:-translate-y-1 transition-all cursor-pointer`}
            >
              <span className="inline-block bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                {promo.badge}
              </span>
              <h3 className="text-2xl font-black mb-3">{promo.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                {promo.desc}
              </p>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-orange-500">
                  {promo.price}
                </span>
                {promo.originalPrice ? (
                  <span className="text-gray-400 line-through text-lg">
                    {promo.originalPrice}
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mt-6 justify-center">
        {PROMOS.map((_, i) => (
          <button
            key={i}
            onClick={() => setPromoIndex(i)}
            className={`rounded-full transition-all ${
              i === promoIndex
                ? "w-6 h-2 bg-orange-500"
                : "w-2 h-2 bg-gray-300 dark:bg-gray-600"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
