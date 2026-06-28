"use client";

import { Provider as ReduxProvider, useDispatch } from "react-redux";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { DesignSystemProvider } from "@/components/providers/DesignSystemProvider";
import { store, type AppDispatch } from "@/store/index";
import { useEffect } from "react";
import { hydrateSession } from "@/store/slices/authSlice";

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
    <ReduxProvider store={store}>
      <ThemeProvider>
        <DesignSystemProvider>      
          <AuthInitializer>
            {children}
          </AuthInitializer>
        </DesignSystemProvider>
      </ThemeProvider>
    </ReduxProvider>
  );
}

