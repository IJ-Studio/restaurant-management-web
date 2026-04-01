"use client";

import { X, MapPin, Phone, Mail, Globe } from "lucide-react";
import type { RestaurantInfo } from "../data/aboutMock";

export function AboutPreviewModal({
  info,
  onClose,
}: {
  info: RestaurantInfo;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[200] overflow-y-auto bg-[#1a1208]/60 backdrop-blur-md p-10 flex items-start justify-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[700px] bg-surface rounded-[28px] shadow-[0_32px_80px_rgba(26,18,8,0.25)] overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero */}
        <div className="h-[200px] bg-gradient-to-br from-brand to-[#f4722b] flex flex-col items-center justify-center gap-3 relative">
          <div className="w-[60px] h-[60px] rounded-[18px] bg-white/20 backdrop-blur-md flex items-center justify-center font-display font-black text-3xl text-white">
            {info.logoText}
          </div>
          <div className="text-center px-4">
            <h1 className="font-display font-black text-[28px] text-white m-0 tracking-tight leading-none mb-1">
              {info.name}
            </h1>
            <p className="text-sm text-white/80 m-0">{info.slogan}</p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 bg-white/20 border-none rounded-xl cursor-pointer flex text-white hover:bg-white/30 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-7 md:p-8">
          {/* About */}
          <p className="text-sm text-text-sec leading-[1.7] mb-6">
            {info.description}
          </p>

          {/* Contact + Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
            <div>
              <h3 className="font-display font-extrabold text-[15px] text-text mb-3">
                Contacto
              </h3>
              {[
                { icon: <MapPin size={13} />, v: info.address },
                { icon: <Phone size={13} />, v: info.phone },
                { icon: <Mail size={13} />, v: info.email },
                { icon: <Globe size={13} />, v: info.website },
              ]
                .filter((r) => r.v)
                .map((r, i) => (
                  <div key={i} className="flex gap-2 items-start mb-2">
                    <span className="text-brand shrink-0 mt-[2px]">{r.icon}</span>
                    <span className="text-xs text-text-sec">{r.v}</span>
                  </div>
                ))}
            </div>
            <div>
              <h3 className="font-display font-extrabold text-[15px] text-text mb-3">
                Horarios
              </h3>
              {info.schedule.map((s) => (
                <div key={s.day} className="flex justify-between mb-1.5 text-xs">
                  <span className="font-bold text-text-sec">{s.day}</span>
                  <span className={`font-semibold ${s.closed ? "text-red-500" : "text-emerald-600"}`}>
                    {s.closed ? "Cerrado" : `${s.open} – ${s.close}`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-2 mb-5">
            {info.features.map((f) => (
              <span
                key={f.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-surface-alt text-text-sec border border-border"
              >
                {f.icon} {f.text}
              </span>
            ))}
          </div>

          {/* Gallery */}
          {info.gallery.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {info.gallery.map((g) => (
                <div
                  key={g.id}
                  className="rounded-xl overflow-hidden aspect-[4/3] bg-surface-alt"
                >
                  <img
                    src={g.url}
                    alt={g.caption}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
