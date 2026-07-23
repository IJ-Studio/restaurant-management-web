"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Filter } from "lucide-react";

/* ---------- tipos ---------- */
interface Order {
  id: string;
  customer: string;
  time: string;
  item: string;
  table: string;
  status: string;
  total: number;
}

const ORDER_STATUS: Record<string, { label: string; colorClass: string; bgClass: string; dotClass: string }> = {
  pendiente: {
    label: "Pendiente",
    colorClass: "text-yellow-700",
    bgClass: "bg-yellow-100",
    dotClass: "bg-yellow-500",
  },
  abierta: {
    label: "En preparación",
    colorClass: "text-blue-700",
    bgClass: "bg-blue-100",
    dotClass: "bg-blue-500",
  },
  entregada: {
    label: "Entregado",
    colorClass: "text-green-700",
    bgClass: "bg-green-100",
    dotClass: "bg-green-500",
  },
  cancelada: {
    label: "Cancelado",
    colorClass: "text-red-700",
    bgClass: "bg-red-100",
    dotClass: "bg-red-500",
  },
  completada: {
    label: "Completado",
    colorClass: "text-gray-700",
    bgClass: "bg-gray-100",
    dotClass: "bg-gray-500",
  },
};

const FILTER_OPTIONS = [
  { value: "todas", label: "Todas" },
  { value: "pendiente", label: "Pendientes" },
  { value: "abierta", label: "En preparación" },
  { value: "entregada", label: "Entregadas" },
  { value: "cancelada", label: "Canceladas" },
];

/* ---------- helper de autenticación ---------- */
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)session=([^;]+)/);
  if (match) return match[1];
  return localStorage.getItem("authToken");
}

const ITEMS_PER_PAGE = 10;

export function RecentOrdersTable() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("todas");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000";

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const res = await fetch(`${API_URL}/pedidos/admin/recent`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      if (!res.ok) throw new Error("Error al cargar pedidos");
      const data = await res.json();
      setOrders(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Filtrado local
  const filteredOrders = useMemo(() => {
    if (filter === "todas") return orders;
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  const visibleOrders = useMemo(() => {
    return filteredOrders.slice(0, visibleCount);
  }, [filteredOrders, visibleCount]);

  const hasMore = visibleCount < filteredOrders.length;

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const fmt = (n: number) =>
    n.toLocaleString("es-MX", { minimumFractionDigits: 2 });

  return (
    <div className="bg-surface rounded-[22px] border border-border shadow-sm overflow-hidden flex flex-col max-h-[600px]">
      {/* Cabecera con filtros (fija arriba) */}
      <div className="px-5 py-4 border-b border-border bg-surface-alt shrink-0">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="font-display font-black text-base text-text mb-0.5">
              Pedidos en curso
            </h2>
            <p className="text-[11px] text-text-muted m-0">
              Actualización en tiempo real vía SSE
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard/admin/orders")}
            className="flex items-center gap-1 text-xs font-bold text-brand bg-transparent border-none cursor-pointer hover:underline"
          >
            Ver todos <ChevronRight size={13} />
          </button>
        </div>

        {/* Filtros rápidos */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter size={12} className="text-text-muted shrink-0" />
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleFilterChange(opt.value)}
              className={`px-3 py-1 rounded-full text-[10px] font-semibold transition-colors
                ${filter === opt.value
                  ? "bg-brand text-white"
                  : "bg-surface-muted text-text-sec hover:bg-border/50"
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cuerpo scrolleable */}
      <div className="overflow-y-auto flex-1">
        {loading ? (
          <div className="flex justify-center items-center h-32 text-text-muted text-sm">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand mr-2" />
            Cargando pedidos...
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-32 text-red-500 text-sm">
            {error}
          </div>
        ) : visibleOrders.length === 0 ? (
          <div className="flex justify-center items-center h-32 text-text-muted text-sm">
            No hay pedidos que coincidan con este filtro.
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-surface-alt z-10">
              <tr className="border-b border-border">
                {["ID", "Cliente", "Platillo", "Ubicación", "Estado", "Total"].map((h) => (
                  <th
                    key={h}
                    className="px-3.5 py-2.5 text-[9px] font-extrabold tracking-[0.13em] uppercase text-text-muted text-left"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleOrders.map((o) => {
                const sc = ORDER_STATUS[o.status] || ORDER_STATUS.pendiente;
                return (
                  <tr
                    key={o.id}
                    className="border-b border-border cursor-pointer transition-colors hover:bg-surface-alt group"
                  >
                    <td className="p-3.5">
                      <span className="text-[11px] font-mono font-bold text-brand">{o.id}</span>
                    </td>
                    <td className="p-3.5">
                      <p className="text-xs font-bold text-text mb-0.5">{o.customer}</p>
                      <p className="text-[10px] text-text-muted m-0">{o.time}</p>
                    </td>
                    <td className="p-3.5 max-w-[140px]">
                      <p className="text-xs text-text-sec m-0 truncate">{o.item}</p>
                    </td>
                    <td className="p-3.5">
                      <span className="text-[11px] text-text-sec">{o.table}</span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${sc.colorClass} ${sc.bgClass}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${sc.dotClass}`} />
                        {sc.label}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="text-[13px] font-black text-brand">${fmt(o.total)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pie con botón "Ver más" (fijo abajo) */}
      {hasMore && !loading && !error && (
        <div className="px-4 py-3 flex justify-center border-t border-border shrink-0 bg-surface">
          <button
            onClick={handleShowMore}
            className="text-xs font-semibold text-brand hover:underline"
          >
            Ver más ({filteredOrders.length - visibleCount} restantes)
          </button>
        </div>
      )}
    </div>
  );
}
