const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000';

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
    `${API_URL}/reservations/availability?fecha=${fecha}&hora=${hora}&numComensales=${numComensales}`
  );
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error al consultar disponibilidad' }));
    throw new Error(error.message || `Error al consultar disponibilidad (${res.status})`);
  }
  return res.json();
}

export async function getTableMap(fechaHora?: string) {
  const url = fechaHora
    ? `${API_URL}/reservations/map?fechaHora=${encodeURIComponent(fechaHora)}`
    : `${API_URL}/reservations/map`;
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error al cargar el mapa de mesas' }));
    throw new Error(error.message || `Error al cargar el mapa de mesas (${res.status})`);
  }
  return res.json();
}

export async function createReservation(data: any) {
  const res = await fetch(`${API_URL}/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error al crear reserva' }));
    throw new Error(error.message || `Error al crear reserva (${res.status})`);
  }
  return res.json();
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

  const res = await fetch(`${API_URL}/reservations?${params.toString()}`, {
    headers: getHeaders(true),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error al obtener reservas' }));
    throw new Error(error.message || `Error al obtener reservas (${res.status})`);
  }
  return res.json();
}

export async function updateReservation(id: string, data: any) {
  const res = await fetch(`${API_URL}/reservations/${id}`, {
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
