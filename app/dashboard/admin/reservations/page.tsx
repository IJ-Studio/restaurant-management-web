'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getReservations, updateReservation, getNoShowRisk } from '@/features/reservations/services/reservations.service';

/* ---------- helpers de autenticación (sin cambios) ---------- */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)session=([^;]+)/);
  if (match) return match[1];
  return localStorage.getItem('authToken');
}

function clearAuthToken() {
  document.cookie = 'session=; Max-Age=0; path=/';
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
}

/* ---------- constantes ---------- */
const statusOptions = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'cancelada', label: 'Cancelada' },
  { value: 'completada', label: 'Completada' },
  { value: 'no_show', label: 'No Show' },
];

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    confirmada: 'bg-green-100 text-green-800',
    pendiente: 'bg-yellow-100 text-yellow-800',
    cancelada: 'bg-red-100 text-red-800',
    completada: 'bg-blue-100 text-blue-800',
    no_show: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

type NoShowRisk = { probabilidad: number; clasificacion: 'Alto' | 'Medio' | 'Bajo' };

const getRiskColor = (clasificacion: string) => {
  const colors: Record<string, string> = {
    Alto: 'bg-red-100 text-red-800',
    Medio: 'bg-amber-100 text-amber-800',
    Bajo: 'bg-green-100 text-green-800',
  };
  return colors[clasificacion] || 'bg-gray-100 text-gray-800';
};

