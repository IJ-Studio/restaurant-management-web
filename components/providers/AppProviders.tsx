"use client";

import { Provider as ReduxProvider } from "react-redux";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { DesignSystemProvider } from "@/components/providers/DesignSystemProvider";
import { store } from "@/store/index";

interface AppProvidersProps {
  children: React.ReactNode;
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
      <DesignSystemProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </DesignSystemProvider>
    </ReduxProvider>
  );
}
