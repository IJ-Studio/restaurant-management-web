"use client";
import React, { useState } from "react";
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  Users,
  Settings,
  LogOut,
  Package,
  DollarSign,
  BarChart2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Plus,
  Trash2,
  X,
  Pencil,
  Eye,
  CheckCircle2,
  Camera,
  Star,
  Instagram,
  Facebook,
  Twitter,
  Info,
  Save,
} from "lucide-react";

const T = {
  brand: "#e85d04",
  bg: "#faf9f7",
  surface: "#ffffff",
  elevated: "#f5f3ef",
  subtle: "#ede9e3",
  text: "#1a1208",
  textSec: "#6b5e4e",
  textMut: "#a89880",
  border: "#e8e1d8",
  borderMed: "#d4c8bc",
  shadow: "0 2px 16px rgba(26,18,8,0.07)",
  shadowHov: "0 8px 32px rgba(26,18,8,0.12)",
  fontD: "'Fraunces', Georgia, serif",
  fontB: "'DM Sans', system-ui, sans-serif",
  ok: "#059669",
  warn: "#d97706",
  danger: "#dc2626",
  info: "#2563eb",
};

function NavItem({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        borderRadius: 14,
        fontSize: 14,
        fontWeight: 600,
        border: "none",
        cursor: "pointer",
        width: "100%",
        textAlign: "left",
        transition: "all .15s",
        background: active ? T.brand : h ? T.elevated : "transparent",
        color: active ? "#fff" : h ? T.text : T.textSec,
        boxShadow: active ? "0 4px 14px rgba(232,93,4,.25)" : "none",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

const inp: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  border: `1px solid ${T.borderMed}`,
  borderRadius: 10,
  fontSize: 13,
  color: T.text,
  background: T.surface,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: T.fontB,
};
const lbl: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  color: T.textSec,
  marginBottom: 5,
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface Schedule {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}
interface Gallery {
  id: number;
  url: string;
  caption: string;
  order: number;
}
interface Feature {
  id: number;
  icon: string;
  text: string;
}

interface RestaurantInfo {
  name: string;
  slogan: string;
  description: string;
  history: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  mapEmbed: string;
  instagram: string;
  facebook: string;
  twitter: string;
  schedule: Schedule[];
  features: Feature[];
  gallery: Gallery[];
  coverImage: string;
  logoText: string;
  rfc: string;
  razonSocial: string;
}

// ─── Initial data ─────────────────────────────────────────────────────────────
const INITIAL: RestaurantInfo = {
  name: "El Quijote",
  slogan: "Cocina internacional con alma española",
  description:
    "El Quijote es un restaurante independiente que ofrece cocina internacional con fuerte inspiración española y una experiencia gastronómica distintiva en Huejutla de Reyes, Hidalgo.",
  history:
    "Fundado por Alejandro Daniel Monterrubio Caballero, el restaurante nació con la visión de llevar sabores del mundo a la Huasteca hidalguense. Desde su apertura, se ha convertido en el punto de encuentro gastronómico de la región.",
  phone: "771 272 8818",
  email: "ftdanielcaballero@gmail.com",
  website: "www.restauranteelquijote.mx",
  address: "Plaza Hidalgo #5-1, Centro, Huejutla de Reyes, Hgo. C.P. 43000",
  mapEmbed: "https://maps.google.com/?q=Plaza+Hidalgo+5-1+Huejutla+Hidalgo",
  instagram: "@elquijotehujutla",
  facebook: "Restaurante El Quijote",
  twitter: "@quijote_hjl",
  rfc: "EQRE001010XXX",
  razonSocial: "Restaurante El Quijote S.A. de C.V.",
  logoText: "Q",
  coverImage: "",
  schedule: [
    { day: "Lunes", open: "13:00", close: "23:00", closed: false },
    { day: "Martes", open: "13:00", close: "23:00", closed: false },
    { day: "Miércoles", open: "13:00", close: "23:00", closed: false },
    { day: "Jueves", open: "13:00", close: "23:00", closed: false },
    { day: "Viernes", open: "13:00", close: "23:00", closed: false },
    { day: "Sábado", open: "13:00", close: "23:00", closed: false },
    { day: "Domingo", open: "13:00", close: "23:00", closed: false },
  ],
  features: [
    { id: 1, icon: "🍷", text: "Carta de vinos importados" },
    { id: 2, icon: "🎭", text: "Ambiente elegante y acogedor" },
    { id: 3, icon: "🚗", text: "Estacionamiento disponible" },
    { id: 4, icon: "📱", text: "Reservas en línea" },
    { id: 5, icon: "🍕", text: "Cocina internacional" },
    { id: 6, icon: "🎂", text: "Eventos privados y banquetes" },
  ],
  gallery: [
    {
      id: 1,
      url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600",
      caption: "Interior del restaurante",
      order: 1,
    },
    {
      id: 2,
      url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600",
      caption: "Nuestra cocina",
      order: 2,
    },
    {
      id: 3,
      url: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=600",
      caption: "Terraza",
      order: 3,
    },
  ],
};

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: T.surface,
        borderRadius: 24,
        border: `1px solid ${T.border}`,
        boxShadow: T.shadow,
        overflow: "hidden",
        marginBottom: 20,
      }}
    >
      <div
        style={{
          padding: "18px 24px",
          borderBottom: `1px solid ${T.border}`,
          background: T.elevated,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span style={{ color: T.brand }}>{icon}</span>
        <h2
          style={{
            fontFamily: T.fontD,
            fontWeight: 900,
            fontSize: 16,
            color: T.text,
            margin: 0,
          }}
        >
          {title}
        </h2>
      </div>
      <div style={{ padding: "22px 24px" }}>{children}</div>
    </div>
  );
}

