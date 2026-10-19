"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";

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

function wasDismissed() {
  try {
    return localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
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
    if (isStandalone() || wasDismissed()) return;

    if (isIos()) {
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
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* almacenamiento no disponible: solo se oculta en esta visita */
    }
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
      className="fixed inset-x-4 bottom-4 z-[60] mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-[var(--color-text)] shadow-2xl sm:inset-x-auto sm:right-6"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icons/icon-192.png" alt="" width={44} height={44} className="shrink-0 rounded-xl" />

      <div className="min-w-0 flex-1 text-sm">
        <p className="font-bold">Instala El Quijote</p>
        {showIosHint ? (
          <p className="text-[var(--color-text-sec)]">
            Toca <Share className="inline h-4 w-4 align-text-bottom" aria-label="Compartir" /> y
            luego «Agregar a inicio».
          </p>
        ) : (
          <p className="text-[var(--color-text-sec)]">
            Accede más rápido al menú y a tus pedidos.
          </p>
        )}
      </div>

      {deferred && (
        <button
          type="button"
          onClick={install}
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[var(--color-brand)] px-3 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          <Download className="h-4 w-4" />
          Instalar
        </button>
      )}

      <button
        type="button"
        onClick={dismiss}
        aria-label="Cerrar"
        className="shrink-0 rounded-lg p-1 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
