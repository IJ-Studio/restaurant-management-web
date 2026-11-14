"use client";

import * as Popover from "@radix-ui/react-popover";
import { Settings2 } from "lucide-react";
import { useId } from "react";
import { cn } from "@/lib/utils";
import { usePreferencias } from "@/components/providers/PreferenciasProvider";
import type { Movimiento, Preferencias, TamanoTexto, Tema } from "@/lib/preferencias/preferencias";

type Grupo<K extends keyof Omit<Preferencias, "v">> = {
  clave: K;
  rotulo: string;
  opciones: { valor: Preferencias[K]; texto: string }[];
};

const GRUPOS = [
  {
    clave: "tema",
    rotulo: "Tema",
    opciones: [
      { valor: "oscuro" as Tema, texto: "Oscuro" },
      { valor: "claro" as Tema, texto: "Claro" },
    ],
  } satisfies Grupo<"tema">,
  {
    clave: "tamanoTexto",
    rotulo: "Tamaño de texto",
    opciones: [
      { valor: "normal" as TamanoTexto, texto: "Normal" },
      { valor: "grande" as TamanoTexto, texto: "Grande" },
      { valor: "muy-grande" as TamanoTexto, texto: "Muy grande" },
    ],
  } satisfies Grupo<"tamanoTexto">,
  {
    clave: "movimiento",
    rotulo: "Movimiento",
    opciones: [
      { valor: "sistema" as Movimiento, texto: "Según el sistema" },
      { valor: "reducido" as Movimiento, texto: "Reducido" },
    ],
  } satisfies Grupo<"movimiento">,
];

/**
 * Opciones de accesibilidad: tema, tamaño de texto y movimiento (DESIGN.md § PanelAccesibilidad).
 * Versión funcional del PLAN 1.6, con el acabado del 3.12: aparece como los menús flotantes
 * (`.menu-flotante`), título como el de los diálogos, por encima de la cabecera fija, y un
 * disparador con texto (`conTexto`) para el pie y el menú móvil.
 *
 * Es un Popover de Radix (`role="dialog"` con nombre): el foco entra al abrir, Esc lo cierra y el
 * foco vuelve al botón. Cada grupo es un `fieldset` con `legend` y botones de opción nativos, así
 * que las flechas cambian la opción y el cambio se aplica al momento.
 */
export function PanelAccesibilidad({ className, conTexto = false }: { className?: string; conTexto?: boolean }) {
  const { preferencias, actualizar } = usePreferencias();
  const id = useId();

  return (
    <Popover.Root>
      <Popover.Trigger
        aria-label={conTexto ? undefined : "Opciones de accesibilidad"}
        data-prueba={conTexto ? "accesibilidad-con-texto" : "accesibilidad"}
        className={cn(
          "area-tactil-minima gap-2 rounded-control text-current transition-colors duration-(--duracion-breve) al-pasar:bg-superficie-cafe",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco",
          conTexto && "px-3",
          className,
        )}
      >
        <Settings2 aria-hidden="true" className="size-5" strokeWidth={1.5} />
        {conTexto && <span>Opciones de accesibilidad</span>}
      </Popover.Trigger>
      <Popover.Portal>
        {/* z 210: por encima del panel lateral del menú móvil (201) y su velo (200), donde también se abre. */}
        <Popover.Content
          align="end"
          sideOffset={8}
          collisionPadding={16}
          aria-labelledby={`${id}-titulo`}
          className="menu-flotante z-[210] max-h-(--radix-popover-content-available-height) w-[min(20rem,calc(100vw-2rem))] overflow-y-auto overscroll-contain rounded-dialogo border border-borde-sutil bg-superficie-elevada p-(--espacio-lg) text-texto-principal shadow-flotante"
        >
          <p id={`${id}-titulo`} className="m-0 font-texto text-(length:--texto-titulo-interfaz) font-semibold leading-[1.35]">
            Opciones de accesibilidad
          </p>
          <div className="mt-(--espacio-md) grid gap-(--espacio-lg)">
            {GRUPOS.map((grupo) => (
              <fieldset key={grupo.clave} className="grid gap-(--espacio-xs)">
                <legend className="mb-(--espacio-xs) text-(length:--texto-etiqueta) font-semibold uppercase tracking-[0.16em] text-texto-secundario">
                  {grupo.rotulo}
                </legend>
                {grupo.opciones.map((opcion) => (
                  <label
                    key={opcion.valor}
                    className="flex min-h-11 cursor-pointer items-center gap-(--espacio-sm) rounded-control px-(--espacio-sm) text-(length:--texto-cuerpo) al-pasar:bg-superficie-cafe has-checked:bg-superficie-cafe"
                  >
                    <input
                      type="radio"
                      name={`${id}-${grupo.clave}`}
                      value={opcion.valor}
                      checked={preferencias[grupo.clave] === opcion.valor}
                      onChange={() => actualizar({ [grupo.clave]: opcion.valor })}
                      className="size-4 accent-acento"
                    />
                    {opcion.texto}
                  </label>
                ))}
              </fieldset>
            ))}
          </div>
          <Popover.Close
            aria-label="Cerrar opciones de accesibilidad"
            className="mt-(--espacio-md) min-h-11 w-full rounded-control border border-borde-control text-(length:--texto-etiqueta) font-semibold uppercase tracking-[0.16em] al-pasar:bg-superficie-cafe focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco"
          >
            Cerrar
          </Popover.Close>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
