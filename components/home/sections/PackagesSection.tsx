import React from "react";

import type { Combo } from "../types";

const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

type Props = {
  combos: Combo[];
};

export default function PackagesSection({ combos }: Props) {
  if (!combos || combos.length === 0) return null;

  return (
    <section className="py-20 px-8 lg:px-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <p className="text-xs uppercase tracking-widest text-orange-500 font-bold mb-2">
            Paquetes especiales
          </p>
          <h2 className="text-4xl font-black mb-2 tracking-tight">
            Cenas <span className="text-orange-500">Románticas</span>
          </h2>
          <div className="h-1.5 w-20 bg-orange-500 rounded-full" />
        </div>
        <a
          href="#reserva"
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl font-black transition-all active:scale-95 shadow-xl shadow-orange-500/20"
        >
          Reservar ahora
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {combos.map((c) => (
          <div
            key={c.id}
            className="bg-gray-50 dark:bg-[#161616] rounded-[2.5rem] p-8 border border-black/5 dark:border-white/5 hover:border-orange-500/30 hover:shadow-xl transition-all"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-widest text-orange-500 font-bold mb-1">
                  Paquete
                </p>
                <h3 className="text-xl font-black leading-tight">{c.nombre}</h3>
              </div>
              <span className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-500 font-black">
                ❤
              </span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              {c.descripcion}
            </p>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black text-orange-500">
                {money.format(c.precio)}
              </span>
              {c.precioRegular != null && Number.isFinite(c.precioRegular) && (
                <span className="text-gray-400 line-through text-lg">
                  {money.format(c.precioRegular)}
                </span>
              )}
            </div>

            <div className="mt-6">
              <a
                href="#reserva"
                className="w-full inline-flex items-center justify-center bg-black/90 dark:bg-white/10 hover:bg-orange-500 text-white px-5 py-3 rounded-2xl font-black transition-all"
              >
                Elegir este paquete
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

