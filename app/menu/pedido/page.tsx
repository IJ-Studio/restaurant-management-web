"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { ShoppingBag, XCircle, RefreshCw, Clock, Truck, Send } from "lucide-react";
import { CldImage } from "next-cloudinary";
import Link from "next/link";

export default function ResumenPedidoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Selector de Pestaña Principal
  const [activeTab, setActiveTab] = useState<"mesa" | "domicilio">("mesa");

  // Estados Comandas en Mesa
  const [dbOrders, setDbOrders] = useState<any[]>([]);
  const [loadingDb, setLoadingDb] = useState(false);
  const [mesaId, setMesaId] = useState<string | null>(null);

  // Estados Pedidos a Domicilio
  const [deliveryOrders, setDeliveryOrders] = useState<any[]>([]);
  const [loadingDelivery, setLoadingDelivery] = useState(false);
  const [usuarioId, setUsuarioId] = useState<string | null>(null);

  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Reloj para cálculo de cancelación en vivo
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const tabParam = searchParams?.get("tab");
    if (tabParam === "domicilio" || tabParam === "mesa") {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // 1. OBTENER COMANDAS DE LA MESA (carrito 'pendiente' + ya enviadas)
  // FIX: ahora requiere usuarioId también. Antes solo se filtraba por
  // mesaId, así que cualquiera que tuviera esa mesa guardada en
  // localStorage veía las órdenes de cualquier cliente, incluso después
  // de cerrar sesión.
  const fetchOrdersFromDB = async (targetMesa: string, userId: string) => {
    setLoadingDb(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/pedidos/usuario?mesaId=${targetMesa}&usuarioId=${userId}`);

      if (!res.ok) {
        const errBody = await res.text().catch(() => "");
        console.error(`Error ${res.status} al consultar comandas de mesa:`, errBody);
        return;
      }

      const data = await res.json();
      setDbOrders(data);
    } catch (error) {
      console.error("Error de red consultando comandas activas:", error);
    } finally {
      setLoadingDb(false);
    }
  };

  // 2. OBTENER PEDIDOS A DOMICILIO
  const fetchDeliveryOrders = async (userId: string) => {
    setLoadingDelivery(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem("authToken");

      const url = `${apiUrl}/pedidos/usuario?usuarioId=${userId}&tipo=domicilio`;

      const res = await fetch(url, {
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        }
      });

      if (!res.ok) {
        const errBody = await res.text().catch(() => "");
        console.error(`Error ${res.status} al consultar pedidos a domicilio:`, errBody);
        return;
      }

      const data = await res.json();
      setDeliveryOrders(data);
    } catch (error) {
      console.error("Error de red consultando órdenes a domicilio:", error);
    } finally {
      setLoadingDelivery(false);
    }
  };

  // Sincronización de Mesa e Identidad del Cliente
  // FIX: antes fetchOrdersFromDB(savedMesa) se disparaba de inmediato, sin
  // esperar a saber quién es el usuario. Ahora primero se resuelve la
  // sesión y, con ese usuarioId en mano, se piden tanto las comandas de
  // mesa como los pedidos a domicilio — ambos ligados a la cuenta real,
  // no a lo que haya quedado guardado en localStorage.
useEffect(() => {
  const urlMesa = searchParams?.get("mesaQuery");

  // La URL siempre manda: si el cliente viene de agregar un producto en
  // una mesa distinta a la que tenía cacheada, actualizamos el localStorage
  // en vez de dejarlo pegado al primer valor que se guardó alguna vez.
  if (urlMesa) {
    localStorage.setItem("num_mesa", urlMesa);
  }

  const savedMesa = urlMesa || localStorage.getItem("num_mesa");

  if (savedMesa) {
    setMesaId(savedMesa);
  }

  const verificarUsuario = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const sessionData = await res.json();
        const activeUser = sessionData?.user || sessionData;
        if (activeUser?.id) {
          setUsuarioId(activeUser.id);
          fetchDeliveryOrders(activeUser.id);
          if (savedMesa) {
            fetchOrdersFromDB(savedMesa, activeUser.id);
          }
        }
      }
    } catch (e) {
      console.error("Error validando cuenta para pedidos:", e);
    }
  };
  verificarUsuario();
}, [searchParams]);

  // Cancelación de una comanda YA enviada a cocina (sin cambios, ventana de 2 min)
  const handleCancelarOrden = async (ordenId: string) => {
    const confirmar = confirm("¿Estás seguro de que deseas cancelar este pedido? Se notificará a la cocina.");
    if (!confirmar) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/pedidos/cancelar/${ordenId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" }
      });

      if (!res.ok) throw new Error("No se pudo cancelar el pedido.");
      alert("Pedido cancelado exitosamente.");
      if (mesaId && usuarioId) fetchOrdersFromDB(mesaId, usuarioId);
    } catch (error: any) {
      alert(error.message || "Error al intentar cancelar.");
    }
  };

  // FIX (nuevo): quita un producto individual mientras su pedido siga en
  // 'pendiente' (carrito). Sirve tanto para mesa como para domicilio.
  const handleDescartarItem = async (itemId: number, tipo: "mesa" | "domicilio") => {
    const confirmar = confirm("¿Quitar este producto de tu pedido?");
    if (!confirmar) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/pedidos/item/${itemId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "No se pudo quitar el producto.");
      }

      if (tipo === "mesa" && mesaId && usuarioId) {
        fetchOrdersFromDB(mesaId, usuarioId);
      } else if (tipo === "domicilio" && usuarioId) {
        fetchDeliveryOrders(usuarioId);
      }
    } catch (error: any) {
      alert(error.message || "Ocurrió un error al quitar el producto.");
    }
  };

  // FIX (nuevo): manda a cocina el carrito de mesa que estaba 'pendiente'.
  const handleConfirmarMesa = async (ordenId: string) => {
    const confirmar = confirm("¿Enviar este pedido a cocina? Ya no podrás quitar productos después de confirmarlo.");
    if (!confirmar) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/pedidos/confirmar/${ordenId}`, {
        method: "POST",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "No se pudo confirmar el pedido.");
      }

      alert("¡Tu pedido fue enviado a cocina!");
      if (mesaId && usuarioId) fetchOrdersFromDB(mesaId, usuarioId);
    } catch (error: any) {
      alert(error.message || "Ocurrió un error al confirmar el pedido.");
    }
  };

  // FIX (sin cambios de lógica): sigue llevando al checkout, que es donde
  // se pedirá la dirección y se mostrará el total real antes de pagar.
  const handleConfirmarDomicilio = () => {
    if (!deliveryOrders.length) return;
    const ordenPendiente = deliveryOrders.find((o: any) => o.estatus === "pendiente") || deliveryOrders[0];
    router.push(`/menu/pedido/checkout?orderId=${ordenPendiente.id}`);
  };

  const handleClearMesaCache = () => {
    localStorage.removeItem("num_mesa");
    setMesaId(null);
    setDbOrders([]);
    router.push("/menu");
  };

  const esCancelable = (tiempoAperturaStr: string) => {
    if (!tiempoAperturaStr) return false;
    const tiempoApertura = new Date(tiempoAperturaStr);
    const diferenciaMs = currentTime.getTime() - tiempoApertura.getTime();
    return diferenciaMs < 2 * 60 * 1000;
  };

  const getEstatusDeliveryEstilo = (estatus: string) => {
    switch (estatus) {
      case "pendiente": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "preparando": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "en_camino": return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      case "entregado": return "bg-green-500/10 text-green-400 border-green-500/20";
      default: return "bg-zinc-500/10 text-text/40 border-border";
    }
  };

  // FIX (nuevo): separamos el carrito de mesa (aún editable) de las
  // comandas que ya se mandaron a cocina, ambos vienen en dbOrders.
  const carritoMesa = dbOrders.find((o: any) => o.estatus === "pendiente");
  const comandasEnviadas = dbOrders.filter((o: any) => o.estatus !== "pendiente");

  return (
    <div className="bg-background min-h-screen text-text pb-12">
      <div className="container mx-auto px-4 max-w-xl pt-32">

        {/* CABECERA DINÁMICA SEGÚN LA PESTAÑA */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <ShoppingBag className="text-brand" size={24} /> Mis Pedidos
            </h1>
            {activeTab === "mesa" && mesaId && (
              <p className="text-xs text-brand font-medium mt-1 uppercase tracking-wider">
                Consumiendo en la Mesa: #{mesaId}
              </p>
            )}
            {activeTab === "domicilio" && (
              <p className="text-xs text-text-sec mt-1">
                Estos son los productos que llevas hasta ahora. Aún no se ha confirmado el pedido.
              </p>
            )}
          </div>
          {activeTab === "mesa" && mesaId && (
            <button
              onClick={handleClearMesaCache}
              className="text-xs font-semibold bg-surface-hover px-3 py-1.5 rounded-xl border border-border text-text/60 hover:text-brand transition-colors self-start sm:self-center"
            >
              Liberar Mesa
            </button>
          )}
        </div>

        {/* CONTROLLER TOGGLE INTERACTIVO (TABS) */}
        <div className="grid grid-cols-2 bg-surface p-1 rounded-2xl border border-border mb-6">
          <button
            onClick={() => setActiveTab("mesa")}
            className={`py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
              activeTab === "mesa"
                ? "bg-brand text-white shadow-sm"
                : "text-text-sec hover:text-text"
            }`}
          >
            Pedidos en Mesa
          </button>
          <button
            onClick={() => setActiveTab("domicilio")}
            className={`py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === "domicilio"
                ? "bg-brand text-white shadow-sm"
                : "text-text-sec hover:text-text"
            }`}
          >
            <Truck size={14} /> Envíos a Domicilio
          </button>
        </div>

        {/* ─── VISTA 1: MESA (carrito pendiente + comandas ya enviadas) ─── */}
        {activeTab === "mesa" && (
          <>
            {(carritoMesa || comandasEnviadas.length > 0) ? (
              <div className="space-y-6">
                <div className="bg-brand/5 border border-brand/20 p-4 rounded-2xl flex items-center justify-between">
                  <span className="text-xs font-bold text-brand uppercase tracking-wider">Tu mesa</span>
                  <button onClick={() => mesaId && usuarioId && fetchOrdersFromDB(mesaId, usuarioId)} className="text-brand p-1">
                    <RefreshCw size={14} className={loadingDb ? "animate-spin" : ""} />
                  </button>
                </div>

                {/* CARRITO PENDIENTE: aún se puede editar, todavía no está en cocina */}
                {carritoMesa && (
                  <>
                    <div className="bg-surface border border-border rounded-2xl p-4 shadow-sm space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b border-border/50">
                        <span className="text-xs font-bold text-text/60 uppercase tracking-wider">Productos por confirmar</span>
                        <span className="text-xs px-2.5 py-1 rounded-full border font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border-amber-500/20">
                          pendiente
                        </span>
                      </div>

                      <div className="space-y-2">
                        {carritoMesa.ordenItems?.map((item: any) => (
                          <div key={item.id} className="flex gap-3 items-center bg-background/40 p-2 rounded-xl border border-border/40">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-surface">
                              {item.platillo?.imagenUrl ? (
                                <CldImage src={item.platillo.imagenUrl} fill alt="Platillo" className="object-cover" sizes="48px" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] text-text/30">S/I</div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold truncate text-text">{item.platillo?.nombre}</h4>
                              <p className="text-xs text-text-sec">{item.cantidad} u. × ${parseFloat(item.precioUnitario).toFixed(2)}</p>
                            </div>
                            <button
                              onClick={() => handleDescartarItem(item.id, "mesa")}
                              title="Quitar producto"
                              className="text-red-400 hover:text-red-500 p-1.5 rounded-lg transition-colors"
                            >
                              <XCircle size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* BOTÓN CONFIRMAR: fuera del contenedor de productos */}
                    <button
                      onClick={() => handleConfirmarMesa(carritoMesa.id)}
                      className="w-full bg-brand hover:bg-brand/90 text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-xs"
                    >
                      <Send size={16} />
                      Confirmar y Enviar a Cocina
                    </button>
                  </>
                )}

                {/* COMANDAS YA ENVIADAS A COCINA: mismo diseño que ya tenías */}
                {comandasEnviadas.map((orden: any) => {
                  const cancelable = esCancelable(orden.tiempoApertura) && orden.estatus === "abierta";

                  return (
                    <div key={orden.id} className="bg-surface rounded-2xl border border-border p-4 shadow-sm space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b border-border/50">
                        <div>
                          <span className="text-[11px] text-text/40 block font-mono">Ref: {orden.id.slice(0, 8).toUpperCase()}</span>
                          <span className="text-xs font-semibold text-text-sec">Estado:</span>
                        </div>
                        <span className={`text-xs uppercase font-bold tracking-widest px-3 py-1 rounded-full bg-brand/10 text-brand`}>
                          {orden.estatus}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {orden.ordenItems?.map((item: any) => (
                          <div key={item.id} className="flex gap-3 items-center bg-background/40 p-2 rounded-xl border border-border/40">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-surface">
                              {item.platillo?.imagenUrl ? (
                                <CldImage src={item.platillo.imagenUrl} fill alt="Platillo" className="object-cover" sizes="48px" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] text-text/30">S/I</div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold truncate text-text">{item.platillo?.nombre}</h4>
                              <p className="text-xs text-text-sec">{item.cantidad} u. × ${parseFloat(item.precioUnitario).toFixed(2)}</p>
                            </div>
                            <span className="text-sm font-bold text-text/80">${(item.cantidad * parseFloat(item.precioUnitario)).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-border/50 flex justify-between items-center">
                        <div className="text-sm">
                          <span className="text-text/50">Total Comanda: </span>
                          <span className="font-extrabold text-brand text-base">${parseFloat(orden.total).toFixed(2)}</span>
                        </div>

                        {orden.estatus !== "cancelada" && (
                          <button
                            onClick={() => handleCancelarOrden(orden.id)}
                            disabled={!cancelable}
                            className={`py-2 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 border ${
                              cancelable ? "bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20" : "bg-surface-hover border-border text-text/20 cursor-not-allowed"
                            }`}
                          >
                            <XCircle size={14} />
                            {cancelable ? "Cancelar" : "En preparación"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-surface p-8 border border-border rounded-2xl text-center space-y-4">
                <p className="text-text/60 text-sm">No hay registros de comandas activas desde esta mesa.</p>
                <Link href="/menu" className="bg-brand text-white text-xs font-bold px-4 py-3 rounded-xl inline-block uppercase tracking-wider">Ordenar algo ahora</Link>
              </div>
            )}
          </>
        )}

        {/* ─── VISTA 2: ENVIOS A DOMICILIO ─── */}
        {activeTab === "domicilio" && (
          <div className="space-y-4">
            <div className="bg-surface border border-border p-4 rounded-2xl flex items-center justify-between shadow-sm">
              <span className="text-xs font-bold text-text/60 uppercase tracking-wider">Tus productos</span>
              <button onClick={() => usuarioId && fetchDeliveryOrders(usuarioId)} className="text-text/60 p-1">
                <RefreshCw size={14} className={loadingDelivery ? "animate-spin" : ""} />
              </button>
            </div>

            {deliveryOrders.length > 0 ? (
              <>
                {deliveryOrders.map((pedido: any) => (
                  <div key={pedido.id} className="bg-surface border border-border rounded-2xl p-4 shadow-sm space-y-4">

                    <div className="flex justify-between items-center pb-3 border-b border-border/50">
                      <div>
                        <span className="text-xs font-bold text-text/40 block">PEDIDO #{pedido.id.toString().slice(0,8).toUpperCase()}</span>
                        <span className="text-xs text-text-sec flex items-center gap-1 mt-0.5">
                          <Clock size={12} /> {new Date(pedido.creadoEn).toLocaleDateString()}
                        </span>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-bold uppercase tracking-wider ${getEstatusDeliveryEstilo(pedido.estatus)}`}>
                        {pedido.estatus}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {pedido.items?.map((item: any) => (
                        <div key={item.id} className="flex gap-3 items-center bg-background/40 p-2 rounded-xl border border-border/40">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold truncate text-text">{item.nombre || "Platillo"}</h4>
                            <p className="text-xs text-text-sec">
                              {item.cantidad || 1} u. × ${parseFloat(item.precio || item.precioUnitario).toFixed(2)}
                            </p>
                          </div>
                          {pedido.estatus === "pendiente" && (
                            <button
                              onClick={() => handleDescartarItem(item.id, "domicilio")}
                              title="Quitar producto"
                              className="text-red-400 hover:text-red-500 p-1.5 rounded-lg transition-colors"
                            >
                              <XCircle size={18} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <button
                  onClick={handleConfirmarDomicilio}
                  className="w-full bg-brand hover:bg-brand/90 text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-xs"
                >
                  <Send size={16} />
                  Confirmar
                </button>
              </>
            ) : (
              <div className="bg-surface p-8 border border-border rounded-2xl text-center space-y-4">
                <p className="text-text/60 text-sm">No cuentas con productos agregados para reparto a domicilio.</p>
                <Link href="/menu" className="bg-brand text-white text-xs font-bold px-4 py-3 rounded-xl inline-block uppercase tracking-wider">Ir a comprar al Menú</Link>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
