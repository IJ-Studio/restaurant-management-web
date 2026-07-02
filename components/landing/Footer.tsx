"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { INITIAL_SETTINGS } from "@/features/shared/data/restaurantData";
import { Facebook, Instagram, Phone, MapPin, Clock } from "lucide-react";
import { useFetch } from "@/hooks/useFetch";
import { useTheme } from "@/hooks/useTheme"; // <-- 1. Importamos tu hook de tema

interface FooterData {
  name: string;
  logo: string;
  address: string;
  schedule: string;
  phone: string;
  facebookUrl: string;
  instagramUrl: string;
  links?: {
    about?: Array<{ label: string; href: string }>;
    help?: Array<{ label: string; href: string }>;
  };
}

export default function Footer() {
  const pathname = usePathname();
  const isDark = useTheme(); // <-- 2. Leemos si estamos en modo oscuro

  if (pathname?.startsWith("/dashboard/admin") || pathname?.startsWith("/(auth)/login")) {
    return null;
  }

  // Obtener datos del footer desde el backend
  const { data } = useFetch<FooterData>("/footer");

  // Valores por defecto si no hay datos del backend
  const defaultData: FooterData = {
    name: INITIAL_SETTINGS.restaurantName,
    logo: INITIAL_SETTINGS.restaurantLogo,
    address: "Pzla. Hidalgo 5-1, Centro, Huejutla de Reyes, Hgo., C.P. 43000",
    schedule: "Lunes a Domingo · 1:00 PM – 11:00 PM",
    phone: "+52 771 702 8172",
    facebookUrl: "https://www.facebook.com/ElQuijote.Huejutla",
    instagramUrl: "https://www.instagram.com/elquijotehuejutla/",
    links: {
      about: [
        { label: "Conócenos", href: "#nosotros" },
        { label: "Información corporativa", href: "/corporativo" },
      ],
      help: [
        { label: "Devoluciones y reemplazos", href: "/devoluciones" },
        { label: "Gestionar reservaciones", href: "/reservaciones" },
        { label: "Alertas de seguridad", href: "/seguridad" },
        { label: "Ayuda", href: "/ayuda" },
      ],
    },
  };

  const footerData = data || defaultData;
  const links = footerData.links || defaultData.links;

  // 3. Calculamos el logo basándonos en el tema (usamos el claro para fondos oscuros y viceversa)
  const currentLogo = isDark
    ? INITIAL_SETTINGS.restaurantLogo_light
    : INITIAL_SETTINGS.restaurantLogo_dark;

  // Hacemos fallback al logo por defecto si los del settings fallan
  const finalLogo = currentLogo || footerData.logo;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <button
        onClick={scrollToTop}
        className="w-full py-3 bg-[var(--color-secondary)] hover:brightness-110 text-white text-sm font-semibold transition-all"
      >
        Volver arriba
      </button>

      <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface-alt)]">
        <div className="px-8 lg:px-24 py-12">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
            <div>
              <h3 className="text-sm font-bold text-[var(--color-text)] mb-4">
                Conócenos
              </h3>
              <ul className="space-y-2 text-sm text-[var(--color-text-sec)]">
                {links.about?.map((link, idx) => (
                  <li key={idx}>
                    <a
                      href={link.href}
                      className="hover:text-[var(--color-brand)] transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--color-text)] mb-4">
                Podemos ayudarte
              </h3>
              <ul className="space-y-2 text-sm text-[var(--color-text-sec)]">
                {links.help?.map((link, idx) => (
                  <li key={idx}>
                    <a
                      href={link.href}
                      className="hover:text-[var(--color-brand)] transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--color-text)] mb-4">
                Contacto directo
              </h3>
              <ul className="space-y-3 text-sm text-[var(--color-text-sec)]">
                <li className="flex items-start gap-2">
                  <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                  <span>{footerData.address}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock size={16} className="flex-shrink-0" />
                  <span>{footerData.schedule}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone size={16} className="flex-shrink-0" />
                  <a
                    href={`tel:${footerData.phone}`}
                    className="hover:text-[var(--color-brand)] transition-colors"
                  >
                    {footerData.phone}
                  </a>
                </li>
                <li className="flex gap-4 pt-2">
                  <a
                    href={footerData.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--color-text-sec)] hover:text-[var(--color-brand)] transition-colors"
                  >
                    <Facebook size={18} />
                  </a>
                  <a
                    href={footerData.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--color-text-sec)] hover:text-[var(--color-brand)] transition-colors"
                  >
                    <Instagram size={18} />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Logo y avisos legales */}
          <div className="flex flex-col items-center justify-center pt-8 border-t border-[var(--color-border)]">
            <div className="mb-4">
              <img
                src={finalLogo} // <-- Usamos la variable que se actualiza con el tema
                alt="Logo"
                className="h-10 w-auto object-contain transition-all"
              />
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-[var(--color-text-muted)] mb-3">
              <a
                href="/condiciones"
                className="hover:text-[var(--color-brand)]"
              >
                Condiciones de uso
              </a>
              <a href="/privacidad" className="hover:text-[var(--color-brand)]">
                Aviso de privacidad
              </a>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] text-center">
              © 1996-2026, {footerData.name}, Inc. o sus afiliados
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
