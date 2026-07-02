"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { ShoppingBag, FileText, ArrowRight, LogIn, Trash2 } from "lucide-react";
import Link from "next/link";

interface CartItem {
  platilloId: number;
  name: string;
  cantidad: number;
  precioUnitario: number;
}

export default function ResumenPedidoPage() {
  const router = useRouter();

  // 1. Verificar si el usuario está autenticado mediante Redux (Dato real, no mock)
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Estados de la vista
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notas, setNotas] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mesaId, setMesaId] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Cargar carrito y detectar si proviene de un código QR de mesa
  useEffect(() => {
    // Recuperar el carrito real del localStorage
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    // Detectar si hay una sesión de mesa activa escaneada por QR
    const savedMesa = localStorage.getItem("mesa_id") || document.cookie.split("; ").find(row => row.startsWith("mesa_id="))?.split("=")[1];
    if (savedMesa) {
      setMesaId(savedMesa);
    }
  }, []);

  // Calcular el total de la orden
  const totalOrden = cart.reduce((acc, item) => acc + (item.cantidad * item.precioUnitario), 0);

  // Eliminar un artículo de la lista de manera limpia
  const handleRemoveItem = (id: number) => {
    const updatedCart = cart.filter(item => item.platilloId !== id);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  // Procesar la orden con las 3 reglas de negocio solicitadas
  const handleConfirmarPedido = async () => {
    if (cart.length === 0) return;

    // Regla 2: Si es un pedido de mesa (QR detectado), se procesa directamente sin importar login
    // Regla 1: Si el usuario está logueado, también pasa directo independientemente de si es mesa o delivery
    if (isAuthenticated || mesaId) {
      setIsSubmitting(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        const payload = {
          productos: cart,
          notasEspeciales: notas,
          tipoPedido: mesaId ? "mesa" : "domicilio",
          mesaId: mesaId || null
        };

        const res = await fetch(`${apiUrl}/menu/order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Error al enviar el pedido");

        const data = await res.json();

        if (data.success) {
          // Limpiar el carrito de manera exitosa
          localStorage.removeItem("cart");
          setCart([]);
          // Redirigir a una pantalla limpia de éxito con su folio real de la BD
          router.push(`/menu/pedido/exito?orderId=${data.orderId}`);
        }
      } catch (error) {
        console.error("Error al procesar pedido:", error);
        alert("Hubo un problema de conexión al enviar el pedido a la cocina.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Regla 3: No está logueado y NO es pedido de mesa (Es delivery/recoger sin cuenta) -> Lanzar cuadro de login
    setShowAuthModal(true);
  };

  return (
    <div className="bg-background min-h-screen text-text pb-12">
      <div className="container mx-auto px-4 max-w-xl pt-32">

        {/* Título limpio de sección */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ShoppingBag className="text-brand" size={24} /> Resumen de tu Pedido
          </h1>
          {mesaId && (
            <p className="text-xs text-brand font-medium mt-1 uppercase tracking-wider">
              Pedido vinculado automáticamente a la Mesa: #{mesaId} (Vía QR)
            </p>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="bg-surface p-8 border border-border rounded-2xl text-center space-y-4">
            <p className="text-text/60 text-sm">Tu carrito está vacío.</p>
            <Link href="/menu" className="btn-primary inline-block text-xs uppercase tracking-wider py-3 px-6">
              Ver el menú
            </Link>
          </div>
        ) : (
          <div className="space-y-6">

            {/* 1. ARTÍCULOS AÑADIDOS */}
            <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
              <div className="p-4 bg-surface-hover/30 border-b border-border">
                <h2 className="text-xs font-bold uppercase tracking-wider text-text/60">Artículos Añadidos</h2>
              </div>
              <div className="divide-y divide-border/60">
                {cart.map((item) => (
                  <div key={item.platilloId} className="p-4 flex justify-between items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{item.name}</h3>
                      <p className="text-xs text-text-sec mt-0.5">
                        {item.cantidad} x ${item.precioUnitario.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-sm">
                        ${(item.cantidad * item.precioUnitario).toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleRemoveItem(item.platilloId)}
                        className="text-text/40 hover:text-red-500 p-1 rounded-lg transition-colors"
                        title="Eliminar artículo"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totalizador simple */}
              <div className="p-4 bg-surface-hover/20 border-t border-border flex justify-between items-center font-bold text-base">
                <span>Total</span>
                <span className="text-brand">${totalOrden.toFixed(2)}</span>
              </div>
            </div>

            {/* 2. NOTAS ESPECIALES */}
            <div className="bg-surface rounded-2xl border border-border p-5 shadow-sm space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-text/60 flex items-center gap-1.5">
                <FileText size={14} className="text-brand" /> Notas especiales para la cocina
              </label>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Ej. Sin cebolla, aderezo a un lado, términos de carne, alérgenos..."
                rows={3}
                maxLength={250}
                className="w-full text-sm bg-background border border-border rounded-xl p-3 focus:outline-none focus:border-brand transition-colors resize-none placeholder:text-text/30"
              />
            </div>

            {/* BOTÓN DE ACCIÓN PRINCIPAL */}
            <button
              onClick={handleConfirmarPedido}
              disabled={isSubmitting}
              className="w-full bg-brand hover:bg-brand/90 text-white py-4 rounded-xl font-bold text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? "Enviando a la cocina..." : "Confirmar y Enviar Pedido"}
              {!isSubmitting && <ArrowRight size={16} />}
            </button>

          </div>
        )}
      </div>

      {/* 3. CUADRO MODAL DE LOGEO (Regla 3: No logueado y NO es pedido de mesa) */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border p-6 rounded-2xl max-w-sm w-full text-center space-y-5 shadow-2xl animate-fadeIn">
            <div className="w-12 h-12 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto">
              <LogIn size={24} />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-lg">Inicia sesión para continuar</h3>
              <p className="text-xs text-text-sec leading-relaxed">
                Para pedidos con entrega a domicilio o retiro en sucursal, requerimos validar tu identidad para resguardar la orden.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowAuthModal(false)}
                className="border border-border text-xs font-bold rounded-xl py-3 hover:bg-surface-hover transition-colors"
              >
                Modificar Pedido
              </button>
              <button
                onClick={() => router.push("/login?redirect=/menu/pedido")}
                className="bg-brand text-white text-xs font-bold rounded-xl py-3 hover:bg-brand/90 transition-all shadow"
              >
                Iniciar Sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
