"use client";

import * as Popover from "@radix-ui/react-popover";
import { Info } from "lucide-react";

interface PasswordRequirementsProps {
  validations: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
}

export default function PasswordRequirements({
  validations,
}: PasswordRequirementsProps) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="rounded-full p-1 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand/50"
          aria-label="Ver requisitos de la contraseña"
        >
          <Info className="w-4 h-4" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          sideOffset={8}
          align="end"
          className="z-50 w-64 rounded-lg border border-gray-200 bg-white p-4 shadow-lg animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
        >
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">
              Tu contraseña debe tener:
            </p>
            <ul className="space-y-1.5 text-xs">
              <li className="flex items-center gap-2">
                <span
                  className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                    validations.length
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {validations.length ? "✓" : "○"}
                </span>
                <span
                  className={
                    validations.length ? "text-gray-700" : "text-gray-500"
                  }
                >
                  Al menos 8 caracteres
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span
                  className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                    validations.uppercase
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {validations.uppercase ? "✓" : "○"}
                </span>
                <span
                  className={
                    validations.uppercase ? "text-gray-700" : "text-gray-500"
                  }
                >
                  Una letra mayúscula
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span
                  className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                    validations.lowercase
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {validations.lowercase ? "✓" : "○"}
                </span>
                <span
                  className={
                    validations.lowercase ? "text-gray-700" : "text-gray-500"
                  }
                >
                  Una letra minúscula
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span
                  className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                    validations.number
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {validations.number ? "✓" : "○"}
                </span>
                <span
                  className={
                    validations.number ? "text-gray-700" : "text-gray-500"
                  }
                >
                  Un número
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span
                  className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                    validations.special
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {validations.special ? "✓" : "○"}
                </span>
                <span
                  className={
                    validations.special ? "text-gray-700" : "text-gray-500"
                  }
                >
                  Un caracter especial (! @ # $ % & , . _ -)
                </span>
              </li>
            </ul>
          </div>
          <Popover.Close className="absolute right-2 top-2 rounded-full p-1 text-gray-400 hover:text-gray-600 focus:outline-none">
            <span className="sr-only">Cerrar</span>✕
          </Popover.Close>
          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
