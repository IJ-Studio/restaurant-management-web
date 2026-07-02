"use client";

import { useState, useEffect } from "react";
import { notFound, useParams } from "next/navigation";
import { CldImage } from "next-cloudinary";
import {
  Clock, Minus, Plus, ShoppingBag, Flame, Leaf, WheatOff,
  ChefHat, Star, Utensils, Truck, ShieldCheck, Scale, Info, AlertTriangle
} from "lucide-react";
import BackButton from "@/components/BackButton";

interface Platillo {
  id: number;
  nombre: string;
  descripcion: string;
  descripcionCorta?: string;
  imagenUrl?: string;
  precio: number;
  tiempoPreparacion?: number;
  disponible: boolean;
  esVegetariano: boolean;
  esVegano: boolean;
  esSinGluten: boolean;
  esPicante: boolean;
  nivelPicante?: number;
  esPopular: boolean;
  esNuevo: boolean;
  esDelChef: boolean;
  sku?: string;
  calorias?: number;
  porciones?: string;
  alergenos?: string[]; // Si los guardas como array o string separado por comas
  categoria?: { id: number; nombre: string };
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id || params?.slug;

  const [platillo, setPlatillo] = useState<Platillo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    const fetchPlatillo = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${apiUrl}/menu/items/${id}`);

        if (!res.ok) {
          if (res.status === 404) return notFound();
          throw new Error("Error al cargar los detalles del platillo");
        }

        const data: Platillo = await res.json();
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

  const handleDecrease = () => {
    if (cantidad > 1) setCantidad(cantidad - 1);
  };

  const handleIncrease = () => {
    if (cantidad < 20) setCantidad(cantidad + 1);
  };

  const handleAddToOrderMesa = () => {
    console.log(`[MESA] Añadido a la orden de la mesa: ${cantidad}x de ${platillo?.nombre}`);
    alert(`Añadido a tu orden en mesa: ${cantidad}x ${platillo?.nombre}`);
  };

  const handleAddToCartDomicilio = () => {
    console.log(`[DOMICILIO] Añadido al carrito para envío: ${cantidad}x de ${platillo?.nombre}`);
    alert(`Agregado al carrito de envíos: ${cantidad}x ${platillo?.nombre}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-24">
        <div className="text-center text-text flex flex-col items-center gap-4">
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
    <div className="bg-background min-h-screen pb-20 pt-32">
      <div className="container mx-auto px-4 max-w-6xl">

        <div className="mb-8">
          <BackButton fallbackHref="/menu" label="← Volver al menú" />
        </div>

        <div className="bg-surface rounded-3xl overflow-hidden shadow-sm border border-border flex flex-col lg:flex-row">

          {/* SECCIÓN IZQUIERDA: Imagen y Atributos Rápidos */}
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
                  Vacio (Sin fotografía)
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

            {/* Ficha Técnica / Nutricional Básica */}
            <div className="p-6 grid grid-cols-3 gap-4 border-t border-border bg-surface text-center">
              <div>
                <span className="text-text/40 text-xs block font-medium uppercase mb-1">Calorías</span>
                <span className="text-text font-semibold text-sm">
                  {platillo.calorias ? `${platillo.calorias} kcal` : "Vacio"}
                </span>
              </div>
              <div>
                <span className="text-text/40 text-xs block font-medium uppercase mb-1">Porciones</span>
                <span className="text-text font-semibold text-sm">
                  {platillo.porciones ? platillo.porciones : "Vacio"}
                </span>
              </div>
              <div>
                <span className="text-text/40 text-xs block font-medium uppercase mb-1">SKU / Ref</span>
                <span className="text-text font-mono text-xs block truncate mt-1">
                  {platillo.sku ? platillo.sku : "Vacio"}
                </span>
              </div>
            </div>
          </div>

          {/* SECCIÓN DERECHA: Información Comercial y Compra */}
          <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col justify-between bg-surface">
            <div>
              {/* Categoría */}
              <span className="text-brand font-semibold tracking-widest uppercase text-xs mb-3 block">
                {platillo.categoria?.nombre || "Sin categoría asignada"}
              </span>

              {/* Título y Precio */}
              <h1 className="text-3xl md:text-5xl font-semibold text-text mb-4 leading-tight">
                {platillo.nombre || "Platillo sin nombre"}
              </h1>

              <div className="text-4xl font-light text-text mb-6 flex items-baseline gap-1">
                <span className="text-brand font-medium text-2xl">$</span>
                <span className="font-semibold">
                  {typeof platillo.precio === 'string' ? parseFloat(platillo.precio).toFixed(2) : platillo.precio?.toFixed(2) || "0.00"}
                </span>
                <span className="text-xs text-text/50 ml-2">IVA Incluido</span>
              </div>

