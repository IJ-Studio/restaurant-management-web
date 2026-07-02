'use client';
import { useState, useEffect } from 'react';
import { getReservations, updateReservation } from '@/app/api/reservations/route';

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ fechaDesde: '', fechaHasta: '', estatus: '', clienteNombre: '' });

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
    fetchReservations();
  }, [filters]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateReservation(id, { estatus: newStatus });
      fetchReservations();
    } catch (err) {
      alert('Error al actualizar estado');
    }
  };

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

  return (
    <div className="p-6 bg-surface-muted min-h-screen">
      <h1 className="text-3xl font-bold text-text mb-6">Gestión de Reservas</h1>

      <div className="bg-surface rounded-xl shadow-sm border border-border p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="date"
          value={filters.fechaDesde}
          onChange={(e) => setFilters({ ...filters, fechaDesde: e.target.value })}
          placeholder="Desde"
          className="px-3 py-2 border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand"
        />
        <input
          type="date"
          value={filters.fechaHasta}
          onChange={(e) => setFilters({ ...filters, fechaHasta: e.target.value })}
          placeholder="Hasta"
          className="px-3 py-2 border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand"
        />
        <select
          value={filters.estatus}
          onChange={(e) => setFilters({ ...filters, estatus: e.target.value })}
          className="px-3 py-2 border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand"
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
          className="px-3 py-2 border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div>
          <span className="ml-3 text-text-sec">Cargando...</span>
        </div>
      ) : (
        <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-surface-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-sec uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-sec uppercase tracking-wider">Fecha/Hora</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-sec uppercase tracking-wider">Comensales</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-sec uppercase tracking-wider">Mesa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-sec uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-sec uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {reservations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-text-sec">
                      No hay reservas que coincidan con los filtros.
                    </td>
                  </tr>
                ) : (
                  reservations.map((res) => (
                    <tr key={res.id} className="hover:bg-surface-muted/50 transition">
                      <td className="px-6 py-4">
                        <div className="font-medium text-text">{res.clienteNombre}</div>
                        <div className="text-sm text-text-sec">{res.clienteEmail}</div>
                      </td>
                      <td className="px-6 py-4 text-text">
                        {new Date(res.fechaHora).toLocaleString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4 text-text">{res.numComensales}</td>
                      <td className="px-6 py-4 text-text">{res.mesaNumero || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(res.estatus)}`}>
                          {statusOptions.find(o => o.value === res.estatus)?.label || res.estatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={res.estatus}
                          onChange={(e) => handleStatusChange(res.id, e.target.value)}
                          className="px-2 py-1 border border-border rounded-lg text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-brand/50"
                        >
                          {statusOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
