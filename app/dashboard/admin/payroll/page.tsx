"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Wallet, Users, TrendingUp, Calculator, Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import { api, APIError } from "@/lib/api";
import type { PayrollEntry } from "@/features/dashboard/admin/types/payroll";
import { PayrollModal } from "@/features/dashboard/admin/components/PayrollModal";

const fmt = (n: number) =>
  n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// "Chef 1", "Mesero 3" -> "Chef", "Mesero"; deja igual roles sin número (Gerente, Marketing, ...)
function department(role: string): string {
  return role.replace(/\s+\d+$/, "").trim();
}

export default function PayrollPage() {
  const [entries, setEntries] = useState<PayrollEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [modalEntry, setModalEntry] = useState<PayrollEntry | null | undefined>(undefined);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<PayrollEntry[]>("/payroll");
      setEntries(data);
    } catch (err) {
      setError(err instanceof APIError ? err.message : "No se pudo cargar la nómina.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSave(data: { id?: string; role: string; name: string; weeklyPay: number; active: boolean }) {
    try {
      if (data.id) {
        const updated = await api.patch<PayrollEntry>(`/payroll/${data.id}`, {
          role: data.role,
          name: data.name,
          weeklyPay: data.weeklyPay,
          active: data.active,
        });
        setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      } else {
        const created = await api.post<PayrollEntry>("/payroll", {
          role: data.role,
          name: data.name,
          weeklyPay: data.weeklyPay,
          active: data.active,
        });
        setEntries((prev) => [...prev, created]);
      }
    } catch (err) {
      alert(err instanceof APIError ? err.message : "No se pudo guardar el registro.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este registro de nómina?")) return;
    const prev = entries;
    setEntries((cur) => cur.filter((e) => e.id !== id));
    try {
      await api.delete(`/payroll/${id}`);
    } catch (err) {
      setEntries(prev);
      alert(err instanceof APIError ? err.message : "No se pudo eliminar el registro.");
    }
  }

  async function toggleActive(id: string) {
    const target = entries.find((e) => e.id === id);
    if (!target) return;
    const prev = entries;
    setEntries((cur) => cur.map((e) => (e.id === id ? { ...e, active: !e.active } : e)));
    try {
      const updated = await api.patch<PayrollEntry>(`/payroll/${id}`, { active: !target.active });
      setEntries((cur) => cur.map((e) => (e.id === id ? updated : e)));
    } catch (err) {
      setEntries(prev);
      alert(err instanceof APIError ? err.message : "No se pudo actualizar el estado.");
    }
  }

  const activeEntries = useMemo(() => entries.filter((e) => e.active), [entries]);

  const weeklyTotal = useMemo(
    () => activeEntries.reduce((sum, e) => sum + e.weeklyPay, 0),
    [activeEntries]
  );

  const avgPerEmployee = activeEntries.length ? weeklyTotal / activeEntries.length : 0;

  const byDepartment = useMemo(() => {
    const map: Record<string, number> = {};
    activeEntries.forEach((e) => {
      const dep = department(e.role);
      map[dep] = (map[dep] || 0) + e.weeklyPay;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [activeEntries]);

  const maxDeptTotal = byDepartment[0]?.[1] || 1;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) => e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q)
    );
  }, [entries, search]);

  return (
    <main className="p-8 md:p-10 min-w-0">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8 min-w-0">
        <div className="min-w-0">
          <h1 className="font-display font-black text-3xl tracking-tight leading-none mb-1.5 text-text m-0">
            Nómina
          </h1>
          <p className="text-sm text-text-muted m-0">
            Control de pagos semanales del personal
          </p>
        </div>
        <button
          onClick={() => setModalEntry(null)}
          className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-[13px] font-bold border-none cursor-pointer bg-brand text-white shadow-[0_4px_12px_rgba(232,93,4,0.28)] hover:-translate-y-px transition-all self-start shrink-0"
        >
          <Plus size={15} /> Agregar empleado
        </button>
      </header>

      {error && (
        <div className="flex items-center justify-between gap-3 mb-6 px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-[13px] font-bold min-w-0">
          <span className="truncate">{error}</span>
          <button
            onClick={() => void load()}
            className="shrink-0 px-3 py-1 rounded-lg bg-white border border-red-200 text-red-700 text-xs font-bold hover:bg-red-100 transition-colors"
          >
            Reintentar
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24 text-text-muted gap-2">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm font-bold">Cargando nómina...</span>
        </div>
      ) : (
      <>
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
        {[
          {
            l: "Nómina semanal",
            v: `$${fmt(weeklyTotal)}`,
            icon: <Wallet size={18} />,
            colorClass: "bg-brand text-brand",
          },
          {
            l: "Nómina mensual est.",
            v: `$${fmt(weeklyTotal * 4)}`,
            icon: <Calculator size={18} />,
            colorClass: "bg-blue-600 text-blue-600",
          },
          {
            l: "Empleados activos",
            v: activeEntries.length,
            icon: <Users size={18} />,
            colorClass: "bg-emerald-600 text-emerald-600",
          },
          {
            l: "Promedio por empleado",
            v: `$${fmt(avgPerEmployee)}`,
            icon: <TrendingUp size={18} />,
            colorClass: "bg-amber-600 text-amber-600",
          },
        ].map((s) => {
          const [bg, textColor] = s.colorClass.split(" ");
          return (
            <div
              key={s.l}
              className="bg-surface rounded-[20px] border border-border p-5 shadow-sm hover:shadow-md transition-shadow min-w-0"
            >
              <div className={`w-6 h-1 rounded-full mb-3.5 opacity-90 ${bg}`} />
              <p className={`font-display text-[26px] font-black m-0 mb-1 leading-none truncate ${textColor}`}>
                {s.v}
              </p>
              <p className="text-xs font-bold text-text m-0 truncate">{s.l}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0">
        {/* Desglose por área */}
        <div className="bg-surface rounded-[24px] border border-border p-6 shadow-sm lg:col-span-1 min-w-0">
          <h2 className="font-display font-black text-[15px] text-text m-0 mb-4">
            Gasto semanal por área
          </h2>
          <div className="flex flex-col gap-3">
            {byDepartment.map(([dep, total]) => (
              <div key={dep} className="min-w-0">
                <div className="flex justify-between items-baseline gap-2 mb-1">
                  <span className="text-xs font-bold text-text-sec truncate">{dep}</span>
                  <span className="text-xs font-bold text-text shrink-0">${fmt(total)}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-alt overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{ width: `${(total / maxDeptTotal) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {byDepartment.length === 0 && (
              <p className="text-xs text-text-muted">Sin empleados activos.</p>
            )}
          </div>
        </div>

        {/* Tabla de nómina */}
        <div className="bg-surface rounded-[24px] border border-border overflow-hidden shadow-sm lg:col-span-2 min-w-0">
          <div className="px-5 py-4 border-b border-border flex items-center gap-3 bg-surface-alt/30 min-w-0">
            <div className="relative flex-1 min-w-0 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre o rol..."
                className="w-full pl-8 pr-3 py-2 text-xs bg-surface border border-border rounded-lg outline-none text-text focus:border-brand transition-colors"
              />
            </div>
            <span className="text-[11px] font-bold text-text-muted ml-auto shrink-0">
              {filtered.length} registro{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[560px]">
              <div className="grid grid-cols-[1.3fr_1.3fr_1fr_90px_80px] gap-2 bg-surface-alt px-5 py-3 border-b border-border text-[10px] font-bold text-text-muted tracking-widest uppercase">
                <span>Rol</span>
                <span>Nombre</span>
                <span>Pago semanal</span>
                <span>Estado</span>
                <span className="text-right">Acciones</span>
              </div>

              <div className="flex flex-col max-h-[520px] overflow-y-auto">
                {filtered.map((e) => (
                  <div
                    key={e.id}
                    className={`grid grid-cols-[1.3fr_1.3fr_1fr_90px_80px] gap-2 px-5 py-3.5 border-b border-border items-center hover:bg-surface-alt transition-colors last:border-none ${
                      !e.active ? "opacity-50" : ""
                    }`}
                  >
                    <span className="text-[13px] font-bold text-text truncate min-w-0">{e.role}</span>
                    <span className="text-[13px] text-text-sec truncate min-w-0">{e.name}</span>
                    <span className="text-[13px] font-bold text-text truncate min-w-0">${fmt(e.weeklyPay)}</span>
                    <button
                      onClick={() => toggleActive(e.id)}
                      className={`inline-flex items-center justify-center px-2 py-1 rounded-lg text-[10px] font-bold border cursor-pointer transition-colors w-fit ${
                        e.active
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                          : "bg-surface-alt text-text-muted border-border hover:bg-border"
                      }`}
                    >
                      {e.active ? "Activo" : "Inactivo"}
                    </button>
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => setModalEntry(e)}
                        className="p-1.5 rounded-lg border border-border bg-surface text-text-sec hover:bg-surface-alt transition-colors"
                        title="Editar"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(e.id)}
                        className="p-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div className="text-center py-10 text-[13px] font-bold text-text-muted">
                    No se encontraron registros.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      </>
      )}

      {modalEntry !== undefined && (
        <PayrollModal
          entry={modalEntry}
          onClose={() => setModalEntry(undefined)}
          onSave={handleSave}
        />
      )}
    </main>
  );
}