              {/* Badges / Etiquetas de Estado o Estilo de Vida */}
              <div className="flex flex-wrap gap-2 mb-6">
                {platillo.esNuevo && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 text-xs font-semibold uppercase">
                    <Star size={12} className="fill-blue-600" /> Nuevo
                  </span>
                )}
                {platillo.esPopular && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 text-xs font-semibold uppercase">
                    <Flame size={12} className="fill-yellow-600" /> Popular
                  </span>
                )}
                {platillo.esDelChef && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand/10 text-brand border border-brand/20 text-xs font-semibold uppercase">
                    <ChefHat size={12} /> Especial del Chef
                  </span>
                )}
                {platillo.esVegetariano && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 text-green-600 border border-green-500/20 text-xs font-semibold uppercase">
                    <Leaf size={12} /> Vegetariano
                  </span>
                )}
                {platillo.esVegano && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-600/10 text-green-700 border border-green-600/20 text-xs font-semibold uppercase">
                    <Leaf size={12} className="fill-green-700" /> Vegano
                  </span>
                )}
                {platillo.esSinGluten && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 text-xs font-semibold uppercase">
                    <WheatOff size={12} /> Sin Gluten
                  </span>
                )}
                {platillo.esPicante && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/10 text-red-600 border border-red-500/20 text-xs font-semibold uppercase">
                    <Flame size={12} className="fill-red-600" /> Picante {platillo.nivelPicante ? `(Lvl ${platillo.nivelPicante})` : ''}
                  </span>
                )}
              </div>

              {/* Descripciones */}
              <div className="space-y-4 mb-6">
                {platillo.descripcionCorta && (
                  <p className="text-text font-medium text-lg italic border-l-4 border-brand pl-3">
                    {platillo.descripcionCorta}
                  </p>
                )}
                <div className="text-text-sec leading-relaxed text-sm">
                  <span className="text-text font-medium block mb-1">Descripción detallada:</span>
                  <p>{platillo.descripcion || "Vacio (Este producto no cuenta con una descripción en este momento)."}</p>
                </div>
              </div>

              {/* Alérgenos Declarados */}
              <div className="mb-6 bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-wider mb-2">
                  <AlertTriangle size={14} />
                  <span>Advertencia de Alérgenos</span>
                </div>
                <p className="text-xs text-text-sec">
                  {platillo.alergenos && platillo.alergenos.length > 0
                    ? `Este producto contiene o puede contener trazas de: ${platillo.alergenos.join(", ")}.`
                    : "Vacio (No se han declarado alérgenos críticos para este platillo)."}
                </p>
              </div>

              {/* Indicadores Logísticos rápidos */}
              <div className="flex flex-col gap-2 bg-background p-4 rounded-xl border border-border mb-8 text-xs text-text-sec">
                {platillo.tiempoPreparacion && (
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-brand" />
                    <span>Preparación estimada: <strong className="text-text">{platillo.tiempoPreparacion} min</strong></span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-green-600" />
                  <span>Garantía de frescura alimentaria e higiene controlada.</span>
                </div>
              </div>
            </div>

            {/* CONTROLES DE COMPRA Y FLUJOS DE PEDIDO */}
            <div className="space-y-4">

              {/* Fila Selector Cantidad y Totalizador */}
              <div className="flex items-center justify-between gap-4 bg-background p-2 rounded-2xl border border-border">
                <span className="text-xs font-semibold uppercase text-text/50 pl-2">Cantidad</span>
                <div className="flex items-center gap-4 border-2 border-border/50 rounded-xl px-3 py-1 bg-surface">
                  <button
                    onClick={handleDecrease}
                    disabled={cantidad <= 1 || !platillo.disponible}
                    className="text-text hover:text-brand disabled:opacity-20 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="text-text font-bold text-base min-w-[20px] text-center">{cantidad}</span>
                  <button
                    onClick={handleIncrease}
                    disabled={!platillo.disponible}
                    className="text-text hover:text-brand disabled:opacity-20 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* DOBLE ACCIÓN DE COMPRA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                {/* Opción A: Ordenar en el restaurante (Mesa) */}
                <button
                  onClick={handleAddToOrderMesa}
                  disabled={!platillo.disponible}
                  className="bg-surface border-2 border-brand text-brand hover:bg-brand/5 disabled:border-border disabled:text-text/30 disabled:cursor-not-allowed font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2.5 transition-all text-sm uppercase tracking-wider"
                >
                  <Utensils size={18} />
                  {platillo.disponible ? "Pedir a la Mesa" : "No disponible"}
                </button>

                {/* Opción B: Agregar al Carrito para Delivery */}
                <button
                  onClick={handleAddToCartDomicilio}
                  disabled={!platillo.disponible}
                  className="bg-brand hover:brightness-110 disabled:bg-surface-hover disabled:text-text/40 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2.5 transition-all text-sm uppercase tracking-wider shadow-md shadow-brand/10"
                >
                  <Truck size={18} />
                  {platillo.disponible ? `Para Domicilio — $${((typeof platillo.precio === 'string' ? parseFloat(platillo.precio) : platillo.precio || 0) * cantidad).toFixed(2)}` : "Agotado"}
                </button>

              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
