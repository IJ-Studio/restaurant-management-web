const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function getAvailability(fecha: string, hora: string, numComensales: number) {
  const res = await fetch(
    `${API_URL}/reservations/availability?fecha=${fecha}&hora=${hora}&numComensales=${numComensales}`
  );
  if (!res.ok) throw new Error('Error al consultar disponibilidad');
  return res.json();
}

export async function getTableMap(fechaHora?: string) {
  const url = fechaHora ? `${API_URL}/reservations/map?fechaHora=${fechaHora}` : `${API_URL}/reservations/map`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al cargar el mapa de mesas');
  return res.json();
}

export async function createReservation(data: any) {
  const res = await fetch(`${API_URL}/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al crear reserva');
  }
  return res.json();
}

export async function getReservations(filters?: { fechaDesde?: string; fechaHasta?: string; estatus?: string; clienteNombre?: string }) {
  const params = new URLSearchParams(filters as any);
  const res = await fetch(`${API_URL}/reservations?${params}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  if (!res.ok) throw new Error('Error al obtener reservas');
  return res.json();
}

export async function updateReservation(id: string, data: any) {
  const res = await fetch(`${API_URL}/reservations/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al actualizar reserva');
  return res.json();
}
