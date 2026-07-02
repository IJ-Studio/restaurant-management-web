"use client";

import { useState, useEffect } from "react";
import { Utensils, Calendar } from "lucide-react";
import MolinoAnimado from "@/components/landing/MolinoAnimado";
import { useTheme } from "@/hooks/useTheme";
// Importamos el servicio que ya lee la configuración (horarios) del backend
import { SettingsService } from "@/features/shared/services/dataService";
import { cn } from "@/lib/utils";

interface HeroProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  stats: Array<{ value: string; label: string }>;
  loading?: boolean;
}

export default function Hero({
  title,
  subtitle,
  ctaText,
  ctaLink,
  stats,
}: HeroProps) {
  const isDark = useTheme();
  const [isOpenNow, setIsOpenNow] = useState<boolean | null>(null);

  // Evaluar horario del restaurante obtenido desde el SettingsService
  useEffect(() => {
    const checkRestaurantStatus = () => {
      const settings = SettingsService.getSettings();

      if (!settings) {
        setIsOpenNow(true); // Fallback amigable por si no han cargado los settings
        return;
      }

      // Supongamos que settings contiene cadenas tipo "09:00" y "22:00"
      // Si tus propiedades se llaman diferente (ej. openingTime / closingTime), adáptalas aquí:
      const openTimeStr = (settings as any).openingTime || "08:00";
      const closeTimeStr = (settings as any).closingTime || "22:00";

      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimeInMinutes = currentHour * 60 + currentMinute;

      // Parsear hora de apertura
      const [openH, openM] = openTimeStr.split(":").map(Number);
      const openTimeInMinutes = openH * 60 + openM;

      // Parsear hora de cierre
      const [closeH, closeM] = closeTimeStr.split(":").map(Number);
      const closeTimeInMinutes = closeH * 60 + closeM;

      // Validar si la hora actual está dentro del rango permitido por la base de datos
      if (currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes < closeTimeInMinutes) {
        setIsOpenNow(true);
      } else {
        setIsOpenNow(false);
      }
    };

    checkRestaurantStatus();
    // Revalidar cada 60 segundos por si cambia el estado mientras el usuario está en la Landing Page
    const interval = setInterval(checkRestaurantStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const molinoFillColor = isDark ? "#121212" : "#ffffff";

  return (
    <section className="relative min-h-screen flex items-center px-8 lg:px-24 overflow-hidden pt-20">
      <div className="z-10 w-full flex flex-col lg:flex-row gap-12 items-start justify-between">
        <div className="w-full lg:w-[50%] max-w-4xl text-left">

          {/* 👇 LETRERO COMPLETAMENTE DINÁMICO SEGÚN LA BD */}
          {isOpenNow !== null && (
            <div
              className={cn(
                "inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-widest mb-6 transition-all duration-300",
                isOpenNow
                  ? "bg-[var(--color-brand)]/10 border-[var(--color-brand)]/20 text-[var(--color-brand)]"
                  : "bg-red-500/10 border-red-500/20 text-red-500"
              )}
            >
              <span className={cn("w-1.5 h-1.5 rounded-full inline-block animate-pulse", isOpenNow ? "bg-[var(--color-brand)]" : "bg-red-500")}></span>
              {isOpenNow ? "Abierto ahora · Lun–Dom" : "Cerrado por ahora · Visítanos pronto"}
            </div>
          )}

          <h1
            className="text-[clamp(3rem,6vw,6rem)] font-black mb-6 leading-[0.9] tracking-tighter"
            dangerouslySetInnerHTML={{ __html: title }}
          />
          <p className="text-[var(--color-text-sec)] text-[clamp(1rem,1.5vw,1.25rem)] mb-10 max-w-lg leading-relaxed">
            {subtitle}
          </p>
          <div className="flex flex-wrap gap-5">
            <a href={ctaLink} className="btn-primary flex items-center gap-3">
              {ctaText} <Utensils size={20} />
            </a>

            {/* 👇 BOTÓN DE RESERVA REDIRIGIENDO A /reservations */}
            <a
              href="/reservations"
              className="border-2 border-[var(--color-border)] hover:border-[var(--color-brand)] px-10 py-5 rounded-2xl font-bold transition-all flex items-center gap-3 bg-surface"
            >
              Reservar Mesa <Calendar size={20} />
            </a>
          </div>

          <div className="flex gap-10 mt-14 pt-10 border-t border-[var(--color-border)]">
            {stats.map((stat, i) => (
              <div key={i}>
                <p className="text-3xl font-black text-[var(--color-brand)]">
                  {stat.value}
                </p>
                <p className="text-xs uppercase tracking-widest text-[var(--color-text-sec)] mt-0.5">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden lg:flex lg:w-[50%] w-full items-start justify-end aspect-square">
          <MolinoAnimado
            colorClassName="text-[var(--color-brand)]"
            bgColorClassName="bg-transparent"
            fillColor={molinoFillColor}
          />
        </div>
      </div>
    </section>
  );
}
