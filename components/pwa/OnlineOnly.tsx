"use client";

import { useEffect, useState, type ReactNode } from "react";
import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

interface OnlineOnlyProps {
  children: ReactNode;
  /** Qué contenido se está ocultando, p. ej. "el menú". */
  what?: string;
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
export default function OnlineOnly({ children, what = "este contenido", extra, className }: OnlineOnlyProps) {
  const online = useOnlineStatus();
  const [hasMounted, setHasMounted] = useState(online);

  useEffect(() => {
    if (online) setHasMounted(true);
  }, [online]);

  return (
    <>
      {!online && (
        <div className={className ?? "flex min-h-[60vh] items-center justify-center px-6 py-24"}>
          <div className="w-full max-w-md rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-center">
            <WifiOff size={28} className="mx-auto mb-4 text-[var(--color-brand)]" />
            <p className="text-lg font-bold text-[var(--color-text)]">Sin conexión</p>
            <p className="mt-2 text-sm text-[var(--color-text-sec)]">
              Para ver {what} necesitas internet. Se cargará solo en cuanto vuelvas a
              conectarte.
            </p>
            {extra && <div className="mt-6">{extra}</div>}
          </div>
        </div>
      )}
      {hasMounted && <div hidden={!online}>{children}</div>}
    </>
  );
}
