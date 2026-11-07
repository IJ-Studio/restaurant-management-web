"use client";

import "@/styles/globals.css";
import { ErrorGlobal } from "@/components/errores/ErrorGlobal";

// Límite de error de la raíz (PLAN 2.17): mensaje genérico, «Reintentar», salida y solo el digest.
// Los estilos se importan aquí porque el layout raíz, que los carga normalmente, es el que falló.
export default ErrorGlobal;
