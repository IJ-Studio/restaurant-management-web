"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { Boton } from "@/components/ui/Boton";

const DISMISS_KEY = "pwa-install-dismissed";

// Evento no estándar de Chromium; TypeScript no lo incluye en lib.dom.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

// El aviso cerrado ya no se guarda en localStorage (PLAN 2.15): dura lo que la visita.
let descartado = false;

/** Retira el valor que guardaban las versiones anteriores. */
function retirarClaveAntigua() {
  try {
    localStorage.removeItem(DISMISS_KEY);
  } catch {
    /* almacenamiento no disponible: no hay nada que retirar */
  }
}

/**
 * Banner para instalar la app. En Chrome/Edge/Android usa el diálogo nativo
 * (beforeinstallprompt); en iOS Safari, que no lo soporta, muestra cómo
 * agregarla a la pantalla de inicio. Se oculta si ya está instalada o si el
 * usuario lo cerró.
 */
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    retirarClaveAntigua();
    if (isStandalone() || descartado) return;

    if (isIos()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- el sistema solo se conoce en el navegador, al montar
      setShowIosHint(true);
      return;
    }

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setDeferred(null);

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismiss = () => {
    descartado = true;
    setDeferred(null);
    setShowIosHint(false);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "dismissed") dismiss();
    setDeferred(null);
  };

  if (!deferred && !showIosHint) return null;

  return (
    <div
      role="dialog"
      aria-label="Instalar aplicación"
      className="fixed inset-x-4 bottom-4 z-[60] mx-auto flex max-w-md items-center gap-3 rounded-tarjeta border border-borde-sutil bg-superficie-elevada p-4 text-texto-principal shadow-flotante sm:inset-x-auto sm:right-6"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icons/icon-192.png" alt="" width={44} height={44} className="shrink-0 rounded-control" />

      <div className="min-w-0 flex-1 text-(length:--texto-pequeno)">
        <p className="m-0 font-semibold">Instala El Quijote</p>
        {showIosHint ? (
          <p className="m-0 text-texto-secundario">
            Toca <Share className="inline h-4 w-4 align-text-bottom" aria-label="Compartir" /> y
            luego «Agregar a inicio».
          </p>
        ) : (
          <p className="m-0 text-texto-secundario">
            Accede más rápido al menú y a tus pedidos.
          </p>
        )}
      </div>

      {deferred && (
        <Boton tamano="compacto" icono={<Download />} onClick={install} className="shrink-0">
          Instalar
        </Boton>
      )}

      <Boton variante="fantasma" tamano="compacto" soloIcono icono={<X />} onClick={dismiss} className="shrink-0">
        Cerrar
      </Boton>
    </div>
  );
}
