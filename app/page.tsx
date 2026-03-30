"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from "next-themes";

import HomePageView from "@/components/home/HomePageView";
import type { CartItem, CategoryKey, Combo, Dish, MenuCategory, Promo, ReservaData } from "@/components/home/types";

const RAW_API_BASE = process.env.NEXT_PUBLIC_API_URL?.trim();
const API_BASE = (RAW_API_BASE && RAW_API_BASE.length > 0 ? RAW_API_BASE : "/api").replace(/\/$/, "");
const IS_EXTERNAL_API = API_BASE.startsWith("http");

function apiUrl(path: string) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${p}`;
}

// (Types moved to `components/home/types`.)

// ─── DATOS ────────────────────────────────────────────────────────────────────
function normalizeStr(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function parseBool(value: unknown, fallback = true) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    if (['1', 'true', 'si', 'sí', 'yes', 'y', 'on'].includes(v)) return true;
    if (['0', 'false', 'no', 'n', 'off'].includes(v)) return false;
  }
  return fallback;
}

function parseNumber(value: unknown, fallback = NaN) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const v = value.trim().replace(',', '.');
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

const money = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const FALLBACK_DISHES: Dish[] = [
  { id: 1, name: 'Tostadas de Atún Rojo', catKey: 'entrantes', catLabel: 'Entrantes', desc: 'Atún aleta amarilla sellado, aguacate, mayonesa de wasabi, huevas de salmón y microverdes.', price: '$245', numPrice: 245, tag: "Chef's Pick", rating: 4.9, time: '10-15 min', img: 'https://images.unsplash.com/photo-1604909052743-94e838986d24?w=600&q=80' },
  { id: 2, name: 'Tiradito de Mero', catKey: 'entrantes', catLabel: 'Entrantes', desc: 'Mero salvaje, leche de tigre verde con chile serrano, pepino y aceite de cilantro.', price: '$265', numPrice: 265, tag: 'Nuevo', rating: 4.8, time: '10 min', img: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80' },
  { id: 3, name: 'Guacamole de Molcajete', catKey: 'entrantes', catLabel: 'Entrantes', desc: 'Aguacate hass, jitomate, cebolla, cilantro, chile serrano y jugo de limón. Preparado en mesa.', price: '$195', numPrice: 195, rating: 4.7, time: '5 min', img: 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=600&q=80' },
  { id: 4, name: 'Sopa de Lima Yucateca', catKey: 'sopas', catLabel: 'Sopas', desc: 'Caldo de pollo de rancho, lima asada, tortilla crujiente, rábano, cilantro y habanero al gusto.', price: '$185', numPrice: 185, tag: 'Favorito', rating: 4.9, time: '15 min', img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80' },
  { id: 5, name: 'Crema de Chícharo y Epazote', catKey: 'sopas', catLabel: 'Sopas', desc: 'Chícharo fresco, crema de rancho, aceite de epazote, pan artesanal tostado.', price: '$165', numPrice: 165, rating: 4.6, time: '12 min', img: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=600&q=80' },
  { id: 6, name: 'Mole Negro Oaxaqueño', catKey: 'principales', catLabel: 'Principales', desc: 'Pecho de pollo de rancho, mole negro con 32 ingredientes, arroz con hierba santa, frijoles ayocotes.', price: '$420', numPrice: 420, tag: 'Icónico', rating: 5.0, time: '25-30 min', img: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&q=80' },
  { id: 7, name: 'Costilla de Res al Mezcal', catKey: 'principales', catLabel: 'Principales', desc: 'Costilla braseada 18 horas, mezcal espadín, jus de huesos, puré de camote morado, salsa borracha.', price: '$580', numPrice: 580, tag: "Chef's Pick", rating: 4.9, time: '20-25 min', img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80' },
  { id: 8, name: 'Tacos de Mariscos', catKey: 'principales', catLabel: 'Principales', desc: 'Tres tacos en tortilla de maíz azul: camarón al ajillo, pulpo al pastor, mejillones en salsa verde.', price: '$340', numPrice: 340, rating: 4.8, time: '20 min', img: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&q=80' },
  { id: 9, name: 'Chiles en Nogada', catKey: 'principales', catLabel: 'Principales', desc: 'Chile poblano relleno de picadillo criollo, nogada de nuez de Castilla, granada y perejil. Temporada.', price: '$395', numPrice: 395, tag: 'Temporada', rating: 4.9, time: '25 min', img: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&q=80' },
  { id: 10, name: 'Tres Leches de Cajeta', catKey: 'postres', catLabel: 'Postres', desc: 'Bizcocho esponjoso empapado en tres leches, cajeta artesanal de Celaya, merengue tostado.', price: '$135', numPrice: 135, tag: 'Favorito', rating: 4.8, time: '5 min', img: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80' },
  { id: 11, name: 'Helado de Maíz Azul', catKey: 'postres', catLabel: 'Postres', desc: 'Helado artesanal de maíz azul, polvo de ceniza de copal, gel de maracuyá, tierra de chocolate.', price: '$125', numPrice: 125, tag: 'Nuevo', rating: 4.7, time: '5 min', img: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=600&q=80' },
  { id: 12, name: 'Mezcal Negroni', catKey: 'bebidas', catLabel: 'Bebidas', desc: 'Mezcal joven, Campari, vermut rosso. Servido en copa esfera con naranja deshidratada y sal de gusano.', price: '$210', numPrice: 210, rating: 4.9, time: '5 min', img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&q=80' },
];

const PROMOS: Promo[] = [
  { id: 1, badge: 'Lunes a Miércoles', title: 'Menú del Día', desc: 'Sopa del día + plato fuerte + postre + agua fresca. Cambia cada semana con ingredientes de temporada.', originalPrice: '$450', price: '$280', color: 'from-orange-500/20 to-yellow-500/10' },
  { id: 2, badge: 'Viernes y Sábados', title: 'Maridaje de Fin de Semana', desc: 'Menú degustación de 5 tiempos con maridaje de vinos y mezcales artesanales de Oaxaca.', originalPrice: '$1,800', price: '$1,350', color: 'from-purple-500/20 to-pink-500/10' },
  { id: 3, badge: 'Todos los domingos', title: 'Brunch Familiar', desc: 'Brunch buffet con 30+ platillos, estación de chilaquiles en vivo y micheladas artesanales.', originalPrice: '$520', price: '$380', color: 'from-green-500/20 to-teal-500/10' },
  { id: 4, badge: '2×1 · Martes', title: 'Noche de Mezcal', desc: 'Dos mezcales artesanales al precio de uno. Acompañados de tabla de botanas y sal de gusano.', originalPrice: '$320', price: '$160', color: 'from-amber-500/20 to-orange-500/10' },
];

const FALLBACK_CATEGORIES: MenuCategory[] = [
  { key: 'todo', label: 'Todo', order: -1 },
  { key: 'entrantes', label: 'Entrantes' },
  { key: 'sopas', label: 'Sopas' },
  { key: 'principales', label: 'Principales' },
  { key: 'postres', label: 'Postres' },
  { key: 'bebidas', label: 'Bebidas' },
];

function pickFeaturedDishes(
  allDishes: Dish[],
  allCategories: MenuCategory[],
  max: number,
) {
  if (max <= 0) return [];
  if (allDishes.length <= max) return allDishes;

  const orderedKeys = allCategories
    .filter((c) => c.key !== 'todo')
    .map((c) => c.key);

  const byCat = new Map<string, Dish[]>();
  for (const d of allDishes) {
    const list = byCat.get(d.catKey);
    if (list) list.push(d);
    else byCat.set(d.catKey, [d]);
  }

  const keys = orderedKeys.length > 0 ? orderedKeys : Array.from(byCat.keys());
  if (keys.length === 0) return allDishes.slice(0, max);

  const idxByKey = new Map<string, number>(keys.map((k) => [k, 0] as const));
  const out: Dish[] = [];

  while (out.length < max) {
    let progressed = false;
    for (const k of keys) {
      const list = byCat.get(k);
      if (!list || list.length === 0) continue;
      const i = idxByKey.get(k) ?? 0;
      if (i >= list.length) continue;
      out.push(list[i]);
      idxByKey.set(k, i + 1);
      progressed = true;
      if (out.length >= max) break;
    }
    if (!progressed) break;
  }

  return out.length > 0 ? out : allDishes.slice(0, max);
}

const CAT_ICONS: Record<string, string> = {
  'Entrantes': '🥗', 'Sopas': '🍲', 'Principales': '🍽️', 'Postres': '🍮', 'Bebidas': '🍹'
};

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function HomePage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Menú
  const [dishes, setDishes] = useState<Dish[]>(FALLBACK_DISHES);
  const [categories, setCategories] = useState<MenuCategory[]>(FALLBACK_CATEGORIES);
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('todo');
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const MENU_PAGE_SIZE = 12;
  const HOME_FEATURED_COUNT = 24;
  const [visibleCount, setVisibleCount] = useState(MENU_PAGE_SIZE);
  const [searchQuery, setSearchQuery] = useState("");

  // Carrito
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Carrusel de promos
  const [promoIndex, setPromoIndex] = useState(0);
  const [publicPromos, setPublicPromos] = useState<Promo[]>(PROMOS);
  const [combos, setCombos] = useState<Combo[]>([]);
  const promoRef = useRef<HTMLDivElement>(null);

  // Reserva
  const [reservaData, setReservaData] = useState<ReservaData>({ nombre: '', email: '', fecha: '', hora: '', personas: '' });
  const [reservaOk, setReservaOk] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    setVisibleCount(MENU_PAGE_SIZE);
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    if (!IS_EXTERNAL_API) return;

    const controller = new AbortController();
    const placeholderImg =
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80';

    async function loadMenu() {
      try {
        const res = await fetch(apiUrl('/platillos/export.json'), {
          signal: controller.signal,
        });
        if (!res.ok) return;

        const data = await res.json().catch(() => null);
        const rows = Array.isArray(data)
          ? data
          : Array.isArray((data as any)?.rows)
            ? ((data as any).rows as any[])
            : [];

        const cats = new Map<string, MenuCategory>();
        const nextDishes: Dish[] = [];

        rows.forEach((r: any, idx: number) => {
          const available = parseBool(r?.disponible ?? r?.available, true);
          if (!available) return;

          const catActive = parseBool(
            r?.categoria_activa ?? r?.categoriaActiva ?? r?.activa ?? r?.is_active,
            true,
          );
          if (!catActive) return;

          const catIdRaw = r?.categoria_id ?? r?.categoriaId ?? 0;
          const catId = parseNumber(catIdRaw, 0);
          const catKey = String(Number.isFinite(catId) ? catId : 0);

          const catLabel =
            normalizeStr(
              r?.categoria_nombre ??
                r?.categoriaNombre ??
                r?.categoria_name ??
                r?.categoriaName ??
                r?.categoria,
            ) || (catKey !== '0' ? `Categoría ${catKey}` : 'Platillos');

          const catIcon = normalizeStr(
            r?.categoria_icono ??
              r?.categoriaIcono ??
              r?.categoria_icon ??
              r?.categoriaIcon,
          );

          const catOrderNum = parseNumber(r?.categoria_orden ?? r?.categoriaOrden, NaN);
          const catOrder = Number.isFinite(catOrderNum) ? catOrderNum : undefined;

          if (!cats.has(catKey)) {
            cats.set(catKey, {
              key: catKey,
              label: catLabel,
              icon: catIcon || CAT_ICONS[catLabel] || '🍽️',
              order: catOrder,
            });
          }

          const idNum = parseNumber(r?.id, NaN);
          const id = Number.isFinite(idNum) ? Math.floor(idNum) : Date.now() + idx;

          const name = normalizeStr(r?.nombre ?? r?.name) || `Platillo ${id}`;
          const desc = normalizeStr(r?.descripcion_corta ?? r?.descripcion ?? r?.desc) || '';

          const priceNum = parseNumber(r?.precio ?? r?.price, NaN);
          const numPrice = Number.isFinite(priceNum) ? priceNum : 0;
          const price = Number.isFinite(priceNum) ? money.format(priceNum) : '$0';

          const img =
            normalizeStr(r?.imagen_url ?? r?.imagenUrl ?? r?.img ?? r?.imagen) ||
            placeholderImg;

          const prep = parseNumber(r?.tiempo_preparacion ?? r?.prepTime, NaN);
          const time = Number.isFinite(prep) ? `${Math.max(0, Math.floor(prep))} min` : '—';

          const tag = parseBool(r?.es_popular, false)
            ? 'Popular'
            : parseBool(r?.es_nuevo, false)
              ? 'Nuevo'
              : undefined;

          nextDishes.push({
            id,
            name,
            catKey,
            catLabel,
            catIcon: catIcon || undefined,
            catOrder,
            desc,
            price,
            numPrice,
            tag,
            rating: 4.9,
            time,
            img,
          });
        });

        if (nextDishes.length === 0) return;

        const nextCategories = Array.from(cats.values()).sort((a, b) => {
          const ao = typeof a.order === 'number' ? a.order : Number(a.key);
          const bo = typeof b.order === 'number' ? b.order : Number(b.key);
          if (Number.isFinite(ao) && Number.isFinite(bo) && ao !== bo) return ao - bo;
          return a.label.localeCompare(b.label, 'es');
        });

        nextDishes.sort((a, b) => {
          const ao = typeof a.catOrder === 'number' ? a.catOrder : Number(a.catKey);
          const bo = typeof b.catOrder === 'number' ? b.catOrder : Number(b.catKey);
          if (Number.isFinite(ao) && Number.isFinite(bo) && ao !== bo) return ao - bo;
          if (a.catLabel !== b.catLabel) return a.catLabel.localeCompare(b.catLabel, 'es');
          return a.name.localeCompare(b.name, 'es');
        });

        const finalCategories = [{ key: 'todo', label: 'Todo', order: -1 }, ...nextCategories];
        setCategories(finalCategories);
        setDishes(nextDishes);
        setActiveCategory((prev) =>
          prev === 'todo' || finalCategories.some((c) => c.key === prev) ? prev : 'todo',
        );
      } catch {
        // ignore (fallback menu stays)
      }
    }

    void loadMenu();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const promoColors = [
      "from-orange-500/20 to-yellow-500/10",
      "from-purple-500/20 to-pink-500/10",
      "from-green-500/20 to-teal-500/10",
      "from-amber-500/20 to-orange-500/10",
    ];

    function promoPriceLabel(tipoRaw: unknown, valorRaw: unknown) {
      const tipo = normalizeStr(tipoRaw).toLowerCase();
      const valorNum = parseNumber(valorRaw, NaN);
      if (tipo === "3x2") return "3x2";
      if (tipo === "2x1") return "2x1";
      if (Number.isFinite(valorNum) && valorNum === 0) return "Gratis";
      if (Number.isFinite(valorNum) && tipo === "monto_fijo") return `$${valorNum}`;
      return tipo ? tipo.toUpperCase() : "Promo";
    }

    async function loadPublicExtras() {
      try {
        const [couponsRes, combosRes] = await Promise.all([
          fetch("/api/public/cupones", { signal: controller.signal }),
          fetch("/api/public/combos", { signal: controller.signal }),
        ]);

        if (couponsRes.ok) {
          const data = await couponsRes.json().catch(() => null);
          const rows = Array.isArray((data as any)?.rows) ? ((data as any).rows as any[]) : [];
          const mapped: Promo[] = rows
            .filter((r) => parseBool(r?.activo, true))
            .map((r, idx) => ({
              id: idx + 1,
              badge: normalizeStr(r?.codigo) || "PROMO",
              title: normalizeStr(r?.nombre) || "Promoción",
              desc: normalizeStr(r?.descripcion) || "",
              originalPrice: "",
              price: promoPriceLabel(r?.tipo, r?.valor),
              color: promoColors[idx % promoColors.length],
            }));

          if (mapped.length > 0) {
            setPublicPromos(mapped);
            setPromoIndex(0);
          }
        }

        if (combosRes.ok) {
          const data = await combosRes.json().catch(() => null);
          const rows = Array.isArray((data as any)?.rows) ? ((data as any).rows as any[]) : [];
          const mapped: Combo[] = rows
            .filter((r) => parseBool(r?.disponible, true))
            .map((r) => {
              const idNum = parseNumber(r?.id, NaN);
              const id = Number.isFinite(idNum) ? Math.floor(idNum) : Date.now();
              const precio = parseNumber(r?.precio, 0);
              const reg = parseNumber(r?.precio_regular, NaN);
              return {
                id,
                nombre: normalizeStr(r?.nombre) || `Paquete ${id}`,
                descripcion: normalizeStr(r?.descripcion) || "",
                precio: Number.isFinite(precio) ? precio : 0,
                precioRegular: Number.isFinite(reg) ? reg : null,
                disponible: true,
              };
            });

          if (mapped.length > 0) setCombos(mapped);
        }
      } catch {
        // ignore
      }
    }

    void loadPublicExtras();
    return () => controller.abort();
  }, []);

  // Toast auto-hide
  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); }
  }, [toast]);

  if (!mounted) return null;

  // ── Helpers ──
  const basePool =
    activeCategory === 'todo'
      ? pickFeaturedDishes(dishes, categories, Math.min(HOME_FEATURED_COUNT, dishes.length))
      : dishes.filter((d) => d.catKey === activeCategory);

  const q = searchQuery.trim().toLowerCase();
  const dishPool =
    q.length > 0
      ? basePool.filter((d) => {
          const hay = `${d.name} ${d.desc} ${d.catLabel}`.toLowerCase();
          return hay.includes(q);
        })
      : basePool;

  const totalInPool = dishPool.length;
  const filteredDishes = dishPool.slice(0, visibleCount);
  const canShowMore = visibleCount < totalInPool;
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.numPrice * i.qty, 0);

  function addToCart(dish: Dish) {
    setCart(prev => {
      const ex = prev.find(i => i.id === dish.id);
      if (ex) return prev.map(i => i.id === dish.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...dish, qty: 1 }];
    });
    setToast(`✓ ${dish.name} agregado`);
  }

  function removeFromCart(id: number) {
    setCart(prev => {
      const ex = prev.find(i => i.id === id);
      if (ex && ex.qty > 1) return prev.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i);
      return prev.filter(i => i.id !== id);
    });
  }

  function handlePromoNext() {
    const max = Math.max(publicPromos.length - 1, 0);
    setPromoIndex((i) => Math.min(i + 1, max));
  }
  function handlePromoPrev() {
    setPromoIndex((i) => Math.max(i - 1, 0));
  }

  function handleReserva(e: React.FormEvent) {
    e.preventDefault();
    setReservaOk(true);
    setToast('🎉 ¡Reservación confirmada! Revisa tu correo.');
    setTimeout(() => setReservaOk(false), 4000);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <HomePageView
      theme={theme}
      setTheme={setTheme}
      toast={toast}
      selectedDish={selectedDish}
      setSelectedDish={setSelectedDish}
      cart={cart}
      cartOpen={cartOpen}
      setCartOpen={setCartOpen}
      cartCount={cartCount}
      cartTotal={cartTotal}
      addToCart={addToCart}
      removeFromCart={removeFromCart}
      PROMOS={publicPromos}
      promoIndex={promoIndex}
      setPromoIndex={setPromoIndex}
      promoRef={promoRef}
      handlePromoPrev={handlePromoPrev}
      handlePromoNext={handlePromoNext}
      combos={combos}
      dishes={dishes}
      categories={categories}
      activeCategory={activeCategory}
      setActiveCategory={setActiveCategory}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      filteredDishes={filteredDishes}
      totalInPool={totalInPool}
      visibleCount={visibleCount}
      setVisibleCount={setVisibleCount}
      canShowMore={canShowMore}
      MENU_PAGE_SIZE={MENU_PAGE_SIZE}
      reservaData={reservaData}
      setReservaData={setReservaData}
      reservaOk={reservaOk}
      handleReserva={handleReserva}
    />
  );
}
