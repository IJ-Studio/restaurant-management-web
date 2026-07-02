import { NextResponse } from "next/server";

// Apunta a la URL de tu backend NestJS
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000";

export async function GET() {
  try {
    // Consumimos el endpoint unificado de NestJS que procesa las categorías con sus productos estructurados
    const response = await fetch(`${BACKEND_URL}/menu/categories/with-products`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 } // Opcional: Cachea de forma limpia por 60 segundos para alto rendimiento
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Error al obtener la respuesta desde el backend central" },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Retornamos directamente la estructura limpia procesada por NestJS hacia tu componente visual
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error en Proxy /api/menu/categories:", error);
    return NextResponse.json(
      { error: "Error interno en el servidor proxy de rutas" },
      { status: 500 }
    );
  }
}
