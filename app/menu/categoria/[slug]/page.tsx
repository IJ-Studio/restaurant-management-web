"use client";

import { useState, useEffect } from "react";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import SmartImage from "@/components/SmartImage";
import BackButton from "@/components/BackButton";

interface Product {
  id: string | number;
  nombre?: string;
  name?: string;
  descripcion?: string;
  description?: string;
  precio?: number | string;
  price?: number | string;
  imagenUrl?: string;
  imageUrl?: string;
  disponible?: boolean;
  available?: boolean;
}

interface Category {
  id: string | number;
  nombre?: string;
  name?: string;
  descripcion?: string;
  description?: string;
  imageUrl?: string;
  products?: Product[];
  platillos?: Product[];
  productos?: Product[];
}

export default function CategoryPage() {
  const { slug } = useParams() as { slug: string };
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [triggerNotFound, setTriggerNotFound] = useState(false);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000";
        const res = await fetch(`${apiUrl}/menu/categories/with-products`);

        if (!res.ok) {
          throw new Error("Error al obtener respuesta del servidor");
        }

        const data: Category[] = await res.json();

        // Buscamos la categoría comparando el ID de forma segura
        const found = data.find((cat) => String(cat.id) === String(slug));

        if (!found) {
          setTriggerNotFound(true);
          return;
        }

        setCategory(found);
      } catch (err) {
        console.error("Error cargando categoría:", err);
        setError("No se pudo cargar la categoría. Intenta más tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [slug]);

  if (triggerNotFound) return notFound();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-text">Cargando categoría...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  if (!category) return notFound();

  // 1. Unificamos el nombre y datos de la Categoría (Español o Inglés)
  const categoryName = category.nombre || category.name || "Categoría";
  const categoryDescription = category.descripcion || category.description;
  const displayProducts = category.platillos || category.productos || category.products || [];

  return (
    <div className="bg-background min-h-screen pb-12">
      <div className="container mx-auto px-4 pt-32 pb-12">

        {category.imageUrl && (
          <div className="relative w-full h-56 md:h-72 lg:h-96 mb-8 rounded-2xl overflow-hidden shadow-sm border border-border">
            <SmartImage
              src={category.imageUrl}
              fill
              alt={categoryName}
              className="object-cover"
              sizes="100vw"
              priority
            />
          </div>
        )}

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-wide text-text">
            {categoryName}
          </h1>
          <div className="w-24 h-1 bg-brand mx-auto my-6 rounded-full"></div>
          {categoryDescription && (
            <p className="text-text/80 max-w-2xl mx-auto text-lg italic">
              {categoryDescription}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayProducts.map((product) => {
            // 2. Extracción híbrida de propiedades para blindar el renderizado
            const prodId = product.id;
            const prodName = product.nombre || product.name || "Platillo sin nombre";
            const prodDesc = product.descripcion || product.description || "";
            const prodImg = product.imagenUrl || product.imageUrl;

            // Verificación de disponibilidad (si viene undefined, asumimos true)
            const isAvailable = product.disponible ?? product.available ?? true;

            // Formateo numérico seguro del precio
            const rawPrice = product.precio ?? product.price ?? 0;
            const prodPrice = typeof rawPrice === 'string' ? parseFloat(rawPrice) : rawPrice;

            return (
              <Link
                key={prodId}
                href={`/menu/producto/${prodId}`}
                className="group block"
              >
                <div className="bg-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-border">
                  <div className="relative h-56 w-full bg-surface-hover/50">
                    {prodImg ? (
                      <SmartImage
                        src={prodImg}
                        fill
                        alt={prodName}
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-text/40 text-sm">
                        Sin imagen
                      </div>
                    )}
                    {!isAvailable && (
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="bg-red-600 text-white text-xs px-3 py-1.5 rounded-full font-medium tracking-wide">
                          Agotado
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-xl font-medium text-text group-hover:text-brand transition">
                        {prodName}
                      </h3>
                      <span className="text-lg font-semibold text-brand whitespace-nowrap">
                        ${prodPrice.toFixed(2)}
                      </span>
                    </div>
                    {prodDesc && (
                      <p className="text-text/70 text-sm mt-2 line-clamp-2">
                        {prodDesc}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {displayProducts.length === 0 && (
          <div className="text-center py-16 bg-surface border border-border rounded-2xl mt-8">
            <p className="text-text/60 text-lg">No hay productos disponibles en esta categoría por el momento.</p>
          </div>
        )}

        <div className="mt-16 text-center">
          <BackButton fallbackHref="/menu" label="← Ver todas las categorías" />
        </div>
      </div>
    </div>
  );
}
