"use client";

import { useEffect, useState } from "react";
import { CldImage } from "next-cloudinary";
import SmartImage from "@/components/SmartImage";
import Link from "next/link";

// 1. Ajustamos las interfaces para que coincidan EXACTAMENTE con lo que devuelve tu Nest.js
interface Product {
  id: number; // Nest/Drizzle maneja IDs numéricos secuenciales habitualmente
  platilloId?: number;
  nombre: string; // Tu backend usa 'nombre' o 'name', ajustado a la estructura típica en español de tu BD
  descripcion?: string;
  precio: string | number; // Drizzle/Postgres suele retornar los precios numéricos como string para no perder precisión
  imagenUrl?: string;
}

interface Category {
  id: number;
  nombre: string;
  imagenUrl?: string;
  platillos: Product[]; // 👈 Tu backend de Nest.js retorna 'platillos', no 'products'
}

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // 2. CAMBIO CLAVE: Llamamos a la ruta interna de Next.js.
        // Esto evita errores de CORS y protege la URL real de tu backend.
        const res = await fetch("/api/menu/categories");

        if (!res.ok) {
          throw new Error("Error al cargar los datos del servidor");
        }
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Error en Fetch Menu:", err);
        setError("No se pudo cargar el menú. Intenta más tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="bg-surface min-h-screen flex items-center justify-center">
        <p className="text-text-sec text-lg">Cargando menú...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-screen">
      {/* Hero image a ancho completo */}
      <div className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden">
        <CldImage
          src="https://res.cloudinary.com/dcb1tspbj/image/upload/v1778825604/Gemini_Generated_Image_2mv3sr2mv3sr2mv3_uciqpl.png"
          fill
          alt="Restaurant background"
          className="object-cover"
          priority
        />
      </div>

      {/* Encabezado de texto */}
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl md:text-6xl font-light tracking-wide text-text">
          MENÚ
        </h1>
        <div className="w-16 h-0.5 bg-brand mx-auto my-4"></div>
        <p className="max-w-2xl mx-auto text-text-sec text-sm md:text-base">
Ya seas un amante de la buena comida o alguien con un paladar aventurero, tenemos algo especial para ti.

        </p>

        {/* Lista de enlaces a las categorías */}
        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3 mt-8">
          {categories.map((category) => (
            <a
              key={`link-${category.id}`}
              href={`#category-${category.id}`}
              className="text-text font-medium underline underline-offset-4 decoration-border hover:decoration-brand hover:text-brand transition-all duration-300"
            >
              {category.nombre}
            </a>
          ))}
        </div>
      </div>

      {/* Categorías con diseño alternado */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        {categories.map((category, idx) => {
          const isEven = idx % 2 === 0;
          return (
            <div
              key={category.id}
              id={`category-${category.id}`}
              className="mb-20 last:mb-0 scroll-mt-32"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {isEven ? (
                  <>
                    <div className="order-1 lg:order-1">
                      <CategoryHeroImage category={category} />
                    </div>
                    <div className="order-2 lg:order-2">
                      <CategoryMenu category={category} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="order-2 lg:order-1">
                      <CategoryMenu category={category} />
                    </div>
                    <div className="order-1 lg:order-2">
                      <CategoryHeroImage category={category} />
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Si la categoría no tiene imagen propia, usamos la foto del primer
// platillo que sí tenga una como imagen referencial — antes de esto,
// categorías sin imagenUrl mostraban "Sin imagen" aunque sus platillos
// individuales ya tuvieran fotos reales.
function CategoryHeroImage({ category }: { category: Category }) {
  const fallbackImg = category.platillos?.find((p) => p.imagenUrl)?.imagenUrl;
  const imgSrc = category.imagenUrl || fallbackImg;

  return (
    <div className="relative h-80 w-full rounded-2xl overflow-hidden shadow-lg">
      {imgSrc ? (
        <SmartImage src={imgSrc} fill alt={category.nombre} className="object-cover" />
      ) : (
        <div className="flex items-center justify-center h-full bg-surface-hover/50 text-text/50">
          Sin imagen
        </div>
      )}
    </div>
  );
}

function CategoryMenu({ category }: { category: Category }) {
  // 3. Ajustamos el renderizado interno utilizando las propiedades en español que envía NestJS
  const displayedProducts = category.platillos ? category.platillos.slice(0, 4) : [];
  const hasMoreThanFive = category.platillos && category.platillos.length > 4;

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-semibold text-text border-b border-border pb-2 block text-center">
        {category.nombre}
      </h2>

      <div
        className="mt-6 space-y-4 relative"
        style={
          hasMoreThanFive
            ? {
                maskImage: "linear-gradient(to bottom, black 65%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, black 65%, transparent 100%)",
              }
            : undefined
        }
      >
        {displayedProducts.map((product) => (
          <div key={product.id} className="border-b border-border/40 pb-2">
            <div className="flex items-baseline">
              <span className="text-text font-medium">{product.nombre}</span>
              <span className="flex-1 mx-2 border-b border-dotted border-text-sec/40"></span>
              <span className="text-brand font-semibold whitespace-nowrap">
                ${product.precio}
              </span>
            </div>
            {product.descripcion && (
              <p className="text-text-sec text-sm mt-0.5">
                {product.descripcion}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Link
          href={`/menu/categoria/${category.id}?bg=${encodeURIComponent(category.imagenUrl || "")}`}
          className="inline-flex items-center gap-1 text-brand hover:text-brand/80 font-medium text-sm transition-colors"
        >
          Ver todos
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
