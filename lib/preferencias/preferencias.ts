// Preferencias de accesibilidad (DESIGN.md § PanelAccesibilidad).
// Es el único uso permitido de localStorage: tema, tamaño de texto y movimiento,
// sin datos personales. public/preferencias.js aplica lo mismo antes de pintar;
// si cambias la clave o el formato, cambia también ese archivo.

export const CLAVE_PREFERENCIAS = "elquijote:preferencias";
/** Clave del conmutador de tema antiguo; se migra una vez y se borra. */
const CLAVE_TEMA_ANTIGUA = "theme";

export type Tema = "oscuro" | "claro";
export type TamanoTexto = "normal" | "grande" | "muy-grande";
export type Movimiento = "sistema" | "reducido";

export interface Preferencias {
  v: 1;
  tema: Tema;
  tamanoTexto: TamanoTexto;
  movimiento: Movimiento;
}

export const PREFERENCIAS_POR_DEFECTO: Preferencias = {
  v: 1,
  tema: "oscuro",
  tamanoTexto: "normal",
  movimiento: "sistema",
};

const TEMAS: readonly Tema[] = ["oscuro", "claro"];
const TAMANOS: readonly TamanoTexto[] = ["normal", "grande", "muy-grande"];
const MOVIMIENTOS: readonly Movimiento[] = ["sistema", "reducido"];

const de = <T extends string>(valores: readonly T[], valor: unknown, porDefecto: T): T =>
  valores.includes(valor as T) ? (valor as T) : porDefecto;

/** Devuelve siempre unas preferencias válidas, descartando cualquier valor desconocido. */
export function validarPreferencias(dato: unknown): Preferencias {
  const p = (dato && typeof dato === "object" ? dato : {}) as Partial<Record<keyof Preferencias, unknown>>;
  return {
    v: 1,
    tema: de(TEMAS, p.tema, PREFERENCIAS_POR_DEFECTO.tema),
    tamanoTexto: de(TAMANOS, p.tamanoTexto, PREFERENCIAS_POR_DEFECTO.tamanoTexto),
    movimiento: de(MOVIMIENTOS, p.movimiento, PREFERENCIAS_POR_DEFECTO.movimiento),
  };
}

export function leerPreferencias(): Preferencias {
  try {
    const guardado = localStorage.getItem(CLAVE_PREFERENCIAS);
    if (guardado) return validarPreferencias(JSON.parse(guardado));
    const antiguo = localStorage.getItem(CLAVE_TEMA_ANTIGUA);
    if (antiguo === "light" || antiguo === "dark") {
      const migradas = { ...PREFERENCIAS_POR_DEFECTO, tema: antiguo === "light" ? "claro" : "oscuro" } as Preferencias;
      guardarPreferencias(migradas);
      return migradas;
    }
  } catch {
    // Sin acceso a localStorage (modo privado, cuota): valores por defecto.
  }
  return PREFERENCIAS_POR_DEFECTO;
}

export function guardarPreferencias(preferencias: Preferencias): void {
  try {
    localStorage.setItem(CLAVE_PREFERENCIAS, JSON.stringify(validarPreferencias(preferencias)));
    localStorage.removeItem(CLAVE_TEMA_ANTIGUA);
  } catch {
    // Si no se puede guardar, la preferencia dura solo esta visita.
  }
}

/** Refleja las preferencias en <html>; los tokens de styles/tokens.css hacen el resto. */
export function aplicarPreferencias(preferencias: Preferencias, raiz: HTMLElement = document.documentElement): void {
  raiz.dataset.tema = preferencias.tema;
  if (preferencias.tamanoTexto === "normal") delete raiz.dataset.tamanoTexto;
  else raiz.dataset.tamanoTexto = preferencias.tamanoTexto;
  if (preferencias.movimiento === "reducido") raiz.dataset.movimiento = "reducido";
  else delete raiz.dataset.movimiento;

  // La barra del navegador móvil toma el color de fondo calculado del tema activo.
  const fondo = getComputedStyle(raiz).getPropertyValue("--color-fondo").trim();
  if (fondo) {
    document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
      meta.content = fondo;
    });
  }
}
