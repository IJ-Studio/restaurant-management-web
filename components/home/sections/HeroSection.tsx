import React from "react";
import Image from "next/image";

import { Calendar, Utensils } from "../icons";

export default function HeroSection() {
  return (
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
          Cocina mexicana de alta gama. Ingredientes de temporada, técnica
          contemporánea, sabor de siempre.
        </p>
        <div className="flex flex-wrap gap-5">
          <a
            href="#menu"
            className="group bg-orange-600 hover:bg-orange-700 text-white px-10 py-5 rounded-2xl font-bold transition-all flex items-center gap-3 shadow-xl shadow-orange-900/20"
          >
            Ver Menú <Utensils size={20} />
          </a>
          <a
            href="#reserva"
            className="group border-2 border-black/10 dark:border-white/10 hover:border-orange-500 px-10 py-5 rounded-2xl font-bold transition-all flex items-center gap-3"
          >
            Reservar Mesa <Calendar size={20} />
          </a>
        </div>

        <div className="flex gap-10 mt-14 pt-10 border-t border-black/10 dark:border-white/10">
          {[
            ["16+", "Años"],
            ["80+", "Platillos"],
            ["4.9★", "Calificación"],
          ].map(([n, l]) => (
            <div key={l}>
              <p className="text-3xl font-black text-orange-500">{n}</p>
              <p className="text-xs uppercase tracking-widest text-gray-500 mt-0.5">
                {l}
              </p>
            </div>
          ))}
        </div>
      </div>

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
  );
}

