"use client";

import { usePathname } from "next/navigation";
import { useBreakpoint, type Breakpoint } from "./useBreakpoint";

export interface NavbarConfig {
  /** Mostrar solo el logo (sin menú hamburguesa ni enlaces) */
  minimal: boolean;
  /** Flotante absoluto y transparente (overlay) */
  overlay: boolean;
}

export type NavbarBehavior =
  | "normal" // sticky, fondo blanco, menú completo
  | "minimal" // solo logo, pero ocupando espacio (sticky)
  | "floating" // minimal + overlay + transparente
  | "hidden"; // oculto (si alguna vez lo necesitas)

/**
 * Configuración por ruta y por breakpoint.
 * Ejemplo:
 * {
 *   "/login": {
 *     default: "floating",
 *     breakpoints: { "md": "minimal", "sm": "normal" }
 *   }
 * }
 */
export interface ResponsiveNavbarOptions {
  /** Comportamiento por defecto para esta ruta */
  default: NavbarBehavior;
  /** Sobrescribir comportamiento en breakpoints específicos */
  breakpoints?: Partial<Record<Breakpoint, NavbarBehavior>>;
}

export function useResponsiveNavbar(
  customConfig?: Record<string, ResponsiveNavbarOptions>,
) {
  const pathname = usePathname();
  const breakpoint = useBreakpoint();

  const defaultConfig: Record<string, ResponsiveNavbarOptions> = {
    "/login": {
      default: "floating",
      breakpoints: {
        xs: "minimal",
        sm: "minimal",
        md: "minimal",
        lg: "floating",
        xl: "floating",
        "2xl": "floating",
      },
    },
    "/register": {
      default: "floating",
      breakpoints: {
        xs: "minimal",
        sm: "minimal",
        md: "minimal",
        lg: "floating",
        xl: "floating",
        "2xl": "floating",
      },
    },
    "/frm_reset": {
      default: "floating",
      breakpoints: {
        xs: "minimal",
        sm: "minimal",
        md: "minimal",
        lg: "floating",
        xl: "floating",
        "2xl": "floating",
      },
    },
  };

  const config = { ...defaultConfig, ...customConfig };
  const routeConfig = config[pathname] || {
    default: "normal",
    breakpoints: {},
  };
  const behavior = routeConfig.breakpoints?.[breakpoint] || routeConfig.default;

  const navbarProps = (() => {
    switch (behavior) {
      case "normal":
        return { minimal: false, overlay: false, needsPadding: false };
      case "minimal":
        return { minimal: true, overlay: false, needsPadding: false };
      case "floating":
        return { minimal: true, overlay: true, needsPadding: true }; // ← añadido
      case "hidden":
        return {
          minimal: true,
          overlay: true,
          needsPadding: false,
          hidden: true,
        };
      default:
        return { minimal: false, overlay: false, needsPadding: false };
    }
  })();

  return navbarProps;
}
