"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react"; // opcional: instalar lucide-react o usar SVG simple

interface BackButtonProps {
  /** Ruta a la que redirigir si no hay historial anterior (por defecto "/") */
  fallbackHref?: string;
  /** Texto opcional junto al ícono */
  label?: string;
  /** Clases adicionales para personalizar el botón */
  className?: string;
}

export default function BackButton({
  fallbackHref = "/",
  label,
  className = "",
}: BackButtonProps) {
  const router = useRouter();

  const handleGoBack = () => {
    // Verificar si hay historial anterior (solo funciona en cliente)
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoBack}
      className={`inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-brand/50 rounded-md px-2 py-1 ${className}`}
      aria-label="Volver atrás"
    >
      <ArrowLeft className="w-4 h-4" />
      {label && <span className="text-sm">{label}</span>}
    </button>
  );
}
