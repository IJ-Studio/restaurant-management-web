"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Check, MapPin, FileText, CreditCard, ShoppingBag, Loader2 } from "lucide-react";

// Se crea UNA sola vez fuera del componente — evita recrear el objeto
// Stripe en cada render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

const RFC_REGEX = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/i;
const CP_REGEX = /^\d{5}$/;

// Catálogos simplificados. El catálogo oficial del SAT tiene muchas más
// opciones — agrega las que tu negocio necesite.
const USOS_CFDI = [
  { value: "G01", label: "G01 - Adquisición de mercancías" },
  { value: "G03", label: "G03 - Gastos en general" },
  { value: "P01", label: "P01 - Por definir" },
];

const REGIMENES_FISCALES = [
  { value: "601", label: "601 - General de Ley Personas Morales" },
  { value: "603", label: "603 - Personas Morales con Fines no Lucrativos" },
  { value: "605", label: "605 - Sueldos y Salarios" },
  { value: "606", label: "606 - Arrendamiento" },
  { value: "612", label: "612 - Personas Físicas con Actividades Empresariales" },
  { value: "616", label: "616 - Sin obligaciones fiscales" },
  { value: "621", label: "621 - Incorporación Fiscal" },
  { value: "626", label: "626 - Régimen Simplificado de Confianza" },
];

const PASOS = [
  { numero: 1, icono: ShoppingBag },
  { numero: 2, icono: MapPin },
  { numero: 3, icono: FileText },
  { numero: 4, icono: CreditCard },
  { numero: 5, icono: Check },
];

export default function CheckoutPage() {
  return (
    <Elements stripe={stripePromise} options={{ locale: "es" }}>
      <CheckoutWizard />
    </Elements>
  );
}

function CheckoutWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams?.get("orderId");
  const stripe = useStripe();
  const elements = useElements();

  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [pasoActual, setPasoActual] = useState(1);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [orden, setOrden] = useState<any>(null);

  // Paso 2: dirección
  const [direcciones, setDirecciones] = useState<any[]>([]);
  const [direccionSeleccionadaId, setDireccionSeleccionadaId] = useState<number | "nueva" | null>(null);
  const [nuevaDireccion, setNuevaDireccion] = useState({
    alias: "Casa",
    linea1: "",
    linea2: "",
    colonia: "",
    ciudad: "",
    estado: "",
    codigoPostal: "",
    referencias: "",
  });
  const [guardarDireccion, setGuardarDireccion] = useState(true);

  // Paso 3: facturación
  const [requiereFactura, setRequiereFactura] = useState(false);
  const [datosFiscales, setDatosFiscales] = useState({
    rfc: "",
    razonSocial: "",
    usoCfdi: "G03",
    regimenFiscal: "",
    codigoPostalFiscal: "",
    email: "",
  });

  // Paso 4: pago
  const [metodosGuardados, setMetodosGuardados] = useState<any[]>([]);
  const [metodoSeleccionadoId, setMetodoSeleccionadoId] = useState<string | "nueva" | null>(null);
  const [guardarTarjeta, setGuardarTarjeta] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Carga inicial: usuario, orden, direcciones guardadas, métodos de pago guardados
  useEffect(() => {
    if (!orderId) {
      setError("Falta el identificador del pedido.");
      setLoading(false);
      return;
    }

    const cargar = async () => {
      try {
        const resUser = await fetch("/api/auth/me");
        if (!resUser.ok) {
          router.push(
            `/login?callbackUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`,
          );
          return;
        }
        const sessionData = await resUser.json();
        const activeUser = sessionData?.user || sessionData;
        if (!activeUser?.id) {
          router.push("/login");
          return;
        }
        setUsuarioId(activeUser.id);

        const resOrdenes = await fetch(
          `${apiUrl}/pedidos/usuario?usuarioId=${activeUser.id}&tipo=domicilio`,
        );
        if (resOrdenes.ok) {
          const ordenesData = await resOrdenes.json();
          const ordenEncontrada = ordenesData.find((o: any) => o.id === orderId);
          if (!ordenEncontrada) {
            setError("No se encontró el pedido. Regresa a Mis Pedidos e intenta de nuevo.");
          } else {
            setOrden(ordenEncontrada);
          }
        }

        const resDirecciones = await fetch(`${apiUrl}/direcciones?usuarioId=${activeUser.id}`);
        if (resDirecciones.ok) {
          const data = await resDirecciones.json();
          setDirecciones(data);
          const principal = data.find((d: any) => d.esPrincipal);
          if (principal) setDireccionSeleccionadaId(principal.id);
          else if (data.length === 0) setDireccionSeleccionadaId("nueva");
        }

        const resMetodos = await fetch(`${apiUrl}/metodos-pago?usuarioId=${activeUser.id}`);
        if (resMetodos.ok) {
          const data = await resMetodos.json();
          setMetodosGuardados(data);
          const principalMetodo = data.find((m: any) => m.esPrincipal);
          if (principalMetodo) setMetodoSeleccionadoId(principalMetodo.id);
          else if (data.length === 0) setMetodoSeleccionadoId("nueva");
        }
      } catch (e) {
        console.error("Error al cargar datos de checkout:", e);
        setError("Ocurrió un error al cargar tu información. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [orderId]);

  const irAtras = () => setPasoActual((p) => Math.max(p - 1, 1));

  // ── VALIDACIONES POR PASO ──────────────────────────────────────

  const validarPaso2 = (): string | null => {
    if (direccionSeleccionadaId === "nueva") {
      if (!nuevaDireccion.linea1.trim()) return "La calle y número son requeridos.";
      if (!nuevaDireccion.colonia.trim()) return "La colonia es requerida.";
      if (!nuevaDireccion.ciudad.trim()) return "La ciudad es requerida.";
      if (!nuevaDireccion.estado.trim()) return "El estado es requerido.";
      if (!CP_REGEX.test(nuevaDireccion.codigoPostal)) return "El código postal debe tener 5 dígitos.";
    } else if (!direccionSeleccionadaId) {
      return "Selecciona o agrega una dirección de envío.";
    }
    return null;
  };

  const validarPaso3 = (): string | null => {
    if (!requiereFactura) return null;
    if (!RFC_REGEX.test(datosFiscales.rfc)) return "El RFC no tiene un formato válido.";
    if (!datosFiscales.razonSocial.trim()) return "La razón social es requerida.";
    if (!datosFiscales.regimenFiscal) return "Selecciona un régimen fiscal.";
    if (!CP_REGEX.test(datosFiscales.codigoPostalFiscal))
      return "El código postal fiscal debe tener 5 dígitos.";
    return null;
  };

  const validarPaso4 = (): string | null => {
    if (metodoSeleccionadoId === "nueva") {
      if (!elements?.getElement(CardElement)) return "Ingresa los datos de tu tarjeta.";
    } else if (!metodoSeleccionadoId) {
      return "Selecciona o agrega un método de pago.";
    }
    return null;
  };

  const manejarSiguiente = async () => {
    setError(null);

    if (pasoActual === 2) {
      const err = validarPaso2();
      if (err) return setError(err);

      if (direccionSeleccionadaId === "nueva" && guardarDireccion) {
        setProcesando(true);
        try {
          const res = await fetch(`${apiUrl}/direcciones`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usuarioId: Number(usuarioId), ...nuevaDireccion }),
          });
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.message || "No se pudo guardar la dirección.");
          }
          const guardada = await res.json();
          setDirecciones((prev) => [...prev, guardada]);
          setDireccionSeleccionadaId(guardada.id);
        } catch (e: any) {
          setError(e.message);
          setProcesando(false);
          return;
        }
        setProcesando(false);
      }
    }

    if (pasoActual === 3) {
      const err = validarPaso3();
      if (err) return setError(err);
    }

    if (pasoActual === 4) {
      const err = validarPaso4();
      if (err) return setError(err);

      if (metodoSeleccionadoId === "nueva" && guardarTarjeta) {
        setProcesando(true);
        try {
          const resSetup = await fetch(`${apiUrl}/metodos-pago/setup-intent`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usuarioId: Number(usuarioId) }),
          });
          if (!resSetup.ok) throw new Error("No se pudo iniciar el guardado de la tarjeta.");
          const { clientSecret } = await resSetup.json();

          const result = await stripe!.confirmCardSetup(clientSecret, {
            payment_method: { card: elements!.getElement(CardElement)! },
          });

          if (result.error) throw new Error(result.error.message || "No se pudo validar la tarjeta.");

          const resGuardar = await fetch(`${apiUrl}/metodos-pago`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              usuarioId: Number(usuarioId),
              paymentMethodId: result.setupIntent!.payment_method,
            }),
          });
          if (!resGuardar.ok) throw new Error("No se pudo guardar el método de pago.");
          const nuevoMetodo = await resGuardar.json();
          setMetodosGuardados((prev) => [...prev, nuevoMetodo]);
          setMetodoSeleccionadoId(nuevoMetodo.id);
        } catch (e: any) {
          setError(e.message);
          setProcesando(false);
          return;
        }
        setProcesando(false);
      }
    }

    setPasoActual((p) => Math.min(p + 1, 5));
  };

  const manejarPagar = async () => {
    setError(null);
    setProcesando(true);

    try {
      const body: any = { usuarioId: Number(usuarioId), ordenId: orden.id };

      if (typeof direccionSeleccionadaId === "number") {
        body.direccionId = direccionSeleccionadaId;
      }
      if (metodoSeleccionadoId !== "nueva") {
        body.metodoPagoGuardadoId = metodoSeleccionadoId;
      }

      const resIntento = await fetch(`${apiUrl}/pagos/crear-intento`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!resIntento.ok) {
        const errData = await resIntento.json().catch(() => ({}));
        throw new Error(errData.message || "No se pudo iniciar el pago.");
      }

      const { clientSecret, status } = await resIntento.json();

      // Si el backend ya confirmó el pago (tarjeta guardada, off_session),
      // no hace falta volver a llamar a Stripe desde el navegador.
      if (status !== "succeeded") {
        const confirmOptions =
          metodoSeleccionadoId === "nueva"
            ? { payment_method: { card: elements!.getElement(CardElement)! } }
            : undefined;

        const result = await stripe!.confirmCardPayment(clientSecret, confirmOptions as any);

        if (result.error) {
          throw new Error(result.error.message || "El pago fue rechazado.");
        }
      }

      if (requiereFactura) {
        await fetch(`${apiUrl}/facturas`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ usuarioId: Number(usuarioId), ordenId: orden.id, ...datosFiscales }),
        }).catch((e) => console.error("Error al generar factura:", e));
      }

      router.push(`/menu/pedido/checkout/exito?ordenId=${orden.id}`);
    } catch (e: any) {
      setError(e.message || "Ocurrió un error al procesar tu pago.");
    } finally {
      setProcesando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <Loader2 className="animate-spin text-brand" size={32} />
      </div>
    );
  }

  if (error && !orden) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 pt-24 px-4 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pb-20 pt-32">
      <div className="container mx-auto px-4 max-w-xl">
        <div className="flex items-center justify-between mb-8">
          {PASOS.map((p, i) => (
            <div key={p.numero} className="flex items-center flex-1">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  pasoActual >= p.numero
                    ? "bg-brand text-white"
                    : "bg-surface-hover text-text/40 border border-border"
                }`}
              >
                {pasoActual > p.numero ? <Check size={16} /> : p.numero}
              </div>
              {i < PASOS.length - 1 && (
                <div className={`h-0.5 flex-1 mx-1 ${pasoActual > p.numero ? "bg-brand" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
          {pasoActual === 1 && <PasoResumen orden={orden} />}
          {pasoActual === 2 && (
            <PasoDireccion
              direcciones={direcciones}
              seleccionadaId={direccionSeleccionadaId}
              onSeleccionar={setDireccionSeleccionadaId}
              nuevaDireccion={nuevaDireccion}
              onCambiarNuevaDireccion={setNuevaDireccion}
              guardar={guardarDireccion}
              onCambiarGuardar={setGuardarDireccion}
            />
          )}
          {pasoActual === 3 && (
            <PasoFacturacion
              requiereFactura={requiereFactura}
              onCambiarRequiere={setRequiereFactura}
              datos={datosFiscales}
              onCambiarDatos={setDatosFiscales}
            />
          )}
          {pasoActual === 4 && (
            <PasoPago
              metodos={metodosGuardados}
              seleccionadoId={metodoSeleccionadoId}
              onSeleccionar={setMetodoSeleccionadoId}
              guardarTarjeta={guardarTarjeta}
              onCambiarGuardarTarjeta={setGuardarTarjeta}
            />
          )}
          {pasoActual === 5 && (
            <PasoConfirmar
              orden={orden}
              direccion={
                direccionSeleccionadaId === "nueva"
                  ? nuevaDireccion
                  : direcciones.find((d) => d.id === direccionSeleccionadaId)
              }
              requiereFactura={requiereFactura}
              datosFiscales={datosFiscales}
              metodo={
                metodoSeleccionadoId === "nueva"
                  ? { marca: "tarjeta nueva", ultimos4: "" }
                  : metodosGuardados.find((m) => m.id === metodoSeleccionadoId)
              }
            />
          )}

          {error && (
            <p className="text-red-500 text-xs bg-red-500/10 border border-red-500/20 rounded-xl p-3 mt-4">
              {error}
            </p>
          )}

          <div className="flex gap-3 mt-6">
            {pasoActual > 1 && (
              <button
                onClick={irAtras}
                disabled={procesando}
                className="flex-1 py-3 bg-surface-hover border border-border text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-surface-hover/80 transition-all disabled:opacity-50"
              >
                Atrás
              </button>
            )}

            {pasoActual < 5 ? (
              <button
                onClick={manejarSiguiente}
                disabled={procesando}
                className="flex-1 py-3 bg-brand text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-brand/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {procesando ? <Loader2 size={14} className="animate-spin" /> : "Continuar"}
              </button>
            ) : (
              <button
                onClick={manejarPagar}
                disabled={procesando}
                className="flex-1 py-3 bg-brand text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-brand/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {procesando ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  `Pagar $${orden ? parseFloat(orden.total).toFixed(2) : ""}`
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── COMPONENTES DE CADA PASO ──────────────────────────────────────

function PasoResumen({ orden }: { orden: any }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-text">Resumen de tu pedido</h2>
      <div className="space-y-2">
        {orden?.items?.map((item: any) => (
          <div
            key={item.id}
            className="flex justify-between items-center bg-background/40 p-3 rounded-xl border border-border/40"
          >
            <p className="text-sm font-semibold text-text">
              {item.cantidad}x {item.nombre}
            </p>
            <span className="text-sm font-bold text-text/80">
              ${(item.cantidad * parseFloat(item.precio || item.precioUnitario)).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      <div className="pt-3 border-t border-border/50 flex justify-between items-center">
        <span className="text-sm text-text-sec">Total</span>
        <span className="text-xl font-black text-brand">
          ${orden ? parseFloat(orden.total).toFixed(2) : "0.00"}
        </span>
      </div>
    </div>
  );
}

function PasoDireccion({
  direcciones,
  seleccionadaId,
  onSeleccionar,
  nuevaDireccion,
  onCambiarNuevaDireccion,
  guardar,
  onCambiarGuardar,
}: any) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-text">¿A dónde enviamos tu pedido?</h2>

      {direcciones.length > 0 && (
        <div className="space-y-2">
          {direcciones.map((d: any) => (
            <button
              key={d.id}
              onClick={() => onSeleccionar(d.id)}
              className={`w-full text-left p-3 rounded-xl border transition-all ${
                seleccionadaId === d.id ? "border-brand bg-brand/5" : "border-border bg-background/40"
              }`}
            >
              <p className="text-sm font-bold text-text">{d.alias}</p>
              <p className="text-xs text-text-sec">
                {d.linea1}, {d.colonia}, {d.ciudad}, {d.estado} — CP {d.codigoPostal}
              </p>
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => onSeleccionar("nueva")}
        className={`w-full text-left p-3 rounded-xl border transition-all text-sm font-bold ${
          seleccionadaId === "nueva"
            ? "border-brand bg-brand/5 text-brand"
            : "border-border bg-background/40 text-text-sec"
        }`}
      >
        + Agregar nueva dirección
      </button>

      {seleccionadaId === "nueva" && (
        <div className="space-y-3 pt-2">
          <input
            placeholder="Alias (ej. Casa, Oficina)"
            value={nuevaDireccion.alias}
            onChange={(e) => onCambiarNuevaDireccion({ ...nuevaDireccion, alias: e.target.value })}
            className="w-full p-3 rounded-xl border border-border bg-background text-sm"
          />
          <input
            placeholder="Calle y número"
            value={nuevaDireccion.linea1}
            onChange={(e) => onCambiarNuevaDireccion({ ...nuevaDireccion, linea1: e.target.value })}
            className="w-full p-3 rounded-xl border border-border bg-background text-sm"
          />
          <input
            placeholder="Colonia"
            value={nuevaDireccion.colonia}
            onChange={(e) => onCambiarNuevaDireccion({ ...nuevaDireccion, colonia: e.target.value })}
            className="w-full p-3 rounded-xl border border-border bg-background text-sm"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Ciudad"
              value={nuevaDireccion.ciudad}
              onChange={(e) => onCambiarNuevaDireccion({ ...nuevaDireccion, ciudad: e.target.value })}
              className="w-full p-3 rounded-xl border border-border bg-background text-sm"
            />
            <input
              placeholder="Estado"
              value={nuevaDireccion.estado}
              onChange={(e) => onCambiarNuevaDireccion({ ...nuevaDireccion, estado: e.target.value })}
              className="w-full p-3 rounded-xl border border-border bg-background text-sm"
            />
          </div>
          <input
            placeholder="Código postal (5 dígitos)"
            maxLength={5}
            value={nuevaDireccion.codigoPostal}
            onChange={(e) =>
              onCambiarNuevaDireccion({ ...nuevaDireccion, codigoPostal: e.target.value.replace(/\D/g, "") })
            }
            className="w-full p-3 rounded-xl border border-border bg-background text-sm"
          />
          <input
            placeholder="Referencias (opcional)"
            value={nuevaDireccion.referencias}
            onChange={(e) => onCambiarNuevaDireccion({ ...nuevaDireccion, referencias: e.target.value })}
            className="w-full p-3 rounded-xl border border-border bg-background text-sm"
          />
          <label className="flex items-center gap-2 text-xs text-text-sec">
            <input type="checkbox" checked={guardar} onChange={(e) => onCambiarGuardar(e.target.checked)} />
            Guardar esta dirección para futuras compras
          </label>
        </div>
      )}
    </div>
  );
}

function PasoFacturacion({ requiereFactura, onCambiarRequiere, datos, onCambiarDatos }: any) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-text">Facturación</h2>

      <label className="flex items-center gap-2 text-sm font-semibold text-text">
        <input type="checkbox" checked={requiereFactura} onChange={(e) => onCambiarRequiere(e.target.checked)} />
        Requiero factura de esta compra
      </label>

      {requiereFactura && (
        <div className="space-y-3 pt-2">
          <input
            placeholder="RFC"
            value={datos.rfc}
            onChange={(e) => onCambiarDatos({ ...datos, rfc: e.target.value.toUpperCase() })}
            className="w-full p-3 rounded-xl border border-border bg-background text-sm uppercase"
          />
          <input
            placeholder="Razón social"
            value={datos.razonSocial}
            onChange={(e) => onCambiarDatos({ ...datos, razonSocial: e.target.value })}
            className="w-full p-3 rounded-xl border border-border bg-background text-sm"
          />
          <select
            value={datos.usoCfdi}
            onChange={(e) => onCambiarDatos({ ...datos, usoCfdi: e.target.value })}
            className="w-full p-3 rounded-xl border border-border bg-background text-sm"
          >
            {USOS_CFDI.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
          <select
            value={datos.regimenFiscal}
            onChange={(e) => onCambiarDatos({ ...datos, regimenFiscal: e.target.value })}
            className="w-full p-3 rounded-xl border border-border bg-background text-sm"
          >
            <option value="">Selecciona tu régimen fiscal</option>
            {REGIMENES_FISCALES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <input
            placeholder="Código postal fiscal (5 dígitos)"
            maxLength={5}
            value={datos.codigoPostalFiscal}
            onChange={(e) =>
              onCambiarDatos({ ...datos, codigoPostalFiscal: e.target.value.replace(/\D/g, "") })
            }
            className="w-full p-3 rounded-xl border border-border bg-background text-sm"
          />
          <input
            placeholder="Correo para enviarte la factura (opcional)"
            value={datos.email}
            onChange={(e) => onCambiarDatos({ ...datos, email: e.target.value })}
            className="w-full p-3 rounded-xl border border-border bg-background text-sm"
          />
        </div>
      )}
    </div>
  );
}

function PasoPago({ metodos, seleccionadoId, onSeleccionar, guardarTarjeta, onCambiarGuardarTarjeta }: any) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-text">Método de pago</h2>

      {metodos.length > 0 && (
        <div className="space-y-2">
          {metodos.map((m: any) => (
            <button
              key={m.id}
              onClick={() => onSeleccionar(m.id)}
              className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 ${
                seleccionadoId === m.id ? "border-brand bg-brand/5" : "border-border bg-background/40"
              }`}
            >
              <CreditCard size={18} className="text-text-sec" />
              <span className="text-sm font-semibold text-text capitalize">
                {m.marca} •••• {m.ultimos4}
              </span>
              <span className="text-xs text-text-sec ml-auto">
                {m.mesExpiracion}/{m.anioExpiracion}
              </span>
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => onSeleccionar("nueva")}
        className={`w-full text-left p-3 rounded-xl border transition-all text-sm font-bold ${
          seleccionadoId === "nueva"
            ? "border-brand bg-brand/5 text-brand"
            : "border-border bg-background/40 text-text-sec"
        }`}
      >
        + Usar una tarjeta nueva
      </button>

      {seleccionadoId === "nueva" && (
        <div className="space-y-3 pt-2">
          {/* CardElement vive dentro de un iframe de Stripe: tu código
              nunca ve el número real ni el CVC que el usuario escribe aquí. */}
          <div className="p-3 rounded-xl border border-border bg-background">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "14px",
                    color: "#1a1a1a",
                    "::placeholder": { color: "#9ca3af" },
                  },
                },
              }}
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-text-sec">
            <input
              type="checkbox"
              checked={guardarTarjeta}
              onChange={(e) => onCambiarGuardarTarjeta(e.target.checked)}
            />
            Guardar esta tarjeta para futuras compras
          </label>
        </div>
      )}
    </div>
  );
}

function PasoConfirmar({ orden, direccion, requiereFactura, datosFiscales, metodo }: any) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-text">Confirma tu pedido</h2>

      <div className="space-y-3 text-sm">
        <div className="flex items-start gap-2">
          <MapPin size={16} className="text-brand shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-text">Enviar a:</p>
            <p className="text-text-sec text-xs">
              {direccion?.linea1}, {direccion?.colonia}, {direccion?.ciudad}, {direccion?.estado} — CP{" "}
              {direccion?.codigoPostal}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <FileText size={16} className="text-brand shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-text">Factura:</p>
            <p className="text-text-sec text-xs">
              {requiereFactura ? `Sí — RFC ${datosFiscales.rfc}` : "No requerida"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <CreditCard size={16} className="text-brand shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-text">Pago con:</p>
            <p className="text-text-sec text-xs capitalize">
              {metodo?.marca} {metodo?.ultimos4 ? `•••• ${metodo.ultimos4}` : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-border/50 flex justify-between items-center">
        <span className="text-sm text-text-sec">Total a pagar</span>
        <span className="text-xl font-black text-brand">
          ${orden ? parseFloat(orden.total).toFixed(2) : "0.00"}
        </span>
      </div>
    </div>
  );
}
