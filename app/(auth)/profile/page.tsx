"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, MapPin, Save, RefreshCw, ArrowLeft, ShieldCheck, Edit3, X, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function PerfilUsuarioPage() {
  const router = useRouter();

  // Datos originales de la base de datos (para saber si hubo cambios reales)
  const [datosOriginales, setDatosOriginales] = useState<any>(null);

  // Estados del formulario
  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    email: "",
    phone: "",
    calle: "",
    numero: "",
    colonia: "",
    ciudad: "",
    codigoPostal: "",
    indicaciones: ""
  });

  // Control de qué categorías están en modo edición
  const [editandoPersonal, setEditandoPersonal] = useState(false);
  const [editandoDireccion, setEditandoDireccion] = useState(false);

  // Estados de carga, envíos y UI
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mostrarBannerConfirmacion, setMostrarBannerConfirmacion] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "exito" | "error"; texto: string } | null>(null);

  // Cargar datos del usuario de forma segura
  useEffect(() => {
    const cargarInformacionUsuario = async () => {
      try {
        // Consultamos la sesión local que ya contiene los datos del usuario
        const sessionRes = await fetch("/api/auth/me");
        if (!sessionRes.ok) {
          router.push("/login?redirect=/profile");
          return;
        }

        const sessionData = await sessionRes.json();
        const activeUser = sessionData?.user || sessionData;

        if (!activeUser) {
          router.push("/login?redirect=/profile");
          return;
        }

        // Estructuramos la información inicial unificada
        const infoPoblada = {
          name: activeUser.name || "",
          lastname: activeUser.lastname || "",
          email: activeUser.email || "",
          phone: activeUser.phone || "",
          calle: activeUser.direccion?.calle || "",
          numero: activeUser.direccion?.numero || "",
          colonia: activeUser.direccion?.colonia || "",
          ciudad: activeUser.direccion?.ciudad || "",
          codigoPostal: activeUser.direccion?.codigoPostal || "",
          indicaciones: activeUser.direccion?.indicaciones || ""
        };

        setFormData(infoPoblada);
        setDatosOriginales(infoPoblada); // Guardamos la foto estática original
      } catch (error) {
        console.error("Error cargando perfil:", error);
        setMensaje({ tipo: "error", texto: "Ocurrió un inconveniente al sincronizar tu cuenta." });
      } finally {
        setLoading(false);
      }
    };

    cargarInformacionUsuario();
  }, [router]);

  // Verificar si hay algún cambio real comparando el estado actual vs el original
  const comprobarSiHayCambios = () => {
    if (!datosOriginales) return false;
    return Object.keys(formData).some(
      (key) => formData[key as keyof typeof formData] !== datosOriginales[key as keyof typeof datosOriginales]
    );
  };

  const hayCambios = comprobarSiHayCambios();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Al dar clic al botón superior derecho, activamos el Banner de Confirmación
  const preonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hayCambios) return;
    setMostrarBannerConfirmacion(true);
  };

  // Procesar la actualización definitiva tras aceptar el banner
  const confirmarGuardado = async () => {
    setMostrarBannerConfirmacion(false);
    setIsSubmitting(true);
    setMensaje(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem("authToken");

      const sessionRes = await fetch("/api/auth/me");
      const sessionData = await sessionRes.json();
      const activeUser = sessionData?.user || sessionData;

      const res = await fetch(`${apiUrl}/usuarios/perfil/actualizar/${activeUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("No se pudieron guardar las modificaciones en el servidor.");

      setMensaje({ tipo: "exito", texto: "¡Tu perfil se ha actualizado correctamente!" });
      setDatosOriginales(formData); // El estado actual se vuelve el nuevo estado original de comparación
      setEditandoPersonal(false);
      setEditandoDireccion(false);
    } catch (error: any) {
      setMensaje({ tipo: "error", texto: error.message || "Error al actualizar." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancelar la edición de una categoría y restaurar sus valores viejos
  const cancelarCategoriaPersonal = () => {
    setFormData(prev => ({
      ...prev,
      name: datosOriginales.name,
      lastname: datosOriginales.lastname,
      phone: datosOriginales.phone
    }));
    setEditandoPersonal(false);
  };

  const cancelarCategoriaDireccion = () => {
    setFormData(prev => ({
      ...prev,
      calle: datosOriginales.calle,
      numero: datosOriginales.numero,
      colonia: datosOriginales.colonia,
      ciudad: datosOriginales.ciudad,
      codigoPostal: datosOriginales.codigoPostal,
      indicaciones: datosOriginales.indicaciones
    }));
    setEditandoDireccion(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
          <p className="text-text/60 text-xs tracking-wide">Sincronizando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen text-text pb-16 pt-32 relative">
      <div className="container mx-auto px-4 max-w-xl">

        {/* CABECERA SUPERIOR INTERACTIVA */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/menu" className="inline-flex items-center gap-2 text-xs font-semibold text-text/60 hover:text-brand transition-colors">
            <ArrowLeft size={14} /> Volver al inicio
          </Link>

          {/* BOTÓN SUPERIOR DERECHA: BLOQUEADO HASTA QUE HAYA CAMBIOS */}
          <button
            onClick={preonSubmit}
            disabled={!hayCambios || isSubmitting}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide shadow-sm transition-all flex items-center gap-2 ${
              hayCambios
                ? "bg-brand hover:bg-brand/90 text-white cursor-pointer"
                : "bg-surface border border-border text-text/30 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            Guardar Cambios
          </button>
        </div>

        {/* BANNER DE CONFIRMACIÓN FLOTANTE / ALERTA */}
        {mostrarBannerConfirmacion && (
          <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl mb-6 flex flex-col gap-3 animate-in fade-in duration-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="text-sm font-bold text-amber-600 dark:text-amber-400">¿Confirmar actualización de cuenta?</h4>
                <p className="text-xs text-text-sec mt-0.5">Estás a punto de reescribir tus datos personales y/o de envío en la plataforma. ¿Deseas guardar estos cambios?</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 self-end">
              <button
                onClick={() => setMostrarBannerConfirmacion(false)}
                className="px-3 py-1.5 text-xs font-semibold bg-surface border border-border rounded-lg hover:bg-border/40 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarGuardado}
                className="px-3 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
              >
                Sí, estoy seguro
              </button>
            </div>
          </div>
        )}

        {/* FEEDBACK DE RESPUESTA */}
        {mensaje && (
          <div className={`p-4 rounded-xl mb-6 border text-sm font-medium ${
            mensaje.tipo === "exito"
              ? "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400"
              : "bg-red-500/10 border-red-500/30 text-red-500"
          }`}>
            {mensaje.texto}
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <User className="text-brand" size={24} /> Mi Cuenta
          </h1>
          <p className="text-xs text-text-sec mt-1">
            Visualiza tus datos registrados. Haz clic en "Editar" en la sección correspondiente para modificar los campos.
          </p>
        </div>

        <div className="space-y-6">

          {/* CATEGORÍA 1: DATOS PERSONALES */}
          <div className="bg-surface rounded-2xl border border-border p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/50">
              <h2 className="text-xs font-bold uppercase tracking-wider text-brand flex items-center gap-1.5">
                <ShieldCheck size={14} /> Datos Personales
              </h2>
              {editandoPersonal ? (
                <button
                  onClick={cancelarCategoriaPersonal}
                  className="text-xs font-medium text-red-500 hover:underline flex items-center gap-1"
                >
                  <X size={12}/> Cancelar
                </button>
              ) : (
                <button
                  onClick={() => setEditandoPersonal(true)}
                  className="text-xs font-bold text-brand hover:underline flex items-center gap-1"
                >
                  <Edit3 size={12}/> Editar Info
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text/60">Nombre</label>
                <input
                  type="text"
                  name="name"
                  required
                  disabled={!editandoPersonal}
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full text-sm rounded-xl p-3 focus:outline-none transition-all ${
                    editandoPersonal
                      ? "bg-background border border-brand text-text"
                      : "bg-background/40 border border-border/60 text-text/50 cursor-not-allowed"
                  }`}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text/60">Apellidos</label>
                <input
                  type="text"
                  name="lastname"
                  required
                  disabled={!editandoPersonal}
                  value={formData.lastname}
                  onChange={handleChange}
                  className={`w-full text-sm rounded-xl p-3 focus:outline-none transition-all ${
                    editandoPersonal
                      ? "bg-background border border-brand text-text"
                      : "bg-background/40 border border-border/60 text-text/50 cursor-not-allowed"
                  }`}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text/60 flex items-center gap-1"><Mail size={12}/> Correo Electrónico (Identidad)</label>
              <input
                type="email"
                name="email"
                disabled
                value={formData.email}
                className="w-full text-sm bg-background/30 border border-border/40 rounded-xl p-3 text-text/40 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text/60 flex items-center gap-1"><Phone size={12}/> Teléfono Celular</label>
              <input
                type="tel"
                name="phone"
                required
                disabled={!editandoPersonal}
                value={formData.phone}
                onChange={handleChange}
                placeholder="Ej. 5512345678"
                className={`w-full text-sm rounded-xl p-3 focus:outline-none transition-all ${
                  editandoPersonal
                    ? "bg-background border border-brand text-text"
                    : "bg-background/40 border border-border/60 text-text/50 cursor-not-allowed"
                }`}
              />
            </div>
          </div>

          {/* CATEGORÍA 2: DOMICILIO DE ENTREGA */}
          <div className="bg-surface rounded-2xl border border-border p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/50">
              <h2 className="text-xs font-bold uppercase tracking-wider text-brand flex items-center gap-1.5">
                <MapPin size={14} /> Domicilio de Entrega
              </h2>
              {editandoDireccion ? (
                <button
                  onClick={cancelarCategoriaDireccion}
                  className="text-xs font-medium text-red-500 hover:underline flex items-center gap-1"
                >
                  <X size={12}/> Cancelar
                </button>
              ) : (
                <button
                  onClick={() => setEditandoDireccion(true)}
                  className="text-xs font-bold text-brand hover:underline flex items-center gap-1"
                >
                  <Edit3 size={12}/> Editar Info
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-text/60">Calle</label>
                <input
                  type="text"
                  name="calle"
                  disabled={!editandoDireccion}
                  value={formData.calle}
                  onChange={handleChange}
                  className={`w-full text-sm rounded-xl p-3 focus:outline-none transition-all ${
                    editandoDireccion
                      ? "bg-background border border-brand text-text"
                      : "bg-background/40 border border-border/60 text-text/50 cursor-not-allowed"
                  }`}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text/60">Número</label>
                <input
                  type="text"
                  name="numero"
                  disabled={!editandoDireccion}
                  value={formData.numero}
                  onChange={handleChange}
                  className={`w-full text-sm rounded-xl p-3 focus:outline-none transition-all ${
                    editandoDireccion
                      ? "bg-background border border-brand text-text"
                      : "bg-background/40 border border-border/60 text-text/50 cursor-not-allowed"
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text/60">Colonia</label>
                <input
                  type="text"
                  name="colonia"
                  disabled={!editandoDireccion}
                  value={formData.colonia}
                  onChange={handleChange}
                  className={`w-full text-sm rounded-xl p-3 focus:outline-none transition-all ${
                    editandoDireccion
                      ? "bg-background border border-brand text-text"
                      : "bg-background/40 border border-border/60 text-text/50 cursor-not-allowed"
                  }`}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text/60">Código Postal</label>
                <input
                  type="text"
                  name="codigoPostal"
                  maxLength={5}
                  disabled={!editandoDireccion}
                  value={formData.codigoPostal}
                  onChange={handleChange}
                  className={`w-full text-sm rounded-xl p-3 focus:outline-none transition-all ${
                    editandoDireccion
                      ? "bg-background border border-brand text-text"
                      : "bg-background/40 border border-border/60 text-text/50 cursor-not-allowed"
                  }`}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text/60">Ciudad</label>
              <input
                type="text"
                name="ciudad"
                disabled={!editandoDireccion}
                value={formData.ciudad}
                onChange={handleChange}
                className={`w-full text-sm rounded-xl p-3 focus:outline-none transition-all ${
                  editandoDireccion
                    ? "bg-background border border-brand text-text"
                    : "bg-background/40 border border-border/60 text-text/50 cursor-not-allowed"
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text/60">Indicaciones de Entrega</label>
              <textarea
                name="indicaciones"
                disabled={!editandoDireccion}
                value={formData.indicaciones}
                onChange={handleChange}
                rows={2}
                className={`w-full text-sm rounded-xl p-3 focus:outline-none transition-all resize-none ${
                  editandoDireccion
                    ? "bg-background border border-brand text-text"
                    : "bg-background/40 border border-border/60 text-text/50 cursor-not-allowed"
                }`}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
