// hooks/useTheme.ts
import { usePreferencias } from "@/components/providers/PreferenciasProvider";

/** true si el tema activo es el oscuro (el tema por defecto). */
export function useTheme(): boolean {
  return usePreferencias().preferencias.tema === "oscuro";
}
