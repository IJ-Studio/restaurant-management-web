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
 * Versión funcional adelantada en PLAN 1.6; el acabado final llega en PLAN 3.12.
 */
export function PanelAccesibilidad({ className }: { className?: string }) {
  const { preferencias, actualizar } = usePreferencias();
  const id = useId();

  return (
    <Popover.Root>
      <Popover.Trigger
        aria-label="Opciones de accesibilidad"
        className={cn(
          "area-tactil-minima rounded-control text-current transition-colors duration-(--duracion-breve) hover:bg-superficie-cafe",
          className,
        )}
      >
        <Settings2 aria-hidden="true" className="size-5" strokeWidth={1.5} />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          collisionPadding={16}
          aria-labelledby={`${id}-titulo`}
          className="z-50 w-[min(20rem,calc(100vw-2rem))] rounded-dialogo border border-borde-sutil bg-superficie-elevada p-(--espacio-lg) text-texto-principal shadow-flotante"
        >
          <p id={`${id}-titulo`} className="font-titulos text-(length:--texto-titulo-interfaz) leading-tight">
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
                    className="flex min-h-11 cursor-pointer items-center gap-(--espacio-sm) rounded-control px-(--espacio-sm) text-(length:--texto-cuerpo) hover:bg-superficie-cafe has-checked:bg-superficie-cafe"
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
            className="mt-(--espacio-md) min-h-11 w-full rounded-control border border-borde-control text-(length:--texto-etiqueta) font-semibold uppercase tracking-[0.16em] hover:bg-superficie-cafe"
          >
            Cerrar
          </Popover.Close>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
