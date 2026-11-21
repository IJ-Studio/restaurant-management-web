"use client";

import { Provider as ReduxProvider, useDispatch } from "react-redux";
import { PreferenciasProvider } from "@/components/providers/PreferenciasProvider";
import { reductorRaiz, store, type AppDispatch } from "@/store/index";
import { useEffect } from "react";
import { hydrateSession } from "@/store/slices/authSlice";
import { ProveedorNotificaciones } from "@/components/ui/Notificacion";

// Lo que pinta el servidor: el estado inicial, sin sesión. `useSelector` lo usa al hidratar, así que
// el HTML coincide aunque /api/auth/me ya haya respondido, y se actualiza justo después (React #418
// en la cuenta de la cabecera). Constante de módulo: si cambiara de referencia, el Provider cambiaría
// su valor de contexto y React volvería a pintar en el cliente los segmentos en streaming.
const ESTADO_SERVIDOR = reductorRaiz(undefined, { type: "@@quijote/estado-servidor" });

interface AppProvidersProps {
  children: React.ReactNode;
}

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(hydrateSession());
  }, [dispatch]);

  return <>{children}</>;
}

/**
 * AppProviders — wraps all client-side providers.
 *
 * This is intentionally a Client Component ("use client") so that the
 * root layout (app/layout.tsx) can remain a Server Component, enabling
 * SSR and React Server Components across the entire app.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ReduxProvider store={store} serverState={ESTADO_SERVIDOR}>
      <PreferenciasProvider>
        {/* Sin DesignSystemProvider (PLAN 5.14, D-12): la apariencia es la de DESIGN.md. */}
        <AuthInitializer>
          {/* Notificaciones del sistema en todo el sitio (PLAN 4.12): sustituyen a alert(). */}
          <ProveedorNotificaciones>{children}</ProveedorNotificaciones>
        </AuthInitializer>
      </PreferenciasProvider>
    </ReduxProvider>
  );
}

