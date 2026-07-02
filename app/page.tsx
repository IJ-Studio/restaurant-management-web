"use client";

import { useState, useEffect } from "react";
import Hero from "@/components/landing/Hero";
import { useFetch } from "@/hooks/useFetch";

// Tipos (deben coincidir con lo que devuelve el backend)
interface Settings {
  restaurantName: string;
  restaurantLogo: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  heroCtaLink: string;
  stats: Array<{ value: string; label: string }>;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

interface Promo {
  id: string;
  badge: string;
  title: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  color: string;
}

interface MenuItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image: string;
  tag?: string;
  rating: number;
  prepTime: string;
}

interface AboutData {
  description: string;
  address: string;
  schedule: string;
  phone: string;
  facebookUrl: string;
  mapsUrl: string;
  reviews: Array<{ text: string; stars: number }>;
  galleryImages: string[];
}

interface FooterData {
  name: string;
  logo: string;
  description: string;
  address: string;
  schedule: string;
  phone: string;
  facebookUrl: string;
  instagramUrl: string;
}

export default function HomePage() {
  // Estado para categoría activa en el menú
  const [activeCategory, setActiveCategory] = useState<string>("todo");
  // Estado para el carrito (simulado, pero puedes implementar lógica real)
  const [cart, setCart] = useState<any[]>([]);

  // Fetch de datos desde el backend
  const { data: settings, loading: settingsLoading } =
    useFetch<Settings>("/settings");
  const { data: categories, loading: categoriesLoading } =
    useFetch<Category[]>("/categories");
  const { data: promos, loading: promosLoading } =
    useFetch<Promo[]>("/promotions");
  const { data: menuItems, loading: menuLoading } =
    useFetch<MenuItem[]>("/menu");
  const { data: about, loading: aboutLoading } =
    useFetch<AboutData>("/about");
  const { data: footer, loading: footerLoading } =
    useFetch<FooterData>("/footer");

  // Filtrar menú según categoría activa
  const filteredMenu = menuItems
    ? activeCategory === "todo"
      ? menuItems
      : menuItems.filter((item) => item.category === activeCategory)
    : [];

  // Obtener lista de categorías únicas para los filtros
  const menuCategories = menuItems
    ? [
        { id: "todo", name: "Todo" },
        ...Array.from(
          new Map(
            menuItems.map((item) => [
              item.category,
              { id: item.category, name: item.category },
            ]),
          ).values(),
        ),
      ]
    : [];

  // Handlers
  const handleAddToCart = (item: MenuItem) => {
    // Lógica de carrito (puedes implementar con contexto o estado local)
    console.log("Agregar al carrito", item);
  };

  const handleSelectItem = (item: MenuItem) => {
    // Abrir modal con detalles (puedes implementar)
    console.log("Ver detalle", item);
  };

  return (
    <>
      <main>
        <Hero
          loading={settingsLoading}
          title={
            settings?.heroTitle ||
            "SABORES QUE <br /> <span class='text-transparent bg-clip-text bg-gradient-to-r from-brand via-brand to-yellow-600 uppercase'>Trascienden</span>"
          }
          subtitle={
            settings?.heroSubtitle ||
            "Cocina mexicana de alta gama. Ingredientes de temporada, técnica contemporánea, sabor de siempre."
          }
          ctaText={settings?.heroCtaText || "Ver Menú"}
          ctaLink={settings?.heroCtaLink || "/menu"}
          stats={
            settings?.stats || [
              // { value: "16+", label: "Años" },
              // { value: "80+", label: "Platillos" },
              // { value: "4.9★", label: "Calificación" },
            ]
          }
        />

        {/* <CategoriesSection
          categories={categories || []}
          onSelectCategory={setActiveCategory}
          activeCategory={activeCategory}
          loading={categoriesLoading}
        /> */}

        {/* <PromosSection promos={promos || []} loading={promosLoading} />

        <MenuSection
          items={filteredMenu}
          categories={menuCategories}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          onAddToCart={handleAddToCart}
          onSelectItem={handleSelectItem}
          loading={menuLoading}
        />

        <AboutSection data={about} loading={aboutLoading} />

        <ReservationSection /> */}
      </main>
    </>
  );
}


