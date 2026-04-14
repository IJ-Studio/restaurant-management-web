"use client";

import { useState, useEffect, useRef } from "react";

interface UseLockoutOptions {
  /** Patrones de error que indican bloqueo (regex o string) */
  lockoutPatterns: (string | RegExp)[];
  /** Función para extraer segundos del mensaje de error (por defecto busca números) */
  extractSeconds?: (errorMessage: string) => number | null;
  /** Callback cuando se inicia el bloqueo */
  onLockoutStart?: (seconds: number) => void;
  /** Callback cuando termina el bloqueo */
  onLockoutEnd?: () => void;
}

export function useLockout({
  lockoutPatterns,
  extractSeconds = (msg) => {
    const match = msg.match(/(\d+)/);
    return match ? Number(match[1]) : null;
  },
  onLockoutStart,
  onLockoutEnd,
}: UseLockoutOptions) {
  const [waitSeconds, setWaitSeconds] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Detectar bloqueo a partir de un mensaje de error
  const checkLockout = (errorMessage: string) => {
    const isLockout = lockoutPatterns.some((pattern) =>
      pattern instanceof RegExp
        ? pattern.test(errorMessage)
        : errorMessage.includes(pattern),
    );
    if (isLockout) {
      const seconds = extractSeconds(errorMessage);
      if (seconds !== null && seconds > 0) {
        setWaitSeconds(seconds);
        onLockoutStart?.(seconds);
        return true;
      }
    }
    return false;
  };

  // Resetear bloqueo manualmente
  const resetLockout = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setWaitSeconds(null);
    onLockoutEnd?.();
  };

  // Timer regresivo
  useEffect(() => {
    if (waitSeconds === null) return;
    if (waitSeconds <= 0) {
      resetLockout();
      return;
    }
    intervalRef.current = setInterval(() => {
      setWaitSeconds((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [waitSeconds]);

  return { waitSeconds, checkLockout, resetLockout };
}
