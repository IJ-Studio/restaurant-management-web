import { api } from "@/lib/api";
import { nombrePropio } from "@/lib/formato/caja";
// Sin respaldo a localhost: el build exige la variable (PLAN 2.16).
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/**
 * Obtiene el token JWT desde:
 * 1. Cookie 'session' (establecida por el login)
 * 2. localStorage 'authToken' (respaldo, usado en login actual)
 */
function getToken(): string | null {
  if (typeof window === 'undefined') return null;

  // Intentar leer la cookie 'session'
  const match = document.cookie.match(/(?:^|;\s*)session=([^;]+)/);
  if (match) return match[1];

  // Fallback a localStorage (con la clave que usa tu login)
  return localStorage.getItem('authToken');
}

/**
 * Construye los headers. Si hay token, agrega Authorization.
 */
function getHeaders(withAuth: boolean = false): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (withAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

export async function getAvailability(fecha: string, hora: string, numComensales: number) {
  const res = await fetch(
    `${API_URL}/reservations/availability?fecha=${fecha}&hora=${hora}&numComensales=${numComensales}`, { cache: "no-store" });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error al consultar disponibilidad' }));
    throw new Error(error.message || `Error al consultar disponibilidad (${res.status})`);
  }
  return res.json();
}

/** Plano para una hora del restaurante («2026-11-15T14:30», sin zona) y un número de personas. */
export async function getTableMap(fechaHora: string, numComensales: number) {
  const params = new URLSearchParams({ fechaHora, numComensales: String(numComensales) });
  const res = await fetch(`${API_URL}/reservations/map?${params}`, { cache: "no-store" });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error al cargar el mapa de mesas' }));
    throw new Error(error.message || `Error al cargar el mapa de mesas (${res.status})`);
  }
  return res.json();
}

/** Pública: si hay sesión, `api` manda el token y el API lo ignora. Lanza `APIError` con el motivo. */
export function createReservation(data: Record<string, unknown>) {
  return api.post<{ mensaje?: string }>("/reservations", data);
}

export async function getReservations(filters?: {
  fechaDesde?: string;
  fechaHasta?: string;
  estatus?: string;
  clienteNombre?: string;
}) {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
  }

  const res = await fetch(`${API_URL}/reservations?${params.toString()}`, { cache: "no-store",
    headers: getHeaders(true),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error al obtener reservas' }));
    throw new Error(error.message || `Error al obtener reservas (${res.status})`);
  }
  const datos = await res.json();
  // El API guarda los nombres en MAYÚSCULAS; aquí se presentan como nombre propio.
  return Array.isArray(datos)
    ? datos.map((r: Record<string, unknown>) => (typeof r?.clienteNombre === "string" ? { ...r, clienteNombre: nombrePropio(r.clienteNombre) } : r))
    : datos;
}

/** Si la predicción de ausencias está activa en el API (Prioridad 3.5). Ante un fallo, no se muestra. */
export async function getNoShowEstado(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/reservations/no-show-model/estado`, { cache: "no-store", headers: getHeaders(true) });
    if (!res.ok) return false;
    const datos = (await res.json()) as { activa?: unknown };
    return datos.activa === true;
  } catch {
    return false;
  }
}

export async function getNoShowRisk(id: string): Promise<{ probabilidad: number; clasificacion: 'Alto' | 'Medio' | 'Bajo' }> {
  const res = await fetch(`${API_URL}/reservations/${id}/no-show-risk`, { cache: "no-store",
    headers: getHeaders(true),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error al calcular riesgo de no-show' }));
    throw new Error(error.message || `Error al calcular riesgo de no-show (${res.status})`);
  }
  return res.json();
}

export async function updateReservation(id: string, data: Record<string, unknown>) {
  const res = await fetch(`${API_URL}/reservations/${id}`, { cache: "no-store",
    method: 'PATCH',
    headers: getHeaders(true),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error al actualizar reserva' }));
    throw new Error(error.message || `Error al actualizar reserva (${res.status})`);
  }
  return res.json();
}

/** Reglas de operación del API (`GET /reglas`): la web no duplica horarios, anticipación ni límites. */
export interface ReglasRestaurante {
  zonaHoraria: string;
  utcOffsetMin: number;
  aceptaReservas: boolean;
  reservas: { anticipacionMin: number; comensalesMax: number; duracionMin: number; intervaloMin: number; diasMaxAdelanto: number };
  horario: { dia: number; cerrado: boolean }[];
  diasEspeciales: { fecha: string; cerrado: boolean }[];
}

export function getReglas() {
  return api.get<ReglasRestaurante>("/reglas");
}

export interface HorasDelDia {
  fecha: string;
  /** El día entero no se puede elegir: «Cerrado», «Ya pasó» o «Fuera de plazo». */
  motivo: string | null;
  horas: { hora: string; disponible: boolean; motivo: string | null }[];
}

/** Horas del día para N personas, todas visibles; las bloqueadas traen su motivo. */
export function getHoras(fecha: string, numComensales: number) {
  return api.get<HorasDelDia>("/reservations/horas", { params: { fecha, numComensales } });
}
