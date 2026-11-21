"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import {
  PREFERENCIAS_POR_DEFECTO,
  aplicarPreferencias,
  guardarPreferencias,
  leerPreferencias,
  validarPreferencias,
  type Preferencias,
} from "@/lib/preferencias/preferencias";

interface ContextoPreferencias {
  preferencias: Preferencias;
  actualizar: (cambios: Partial<Omit<Preferencias, "v">>) => void;
}

// El contexto solo lleva `actualizar`, que no cambia nunca. Las preferencias se leen con
// `useSyncExternalStore` en cada consumidor: si el valor del contexto cambiara al hidratar, React
// tendría que pintar en el cliente todo segmento aún en streaming bajo la raíz (el panel entero,
// por `app/loading.tsx`) y convivirían dos copias del marco del panel hasta que llega su HTML.
const Contexto = createContext<ContextoPreferencias["actualizar"] | null>(null);

// Almacén mínimo: una sola fuente en memoria, sincronizada con localStorage y con
// otras pestañas mediante el evento "storage".
let actual: Preferencias | null = null;
const oyentes = new Set<() => void>();

function instantanea(): Preferencias {
  if (!actual) actual = leerPreferencias();
  return actual;
}

function suscribir(oyente: () => void) {
  oyentes.add(oyente);
  const alCambiarOtraPestana = (e: StorageEvent) => {
    if (e.key !== null && e.key !== "elquijote:preferencias") return;
    actual = leerPreferencias();
    aplicarPreferencias(actual);
    oyentes.forEach((o) => o());
  };
  window.addEventListener("storage", alCambiarOtraPestana);
  return () => {
    oyentes.delete(oyente);
    window.removeEventListener("storage", alCambiarOtraPestana);
  };
}

const instantaneaServidor = () => PREFERENCIAS_POR_DEFECTO;

export function PreferenciasProvider({ children }: { children: React.ReactNode }) {
  // Al montar: completa la migración de la clave antigua y ajusta theme-color.
  useEffect(() => {
    guardarPreferencias(instantanea());
    aplicarPreferencias(instantanea());
  }, []);

  const actualizar = useCallback((cambios: Partial<Omit<Preferencias, "v">>) => {
    actual = validarPreferencias({ ...instantanea(), ...cambios });
    guardarPreferencias(actual);
    aplicarPreferencias(actual);
    oyentes.forEach((o) => o());
  }, []);

  return <Contexto.Provider value={actualizar}>{children}</Contexto.Provider>;
}

export function usePreferencias(): ContextoPreferencias {
  const actualizar = useContext(Contexto);
  if (!actualizar) throw new Error("usePreferencias debe usarse dentro de PreferenciasProvider");
  const preferencias = useSyncExternalStore(suscribir, instantanea, instantaneaServidor);
  return useMemo(() => ({ preferencias, actualizar }), [preferencias, actualizar]);
}
