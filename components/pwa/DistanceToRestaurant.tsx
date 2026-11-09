"use client";

import { useState, useSyncExternalStore } from "react";
import { LocateFixed, Navigation } from "lucide-react";
import { Boton } from "@/components/ui/Boton";
import { BotonEnlace } from "@/components/ui/BotonEnlace";
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
  3: "Tu ubicación tardó demasiado. Inténtalo de nuevo.",
};

/**
 * Usa el GPS del dispositivo (Geolocation API) para decir qué tan lejos está
 * el cliente del restaurante y abrir la ruta en Google Maps. El cálculo es
 * local, así que funciona aun sin internet; solo el mapa necesita conexión.
 */
export default function DistanceToRestaurant({ className = "" }: { className?: string }) {
  const online = useOnlineStatus();
  // Se lee del navegador sin efecto: en el servidor, nunca disponible.
  const supported = useSyncExternalStore(() => () => {}, () => "geolocation" in navigator, () => false);
  const [state, setState] = useState<State>({ status: "idle" });

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

  // Estilo del sistema (PLAN 4.21): botón fantasma, enlace del sistema y avisos en texto secundario.
  return (
    <div className={`flex flex-col gap-2 text-(length:--texto-pequeno) ${className}`}>
      {state.status === "done" ? (
        (() => {
          const { walking, minutes } = estimate(state.km);
          return (
            <>
              <p className="m-0 text-texto-principal">
                Estás a <strong className="numeros-tabulares">{formatDistance(state.km)}</strong> del restaurante · unos{" "}
                <span className="numeros-tabulares">{minutes}</span> min {walking ? "caminando" : "en coche"}
              </p>
              {online ? (
                <BotonEnlace href={directionsUrl(state.origin, walking)} target="_blank" rel="noopener noreferrer" variante="fantasma" tamano="compacto" icono={<Navigation />} className="-ms-3 self-start">
                  Ver la ruta<span className="solo-lectores"> (abre el mapa en otra pestaña)</span>
                </BotonEnlace>
              ) : (
                <p className="m-0 text-texto-secundario">Con conexión podrás abrir la ruta en el mapa.</p>
              )}
            </>
          );
        })()
      ) : (
        <Boton variante="fantasma" tamano="compacto" icono={<LocateFixed />} onClick={locate} cargando={state.status === "locating"} textoCargando="Buscando tu ubicación…" className="-ms-3 self-start">
          ¿A qué distancia estoy?
        </Boton>
      )}
      {state.status === "error" && <p role="status" className="m-0 text-texto-secundario">{state.message}</p>}
    </div>
  );
}
