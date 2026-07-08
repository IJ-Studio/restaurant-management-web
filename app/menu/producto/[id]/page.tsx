"use client";

import { useState, useEffect } from "react";
import { notFound, useParams, useRouter, useSearchParams } from "next/navigation";
import { CldImage } from "next-cloudinary";
import {
  Minus, Plus, Utensils, Truck, AlertTriangle, X
} from "lucide-react";
import BackButton from "@/components/BackButton";
import { useSelector } from "react-redux";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params?.id || params?.slug;

  const reduxUser = useSelector((state: any) => state.auth.user);

  const [platillo, setPlatillo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cantidad, setCantidad] = useState(1);

  // Estados para el Modal de Mesas desde la BD
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mesas, setMesas] = useState<any[]>([]);
  const [loadingMesas, setLoadingMesas] = useState(false);

  // Leemos la mesa directamente del parámetro de la URL (?mesaQuery=...) en lugar de localStorage
  const urlMesa = searchParams?.get("mesaQuery");
  const [selectedMesa, setSelectedMesa] = useState<string>(urlMesa || "");

  // Fuente de verdad única para validar sesión mediante la API sin tokens locales
  const resolveCurrentUser = async (): Promise<any | null> => {
    if (reduxUser?.id) return reduxUser;

    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const sessionData = await res.json();
        const activeUser = sessionData?.user || sessionData;
        if (activeUser?.id) return activeUser;
      }
    } catch (e) {
      console.error("No se pudo verificar la sesión activa:", e);
    }
    return null;
  };

  // Cargar detalles del platillo
  useEffect(() => {
    const fetchPlatillo = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${apiUrl}/menu/items/${id}`);

        if (!res.ok) {
          if (res.status === 404) return notFound();
          throw new Error("Error al cargar los detalles del platillo");
        }

        const data = await res.json();
        setPlatillo(data);
      } catch (err: any) {
        console.error("Error capturado en el Front:", err);
        setError("No se pudo cargar la información del producto. Intenta más tarde.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPlatillo();
    }
  }, [id]);

  // Cargar las mesas de la base de datos cuando se abre el modal
  useEffect(() => {
    if (isModalOpen) {
const fetchMesasDeBD = async () => {
  setLoadingMesas(true);
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const res = await fetch(`${apiUrl}/mesas`);

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.error(`Error ${res.status} al consultar mesas:`, errBody);
      return;
    }

    const data = await res.json();
    console.log("Mesas recibidas:", data); // temporal, para debug
    setMesas(data);
  } catch (error) {
    console.error("Error de red consultando mesas:", error);
  } finally {
    setLoadingMesas(false);
  }
};

      fetchMesasDeBD();
    }
  }, [isModalOpen]);

  // Manejo del auto-execute si viene escaneado por query params
  useEffect(() => {
    const autoExecute = searchParams?.get("autoExecute");
    const qtyParam = searchParams?.get("qty");

    if (!platillo || autoExecute !== "pedir_mesa") return;

    const ejecutarAutoPedido = async () => {
      const currentUser = await resolveCurrentUser();
      if (!currentUser) return;

      if (qtyParam) {
        setCantidad(Number(qtyParam));
      }

      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);

      handleAddToOrderMesa(currentUser, urlMesa || undefined);
    };

    ejecutarAutoPedido();
  }, [platillo, reduxUser, searchParams, urlMesa]);

  const handleAddToOrderMesa = async (forcedUser?: any, targetMesa?: string) => {
    const currentUser = forcedUser || (await resolveCurrentUser());

    if (!currentUser) {
      const currentUrl = window.location.pathname;
      router.push(`/login?callbackUrl=${encodeURIComponent(currentUrl)}`);
      return;
    }

    const mesaFinal = targetMesa || selectedMesa;
    if (!mesaFinal) {
      setIsModalOpen(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      const res = await fetch(`${apiUrl}/pedidos/mesa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          platilloId: Number(platillo?.id),
          cantidad: Number(cantidad),
          usuarioId: Number(currentUser.id),
          mesa: mesaFinal,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || errData.error || "El servidor rechazó la solicitud de orden.");
      }

      const data = await res.json();

      alert(`¡Marchando! Tu pedido de ${cantidad}x ${platillo?.nombre} ha sido enviado a la cocina para la mesa ${data.mesaId || mesaFinal}.`);
      setIsModalOpen(false);

      // Redirigimos pasando el número de mesa en la URL de forma limpia
      router.push(`/menu/pedido?mesaQuery=${data.mesaId || mesaFinal}&tab=mesa`);
    } catch (err: any) {
      console.error("Error detallado al crear pedido:", err);
      alert(err.message || "Ocurrió un error al enviar el pedido.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddToCartDomicilio = async () => {
    const currentUser = await resolveCurrentUser();

    if (!currentUser) {
      const currentUrl = window.location.pathname;
      router.push(`/login?callbackUrl=${encodeURIComponent(currentUrl)}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      const res = await fetch(`${apiUrl}/pedidos/mesa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          platilloId: Number(platillo?.id),
          cantidad: Number(cantidad),
          usuarioId: Number(currentUser.id),
          // Sin parámetro "mesa" para indicarle al backend que es a domicilio
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error("Fallo al agregar a domicilio:", res.status, errData);
        throw new Error(errData.message || errData.error || `No se pudo agregar el producto (HTTP ${res.status}).`);
      }

      alert(`Agregado a tu pedido a domicilio: ${cantidad}x ${platillo?.nombre}`);
      router.push("/menu/pedido?tab=domicilio");
    } catch (err: any) {
      console.error("Error al agregar al pedido a domicilio:", err);
      alert(err.message || "Ocurrió un error al agregar el producto.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDecrease = () => {
    if (cantidad > 1) setCantidad(cantidad - 1);
  };

  const handleIncrease = () => {
    if (cantidad < 20) setCantidad(cantidad + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-24">
        <div className="text-center flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
          <p>Cargando experiencia gastronómica...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 pt-24">
        <p className="text-red-500 text-lg">{error}</p>
        <BackButton fallbackHref="/menu" label="Volver al menú" />
      </div>
    );
  }

  if (!platillo) return notFound();

  return (
    <div className="bg-background min-h-screen pb-20 pt-32 relative">
      <div className="container mx-auto px-4 max-w-6xl">

        <div className="mb-8">
          <BackButton fallbackHref="/menu" label="← Volver al menú" />
        </div>

        <div className="bg-surface rounded-3xl overflow-hidden shadow-sm border border-border flex flex-col lg:flex-row">

          {/* Sección de Imagen e Info Nutricional */}
          <div className="w-full lg:w-1/2 flex flex-col bg-surface-hover/10">
            <div className="relative w-full h-80 sm:h-96 lg:h-[500px]">
              {platillo.imagenUrl ? (
                <CldImage
                  src={platillo.imagenUrl}
                  fill
                  alt={platillo.nombre}
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full text-text/40 text-lg bg-surface">
                  Vacío (Sin fotografía)
                </div>
              )}

              {!platillo.disponible && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                  <span className="bg-red-600 text-white text-lg px-6 py-2 rounded-full font-bold tracking-widest uppercase shadow-lg">
                    Agotado Temporalmente
                  </span>
                </div>
              )}
            </div>

            {/* <div className="p-6 grid grid-cols-3 gap-4 border-t border-border bg-surface text-center">
              <div>
                <span className="text-text/40 text-xs block font-medium uppercase mb-1">Calorías</span>
                <span className="text-text font-semibold text-sm">{platillo.calorias ? `${platillo.calorias} Kcal` : "—"}</span>
              </div>
              <div>
                <span className="text-text/40 text-xs block font-medium uppercase mb-1">Porciones</span>
                <span className="text-text font-semibold text-sm">{platillo.porciones ? platillo.porciones : "—"}</span>
              </div>
              <div>
                <span className="text-text/40 text-xs block font-medium uppercase mb-1">SKU / Ref</span>
                <span className="text-text font-mono text-xs block truncate mt-1">{platillo.sku ? platillo.sku : "—"}</span>
              </div>
            </div> */}
          </div>

          {/* Detalles del Platillo */}
          <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col justify-between bg-surface">
            <div>
              <span className="text-brand font-semibold tracking-widest uppercase text-xs mb-3 block">
                {platillo.categoria?.nombre || "General"}
              </span>

              <h1 className="text-3xl md:text-5xl font-semibold text-text mb-4 leading-tight">
                {platillo.nombre}
              </h1>

              <div className="text-4xl font-light text-text mb-6 flex items-baseline gap-1">
                <span className="text-brand font-medium text-2xl">$</span>
                <span className="font-semibold">
                  {typeof platillo.precio === 'string' ? parseFloat(platillo.precio).toFixed(2) : platillo.precio?.toFixed(2)}
                </span>
                <span className="text-xs text-text/50 ml-2">IVA Incluido</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {platillo.esNuevo && <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-xs font-semibold uppercase">★ Nuevo</span>}
                {platillo.esPopular && <span className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-600 text-xs font-semibold uppercase">🔥 Popular</span>}
              </div>

              <div className="space-y-4 mb-6">
                {platillo.descripcionCorta && (
                  <p className="text-text font-medium text-lg italic border-l-4 border-brand pl-3">
                    {platillo.descripcionCorta}
                  </p>
                )}
                <p className="text-text-sec leading-relaxed text-sm">{platillo.descripcion}</p>
              </div>

              <div className="mb-6 bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-wider mb-1">
                  <AlertTriangle size={14} />
                  <span>Advertencia de Alérgenos</span>
                </div>
                <p className="text-xs text-text-sec">
                  {platillo.alergenos && platillo.alergenos.length > 0
                    ? `Este producto contiene o puede contener: ${platillo.alergenos.join(", ")}.`
                    : "No se han declarado alérgenos críticos."}
                </p>
              </div>

              {/* Selector de cantidad y acciones */}
              <div className="mt-8 space-y-6">
                <div className="flex items-center justify-between bg-background p-3 rounded-2xl border border-border">
                  <span className="text-sm font-semibold text-text-sec pl-2">Cantidad</span>
                  <div className="flex items-center gap-4 bg-surface rounded-xl border border-border p-1">
                    <button
                      onClick={handleDecrease}
                      className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-surface-hover text-text/70 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="text-base font-bold w-6 text-center font-mono">{cantidad}</span>
                    <button
                      onClick={handleIncrease}
                      className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-surface-hover text-text/70 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleAddToOrderMesa()}
                    disabled={isSubmitting || !platillo.disponible}
                    className="bg-brand hover:bg-brand/90 text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Utensils size={16} />
                    Pedir en Mesa
                  </button>

                  <button
                    onClick={handleAddToCartDomicilio}
                    disabled={isSubmitting || !platillo.disponible}
                    className="bg-surface hover:bg-surface-hover border border-border text-text font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Truck size={16} />
                    Para Domicilio
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* MODAL DE SELECCIÓN DE MESA DESDE LA BASE DE DATOS */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border w-full max-w-md rounded-3xl p-6 relative shadow-xl text-text animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-text/40 hover:text-text p-1 rounded-xl bg-surface-hover/50 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
                <Utensils size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold">Selecciona tu Mesa</h3>
                <p className="text-xs text-text-sec">Indica en qué mesa te encuentras para marchar tu orden.</p>
              </div>
            </div>

            {loadingMesas ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-text-sec">Consultando salones activos...</p>
              </div>
            ) : mesas.length > 0 ? (
              <div className="max-h-60 overflow-y-auto grid grid-cols-3 gap-2 p-1 mb-6 custom-scrollbar">
                {mesas.map((m: any) => {
                  const isSelected = selectedMesa === m.numero;
                  return (
                    <button
                      key={m.id || m.numero}
                      type="button"
                      onClick={() => setSelectedMesa(m.numero)}
                      className={`p-3 text-sm font-bold rounded-xl border transition-all flex flex-col items-center justify-center gap-1 ${
                        isSelected
                          ? "bg-brand border-brand text-white shadow-md scale-95"
                          : "bg-background border-border text-text hover:border-brand/50"
                      }`}
                    >
                      <span className="text-[10px] uppercase opacity-60 font-medium">Mesa</span>
                      <span className="text-base font-black">{m.numero}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-center text-text-sec py-8">No se encontraron mesas disponibles en el sistema.</p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 bg-surface-hover border border-border text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-surface-hover/80 transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleAddToOrderMesa()}
                disabled={isSubmitting || !selectedMesa}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 ${
                  selectedMesa && !isSubmitting
                    ? "bg-brand text-white shadow-lg hover:bg-brand/90 cursor-pointer"
                    : "bg-surface-hover border border-border text-text/20 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? "Enviando..." : "Confirmar Mesa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
