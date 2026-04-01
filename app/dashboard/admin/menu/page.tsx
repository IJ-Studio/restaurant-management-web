"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ImportPreviewModal from "@/components/admin/Importpreviewmodal";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

import {
  Search,
  Plus,
  Filter,
  Upload,
  Download,
  UtensilsCrossed,
  LayoutGrid,
  CheckCircle2,
  Star,
  ChevronDown,
} from "lucide-react";

import { MenuService } from "@/features/shared/services/dataService";
import { type MenuCategory, type MenuItem } from "@/features/shared/data/restaurantData";

import {
  parseBool,
  parseNumber,
  csvEscape,
  parseCsv,
  downloadAsFile,
} from "@/features/dashboard/admin/utils/menuUtils";

import { CategorySection } from "@/features/dashboard/admin/components/CategorySection";
import { ItemModal } from "@/features/dashboard/admin/components/ItemModal";

// API base
const RAW_API_BASE = process.env.NEXT_PUBLIC_API_URL?.trim();
const API = (RAW_API_BASE && RAW_API_BASE.length > 0 ? RAW_API_BASE : "/api").replace(/\/$/, "");
const IS_EXTERNAL_API = API.startsWith("http");

export default function AdminMenuPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [search, setSearch] = useState("");
  const [filterAvail, setFilterAvail] = useState<"all" | "available" | "unavailable">("all");
  const [modal, setModal] = useState<{ catId: string; item: MenuItem | null } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importBusy, setImportBusy] = useState(false);
  const pendingFormatRef = useRef<"csv" | "json" | "xlsx" | null>(null);
  const [ioOpen, setIoOpen] = useState<null | "import" | "export">(null);
  const ioWrapRef = useRef<HTMLDivElement | null>(null);

  const [preview, setPreview] = useState<{
    file: File;
    parsedRows: Array<Record<string, unknown>>;
    dbRows: Array<Record<string, unknown>>;
  } | null>(null);

  // Persistence logic (Unified DataService)
  useEffect(() => {
    setCategories(MenuService.getMenu());
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      MenuService.saveMenu(categories);
    }
  }, [categories]);

  useEffect(() => {
    if (!IS_EXTERNAL_API) return;
    void loadFromDb();
  }, []);

  useEffect(() => {
    if (!ioOpen) return;
    const h = (e: MouseEvent) => {
      if (!ioWrapRef.current?.contains(e.target as Node)) setIoOpen(null);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [ioOpen]);

  async function loadFromDb() {
    try {
      const res = await fetch(`${API}/platillos/export.json`);
      if (!res.ok) return;
      const data = await res.json().catch(() => null);
      const rows: Record<string, unknown>[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.rows)
        ? data.rows
        : [];
      if (!rows.length) return;
      setCategories(mapDbRows(rows));
    } catch {}
  }

  function mapDbRows(rows: Record<string, unknown>[]): MenuCategory[] {
    const colors = ["#e85d04", "#2563eb", "#059669", "#7c3aed", "#d97706", "#0ea5e9"];
    const byCat = new Map<string, MenuCategory>();
    rows.forEach((r, idx) => {
      const catIdRaw = r.categoria_id ?? 0;
      const catKey = String(catIdRaw);
      if (!byCat.has(catKey)) {
        byCat.set(catKey, {
          id: catKey,
          name: `Categoría ${catIdRaw}`,
          icon: "🍽️",
          color: colors[Math.abs(Number(catIdRaw)) % colors.length],
          items: [],
        });
      }
      const tags: string[] = [];
      if (parseBool(r.es_popular, false)) tags.push("popular");
      if (parseBool(r.es_vegano, false)) tags.push("vegano");
      if (parseBool(r.es_picante, false)) tags.push("picante");
      if (parseBool(r.es_nuevo, false)) tags.push("nuevo");
      if (parseBool(r.es_sin_gluten, false)) tags.push("sin-gluten");
      byCat.get(catKey)!.items.push({
        id: Number(r.id) || Date.now() + idx,
        name: String(r.nombre ?? ""),
        description: String(r.descripcion_corta ?? r.descripcion ?? ""),
        price: parseNumber(r.precio, 0),
        available: parseBool(r.disponible, true),
        category: catKey,
        tags,
        prepTime: parseNumber(r.tiempo_preparacion, 10),
        calories: 0,
      });
    });
    return Array.from(byCat.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async function handleImportFile(file: File) {
    setImportBusy(true);
    try {
      const requested = pendingFormatRef.current;
      pendingFormatRef.current = null;
      const lower = file.name.toLowerCase();
      const isXlsx = lower.endsWith(".xlsx");
      const isJson = lower.endsWith(".json");

      if (requested === "csv" && (isJson || isXlsx)) {
        alert("Archivo no es CSV.");
        return;
      }
      if (requested === "json" && !isJson) {
        alert("Archivo no es JSON.");
        return;
      }
      if (requested === "xlsx" && !isXlsx) {
        alert("Archivo no es Excel.");
        return;
      }

      let parsedRows: Array<Record<string, unknown>> = [];

      if (isJson) {
        const text = await file.text();
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) parsedRows = parsed;
        else if (Array.isArray(parsed?.rows)) parsedRows = parsed.rows;
        else if (Array.isArray(parsed?.categories)) {
          for (const cat of parsed.categories) {
            for (const item of cat.items ?? []) parsedRows.push({ ...item, category: cat.name });
          }
        }
      } else if (isXlsx) {
        const XLSX = await import("xlsx");
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        parsedRows = XLSX.utils.sheet_to_json(ws, { defval: "" }) as Array<Record<string, unknown>>;
      } else {
        const text = await file.text();
        const grid = parseCsv(text);
        if (grid.length < 2) return;
        const [headerRow, ...dataRows] = grid;
        parsedRows = dataRows.map((cols) => {
          const obj: Record<string, unknown> = {};
          headerRow.forEach((h, i) => {
            obj[h.trim()] = cols[i]?.trim() ?? "";
          });
          return obj;
        });
      }

      if (!parsedRows.length) {
        alert("El archivo no tiene datos.");
        return;
      }

      let dbRows: Array<Record<string, unknown>> = [];
      if (IS_EXTERNAL_API) {
        try {
          const res = await fetch(`${API}/platillos/export.json`);
          if (res.ok) {
            const data = await res.json().catch(() => null);
            dbRows = Array.isArray(data) ? data : Array.isArray(data?.rows) ? data.rows : [];
          }
        } catch {}
      }
      setPreview({ file, parsedRows, dbRows });
    } catch (e: any) {
      alert(e?.message ?? "No se pudo leer el archivo.");
    } finally {
      setImportBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleImportSuccess(result: { inserted: number; updated: number }) {
    setPreview(null);
    alert(`✓ Importación exitosa\nInsertados: ${result.inserted}\nActualizados: ${result.updated}`);
    if (IS_EXTERNAL_API) await loadFromDb();
  }

  function toggleItem(catId: string, itemId: string | number) {
    setCategories((cs) =>
      cs.map((c) =>
        c.id !== catId
          ? c
          : {
              ...c,
              items: c.items.map((i) => (i.id !== itemId ? i : { ...i, available: !i.available })),
            }
      )
    );
  }

  function deleteItem(catId: string, itemId: string | number) {
    if (!confirm("¿Eliminar este platillo?")) return;
    setCategories((cs) =>
      cs.map((c) => (c.id !== catId ? c : { ...c, items: c.items.filter((i) => i.id !== itemId) }))
    );
  }

  function saveItem(catId: string, data: Partial<MenuItem>) {
    setCategories((cs) =>
      cs.map((c) => {
        if (c.id !== catId) return c;
        const exists = c.items.find((i) => i.id === data.id);
        if (exists)
          return {
            ...c,
            items: c.items.map((i) => (i.id === data.id ? ({ ...i, ...data } as MenuItem) : i)),
          };
        return {
          ...c,
          items: [
            ...c.items,
            {
              id: Date.now(),
              name: data.name ?? "",
              description: data.description ?? "",
              price: data.price ?? 0,
              available: data.available ?? true,
              category: catId,
              tags: data.tags ?? [],
              prepTime: data.prepTime ?? 10,
              calories: data.calories ?? 0,
            } as MenuItem,
          ],
        };
      })
    );
  }

  function exportJson() {
    const blob = new Blob(
      [JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), categories }, null, 2)],
      { type: "application/json" }
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `menu_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function exportCsv() {
    const header = ["category", "name", "description", "price", "available", "tags", "prepTime", "calories"];
    const lines = [header.join(",")];
    categories.forEach((c) =>
      c.items.forEach((i) =>
        lines.push(
          [
            csvEscape(c.name),
            csvEscape(i.name),
            csvEscape(i.description),
            csvEscape(i.price),
            csvEscape(i.available ? 1 : 0),
            csvEscape(i.tags?.join("|") ?? ""),
            csvEscape(i.prepTime ?? 0),
            csvEscape(i.calories ?? 0),
          ].join(",")
        )
      )
    );
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `menu_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function exportDbExcel() {
    setImportBusy(true);
    try {
      await downloadAsFile(`${API}/platillos/export/dishes/excel`, `platillos_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } finally {
      setImportBusy(false);
    }
  }

  async function downloadTemplate(fmt: "csv" | "json" | "xlsx") {
    setImportBusy(true);
    try {
      if (fmt === "xlsx") await downloadAsFile(`${API}/platillos/export/dishes/excel`, `template_platillos.xlsx`);
      else await downloadAsFile(`${API}/platillos/template.${fmt}`, `template_platillos.${fmt}`);
    } finally {
      setImportBusy(false);
    }
  }

  function ensureApi() {
    if (!IS_EXTERNAL_API) {
      alert("Configura NEXT_PUBLIC_API_URL para usar importación desde DB.");
      return false;
    }
    return true;
  }

  const user = useSelector((state: RootState) => state.auth.user);

  const totalItems = categories.reduce((s, c) => s + c.items.length, 0);
  const availItems = categories.reduce((s, c) => s + c.items.filter((i) => i.available).length, 0);
  const popularItems = categories.reduce((s, c) => s + c.items.filter((i) => i.tags?.includes("popular")).length, 0);
  const avgPrice = +(categories.flatMap((c) => c.items).reduce((s, i) => s + i.price, 0) / (totalItems || 1)).toFixed(0);

  const stats = [
    { label: "Total Platillos", value: totalItems, sub: `${categories.length} categorías`, color: "bg-brand text-brand", icon: <UtensilsCrossed size={16} /> },
    { label: "Disponibles", value: availItems, sub: `${totalItems - availItems} ocultos`, color: "bg-emerald-600 text-emerald-600", icon: <CheckCircle2 size={16} /> },
    { label: "Populares", value: popularItems, sub: "Etiqueta destacada", color: "bg-amber-600 text-amber-600", icon: <Star size={16} /> },
    { label: "Precio Promedio", value: `$${avgPrice}`, sub: "MXN por platillo", color: "bg-violet-600 text-violet-600", icon: <LayoutGrid size={16} /> },
  ];

  return (
    <main className="p-8 md:p-10 min-w-0" onClick={() => setIoOpen(null)}>
      {/* Preview Modal for Imports */}
      {preview && (
        <ImportPreviewModal
          file={preview.file}
          parsedRows={preview.parsedRows}
          dbRows={preview.dbRows}
          apiBase={API}
          onClose={() => setPreview(null)}
          onSuccess={handleImportSuccess}
        />
      )}

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
        <div>
          <h1 className="font-display font-black text-3xl tracking-tight leading-none mb-1.5 text-text m-0">
            Catálogo del Menú
          </h1>
          <p className="text-sm text-text-muted m-0">
            Gestiona platillos, categorías, precios y disponibilidad en tiempo real.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5" ref={ioWrapRef}>
           <input ref={fileInputRef} type="file" accept=".csv,.json,.xlsx" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleImportFile(f); }} />
          
           {/* Actions Dropdowns */}
           <div className="relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setIoOpen(ioOpen === "import" ? null : "import"); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-[13px] font-bold cursor-pointer bg-surface text-text-sec hover:bg-surface-alt transition-colors"
                disabled={importBusy}
              >
                <Upload size={16} /> {importBusy ? "Cargando..." : "Importar"}
              </button>
              {ioOpen === "import" && (
                <div className="absolute right-0 top-full mt-2 z-50 w-48 bg-surface rounded-2xl border border-border shadow-xl overflow-hidden py-1.5 animate-in fade-in zoom-in-95">
                   {[
                    { label: "CSV Plantilla", action: () => { if(ensureApi()) downloadTemplate("csv"); } },
                    { label: "Subir CSV", action: () => { if(ensureApi()) { pendingFormatRef.current="csv"; fileInputRef.current?.click(); } } },
                    "divider",
                    { label: "Excel Plantilla", action: () => { if(ensureApi()) downloadTemplate("xlsx"); } },
                    { label: "Subir Excel", action: () => { if(ensureApi()) { pendingFormatRef.current="xlsx"; fileInputRef.current?.click(); } } },
                   ].map((item, i) => (
                      item === "divider" 
                        ? <div key={i} className="h-px bg-border my-1.5" />
                        : <button key={i} onClick={(item as any).action} className="w-full text-left px-4 py-2.5 text-[12px] font-bold border-none bg-transparent cursor-pointer hover:bg-surface-alt hover:text-brand transition-colors">{(item as any).label}</button>
                   ))}
                </div>
              )}
           </div>

           <div className="relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setIoOpen(ioOpen === "export" ? null : "export"); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-[13px] font-bold cursor-pointer bg-surface text-text-sec hover:bg-surface-alt transition-colors"
              >
                <Download size={16} /> Exportar
              </button>
              {ioOpen === "export" && (
                <div className="absolute right-0 top-full mt-2 z-50 w-48 bg-surface rounded-2xl border border-border shadow-xl overflow-hidden py-1.5 animate-in fade-in zoom-in-95">
                   {[
                    { label: "CSV (Local)", action: () => exportCsv() },
                    { label: "JSON (Local)", action: () => exportJson() },
                    "divider",
                    { label: "Excel (Desde BD)", action: () => { if(ensureApi()) exportDbExcel(); } },
                   ].map((item, i) => (
                      item === "divider" 
                        ? <div key={i} className="h-px bg-border my-1.5" />
                        : <button key={i} onClick={(item as any).action} className="w-full text-left px-4 py-2.5 text-[12px] font-bold border-none bg-transparent cursor-pointer hover:bg-surface-alt hover:text-brand transition-colors">{(item as any).label}</button>
                   ))}
                </div>
              )}
           </div>

          <div className="w-px h-8 bg-border/60 mx-1 hidden sm:block" />
          
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-none font-black text-[13px] tracking-tight cursor-pointer bg-brand text-white shadow-[0_4px_12px_rgba(232,93,4,0.3)] hover:-translate-y-px transition-all ml-1">
            <Plus size={16} /> Nueva Categoría
          </button>
        </div>
      </header>

      {/* Hero Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
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

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-10">
        <div className="relative flex-1 w-full max-w-sm group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand transition-colors" size={16} />
          <input
            placeholder="Buscar platillo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-2xl text-sm font-bold text-text outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all shadow-sm"
          />
        </div>

        <div className="flex p-1 bg-surface-alt rounded-[18px] border border-border gap-1 w-full md:w-auto overflow-hidden">
          {[
            { k: "all", l: "Todos" },
            { k: "available", l: "Disponibles" },
            { k: "unavailable", l: "Ocultos" },
          ].map((o) => (
            <button
              key={o.k}
              onClick={() => setFilterAvail(o.k as any)}
              className={`px-5 py-2 rounded-xl text-[12px] font-black tracking-tight cursor-pointer transition-all border-none ${
                filterAvail === o.k ? "bg-surface text-brand shadow-sm ring-1 ring-border" : "bg-transparent text-text-muted hover:text-text-sec"
              }`}
            >
              {o.l}
            </button>
          ))}
        </div>

        <button className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-border text-sm font-bold bg-surface text-text-sec hover:bg-surface-alt transition-colors cursor-pointer shadow-sm ml-auto">
          <Filter size={16} /> Filtros avanzados
        </button>
      </div>

      {/* Categories Grid */}
      <div className="flex flex-col gap-4">
        {categories.map((cat) => (
          <CategorySection
            key={cat.id}
            category={cat}
            search={search}
            filterAvail={filterAvail}
            onAdd={(cId) => setModal({ catId: cId, item: null })}
            onToggle={toggleItem}
            onEdit={(cId, item) => setModal({ catId: cId, item })}
            onDelete={deleteItem}
          />
        ))}
      </div>

      {/* Item Modal */}
      {modal && (
        <ItemModal
          catId={modal.catId}
          categories={categories}
          item={modal.item}
          onClose={() => setModal(null)}
          onSave={saveItem}
        />
      )}
    </main>
  );
}
