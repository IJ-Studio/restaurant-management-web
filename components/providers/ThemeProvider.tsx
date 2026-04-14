"use client";

import { ReactNode } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  // No usamos next-themes, simplemente renderizamos los hijos
  return <>{children}</>;
}
