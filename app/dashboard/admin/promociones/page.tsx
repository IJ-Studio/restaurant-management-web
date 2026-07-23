"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Tag,
  CheckCircle2,
  EyeOff,
  Edit3,
  Trash2,
  Eye,
  ImageIcon,
} from "lucide-react";

import { authHeaders } from "@/features/dashboard/admin/utils/menuUtils";
import { PromoModal } from "@/features/dashboard/admin/components/PromoModal";
import {
  type Promotion,
  type PromotionRow,
  mapPromotionRow,
} from "@/features/shared/data/promotions";

const RAW_API_BASE = process.env.NEXT_PUBLIC_API_URL?.trim();
const API = (RAW_API_BASE && RAW_API_BASE.length > 0 ? RAW_API_BASE : "/api").replace(/\/$/, "");

export default function AdminPromocionesPage() {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);

  useEffect(() => {
    void loadPromos();
  }, []);

  async function loadPromos() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/promociones/admin`, { headers: authHeaders() });
      if (!res.ok) return;
      const data: PromotionRow[] = await res.json();
      setPromos(
        (Array.isArray(data) ? data : []).map(mapPromotionRow).sort((a, b) => a.order - b.order)
      );
    } catch (e) {
      console.error("No se pudieron cargar las promociones", e);
    } finally {
      setLoading(false);
    }
  }

  function toBody(data: Partial<Promotion>) {
    return {
      titulo: data.title,
      descripcion: data.description,
      badge: data.badge || null,
      emoji: data.emoji || null,
      color: data.color,
      precio_original: data.originalPrice ?? null,
      precio_descuento: data.discountedPrice ?? null,
      imagen_url: data.imageUrl || null,
      imagen_public_id: data.imagePublicId || null,
      activa: data.active,
      orden: data.order ?? 0,
      fecha_inicio: data.startDate || null,
      fecha_fin: data.endDate || null,
    };
  }

  async function savePromo(data: Partial<Promotion>) {
    try {
      if (data.id) {
        const res = await fetch(`${API}/promociones/${data.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify(toBody(data)),
        });
        if (!res.ok) throw new Error("No se pudo actualizar");
        const row: PromotionRow = await res.json();
        const updated = mapPromotionRow(row);
        setPromos((ps) => ps.map((p) => (p.id === updated.id ? updated : p)));
      } else {
        const res = await fetch(`${API}/promociones`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify(toBody(data)),
        });
        if (!res.ok) throw new Error("No se pudo crear");
        const row: PromotionRow = await res.json();
        setPromos((ps) => [...ps, mapPromotionRow(row)]);
      }
    } catch (e) {
      console.error(e);
      alert("Ocurrió un error al guardar la promoción.");
    }
  }

  async function toggleActive(promo: Promotion) {
    const next = !promo.active;
    setPromos((ps) => ps.map((p) => (p.id === promo.id ? { ...p, active: next } : p)));
    try {
      await fetch(`${API}/promociones/${promo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ activa: next }),
      });
    } catch (e) {
      console.error(e);
      setPromos((ps) => ps.map((p) => (p.id === promo.id ? { ...p, active: !next } : p)));
    }
  }

  async function deletePromo(promo: Promotion) {
    if (!confirm(`¿Eliminar la promoción "${promo.title}"?`)) return;
    const prev = promos;
    setPromos((ps) => ps.filter((p) => p.id !== promo.id));
    try {
      const res = await fetch(`${API}/promociones/${promo.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("No se pudo eliminar");
    } catch (e) {
      console.error(e);
      alert("No se pudo eliminar la promoción.");
      setPromos(prev);
    }
  }

  const filtered = promos.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" || (filter === "active" && p.active) || (filter === "inactive" && !p.active);
    return matchesSearch && matchesFilter;
  });

  const total = promos.length;
  const activeCount = promos.filter((p) => p.active).length;

  const stats = [
    { label: "Total Promociones", value: total, sub: "Registradas en el sistema", color: "bg-brand text-brand", icon: <Tag size={16} /> },
    { label: "Activas", value: activeCount, sub: `${total - activeCount} inactivas`, color: "bg-emerald-600 text-emerald-600", icon: <CheckCircle2 size={16} /> },
  ];

  return (
    <main className="p-8 md:p-10 min-w-0">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
        <div>
          <h1 className="font-display font-black text-3xl tracking-tight leading-none mb-1.5 text-text m-0">
            Promociones
          </h1>
          <p className="text-sm text-text-muted m-0">
            Administra las ofertas y promociones que se muestran en el sitio público.
          </p>
        </div>

        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-none font-black text-[13px] tracking-tight cursor-pointer bg-brand text-white shadow-[0_4px_12px_rgba(232,93,4,0.3)] hover:-translate-y-px transition-all"
        >
          <Plus size={16} /> Nueva Promoción
        </button>
      </header>

      {/* Hero Stats */}
      <div className="grid grid-cols-2 gap-4 mb-10 max-w-xl">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface rounded-3xl border border-border p-6 shadow-sm hover:shadow-lg transition-all group">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${s.color.split(" ")[0]} bg-opacity-10 ${s.color.split(" ")[1]}`}>
              {s.icon}
            </div>
            <p className={`font-display text-3xl font-black m-0 mb-1 leading-none ${s.color.split(" ")[1]}`}>
              {s.value}
            </p>
            <p className="text-xs font-black text-text m-0 uppercase tracking-widest">{s.label}</p>
            <p className="text-[11px] text-text-muted m-0 mt-1 font-medium">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
        <div className="relative flex-1 w-full max-w-sm group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand transition-colors" size={16} />
          <input
            placeholder="Buscar promoción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-2xl text-sm font-bold text-text outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all shadow-sm"
          />
        </div>

        <div className="flex p-1 bg-surface-alt rounded-[18px] border border-border gap-1 w-full md:w-auto overflow-hidden">
          {[
            { k: "all", l: "Todas" },
            { k: "active", l: "Activas" },
            { k: "inactive", l: "Inactivas" },
          ].map((o) => (
            <button
              key={o.k}
              onClick={() => setFilter(o.k as any)}
              className={`px-5 py-2 rounded-xl text-[12px] font-black tracking-tight cursor-pointer transition-all border-none ${
                filter === o.k ? "bg-surface text-brand shadow-sm ring-1 ring-border" : "bg-transparent text-text-muted hover:text-text-sec"
              }`}
            >
              {o.l}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <p className="text-sm text-text-muted">Cargando promociones...</p>
      ) : filtered.length === 0 ? (
        <div className="bg-surface rounded-3xl border border-border p-12 text-center">
          <Tag size={28} className="mx-auto mb-3 text-text-muted" />
          <p className="text-sm font-bold text-text">No hay promociones para mostrar</p>
          <p className="text-xs text-text-muted mt-1">Crea una nueva promoción para que aparezca aquí.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((promo) => (
            <div
              key={promo.id}
              className={`relative rounded-3xl border overflow-hidden transition-all ${
                promo.active ? "border-border shadow-sm hover:shadow-md" : "border-border opacity-60"
              }`}
            >
              <div className={`h-28 w-full bg-gradient-to-br ${promo.color} relative flex items-center justify-center`}>
                {promo.imageUrl ? (
                  <img src={promo.imageUrl} alt={promo.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl opacity-80">{promo.emoji || <ImageIcon className="text-white/70" size={28} />}</span>
                )}
                {promo.badge && (
                  <span className="absolute top-3 left-3 bg-white/90 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full text-text">
                    {promo.badge}
                  </span>
                )}
              </div>

              <div className="p-4 bg-surface">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h4 className="text-sm font-bold text-text">{promo.title}</h4>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                      promo.active
                        ? "bg-emerald-50 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-400/30"
                        : "bg-red-50 dark:bg-red-400/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-400/30"
                    }`}
                  >
                    {promo.active ? "Activa" : "Inactiva"}
                  </span>
                </div>
                <p className="text-xs text-text-muted line-clamp-2 mb-3">{promo.description}</p>

                {(promo.originalPrice || promo.discountedPrice) && (
                  <div className="flex items-baseline gap-2 mb-3">
                    {promo.discountedPrice != null && (
                      <span className="text-base font-extrabold text-brand">${promo.discountedPrice.toFixed(2)}</span>
                    )}
                    {promo.originalPrice != null && (
                      <span className="text-xs text-text-muted line-through">${promo.originalPrice.toFixed(2)}</span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  {promo.endDate ? (
                    <span className="text-[10px] text-text-muted font-bold">Hasta {promo.endDate}</span>
                  ) : (
                    <span className="text-[10px] text-text-muted font-bold">Sin fecha límite</span>
                  )}
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditing(promo);
                        setModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg hover:bg-surface-muted text-text-muted transition"
                      title="Editar"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => toggleActive(promo)}
                      className="p-1.5 rounded-lg hover:bg-surface-muted text-text-muted transition"
                      title={promo.active ? "Ocultar" : "Mostrar"}
                    >
                      {promo.active ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button
                      onClick={() => deletePromo(promo)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-400/10 text-red-500 transition"
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <PromoModal
          promo={editing}
          onClose={() => setModalOpen(false)}
          onSave={savePromo}
        />
      )}
    </main>
  );
}
