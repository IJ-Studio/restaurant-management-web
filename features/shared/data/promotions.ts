/**
 * features/shared/data/promotions.ts
 *
 * Tipo compartido de Promoción — consumido por el panel admin
 * (features/dashboard/admin) y por la página pública /promociones.
 */

export interface Promotion {
  id: number;
  title: string;
  description: string;
  badge?: string;
  emoji?: string;
  /** Clases de gradiente Tailwind, ej. "from-orange-600 to-red-600" */
  color: string;
  originalPrice?: number;
  discountedPrice?: number;
  imageUrl?: string;
  imagePublicId?: string;
  active: boolean;
  order: number;
  startDate?: string;
  endDate?: string;
}

export const GRADIENT_PRESETS: { label: string; value: string }[] = [
  { label: "Naranja/Rojo", value: "from-orange-600 to-red-600" },
  { label: "Morado/Azul", value: "from-purple-600 to-blue-600" },
  { label: "Verde/Turquesa", value: "from-green-600 to-teal-600" },
  { label: "Rosa/Fucsia", value: "from-pink-600 to-fuchsia-600" },
  { label: "Ámbar/Naranja", value: "from-amber-500 to-orange-600" },
  { label: "Azul/Cian", value: "from-blue-600 to-cyan-600" },
];

/** Fila cruda tal como la devuelve el backend (snake_case) */
export interface PromotionRow {
  id: number;
  titulo: string;
  descripcion: string | null;
  badge: string | null;
  emoji: string | null;
  color: string | null;
  precio_original: string | number | null;
  precio_descuento: string | number | null;
  imagen_url: string | null;
  imagen_public_id: string | null;
  activa: boolean | null;
  orden: number | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
}

export function mapPromotionRow(r: PromotionRow): Promotion {
  return {
    id: Number(r.id),
    title: r.titulo ?? "",
    description: r.descripcion ?? "",
    badge: r.badge ?? undefined,
    emoji: r.emoji ?? undefined,
    color: r.color ?? GRADIENT_PRESETS[0].value,
    originalPrice:
      r.precio_original != null ? Number(r.precio_original) : undefined,
    discountedPrice:
      r.precio_descuento != null ? Number(r.precio_descuento) : undefined,
    imageUrl: r.imagen_url ?? undefined,
    imagePublicId: r.imagen_public_id ?? undefined,
    active: r.activa ?? true,
    order: r.orden ?? 0,
    startDate: r.fecha_inicio ?? undefined,
    endDate: r.fecha_fin ?? undefined,
  };
}
