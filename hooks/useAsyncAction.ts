"use client";

import { useState, useCallback } from "react";

interface AsyncActionOptions<T, A extends unknown[]> {
  /** Función asíncrona a ejecutar */
  action: (...args: A) => Promise<T>;
  /** Mensaje de éxito opcional */
  successMessage?: string;
  /** Callback al completar con éxito */
  onSuccess?: (result: T) => void;
  /** Callback al ocurrir error */
  onError?: (error: Error) => void;
  /** Callback al finalizar (siempre) */
  onFinally?: () => void;
  /** Hook de lockout (opcional) para manejar bloqueos automáticos */
  lockout?: {
    checkLockout: (errorMessage: string) => boolean;
    resetLockout: () => void;
  };
}

export function useAsyncAction<T, A extends unknown[] = []>({
  action,
  successMessage,
  onSuccess,
  onError,
  onFinally,
  lockout,
}: AsyncActionOptions<T, A>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: A) => {
      setLoading(true);
      setError(null);
      setSuccess(null);
      if (lockout) lockout.resetLockout();

      try {
        const result = await action(...args);
        const msg =
          successMessage ||
          (typeof result === "string" ? result : "Operación exitosa");
        setSuccess(msg);
        onSuccess?.(result);
        return result;
      } catch (err) {
        const errorMsg = (err as Error).message || "Ocurrió un error";
        setError(errorMsg);
        onError?.(err as Error);

        // Si hay lockout y el error activa bloqueo, lo procesa
        if (lockout && lockout.checkLockout(errorMsg)) {
          // No mostramos el error en UI porque ya se maneja con waitSeconds
          setError(null);
        }
        throw err;
      } finally {
        setLoading(false);
        onFinally?.();
      }
    },
    [action, successMessage, onSuccess, onError, onFinally, lockout],
  );

  return { execute, loading, error, success, setError, setSuccess };
}
