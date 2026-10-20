"use client";

import { useEffect, useState, type ReactNode } from "react";
import { WifiOff } from "lucide-react";
import { useConfirmedOnline, useOnlineStatus } from "@/hooks/useOnlineStatus";

interface OnlineOnlyProps {
  children: ReactNode;
  /** Qué contenido se está ocultando, p. ej. "el menú" ("Para ver el menú…"). */
  what?: string;
  /** Acción completa cuando no es "ver algo", p. ej. "iniciar sesión". */
  action?: string;
  /** Contenido extra bajo el aviso (p. ej. un enlace para llamar). */
  extra?: ReactNode;
  className?: string;
}

/**
 * Envuelve contenido que depende del servidor (menú, promociones, pedidos…).
 * Sin conexión muestra un aviso en lugar del contenido; al reconectarse lo
 * monta (y por lo tanto vuelve a pedir los datos) automáticamente.
 *
 * Si el contenido ya se había montado, solo se oculta mientras no hay red
 * para no perder lo que el usuario estuviera llenando.
 */
export default function OnlineOnly({ children, what = "este contenido", action, extra, className }: OnlineOnlyProps) {
  const online = useOnlineStatus();
  // El contenido solo se monta en el navegador y con conexión confirmada, para
  // que sus peticiones no se disparen si la página se abrió sin red.
  const confirmedOnline = useConfirmedOnline();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    if (confirmedOnline) setHasMounted(true);
  }, [confirmedOnline]);

  const showChildren = hasMounted || confirmedOnline;

  return (
    <>
      {!online && (
        <div className={className ?? "flex min-h-[60vh] items-center justify-center px-6 py-24"}>
          <div className="w-full max-w-md rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-center">
            <WifiOff size={28} className="mx-auto mb-4 text-[var(--color-brand)]" />
            <p className="text-lg font-bold text-[var(--color-text)]">Sin conexión</p>
            <p className="mt-2 text-sm text-[var(--color-text-sec)]">
              Para {action ?? `ver ${what}`} necesitas internet. Se cargará solo en cuanto vuelvas a
              conectarte.
            </p>
            {extra && <div className="mt-6">{extra}</div>}
          </div>
        </div>
      )}
      {showChildren && <div hidden={!online}>{children}</div>}
    </>
  );
}
