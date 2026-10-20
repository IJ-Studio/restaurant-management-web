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
      wasOffline.current = true;
      setShowBack(false);
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
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] flex justify-center px-4"
    >
      <div
        className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-white shadow-lg ${
          online ? "bg-emerald-600" : "bg-[var(--color-secondary)]"
        }`}
      >
        {online ? (
          <>
            <Wifi size={14} /> Conexión restablecida
          </>
        ) : (
          <>
            <WifiOff size={14} /> Sin conexión · mostrando la versión guardada
          </>
        )}
      </div>
    </div>
  );
}
