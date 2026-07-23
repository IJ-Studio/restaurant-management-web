"use client";

import React, { useState } from "react";
import { X, Tag, Upload, ImageIcon } from "lucide-react";
import { CldUploadButton } from "next-cloudinary";
import { type Promotion, GRADIENT_PRESETS } from "@/features/shared/data/promotions";

const inpClass =
  "w-full px-4 py-3 border border-border bg-surface rounded-2xl text-[14px] text-text font-body outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all shadow-sm";
const lblClass = "block text-[11px] font-black text-text-muted uppercase tracking-widest mb-2";

export function PromoModal({
  promo,
  onClose,
  onSave,
}: {
  promo: Promotion | null;
  onClose: () => void;
  onSave: (data: Partial<Promotion>) => void;
}) {
  const [form, setForm] = useState<Partial<Promotion>>(
    promo ?? {
      title: "",
      description: "",
      badge: "",
      emoji: "🎉",
      color: GRADIENT_PRESETS[0].value,
      originalPrice: undefined,
      discountedPrice: undefined,
      imageUrl: "",
      imagePublicId: "",
      active: true,
      order: 0,
      startDate: "",
      endDate: "",
    }
  );

  const handleImageUpload = (result: any) => {
    if (result?.info?.secure_url) {
      setForm((prev) => ({
        ...prev,
        imageUrl: result.info.secure_url,
        imagePublicId: result.info.public_id ?? "",
      }));
    }
  };

  const handleRemoveImage = () => {
    setForm((prev) => ({ ...prev, imageUrl: "", imagePublicId: "" }));
  };

  const handleSubmit = () => {
    if (!form.title) return;
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#1a1208]/45 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-surface rounded-[32px] shadow-[0_32px_80px_rgba(26,18,8,0.2)] w-full max-w-[560px] overflow-hidden flex flex-col scale-100 animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-8 py-7 border-b border-border bg-surface-alt flex justify-between items-start">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-white bg-brand/10 text-brand">
              <Tag size={20} />
            </div>
            <div>
              <h2 className="font-display font-black text-2xl text-text m-0 tracking-tight leading-none mb-1.5">
                {promo ? "Editar promoción" : "Nueva promoción"}
              </h2>
              <p className="text-xs font-bold text-text-muted m-0 uppercase tracking-wide">
                Panel de promociones
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 bg-white border border-border rounded-xl cursor-pointer flex text-text-muted/40 hover:text-text hover:bg-border transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="px-8 py-6 flex flex-col gap-6 max-h-[60vh] overflow-y-auto">
          <div>
            <label className={lblClass}>Título *</label>
            <input
              className={inpClass}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ej. 2x1 en Pizzas"
            />
          </div>

          <div>
            <label className={lblClass}>Descripción</label>
            <textarea
              className={`${inpClass} min-h-[90px] resize-none py-3`}
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Ej. Todos los martes, aplica en sucursal"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lblClass}>Etiqueta (badge)</label>
              <input
                className={inpClass}
                value={form.badge ?? ""}
                onChange={(e) => setForm({ ...form, badge: e.target.value })}
                placeholder="Ej. Oferta especial"
              />
            </div>
            <div>
              <label className={lblClass}>Emoji decorativo</label>
              <input
                className={inpClass}
                value={form.emoji ?? ""}
                onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                placeholder="🎉"
                maxLength={4}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lblClass}>Precio original</label>
              <input
                type="number"
                min={0}
                className={inpClass}
                value={form.originalPrice ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    originalPrice: e.target.value === "" ? undefined : Number(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <label className={lblClass}>Precio con descuento</label>
              <input
                type="number"
                min={0}
                className={inpClass}
                value={form.discountedPrice ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    discountedPrice: e.target.value === "" ? undefined : Number(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lblClass}>Vigencia desde</label>
              <input
                type="date"
                className={inpClass}
                value={form.startDate ?? ""}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className={lblClass}>Vigencia hasta</label>
              <input
                type="date"
                className={inpClass}
                value={form.endDate ?? ""}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
          </div>

          {/* ─── IMAGEN ─── */}
          <div>
            <label className={lblClass}>Imagen (opcional, reemplaza el emoji)</label>
            <div className="flex items-start gap-4 mt-2">
              <div className="w-24 h-24 rounded-2xl border border-border bg-surface-alt flex items-center justify-center overflow-hidden">
                {form.imageUrl ? (
                  <img src={form.imageUrl} alt="Vista previa" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={24} className="text-text-muted" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <CldUploadButton
                  uploadPreset="tu_upload_preset"
                  onSuccess={handleImageUpload}
                  options={{ maxFiles: 1 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand/10 text-brand text-sm font-bold hover:bg-brand/20 transition"
                >
                  <Upload size={14} />
                  {form.imageUrl ? "Cambiar imagen" : "Subir imagen"}
                </CldUploadButton>
                {form.imageUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-xs text-red-500 hover:underline text-left"
                  >
                    Quitar imagen
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ─── COLOR ─── */}
          <div>
            <label className={lblClass}>Color de fondo (tarjeta)</label>
            <div className="flex flex-wrap gap-2.5 p-4 bg-surface-alt rounded-[22px] border border-border">
              {GRADIENT_PRESETS.map((preset) => {
                const selected = form.color === preset.value;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setForm({ ...form, color: preset.value })}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full text-[11px] font-black cursor-pointer transition-all border-2 ${
                      selected ? "border-brand" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full bg-gradient-to-br ${preset.value}`} />
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between p-5 bg-surface-alt rounded-[22px] border border-border shadow-sm">
            <div>
              <p className="text-[14px] font-black text-text m-0">Promoción activa</p>
              <p className="text-[11px] text-text-muted m-0 font-medium tracking-wide uppercase mt-1">
                Visible en el sitio público
              </p>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, active: !form.active })}
              className={`w-14 h-8 rounded-full border-none cursor-pointer transition-all relative flex items-center p-1 ${
                form.active ? "bg-emerald-500 shadow-[0_2px_12px_rgba(16,185,129,0.3)]" : "bg-border"
              }`}
            >
              <div
                className={`w-6 h-6 bg-white rounded-full transition-all shadow-md ${
                  form.active ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-border bg-surface-alt flex justify-end gap-3.5">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-2xl text-[13px] font-black border-none cursor-pointer bg-white text-text-muted hover:bg-border hover:text-text transition-all tracking-widest uppercase"
          >
            Cancelar
          </button>
          <button
            disabled={!form.title}
            onClick={handleSubmit}
            className={`px-8 py-3 rounded-2xl text-[13px] font-black border-none cursor-pointer text-white transition-all tracking-widest uppercase ${
              form.title
                ? "bg-brand shadow-[0_8px_24px_rgba(232,93,4,0.3)] hover:-translate-y-px active:translate-y-px"
                : "bg-border text-text-muted"
            }`}
          >
            {promo ? "Guardar cambios" : "Publicar promoción"}
          </button>
        </div>
      </div>
    </div>
  );
}
