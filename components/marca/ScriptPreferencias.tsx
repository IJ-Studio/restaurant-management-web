/**
 * Aplica las preferencias de accesibilidad antes de pintar (sin parpadeo).
 * Es un archivo estático y síncrono en lugar de un script en línea para no usar
 * HTML insertado en crudo (decisión D-03). Recibe el nonce de la CSP (PLAN 2.3).
 */
export function ScriptPreferencias({ nonce }: { nonce?: string }) {
  // eslint-disable-next-line @next/next/no-sync-scripts -- debe ejecutarse antes del primer pintado.
  return <script src="/preferencias.js" nonce={nonce} />;
}
