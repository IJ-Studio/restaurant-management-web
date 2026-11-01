import localFont from "next/font/local";

// Fuentes autoalojadas (DESIGN.md § Typography): archivos variables del subconjunto
// latino en app/_fuentes (licencia OFL). Se usa next/font/local porque la descarga
// de next/font/google en el build falla en este entorno (PLAN 1.5). next/font genera
// una fuente de respaldo con métricas ajustadas para evitar saltos al cargar.

export const fuenteTitulos = localFont({
  src: [
    { path: "./_fuentes/fraunces-normal-latin.woff2", weight: "100 900", style: "normal" },
    { path: "./_fuentes/fraunces-italic-latin.woff2", weight: "100 900", style: "italic" },
  ],
  display: "swap",
  adjustFontFallback: "Times New Roman",
  variable: "--fuente-titulos",
});

export const fuenteTexto = localFont({
  src: [{ path: "./_fuentes/dmsans-normal-latin.woff2", weight: "100 1000", style: "normal" }],
  display: "swap",
  adjustFontFallback: "Arial",
  variable: "--fuente-texto",
});
