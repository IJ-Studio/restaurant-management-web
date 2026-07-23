"use client";

import { useEffect, useState } from "react";
import { Tag } from "lucide-react";
import PromosSection from "@/components/landing/PromosSection";
import { type Promotion, type PromotionRow, mapPromotionRow } from "@/features/shared/data/promotions";

const RAW_API_BASE = process.env.NEXT_PUBLIC_API_URL?.trim();
const API = (RAW_API_BASE && RAW_API_BASE.length > 0 ? RAW_API_BASE : "/api").replace(/\/$/, "");

export default function PromocionesPage() {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await fetch(`${API}/promociones`);
        if (!res.ok) return;
        const data: PromotionRow[] = await res.json();
        if (!isMounted) return;
        setPromos(
          (Array.isArray(data) ? data : []).map(mapPromotionRow).sort((a, b) => a.order - b.order)
        );
      } catch (e) {
        console.error("No se pudieron cargar las promociones", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="w-full bg-background text-[var(--color-text)] transition-colors duration-200 pb-20">
      {/* Encabezado */}
      <section className="relative px-8 lg:px-24 pt-36 pb-16">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--color-brand)]/20 bg-[var(--color-brand)]/5 text-[var(--color-brand)] text-xs font-bold uppercase tracking-widest mb-6">
            <Tag size={12} /> Ofertas especiales
          </div>
          <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-black leading-[0.95] tracking-tighter mb-6">
            Nuestras <span className="text-[var(--color-brand)]">Promociones</span>
          </h1>
          <p className="text-[var(--color-text-sec)] text-lg max-w-2xl leading-relaxed">
            Descubre los descuentos y combos vigentes en El Quijote. Actualizamos esta sección
            constantemente, ¡no te quedes sin probarlos!
          </p>
        </div>
      </section>

      {loading ? (
        <PromosSection promos={[]} loading />
      ) : promos.length === 0 ? (
        <section className="px-8 lg:px-24">
          <div className="max-w-4xl mx-auto text-center border border-[var(--color-border)] bg-surface rounded-3xl p-16">
            <Tag size={28} className="mx-auto mb-4 text-[var(--color-text-sec)]" />
            <p className="text-lg font-bold">No hay promociones activas por el momento</p>
            <p className="text-sm text-[var(--color-text-sec)] mt-2">
              Vuelve pronto, publicamos nuevas ofertas con frecuencia.
            </p>
          </div>
        </section>
      ) : (
        <PromosSection promos={promos} />
      )}
    </div>
  );
}
