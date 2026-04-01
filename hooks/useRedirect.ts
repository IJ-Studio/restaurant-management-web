/**
 * hooks/useRedirect.ts
 *
 * Hook for programmatic navigation with role-based redirect.
 */
"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function useRedirect() {
  const router = useRouter();

  const redirectTo = useCallback(
    (path: string) => {
      router.push(path);
    },
    [router]
  );

  const redirectToRole = useCallback(
    (role: string) => {
      const roleMap: Record<string, string> = {
        admin:   "/dashboard/admin",
        cajero:  "/dashboard/cajero",
        mesero:  "/dashboard/mesero",
        cocina:  "/dashboard/cocina",
        cliente: "/dashboard/cliente",
      };
      const dest = roleMap[role] ?? "/dashboard/cliente";
      router.push(dest);
    },
    [router]
  );

  return { redirectTo, redirectToRole };
}