// ─── Preview modal ────────────────────────────────────────────────────────────
function PreviewModal({
  info,
  onClose,
}: {
  info: RestaurantInfo;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        overflowY: "auto",
        background: "rgba(26,18,8,0.6)",
        backdropFilter: "blur(6px)",
        padding: "40px 20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          maxWidth: 700,
          margin: "0 auto",
          background: T.surface,
          borderRadius: 28,
          boxShadow: "0 32px 80px rgba(26,18,8,0.25)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero */}
        <div
          style={{
            height: 200,
            background: `linear-gradient(135deg,${T.brand} 0%,#f4722b 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 12,
            position: "relative",
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 18,
              background: "rgba(255,255,255,.2)",
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: T.fontD,
              fontWeight: 900,
              fontSize: 32,
              color: "#fff",
            }}
          >
            {info.logoText}
          </div>
          <div style={{ textAlign: "center" }}>
            <h1
              style={{
                fontFamily: T.fontD,
                fontWeight: 900,
                fontSize: 28,
                color: "#fff",
                margin: "0 0 4px",
              }}
            >
              {info.name}
            </h1>
            <p
              style={{ fontSize: 14, color: "rgba(255,255,255,.8)", margin: 0 }}
            >
              {info.slogan}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              padding: 8,
              background: "rgba(255,255,255,.2)",
              border: "none",
              borderRadius: 10,
              cursor: "pointer",
              display: "flex",
              color: "#fff",
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: "28px 32px" }}>
          {/* About */}
          <p
            style={{
              fontSize: 14,
              color: T.textSec,
              lineHeight: 1.7,
              marginBottom: 24,
            }}
          >
            {info.description}
          </p>

          {/* Contact + Hours */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 20,
              marginBottom: 24,
            }}
          >
            <div>
              <h3
                style={{
                  fontFamily: T.fontD,
                  fontWeight: 800,
                  fontSize: 15,
                  color: T.text,
                  margin: "0 0 12px",
                }}
              >
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
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: 8,
                      marginBottom: 8,
                      alignItems: "flex-start",
                    }}
                  >
                    <span
                      style={{ color: T.brand, flexShrink: 0, marginTop: 2 }}
                    >
                      {r.icon}
                    </span>
                    <span style={{ fontSize: 12, color: T.textSec }}>
                      {r.v}
                    </span>
                  </div>
                ))}
            </div>
            <div>
              <h3
                style={{
                  fontFamily: T.fontD,
                  fontWeight: 800,
                  fontSize: 15,
                  color: T.text,
                  margin: "0 0 12px",
                }}
              >
                Horarios
              </h3>
              {info.schedule.map((s) => (
                <div
                  key={s.day}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 5,
                    fontSize: 12,
                  }}
                >
                  <span style={{ fontWeight: 700, color: T.textSec }}>
                    {s.day}
                  </span>
                  <span style={{ color: s.closed ? T.danger : T.ok }}>
                    {s.closed ? "Cerrado" : `${s.open} – ${s.close}`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 20,
            }}
          >
            {info.features.map((f) => (
              <span
                key={f.id}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 99,
                  fontSize: 12,
                  fontWeight: 600,
                  background: T.elevated,
                  color: T.textSec,
                  border: `1px solid ${T.border}`,
                }}
              >
                {f.icon} {f.text}
              </span>
            ))}
          </div>

          {/* Gallery */}
          {info.gallery.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 8,
              }}
            >
              {info.gallery.map((g) => (
                <div
                  key={g.id}
                  style={{
                    borderRadius: 12,
                    overflow: "hidden",
                    aspectRatio: "4/3",
                    background: T.elevated,
                  }}
                >
                  <img
                    src={g.url}
                    alt={g.caption}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
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

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AboutPage() {
  const router = useRouter();
  const [info, setInfo] = useState<RestaurantInfo>(INITIAL);
  const [saved, setSaved] = useState(false);
  const [preview, setPreview] = useState(false);
  const [newFeature, setNewFeature] = useState("");
  const [newFeatureIcon, setNewFeatureIcon] = useState("✨");
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [newGalleryCaption, setNewGalleryCaption] = useState("");
  const user = useSelector((state) => state.auth.user);

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function updateField(field: keyof RestaurantInfo, value: any) {
    setInfo((i) => ({ ...i, [field]: value }));
  }

  function updateSchedule(idx: number, field: keyof Schedule, value: any) {
    setInfo((i) => ({
      ...i,
      schedule: i.schedule.map((s, j) =>
        j !== idx ? s : { ...s, [field]: value },
      ),
    }));
  }

  function addFeature() {
    if (!newFeature.trim()) return;
    setInfo((i) => ({
      ...i,
      features: [
        ...i.features,
        { id: Date.now(), icon: newFeatureIcon, text: newFeature.trim() },
      ],
    }));
    setNewFeature("");
    setNewFeatureIcon("✨");
  }

  function removeFeature(id: number) {
    setInfo((i) => ({ ...i, features: i.features.filter((f) => f.id !== id) }));
  }

  function addGallery() {
    if (!newGalleryUrl.trim()) return;
    setInfo((i) => ({
      ...i,
      gallery: [
        ...i.gallery,
        {
          id: Date.now(),
          url: newGalleryUrl.trim(),
          caption: newGalleryCaption,
          order: i.gallery.length + 1,
        },
      ],
    }));
    setNewGalleryUrl("");
    setNewGalleryCaption("");
  }

  function removeGallery(id: number) {
    setInfo((i) => ({ ...i, gallery: i.gallery.filter((g) => g.id !== id) }));
  }

  function handleLogout() {
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: T.fontB,
        background: T.bg,
        color: T.text,
      }}
    >
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <AdminSidebar activePage="about" user={user} onLogout={handleLogout} />

        <main style={{ flex: 1, marginLeft: 260, padding: "40px 48px" }}>
          {/* Header */}
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 32,
            }}
          >
            <div>
              <h1
                style={{
                  fontFamily: T.fontD,
                  fontWeight: 900,
                  fontSize: 32,
                  letterSpacing: "-.03em",
                  lineHeight: 1.1,
                  margin: "0 0 6px",
                  color: T.text,
                }}
              >
                Información del restaurante
              </h1>
              <p style={{ fontSize: 14, color: T.textMut, margin: 0 }}>
                Esta información se muestra en la página pública del restaurante
              </p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setPreview(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "10px 16px",
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  border: `1px solid ${T.border}`,
                  background: T.surface,
                  color: T.textSec,
                }}
              >
                <Eye size={14} /> Vista previa
              </button>
              <button
                onClick={save}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "10px 18px",
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  color: "#fff",
                  background: saved ? T.ok : T.brand,
                  boxShadow: `0 4px 12px ${saved ? "rgba(5,150,105,.3)" : "rgba(232,93,4,.28)"}`,
                  transition: "all .2s",
                }}
              >
                {saved ? (
                  <>
                    <CheckCircle2 size={14} /> Guardado
                  </>
                ) : (
                  <>
                    <Save size={14} /> Guardar cambios
                  </>
                )}
              </button>
            </div>
          </header>

          {/* ── 1. Identidad ── */}
          <Section title="Identidad y presentación" icon={<Star size={16} />}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div>
                <label style={lbl}>Nombre del restaurante</label>
                <input
                  style={inp}
                  value={info.name}
                  onChange={(e) => updateField("name", e.target.value)}
                />
              </div>
              <div>
                <label style={lbl}>Slogan / Tagline</label>
                <input
                  style={inp}
                  value={info.slogan}
                  onChange={(e) => updateField("slogan", e.target.value)}
                />
              </div>
              <div>
                <label style={lbl}>Razón social</label>
                <input
                  style={inp}
                  value={info.razonSocial}
                  onChange={(e) => updateField("razonSocial", e.target.value)}
                />
              </div>
              <div>
                <label style={lbl}>RFC fiscal</label>
                <input
                  style={{ ...inp, fontFamily: "monospace", fontWeight: 700 }}
                  value={info.rfc}
                  onChange={(e) =>
                    updateField("rfc", e.target.value.toUpperCase())
                  }
                  maxLength={13}
                />
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={lbl}>Descripción principal</label>
                <textarea
                  style={{ ...inp, resize: "vertical" }}
                  rows={3}
                  value={info.description}
                  onChange={(e) => updateField("description", e.target.value)}
                />
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={lbl}>Historia / Acerca de nosotros</label>
                <textarea
                  style={{ ...inp, resize: "vertical" }}
                  rows={4}
                  value={info.history}
                  onChange={(e) => updateField("history", e.target.value)}
                />
              </div>
            </div>
          </Section>

          {/* ── 2. Contacto y Ubicación ── */}
          <Section title="Contacto y ubicación" icon={<MapPin size={16} />}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }}
            >
              <div>
                <label style={lbl}>Teléfono</label>
                <div style={{ position: "relative" }}>
                  <Phone
                    size={13}
                    style={{
                      position: "absolute",
                      left: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: T.textMut,
                    }}
                  />
                  <input
                    style={{ ...inp, paddingLeft: 30 }}
                    value={info.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label style={lbl}>Correo electrónico</label>
                <div style={{ position: "relative" }}>
                  <Mail
                    size={13}
                    style={{
                      position: "absolute",
                      left: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: T.textMut,
                    }}
                  />
                  <input
                    type="email"
                    style={{ ...inp, paddingLeft: 30 }}
                    value={info.email}
                    onChange={(e) => updateField("email", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label style={lbl}>Sitio web</label>
                <div style={{ position: "relative" }}>
                  <Globe
                    size={13}
                    style={{
                      position: "absolute",
                      left: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: T.textMut,
                    }}
                  />
                  <input
                    style={{ ...inp, paddingLeft: 30 }}
                    value={info.website}
                    onChange={(e) => updateField("website", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label style={lbl}>Dirección completa</label>
                <div style={{ position: "relative" }}>
                  <MapPin
                    size={13}
                    style={{
                      position: "absolute",
                      left: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: T.textMut,
                    }}
                  />
                  <input
                    style={{ ...inp, paddingLeft: 30 }}
                    value={info.address}
                    onChange={(e) => updateField("address", e.target.value)}
                  />
                </div>
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={lbl}>URL de Google Maps / Embed</label>
                <input
                  style={inp}
                  value={info.mapEmbed}
                  onChange={(e) => updateField("mapEmbed", e.target.value)}
                  placeholder="https://maps.google.com/?q=..."
                />
              </div>
            </div>

            {/* Redes sociales */}
            <div
              style={{
                marginTop: 18,
                paddingTop: 18,
                borderTop: `1px solid ${T.border}`,
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: T.textMut,
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  margin: "0 0 12px",
                }}
              >
                Redes sociales
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: 12,
                }}
              >
                {[
                  {
                    icon: <Instagram size={13} />,
                    label: "Instagram",
                    field: "instagram" as const,
                    color: "#E1306C",
                  },
                  {
                    icon: <Facebook size={13} />,
                    label: "Facebook",
                    field: "facebook" as const,
                    color: "#1877F2",
                  },
                  {
                    icon: <Twitter size={13} />,
                    label: "Twitter/X",
                    field: "twitter" as const,
                    color: "#1DA1F2",
                  },
                ].map((s) => (
                  <div key={s.field}>
                    <label style={lbl}>{s.label}</label>
                    <div style={{ position: "relative" }}>
                      <span
                        style={{
                          position: "absolute",
                          left: 10,
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: s.color,
                        }}
                      >
                        {s.icon}
                      </span>
                      <input
                        style={{ ...inp, paddingLeft: 30 }}
                        value={(info as any)[s.field]}
                        onChange={(e) => updateField(s.field, e.target.value)}
                        placeholder={
                          s.label === "Instagram"
                            ? "@usuario"
                            : "Nombre de página"
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* ── 3. Horarios ── */}
          <Section title="Horarios de atención" icon={<Clock size={16} />}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {info.schedule.map((s, i) => (
                <div
                  key={s.day}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 16px",
                    background: T.elevated,
                    borderRadius: 12,
                    border: `1px solid ${s.closed ? T.danger : T.border}`,
                    opacity: s.closed ? 0.65 : 1,
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: T.text,
                      width: 90,
                      flexShrink: 0,
                    }}
                  >
                    {s.day}
                  </span>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={s.closed}
                      onChange={(e) =>
                        updateSchedule(i, "closed", e.target.checked)
                      }
                      style={{ width: 14, height: 14, accentColor: T.danger }}
                    />
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: s.closed ? T.danger : T.textMut,
                      }}
                    >
                      Cerrado
                    </span>
                  </label>
                  {!s.closed && (
                    <>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          flex: 1,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            color: T.textMut,
                            fontWeight: 600,
                          }}
                        >
                          Abre
                        </span>
                        <input
                          type="time"
                          value={s.open}
                          onChange={(e) =>
                            updateSchedule(i, "open", e.target.value)
                          }
                          style={{
                            padding: "6px 10px",
                            borderRadius: 8,
                            border: `1px solid ${T.border}`,
                            fontSize: 13,
                            color: T.text,
                            background: T.surface,
                            outline: "none",
                            fontFamily: T.fontB,
                          }}
                        />
                        <span
                          style={{
                            fontSize: 11,
                            color: T.textMut,
                            fontWeight: 600,
                          }}
                        >
                          Cierra
                        </span>
                        <input
                          type="time"
                          value={s.close}
                          onChange={(e) =>
                            updateSchedule(i, "close", e.target.value)
                          }
                          style={{
                            padding: "6px 10px",
                            borderRadius: 8,
                            border: `1px solid ${T.border}`,
                            fontSize: 13,
                            color: T.text,
                            background: T.surface,
                            outline: "none",
                            fontFamily: T.fontB,
                          }}
                        />
                      </div>
                      <span
                        style={{ fontSize: 11, fontWeight: 700, color: T.ok }}
                      >
                        {s.open} – {s.close}
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </Section>

          {/* ── 4. Características ── */}
          <Section
            title="Características y servicios"
            icon={<Star size={16} />}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 16,
              }}
            >
              {info.features.map((f) => (
                <div
                  key={f.id}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 12px",
                    borderRadius: 99,
                    fontSize: 12,
                    fontWeight: 600,
                    background: T.elevated,
                    color: T.textSec,
                    border: `1px solid ${T.border}`,
                  }}
                >
                  {f.icon} {f.text}
                  <button
                    onClick={() => removeFeature(f.id)}
                    style={{
                      display: "flex",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: T.textMut,
                      padding: 0,
                      marginLeft: 2,
                    }}
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                style={{ ...inp, width: 56 }}
                value={newFeatureIcon}
                onChange={(e) => setNewFeatureIcon(e.target.value)}
                placeholder="🍕"
                maxLength={2}
              />
              <input
                style={{ ...inp, flex: 1 }}
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addFeature()}
                placeholder="Ej. Estacionamiento gratuito"
              />
              <button
                onClick={addFeature}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "9px 16px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  background: T.brand,
                  color: "#fff",
                }}
              >
                <Plus size={14} /> Agregar
              </button>
            </div>
          </Section>

          {/* ── 5. Galería ── */}
          <Section title="Galería de imágenes" icon={<Camera size={16} />}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 12,
                marginBottom: 16,
              }}
            >
              {info.gallery.map((g) => (
                <div
                  key={g.id}
                  style={{
                    borderRadius: 14,
                    overflow: "hidden",
                    position: "relative",
                    aspectRatio: "4/3",
                    background: T.elevated,
                    border: `1px solid ${T.border}`,
                  }}
                >
                  <img
                    src={g.url}
                    alt={g.caption}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(26,18,8,0)",
                      transition: "background .2s",
                      display: "flex",
                      alignItems: "flex-end",
                      padding: 8,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "rgba(26,18,8,0.5)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "rgba(26,18,8,0)")
                    }
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                        gap: 4,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          color: "#fff",
                          fontWeight: 600,
                          flex: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {g.caption}
                      </span>
                      <button
                        onClick={() => removeGallery(g.id)}
                        style={{
                          padding: 4,
                          background: "rgba(220,38,38,.8)",
                          border: "none",
                          borderRadius: 6,
                          cursor: "pointer",
                          display: "flex",
                          color: "#fff",
                          flexShrink: 0,
                        }}
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add placeholder */}
              <div
                style={{
                  borderRadius: 14,
                  aspectRatio: "4/3",
                  border: `2px dashed ${T.borderMed}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: T.elevated,
                  cursor: "pointer",
                  flexDirection: "column",
                  gap: 8,
                  color: T.textMut,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = T.brand;
                  e.currentTarget.style.color = T.brand;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = T.borderMed;
                  e.currentTarget.style.color = T.textMut;
                }}
              >
                <Camera size={24} />
                <span style={{ fontSize: 11, fontWeight: 700 }}>
                  Nueva imagen
                </span>
              </div>
            </div>

            {/* Add gallery form */}
            <div
              style={{
                display: "flex",
                gap: 8,
                padding: "14px 16px",
                background: T.elevated,
                borderRadius: 12,
              }}
            >
              <input
                style={{ ...inp, flex: 2 }}
                value={newGalleryUrl}
                onChange={(e) => setNewGalleryUrl(e.target.value)}
                placeholder="URL de imagen (https://...)"
              />
              <input
                style={{ ...inp, flex: 1 }}
                value={newGalleryCaption}
                onChange={(e) => setNewGalleryCaption(e.target.value)}
                placeholder="Descripción (opcional)"
              />
              <button
                onClick={addGallery}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "9px 14px",
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  background: T.brand,
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                <Plus size={13} /> Agregar
              </button>
            </div>
          </Section>

          {/* Save footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              padding: "16px 24px",
              background: T.surface,
              borderRadius: 16,
              border: `1px solid ${T.border}`,
              boxShadow: T.shadow,
            }}
          >
            <button
              onClick={() => setInfo(INITIAL)}
              style={{
                padding: "9px 20px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                background: T.subtle,
                color: T.textSec,
              }}
            >
              Restablecer
            </button>
            <button
              onClick={() => setPreview(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 16px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                border: `1px solid ${T.border}`,
                background: T.surface,
                color: T.textSec,
              }}
            >
              <Eye size={14} /> Vista previa
            </button>
            <button
              onClick={save}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "9px 20px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                color: "#fff",
                background: saved ? T.ok : T.brand,
                boxShadow: `0 4px 12px ${saved ? "rgba(5,150,105,.3)" : "rgba(232,93,4,.28)"}`,
                transition: "all .2s",
              }}
            >
              {saved ? (
                <>
                  <CheckCircle2 size={14} /> Guardado
                </>
              ) : (
                <>
                  <Save size={14} /> Publicar cambios
                </>
              )}
            </button>
          </div>
        </main>
      </div>

      {preview && (
        <PreviewModal info={info} onClose={() => setPreview(false)} />
      )}
    </div>
  );
}
