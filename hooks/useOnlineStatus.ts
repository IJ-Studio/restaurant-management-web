"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

/**
 * true si el navegador tiene conexión. En el servidor (y durante la
 * hidratación) se asume que sí, para que el HTML coincida.
 */
export function useOnlineStatus() {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  );
}

/**
 * Como useOnlineStatus, pero false hasta que el componente se monta en el
 * navegador. Sirve para no disparar peticiones durante la hidratación cuando
 * la página se abrió sin conexión (ahí useOnlineStatus todavía dice true).
 */
export function useConfirmedOnline() {
  const online = useOnlineStatus();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted && online;
}
