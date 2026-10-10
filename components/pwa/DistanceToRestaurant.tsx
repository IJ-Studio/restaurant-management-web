"use client";

import { useEffect, useState } from "react";
import { Loader2, LocateFixed, Navigation } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

// Coordenadas del restaurante (las mismas del mapa de Google en /about).
const RESTAURANT = { lat: 21.1391737, lng: -98.4199769 };

type State =
  | { status: "idle" }
  | { status: "locating" }
  | { status: "done"; km: number; origin: { lat: number; lng: number } }
  | { status: "error"; message: string };

// Distancia en línea recta entre dos puntos (fórmula de Haversine).
function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function formatDistance(km: number) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

// Estimación aproximada: caminando (~5 km/h) si está cerca, en auto por
// ciudad (~25 km/h) si no.
function estimate(km: number) {
  const walking = km < 1.5;
  const minutes = Math.max(1, Math.round((km / (walking ? 5 : 25)) * 60));
  return { walking, minutes };
}

const ERRORS: Record<number, string> = {
  1: "Permite el acceso a tu ubicación en el navegador para calcular la distancia.",
  2: "No pudimos obtener tu ubicación. Revisa que el GPS esté encendido.",
  3: "Tu ubicación tardó demasiado. Intenta de nuevo.",
};

/**
 * Usa el GPS del dispositivo (Geolocation API) para decir qué tan lejos está
 * el cliente del restaurante y abrir la ruta en Google Maps. El cálculo es
 * local, así que funciona aun sin internet; solo el mapa necesita conexión.
 */
export default function DistanceToRestaurant({ className = "" }: { className?: string }) {
  const online = useOnlineStatus();
  const [supported, setSupported] = useState(false);
  const [state, setState] = useState<State>({ status: "idle" });

  useEffect(() => {
    setSupported("geolocation" in navigator);
  }, []);

  if (!supported) return null;

  const locate = () => {
    setState({ status: "locating" });
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const origin = { lat: coords.latitude, lng: coords.longitude };
        setState({ status: "done", km: distanceKm(origin, RESTAURANT), origin });
      },
      (error) => setState({ status: "error", message: ERRORS[error.code] ?? ERRORS[2] }),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  };

  const directionsUrl = (origin?: { lat: number; lng: number }, walking?: boolean) => {
    const params = new URLSearchParams({
      api: "1",
      destination: `${RESTAURANT.lat},${RESTAURANT.lng}`,
      travelmode: walking ? "walking" : "driving",
    });
    if (origin) params.set("origin", `${origin.lat},${origin.lng}`);
    return `https://www.google.com/maps/dir/?${params}`;
  };

  return (
    <div className={`text-sm ${className}`}>
      {state.status === "done" ? (
        (() => {
          const { walking, minutes } = estimate(state.km);
          return (
            <div className="space-y-2">
              <p className="text-[var(--color-text)]">
                Estás a <strong>{formatDistance(state.km)}</strong> del restaurante · aprox.{" "}
                {minutes} min {walking ? "caminando" : "en auto"}
              </p>
              {online ? (
                <a
                  href={directionsUrl(state.origin, walking)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-semibold text-[var(--color-brand)] hover:underline"
                >
                  <Navigation size={14} /> Cómo llegar
                </a>
              ) : (
                <p className="text-xs text-[var(--color-text-muted)]">
                  Conéctate a internet para abrir la ruta en el mapa.
                </p>
              )}
            </div>
          );
        })()
      ) : (
        <button
          type="button"
          onClick={locate}
          disabled={state.status === "locating"}
          className="inline-flex items-center gap-1.5 font-semibold text-[var(--color-brand)] hover:underline disabled:opacity-60"
        >
          {state.status === "locating" ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Buscando tu ubicación…
            </>
          ) : (
            <>
              <LocateFixed size={14} /> ¿Qué tan lejos estoy?
            </>
          )}
        </button>
      )}
      {state.status === "error" && (
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">{state.message}</p>
      )}
    </div>
  );
}
