"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function IdleLogout() {
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 min

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      try {
        // Al no usar Firebase, solo llamamos al backend para limpiar cookie de sesión
        await fetch("/api/logout", { method: "POST" });
        router.push("/login");
      } catch (err) {
        console.error("Error cerrando sesión por inactividad:", err);
      }
    }, INACTIVITY_LIMIT);
  };

  useEffect(() => {
    resetTimer();

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );
    };
  }, []);

  return null;
}