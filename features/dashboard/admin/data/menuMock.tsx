"use client";

import React from "react";
import { Star, Leaf, Flame, Tag, Wheat } from "lucide-react";

export type TagKey = "popular" | "vegano" | "picante" | "nuevo" | "sin-gluten";

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  available: boolean;
  tags: TagKey[];
  prepTime: number;
  calories: number;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  items: MenuItem[];
}

export const MENU_STORAGE_KEY = "rmp_admin_menu_v1";

export const TAG_CONFIG: Record<
  TagKey,
  { label: string; colorClass: string; bgClass: string; icon: React.ReactNode }
> = {
  popular: {
    label: "Popular",
    colorClass: "text-amber-600",
    bgClass: "bg-amber-50",
    icon: <Star size={10} />,
  },
  vegano: {
    label: "Vegano",
    colorClass: "text-emerald-600",
    bgClass: "bg-emerald-50",
    icon: <Leaf size={10} />,
  },
  picante: {
    label: "Picante",
    colorClass: "text-red-600",
    bgClass: "bg-red-50",
    icon: <Flame size={10} />,
  },
  nuevo: {
    label: "Nuevo",
    colorClass: "text-violet-600",
    bgClass: "bg-violet-50",
    icon: <Tag size={10} />,
  },
  "sin-gluten": {
    label: "Sin Gluten",
    colorClass: "text-sky-600",
    bgClass: "bg-sky-50",
    icon: <Wheat size={10} />,
  },
};

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 1,
    name: "Entradas",
    icon: "🥗",
    color: "#16a34a",
    items: [
      {
        id: 101,
        name: "Bruschetta Italiana",
        description: "Pan tostado con tomate fresco, albahaca y aceite de oliva.",
        price: 89,
        available: true,
        tags: ["vegano"],
        prepTime: 8,
        calories: 210,
      },
      {
        id: 102,
        name: "Tabla de Quesos",
        description: "Selección de quesos artesanales con mermelada de higo y nueces.",
        price: 165,
        available: true,
        tags: ["popular"],
        prepTime: 5,
        calories: 480,
      },
      {
        id: 103,
        name: "Caldo Tlalpeño",
        description: "Caldo de pollo con garbanzos, chipotle y epazote.",
        price: 95,
        available: false,
        tags: ["picante"],
        prepTime: 12,
        calories: 280,
      },
    ],
  },
  {
    id: 2,
    name: "Sopas & Cremas",
    icon: "🍲",
    color: "#d97706",
    items: [
      {
        id: 201,
        name: "Crema de Elote",
        description: "Cremosa sopa de maíz con chorizo crocante.",
        price: 110,
        available: true,
        tags: ["popular", "nuevo"],
        prepTime: 10,
        calories: 320,
      },
      {
        id: 202,
        name: "Sopa de Lima",
        description: "Tradicional sopa yucateca con pollo deshebrado.",
        price: 105,
        available: true,
        tags: [],
        prepTime: 10,
        calories: 295,
      },
    ],
  },
  {
    id: 3,
    name: "Platos Fuertes",
    icon: "🍽️",
    color: "#e85d04",
    items: [
      {
        id: 301,
        name: "Filete al Chipotle",
        description: "Filete de res 200g en salsa de chipotle con papas cambray.",
        price: 285,
        available: true,
        tags: ["popular", "picante"],
        prepTime: 25,
        calories: 650,
      },
      {
        id: 302,
        name: "Pollo en Mole Negro",
        description: "Muslo de pollo rostizado bañado en mole negro.",
        price: 215,
        available: true,
        tags: ["popular"],
        prepTime: 20,
        calories: 580,
      },
      {
        id: 303,
        name: "Pasta Primavera",
        description: "Linguini con vegetales de temporada y parmesano.",
        price: 175,
        available: true,
        tags: ["vegano", "sin-gluten"],
        prepTime: 15,
        calories: 420,
      },
    ],
  },
  {
    id: 4,
    name: "Postres",
    icon: "🍮",
    color: "#7c3aed",
    items: [
      {
        id: 401,
        name: "Flan Napolitano",
        description: "Flan cremoso de vainilla con cajeta y nuez.",
        price: 75,
        available: true,
        tags: ["popular"],
        prepTime: 5,
        calories: 310,
      },
      {
        id: 402,
        name: "Volcán de Chocolate",
        description: "Bizcocho de chocolate con centro fundido.",
        price: 95,
        available: true,
        tags: ["nuevo"],
        prepTime: 12,
        calories: 480,
      },
    ],
  },
  {
    id: 5,
    name: "Bebidas",
    icon: "🥤",
    color: "#0ea5e9",
    items: [
      {
        id: 501,
        name: "Agua de Jamaica",
        description: "Agua fresca con limón y menta.",
        price: 45,
        available: true,
        tags: ["vegano", "sin-gluten"],
        prepTime: 2,
        calories: 80,
      },
      {
        id: 502,
        name: "Café de Olla",
        description: "Café negro con piloncillo y canela.",
        price: 55,
        available: true,
        tags: ["popular"],
        prepTime: 4,
        calories: 30,
      },
    ],
  },
];
