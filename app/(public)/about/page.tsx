"use client";

import React, { useState } from "react";
import { Star, MapPin, Clock, ShieldCheck, Award, Heart, Layers, Facebook, Minimize2, Maximize2 } from "lucide-react";
import MolinoAnimado from "@/components/landing/MolinoAnimado";
import { useTheme } from "@/hooks/useTheme";

// Componente vectorial para el logo oficial de Google Reviews
const GoogleIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className="fill-current">
    <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.113-5.136 4.113-3.41 0-6.165-2.755-6.165-6.165 0-3.41 2.756-6.165 6.165-6.165 1.548 0 2.955.57 4.04 1.514l2.98-2.979C18.993 2.1 15.816 1 11.991 1 5.92 1 1 5.92 1 11.991c0 6.07 4.92 10.992 10.991 10.992 6.327 0 10.533-4.453 10.533-10.728 0-.728-.065-1.39-.182-1.97H12.24z" />
  </svg>
);

export default function AboutPage() {
  const isDark = useTheme();
  const molinoFillColor = isDark ? "#121212" : "#ffffff";

  // Estado para controlar si la tarjeta informativa de la fachada está minimizada
  const [isMinimized, setIsMinimized] = useState(false);

  // 🗺️ URL oficial del mapa interactivo
  const googleMapsEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3721.332207652526!2d-98.4199769!3d21.1391737!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d727734590aaf3%3A0x7f2692660c8fb24b!2sRestaurante%20El%20Quijote!5e0!3m2!1ses-419!2smx!4v1783014564080!5m2!1ses-419!2smx";

  // URL exacta de la imagen vertical proporcionada
  const facadeImageUrl = "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEI-EO_F2xCuwTMc4DKBQq9qOHrIaCeBssPhvRnLkpfELlQjP_GcJihNRS5f-yebFgWyn4hQ2eq76pnGPLmEAztSrwcZEgPDO1q6QMswRjSW7UQmW8yUOCaDak3LkFCY-DbUps=w289-h312-n-k-no";

  // Datos de las opiniones con fuentes, iniciales y colores de avatar profesional
  const reviews = [
    { text: "Excelente sazón internacional y un ambiente familiar inigualable en el centro.", author: "Familia Martínez", rating: 5, source: "Google", initial: "FM", color: "bg-blue-600" },
    { text: "La propuesta de inspiración española es única en la Huasteca. Muy recomendado.", author: "Carlos R.", rating: 5, source: "Facebook", initial: "CR", color: "bg-emerald-600" },
    { text: "Ubicación céntrica ideal para comidas de oficina y reuniones sociales importantes.", author: "Ana Laura H.", rating: 4, source: "Google", initial: "AH", color: "bg-purple-600" },
    { text: "La atención al cliente es sumamente profesional. Los platillos siempre en su punto.", author: "Jorge G.", rating: 5, source: "Google", initial: "JG", color: "bg-amber-600" },
    { text: "Un lugar sofisticado, limpio y con una evolución digital excelente para reservar.", author: "Sofía Alarcón", rating: 4, source: "Facebook", initial: "SA", color: "bg-rose-600" }
  ];

  return (
    <div className="w-full bg-background text-[var(--color-text)] transition-colors duration-200">

      {/* 1. SECCIÓN INTRODUCTORIA ELEGANTE */}
      <section className="relative min-h-[70vh] flex items-center px-8 lg:px-24 overflow-hidden pt-28">
        <div className="z-10 w-full flex flex-col lg:flex-row gap-12 items-center justify-between">

          <div className="w-full lg:w-[60%] max-w-4xl text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--color-brand)]/20 bg-[var(--color-brand)]/5 text-[var(--color-brand)] text-xs font-bold uppercase tracking-widest">
              Gastronomía Internacional & Inspiración Española
            </div>

            <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-black leading-[0.95] tracking-tighter">
              Tradición, fuego y vanguardia en <span className="text-[var(--color-brand)]">El Quijote</span>
            </h1>

            <p className="text-[var(--color-text-sec)] text-lg max-w-2xl leading-relaxed">
              Consolidado como un referente gastronómico imprescindible en Huejutla de Reyes, Hidalgo.
              Nos distinguimos por construir una experiencia culinaria premium, donde cada receta
              rinde homenaje a la cultura internacional con un toque distinguido y sofisticada hospitalidad.
            </p>
          </div>

          <div className="hidden lg:flex lg:w-[40%] items-center justify-end aspect-square opacity-80">
            <MolinoAnimado
              colorClassName="text-[var(--color-brand)]"
              bgColorClassName="bg-transparent"
              fillColor={molinoFillColor}
            />
          </div>
        </div>
      </section>

      {/* 2. FILOSOFÍA INSTITUCIONAL */}
      <section className="px-8 lg:px-24 py-16 border-t border-[var(--color-border)] bg-surface/30">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-7xl mx-auto">

          <div className="p-8 rounded-2xl border border-[var(--color-border)] bg-surface space-y-4 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-brand)]/10 flex items-center justify-center text-[var(--color-brand)]">
              <Award size={22} />
            </div>
            <h3 className="text-2xl font-bold tracking-tight">Nuestra Misión</h3>
            <p className="text-[var(--color-text-sec)] leading-relaxed text-sm">
              Ofrecer alimentos y bebidas de la más alta calidad con el auténtico toque de la cocina internacional,
              garantizando una atención personalizada, eficiente y de alta fidelidad que convierta cada visita
              en un momento memorable para las familias y visitantes de la Huasteca Hidalguense.
            </p>
          </div>

          <div className="p-8 rounded-2xl border border-[var(--color-border)] bg-surface space-y-4 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-brand)]/10 flex items-center justify-center text-[var(--color-brand)]">
              <ShieldCheck size={22} />
            </div>
            <h3 className="text-2xl font-bold tracking-tight">Nuestra Visión</h3>
            <p className="text-[var(--color-text-sec)] leading-relaxed text-sm">
              Ser reconocidos como el restaurante líder e innovador en la región de la Huasteca Hidalguense,
              destacando por la modernización y digitalización de nuestros procesos, la sostenibilidad
              de nuestra cadena de valor y la lealtad absoluta de nuestros comensales.
            </p>
          </div>

        </div>
      </section>

      {/* 3. BANNER REFINADO DE RESEÑAS MULTIFUENTE */}
      <section className="w-full bg-[var(--color-brand)] py-12 overflow-hidden relative shadow-inner">
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee-elegant {
            display: flex;
            width: max-content;
            animation: marquee 65s linear infinite;
          }
          .animate-marquee-elegant:hover {
            animation-play-state: paused;
          }
        `}</style>

        <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-[var(--color-brand)] via-[var(--color-brand)]/60 to-transparent z-10" />
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-[var(--color-brand)] via-[var(--color-brand)]/60 to-transparent z-10" />

        <div className="animate-marquee-elegant gap-6 items-center">
          {[...reviews, ...reviews].map((rev, idx) => (
            <div
              key={idx}
              className="bg-white/15 dark:bg-zinc-950/20 backdrop-blur-xl border border-white/20 dark:border-zinc-800/20 p-7 rounded-2xl max-w-sm flex-shrink-0 space-y-4 cursor-pointer transition-all duration-300 hover:bg-white/25 dark:hover:bg-zinc-950/40 hover:scale-[1.02] shadow-xl"
            >
              <div className="flex justify-between items-center w-full">
                <div className="flex gap-1 text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>

                {rev.source === "Google" ? (
                  <div className="flex items-center gap-1.5 text-white bg-red-600/30 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide border border-red-400/20">
                    <GoogleIcon size={11} />
                    Google Reviews
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-white bg-blue-600/30 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide border border-blue-400/20">
                    <Facebook size={12} className="fill-current" />
                    Facebook
                  </div>
                )}
              </div>

              <p className="text-sm font-medium tracking-tight leading-relaxed italic text-white">
                "{rev.text}"
              </p>

              <div className="w-full h-px bg-white/10" />

              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${rev.color} flex items-center justify-center text-xs font-black tracking-wider text-white shadow-md flex-shrink-0`}>
                  {rev.initial}
                </div>
                <div>
                  <span className="text-xs font-bold text-white block leading-none">{rev.author}</span>
                  <span className="text-[10px] text-white/60 block mt-1 font-medium">Cliente Verificado</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. SECCIÓN LOGÍSTICA & MAPA INTERACTIVO */}
      <section className="px-8 lg:px-24 py-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

          {/* Información del Establecimiento (45% de ancho) */}
          <div className="lg:col-span-5 border border-[var(--color-border)] rounded-2xl p-8 md:p-10 flex flex-col justify-between bg-surface shadow-sm">
            <div className="space-y-8">
              <div>
                <span className="text-xs uppercase font-bold text-[var(--color-brand)] tracking-widest block mb-2">Ubicación</span>
                <div className="flex items-start gap-3">
                  <MapPin className="text-[var(--color-brand)] flex-shrink-0 mt-1" size={20} />
                  <p className="text-base font-semibold leading-relaxed">
                    Plaza Hidalgo #5-1, Colonia Centro,<br />
                    Segunda Planta (Sobre la calle Hidalgo),<br />
                    C.P. 43000, Huejutla de Reyes, Hidalgo, México.
                  </p>
                </div>
                <p className="text-xs text-[var(--color-text-sec)] mt-3 italic pl-8">
                  * Referencia de acceso: Frente a la sucursal de BBVA Bancomer, justo a un costado del establecimiento "Modas Elvia".
                </p>
              </div>

              <div className="w-full h-px bg-[var(--color-border)]" />

              <div>
                <span className="text-xs uppercase font-bold text-[var(--color-brand)] tracking-widest block mb-3">Horario Unificado</span>
                <div className="flex items-center gap-3">
                  <Clock className="text-[var(--color-brand)] flex-shrink-0" size={20} />
                  <div className="flex justify-between items-center w-full text-sm font-bold">
                    <span>Lunes a Domingo</span>
                    <span className="text-[var(--color-brand)] bg-[var(--color-brand)]/10 px-3 py-1 rounded-lg text-xs">
                      13:00 - 23:00 hrs
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <a
                href="/reservations"
                className="btn-primary w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                Planifica tu Visita <Heart size={16} />
              </a>
            </div>
          </div>

          {/* Google Maps Embed con Tarjeta Flotante Adaptada */}
          <div className="lg:col-span-7 h-[500px] lg:h-auto min-h-[520px] rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-sm relative bg-surface">

            <iframe
              src={googleMapsEmbedUrl}
              className="absolute inset-0 w-full h-full border-0"
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              title="Ubicación en Tiempo Real Corregida"
            />

            {/* 📐 CARD FLOTANTE TOTALMENTE ADAPTADO AL CONTENEDOR */}
            <div
              className={`absolute bottom-4 left-4 bg-background/95 backdrop-blur-md border border-[var(--color-border)] rounded-xl shadow-2xl z-20 transition-all duration-300 flex flex-col overflow-hidden ${
                isMinimized ? 'w-44 h-auto p-2.5' : 'w-56 h-[320px] p-3'
              }`}
            >
              {/* Cabecera del panel con botón minimizar */}
              <div className="flex items-center justify-between gap-2 flex-shrink-0 mb-2">
                <div className="flex items-center gap-1.5">
                  <Layers size={13} className="text-[var(--color-brand)]" />
                  <h4 className="text-xs font-black tracking-tight">Acceso Principal</h4>
                </div>

                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-[var(--color-text-sec)] hover:text-[var(--color-brand)] p-1 rounded-md transition-colors bg-surface/60 border border-[var(--color-border)] flex items-center justify-center"
                  title={isMinimized ? "Maximizar panel" : "Minimizar panel"}
                >
                  {isMinimized ? <Maximize2 size={11} /> : <Minimize2 size={11} />}
                </button>
              </div>

              {/* Contenedor e imagen completamente adaptada (object-cover + w-full h-full) */}
              {!isMinimized && (
                <div className="flex-1 w-full relative bg-zinc-100/50 dark:bg-zinc-800/40 rounded-lg overflow-hidden border border-[var(--color-border)]/40 animate-in fade-in duration-200">
                  <img
                    src={facadeImageUrl}
                    alt="Fachada Adaptada El Quijote"
                    /* 🔍 object-cover adapta y rellena perfectamente el contenedor sin dejar espacios vacíos */
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}
