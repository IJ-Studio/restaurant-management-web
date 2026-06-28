"use client";

import { useEffect, useState } from "react";
import { CldImage } from "next-cloudinary";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
}

interface Category {
  id: string;
  name: string;
  imagePublicId: string;
  products: Product[];
}

// Mock de datos (reemplazar con API real)
const categoriesMock: Category[] = [
  {
    id: "1",
    name: "COCKTAILS",
    imagePublicId: "https://res.cloudinary.com/dcb1tspbj/image/upload/q_auto/f_auto/v1778826210/Gemini_Generated_Image_hfyqz3hfyqz3hfyq_djzxrr.png",
    products: [
      { id: "c1", name: "TEQUILA SUNRISE", price: 32 },
      { id: "c2", name: "STRAWBERRY DAIQUIRI", price: 25 },
      { id: "c3", name: "CUBA LIBRE", price: 38 },
    ],
  },
  {
    id: "2",
    name: "WINE",
    imagePublicId: "",
    products: [
      {
        id: "w1",
        name: "CHARDONNAY HAND OF TIME",
        description: "Alexander Valley",
        price: 199,
      },
      { id: "w2", name: "MOSCATO CAVIT", description: "Chile", price: 225 },
      {
        id: "w3",
        name: "RIESLING MICHELLE",
        description: "Santa Lucia Highlands",
        price: 382,
      },
      {
        id: "w4",
        name: "MALBEC DONNA PAULA",
        description: "France",
        price: 124,
      },
    ],
  },
  {
    id: "3",
    name: "APPETIZERS",
    imagePublicId: "appetizers-image",
    products: [
      {
        id: "a1",
        name: "FOUR CHEESE GARLIC BREAD",
        description: "Toasted French bread topped with romona, cheddar",
        price: 32,
      },
      {
        id: "a2",
        name: "SHRIMP SCAMPI",
        description: "Jumbo shrimp sautéed in white wine, butter and garlic",
        price: 25,
      },
      { id: "a3", name: "FRIED CALAMARI", price: 18 },
    ],
  },
];

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    setCategories(categoriesMock);
  }, []);

  return (
    <div className="bg-surface min-h-screen">
      {/* Hero image a ancho completo */}
      <div className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden">
        <CldImage
          src="https://res.cloudinary.com/dcb1tspbj/image/upload/v1778825604/Gemini_Generated_Image_2mv3sr2mv3sr2mv3_uciqpl.png" // Reemplazar con ID real de Cloudinary
          fill
          alt="Restaurant background"
          className="object-cover"
          priority
        />
      </div>

      {/* Encabezado de texto después de la imagen */}
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl md:text-6xl font-light tracking-wide text-text">
          MAIN MENU
        </h1>
        <div className="w-16 h-0.5 bg-brand mx-auto my-4"></div>
        <p className="max-w-2xl mx-auto text-text-sec text-sm md:text-base">
          Poetry editors, adventurous eaters, whichever your tastes, we have
          something for you.
        </p>
      </div>

      {/* Categorías con diseño alternado */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        {categories.map((category, idx) => {
          const isEven = idx % 2 === 0;
          return (
            <div key={category.id} className="mb-20 last:mb-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {isEven ? (
                  <>
                    <div className="order-1 lg:order-1">
                      <div className="relative h-80 w-full rounded-2xl overflow-hidden shadow-lg">
                        <CldImage
                          src={category.imagePublicId}
                          fill
                          alt={category.name}
                          className="object-cover"
                        />
                      </div>
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
                      <div className="relative h-80 w-full rounded-2xl overflow-hidden shadow-lg">
                        <CldImage
                          src={category.imagePublicId}
                          fill
                          alt={category.name}
                          className="object-cover"
                        />
                      </div>
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

// Componente para el menú de cada categoría
// Componente para el menú de cada categoría
function CategoryMenu({ category }: { category: Category }) {
  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-semibold text-text border-b border-border pb-2 block text-center">
        {category.name}
      </h2>
      <div className="mt-6 space-y-4">
        {category.products.map((product) => (
          <div key={product.id} className="border-b border-border/40 pb-2">
            {/* Fila principal: nombre + línea punteada + precio */}
            <div className="flex items-baseline">
              <span className="text-text font-medium">{product.name}</span>
              <span className="flex-1 mx-2 border-b border-dotted border-text-sec/40"></span>
              <span className="text-brand font-semibold whitespace-nowrap">
                ${product.price}
              </span>
            </div>
            {/* Descripción debajo (opcional) */}
            {product.description && (
              <p className="text-text-sec text-sm mt-0.5">
                {product.description}
              </p>
            )}
          </div>
        ))}
      </div>
      {/* Botón Ver todos centrado */}
      <div className="mt-6 text-center">
        <Link
          href={`/menu/categoria/${category.id}`}
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

