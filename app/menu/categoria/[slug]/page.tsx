"use client";

import { useState, useEffect } from "react";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import { CldImage } from "next-cloudinary";
import BackButton from "@/components/BackButton";

// Tipos de datos
interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // Precio final ya con IVA y descuentos (o base)
  imagePublicId?: string;
  available: boolean;
  tags?: string[];
}

interface Category {
  id: string;
  name: string; // "Small Bites"
  slug: string; // "small-bites"
  description?: string; // "Order for the table and spread the love."
  heroImage?: string; // Imagen decorativa (opcional)
}

// Mock de datos (reemplazar con llamada a tu API)
const categoriesMock: Category[] = [
  {
    id: "1",
    name: "Small Bites",
    slug: "small-bites",
    description: "Order for the table and spread the love.",
  },
  {
    id: "2",
    name: "Soul Bowls",
    slug: "soul-bowls",
    description: "Healthy and hearty bowls.",
  },
  {
    id: "3",
    name: "Signature Drinks",
    slug: "signature-drinks",
    description: "Explore the bar.",
  },
];

const productsMock: Record<string, Product[]> = {
  "small-bites": [
    {
      id: "p1",
      name: "Green poppy seeds",
      description: "Crunchy and fresh",
      price: 12,
      imagePublicId: "green-poppy",
      available: true,
    },
    {
      id: "p2",
      name: "Pocky crispy (per piece)",
      description: "Crispy rice cracker",
      price: 5,
      imagePublicId: "pocky-crispy",
      available: true,
    },
    {
      id: "p3",
      name: "Phiships Peppers",
      description: "Spicy and tangy",
      price: 9,
      imagePublicId: "phiships-peppers",
      available: true,
    },
    {
      id: "p4",
      name: "Black pepper calamari",
      description: "Tender calamari",
      price: 14,
      imagePublicId: "calamari",
      available: true,
    },
    {
      id: "p5",
      name: "Kingfish sashimi",
      description: "Fresh kingfish",
      price: 15,
      imagePublicId: "kingfish",
      available: true,
    },
    {
      id: "p6",
      name: "Thai chicken lettuce cups",
      description: "Lettuce wraps",
      price: 13,
      imagePublicId: "thai-chicken",
      available: true,
    },
    {
      id: "p7",
      name: "Turmeric spiced courgettes",
      description: "Zucchini with turmeric",
      price: 11,
      imagePublicId: "courgettes",
      available: true,
    },
    {
      id: "p8",
      name: "Caramelised beet leaf",
      description: "Sweet and earthy",
      price: 12,
      imagePublicId: "beet-leaf",
      available: true,
    },
    {
      id: "p9",
      name: "Edamame",
      description: "Steamed edamame",
      price: 8,
      imagePublicId: "edamame",
      available: true,
    },
  ],
  "soul-bowls": [
    {
      id: "p10",
      name: "Buddha Bowl",
      description: "Quinoa, avocado, kale",
      price: 18,
      imagePublicId: "buddha-bowl",
      available: true,
    },
    {
      id: "p11",
      name: "Poke Bowl",
      description: "Fresh tuna, rice, veggies",
      price: 22,
      imagePublicId: "poke-bowl",
      available: true,
    },
  ],
  "signature-drinks": [
    {
      id: "p12",
      name: "Soul Mule",
      description: "Ginger, vodka, lime",
      price: 12,
      imagePublicId: "soul-mule",
      available: true,
    },
    {
      id: "p13",
      name: "Spiced Chai Latte",
      description: "House blend",
      price: 8,
      imagePublicId: "chai-latte",
      available: true,
    },
  ],
};

export default function CategoryPage() {
  const { slug } = useParams() as { slug: string };
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de datos (reemplazar con fetch real)
    const foundCategory = categoriesMock.find((c) => c.slug === slug);
    if (!foundCategory) {
      notFound();
      return;
    }
    setCategory(foundCategory);
    setProducts(productsMock[slug] || []);
    setLoading(false);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Cargando menú...</div>
      </div>
    );
  }

  if (!category) return notFound();

  return (
    <div className="bg-white min-h-screen">
      {/* Encabezado inspirado en el diseño */}
      <div className="relative bg-black/5 py-16 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-light tracking-wide text-gray-800">
            {category.name}
          </h1>
          <div className="w-24 h-0.5 bg-amber-500 mx-auto my-4"></div>
          {category.description && (
            <p className="text-gray-600 max-w-2xl mx-auto text-lg italic">
              {category.description}
            </p>
          )}
        </div>
      </div>

      {/* Cuadrícula de productos */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/menu/producto/${product.id}`} // Ruta de detalle del producto
              className="group block"
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
                {/* Imagen con CldImage */}
                <div className="relative h-56 w-full bg-gray-100">
                  {product.imagePublicId ? (
                    <CldImage
                      src={product.imagePublicId}
                      fill
                      alt={product.name}
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                      Sin imagen
                    </div>
                  )}
                  {!product.available && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">
                        Agotado
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-xl font-medium text-gray-800 group-hover:text-amber-700 transition">
                      {product.name}
                    </h3>
                    <span className="text-lg font-semibold text-amber-700 whitespace-nowrap">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                    {product.description}
                  </p>
                  {product.tags && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {product.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay productos en esta categoría.</p>
          </div>
        )}

        {/* Botón para volver al menú principal */}
        <div className="mt-12 text-center">
          <BackButton fallbackHref="/menu" label="← Ver todas las categorías" />
        </div>
      </div>
    </div>
  );
}