function RiskBadge({ risk }: { risk: NoShowRisk | 'loading' | 'error' | undefined }) {
  if (!risk) return <span className="text-xs text-text-sec">—</span>;
  if (risk === 'loading') return <span className="text-xs text-text-sec animate-pulse">Calculando…</span>;
  if (risk === 'error') return <span className="text-xs text-text-sec">N/D</span>;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${getRiskColor(risk.clasificacion)}`}
      title="Riesgo de no-show (predicción)"
    >
      {risk.clasificacion} · {Math.round(risk.probabilidad * 100)}%
    </span>
  );
}

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

/* ---------- componente ---------- */
export default function AdminReservationsPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ fechaDesde: '', fechaHasta: '', estatus: '', clienteNombre: '' });
  const [authChecked, setAuthChecked] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null); // <-- fila seleccionada
  const [risks, setRisks] = useState<Record<string, NoShowRisk | 'loading' | 'error'>>({});

  /* autenticación */
  useEffect(() => {
    const token = getAuthToken();
    if (!token) router.push('/login?redirect=/dashboard/admin/reservations');
    else setAuthChecked(true);
  }, [router]);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const data = await getReservations(filters);
      setReservations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authChecked) fetchReservations();
  }, [filters, authChecked]);

  // Riesgo de no-show: solo aplica a reservas ya confirmadas (el modelo se
  // dispara al confirmar), y se pide una vez por reserva mientras no cambie
  // la lista cargada.
  useEffect(() => {
    const pendientes = reservations.filter(
      (r) => r.estatus === 'confirmada' && !(r.id in risks),
    );
    if (pendientes.length === 0) return;

    pendientes.forEach((r) => {
      setRisks((prev) => ({ ...prev, [r.id]: 'loading' }));
      getNoShowRisk(r.id)
        .then((data) => setRisks((prev) => ({ ...prev, [r.id]: data })))
        .catch(() => setRisks((prev) => ({ ...prev, [r.id]: 'error' })));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservations]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateReservation(id, { estatus: newStatus });
      fetchReservations();
    } catch (err) {
      alert('Error al actualizar estado');
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    router.push('/login');
  };

  /* spinner mientras se verifica sesión */
  if (!authChecked) {
    return (
      <div className="p-6 min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div>
        <span className="ml-3 text-text-sec">Verificando sesión...</span>
      </div>
    );
  }

  /* ─── UI principal ─── */
  return (
    <div className="min-h-screen bg-surface-muted p-4 md:p-6">
      {/* cabecera */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-text">Gestión de Reservas</h1>

      </div>

      {/* filtros */}
      <div className="bg-surface rounded-xl shadow-sm border border-border p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <input
          type="date"
          value={filters.fechaDesde}
          onChange={(e) => setFilters({ ...filters, fechaDesde: e.target.value })}
          className="px-3 py-2 border border-border rounded-lg bg-surface text-sm"
          placeholder="Desde"
        />
        <input
          type="date"
          value={filters.fechaHasta}
          onChange={(e) => setFilters({ ...filters, fechaHasta: e.target.value })}
          className="px-3 py-2 border border-border rounded-lg bg-surface text-sm"
          placeholder="Hasta"
        />
        <select
          value={filters.estatus}
          onChange={(e) => setFilters({ ...filters, estatus: e.target.value })}
          className="px-3 py-2 border border-border rounded-lg bg-surface text-sm"
        >
          <option value="">Todos los estados</option>
          {statusOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <input
          type="text"
          value={filters.clienteNombre}
          onChange={(e) => setFilters({ ...filters, clienteNombre: e.target.value })}
          placeholder="Buscar cliente..."
          className="px-3 py-2 border border-border rounded-lg bg-surface text-sm"
        />
      </div>

      {/* contenido */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div>
          <span className="ml-3 text-text-sec">Cargando reservas...</span>
        </div>
      ) : reservations.length === 0 ? (
        <div className="bg-surface rounded-xl shadow-sm border border-border p-10 text-center text-text-sec">
          No hay reservas que coincidan con los filtros.
        </div>
      ) : (
        <>
          {/* ─── VISTA ESCRITORIO (tabla) ─── */}
          <div className="hidden md:block bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border text-sm">
                <thead className="bg-surface-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-sec uppercase">Cliente</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-sec uppercase">Fecha/Hora</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-sec uppercase">Com.</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-sec uppercase">Mesa</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-sec uppercase">Canal</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-sec uppercase">Ocasión</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-sec uppercase">Peticiones</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-sec uppercase">Depósito</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-sec uppercase">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-sec uppercase">Riesgo no-show</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {reservations.map((res) => (
                    <tr
                      key={res.id}
                      onClick={() => setSelectedId(selectedId === res.id ? null : res.id)}
                      className={`cursor-pointer transition-all duration-150 ${
                        selectedId === res.id
                          ? 'bg-brand/5 ring-2 ring-brand/40 shadow-md'
                          : 'hover:bg-surface-muted/50'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-text">{res.clienteNombre || '—'}</div>
                        <div className="text-xs text-text-sec">{res.clienteEmail || '—'}</div>
                        <div className="text-xs text-text-sec">{res.clienteTelefono || '—'}</div>
                      </td>
                      <td className="px-4 py-3 text-text whitespace-nowrap">{formatDate(res.fechaHora)}</td>
                      <td className="px-4 py-3 text-text text-center">{res.numComensales}</td>
                      <td className="px-4 py-3 text-text">{res.mesaNumero || 'N/A'}</td>
                      <td className="px-4 py-3 text-text capitalize">{res.canal || '—'}</td>
                      <td className="px-4 py-3 text-text max-w-[120px] truncate" title={res.ocasion}>
                        {res.ocasion || '—'}
                      </td>
                      <td className="px-4 py-3 text-text max-w-[150px] truncate" title={res.peticionesEspeciales}>
                        {res.peticionesEspeciales || '—'}
                      </td>
                      <td className="px-4 py-3 text-text">
                        {res.depositoPagado != null ? `$${Number(res.depositoPagado).toFixed(2)}` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(res.estatus)}`}>
                            {statusOptions.find(o => o.value === res.estatus)?.label || res.estatus}
                          </span>
                          <select
                            value={res.estatus}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleStatusChange(res.id, e.target.value);
                            }}
                            className="mt-1 px-1 py-0.5 border border-border rounded text-xs bg-surface focus:outline-none focus:ring-1 focus:ring-brand/50 w-full"
                          >
                            {statusOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <RiskBadge risk={res.estatus === 'confirmada' ? risks[res.id] : undefined} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ─── VISTA MÓVIL (tarjetas) ─── */}
          <div className="md:hidden space-y-4">
            {reservations.map((res) => (
              <div
                key={res.id}
                onClick={() => setSelectedId(selectedId === res.id ? null : res.id)}
                className={`bg-surface rounded-xl shadow-sm border p-4 cursor-pointer transition-all duration-150 ${
                  selectedId === res.id
                    ? 'border-brand ring-2 ring-brand/40 shadow-md'
                    : 'border-border hover:shadow-md'
                }`}
              >
                {/* línea superior: nombre + estado */}
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold text-text">{res.clienteNombre || '—'}</div>
                    <div className="text-xs text-text-sec">{res.clienteEmail || '—'}</div>
                    <div className="text-xs text-text-sec">{res.clienteTelefono || '—'}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(res.estatus)}`}>
                      {statusOptions.find(o => o.value === res.estatus)?.label || res.estatus}
                    </span>
                    <RiskBadge risk={res.estatus === 'confirmada' ? risks[res.id] : undefined} />
                  </div>
                </div>

                {/* detalles en grid */}
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <span className="text-text-sec text-xs">Fecha/Hora</span>
                    <div className="text-text">{formatDate(res.fechaHora)}</div>
                  </div>
                  <div>
                    <span className="text-text-sec text-xs">Comensales</span>
                    <div className="text-text">{res.numComensales}</div>
                  </div>
                  <div>
                    <span className="text-text-sec text-xs">Mesa</span>
                    <div className="text-text">{res.mesaNumero || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-text-sec text-xs">Canal</span>
                    <div className="text-text capitalize">{res.canal || '—'}</div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-text-sec text-xs">Ocasión</span>
                    <div className="text-text truncate" title={res.ocasion}>{res.ocasion || '—'}</div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-text-sec text-xs">Peticiones especiales</span>
                    <div className="text-text truncate" title={res.peticionesEspeciales}>{res.peticionesEspeciales || '—'}</div>
                  </div>
                  <div>
                    <span className="text-text-sec text-xs">Depósito</span>
                    <div className="text-text">
                      {res.depositoPagado != null ? `$${Number(res.depositoPagado).toFixed(2)}` : '—'}
                    </div>
                  </div>
                </div>

                {/* cambio de estado */}
                <div className="flex items-center gap-2">
                  <label className="text-xs text-text-sec">Cambiar estado:</label>
                  <select
                    value={res.estatus}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleStatusChange(res.id, e.target.value);
                    }}
                    className="px-2 py-1 border border-border rounded text-xs bg-surface focus:outline-none focus:ring-1 focus:ring-brand/50"
                  >
                    {statusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
