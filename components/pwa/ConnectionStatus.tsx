"use client";

import { useEffect, useRef, useState } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

/**
 * Aviso flotante del estado de la conexión: fijo mientras no hay red y una
 * confirmación breve cuando vuelve.
 */
export default function ConnectionStatus() {
  const online = useOnlineStatus();
  const wasOffline = useRef(false);
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    if (!online) {
      // Sin conexión manda `online`; `showBack` solo importa al volver.
      wasOffline.current = true;
      return;
    }
    if (!wasOffline.current) return;
    wasOffline.current = false;
    setShowBack(true);
    const timer = setTimeout(() => setShowBack(false), 3000);
    return () => clearTimeout(timer);
  }, [online]);

  if (online && !showBack) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-20 z-[70] flex justify-center px-4"
    >
      <div
        className="flex items-center gap-2 rounded-pastilla border border-borde-sutil bg-superficie-elevada px-4 py-2 text-(length:--texto-pequeno) font-semibold text-texto-principal shadow-flotante [&_svg]:size-4 [&_svg]:stroke-[1.5]"
      >
        {online ? (
          <>
            <Wifi aria-hidden="true" className="text-exito" /> Conexión restablecida
          </>
        ) : (
          <>
            <WifiOff aria-hidden="true" className="text-aviso" /> Sin conexión: ves la última versión guardada
          </>
        )}
      </div>
    </div>
  );
}
