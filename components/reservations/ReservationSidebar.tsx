'use client';
import { useState, useEffect } from 'react';
import { useReservationAvailability } from '@/hooks/useReservationAvailability';
import { createReservation } from '@/app/api/reservations/route';
import TableMap from './TableMap';
import { cn } from '@/lib/utils';

interface Props {
  onSuccess?: () => void;
}

export default function ReservationForm({ onSuccess }: Props) {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  const [step, setStep] = useState(1);
  const [isLogged, setIsLogged] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [selectedTableId, setSelectedTableId] = useState<number | undefined>(undefined);

  const [formData, setFormData] = useState({
    clienteNombre: '',
    clienteTelefono: '',
    clienteEmail: '',
    fecha: today,
    hora: '13:00',
    numComensales: 2,
    peticionesEspeciales: '',
    ocasion: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Detectar sesión al montar y auto-poblar los campos de contacto
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();

          if (data && data.user) {
            // Poblamos los datos del estado usando la data real recuperada del backend
            setFormData(prev => ({
              ...prev,
              clienteNombre: `${data.user.name || ''} ${data.user.lastname || ''}`.trim(),
              clienteEmail: data.user.email || '',
              clienteTelefono: data.user.phone || '', // Inyección directa del teléfono de contacto
            }));

            setIsLogged(true);
            setStep(1); // Mantiene al usuario en el paso 1 para que confirme su información
          }
        }
      } catch (err) {
        console.error("Error recuperando sesión activa:", err);
      } finally {
        setCheckingSession(false);
      }
    };

    checkUserSession();
  }, []);

  const { loading: availabilityLoading, data: availability } = useReservationAvailability(
    formData.fecha,
    formData.hora,
    formData.numComensales
  );

  const targetFechaHora = `${formData.fecha}T${formData.hora}`;

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};

    // Se validan los datos básicos independientemente de si está logueado o no, por si edita los campos auto-poblados
    if (currentStep === 1) {
      if (!formData.clienteNombre.trim()) newErrors.clienteNombre = 'El nombre es requerido';
      if (!formData.clienteTelefono.trim()) newErrors.clienteTelefono = 'El teléfono es requerido';
      if (!formData.clienteEmail.trim()) newErrors.clienteEmail = 'El correo es requerido';
      else if (!/\S+@\S+\.\S+/.test(formData.clienteEmail)) newErrors.clienteEmail = 'Email inválido';
    }

    if (currentStep === 2) {
      if (!formData.fecha) newErrors.fecha = 'Elige una fecha';
      if (!formData.hora) newErrors.hora = 'Elige un horario';
      if (formData.numComensales < 1) newErrors.numComensales = 'Mínimo 1 persona';

      const selectedDate = new Date(`${formData.fecha}T${formData.hora}`);
      if (selectedDate < new Date()) newErrors.fecha = 'Debe ser una fecha futura';
    }

    if (currentStep === 3 && !selectedTableId) {
      newErrors.mesa = 'Por favor, selecciona una mesa del mapa para continuar.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (!validateStep(step)) return;
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setSubmitting(true);
    setErrors({});

    try {
      const fechaObjeto = new Date(`${formData.fecha}T${formData.hora}:00`);
      const res = await createReservation({
        clienteNombre: formData.clienteNombre,
        clienteTelefono: formData.clienteTelefono,
        clienteEmail: formData.clienteEmail,
        fechaHora: fechaObjeto.toISOString(),
        numComensales: Number(formData.numComensales),
        mesaId: selectedTableId,
        peticionesEspeciales: formData.peticionesEspeciales,
        ocasion: formData.ocasion,
      });

      setSuccessMessage(res.mensaje || 'Reserva confirmada con éxito');
      if (onSuccess) onSuccess();
      setSelectedTableId(undefined);
      setStep(1);
    } catch (err: any) {
      setErrors({ general: err.message || 'Error al procesar la reserva' });
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="bg-surface rounded-xl border border-border p-8 text-center animate-pulse text-text-sec shadow-sm max-w-2xl mx-auto">
        Cargando preferencias de reserva...
      </div>
    );
  }

  if (successMessage) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center shadow-sm max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold shadow-md animate-bounce">✓</div>
        <div className="text-green-800 text-2xl font-black mb-2">¡Todo Listo!</div>
        <p className="text-sm text-green-700 max-w-md mx-auto">{successMessage}</p>
        <button
          onClick={() => setSuccessMessage(null)}
          className="mt-6 w-full max-w-xs bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-3 rounded-xl transition shadow-sm"
        >
          Hacer otra reservación
        </button>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl shadow-xl border border-border p-8 relative overflow-hidden max-w-2xl w-full mx-auto transition-all duration-300">

      {/* ─── BARRA PROGRESIVA ANÓNIMA ─── */}
      <div className="w-full bg-border h-1.5 absolute top-0 left-0">
        <div
          className="bg-brand h-full transition-all duration-500 ease-out"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 mt-2">

        {/* ─── PASO 1: DETALLES Y CONFIRMACIÓN DE CONTACTO ─── */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div className="text-center mb-2">
              <h2 className="text-xl font-bold text-text">
                {isLogged ? 'Confirma tus datos básicos' : 'Introduce tus datos básicos'}
              </h2>
              <p className="text-xs text-text-sec mt-1">
                {isLogged ? 'Verifica que tu información de contacto cargada sea correcta.' : 'O inicia sesión para omitir este paso.'}
              </p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-sec uppercase tracking-wider mb-1">Nombre completo</label>
              <input
                type="text"
                value={formData.clienteNombre}
                onChange={(e) => setFormData({ ...formData, clienteNombre: e.target.value })}
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-surface text-sm focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none transition"
                placeholder="Juan Pérez"
              />
              {errors.clienteNombre && <p className="text-red-500 text-xs mt-1">{errors.clienteNombre}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-sec uppercase tracking-wider mb-1">Teléfono</label>
              <input
                type="tel"
                value={formData.clienteTelefono}
                onChange={(e) => setFormData({ ...formData, clienteTelefono: e.target.value })}
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-surface text-sm focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none transition"
                placeholder="55 1234 5678"
              />
              {errors.clienteTelefono && <p className="text-red-500 text-xs mt-1">{errors.clienteTelefono}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-sec uppercase tracking-wider mb-1">Email</label>
              <input
                type="email"
                value={formData.clienteEmail}
                onChange={(e) => setFormData({ ...formData, clienteEmail: e.target.value })}
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-surface text-sm focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none transition"
                placeholder="juan.perez@email.com"
              />
              {errors.clienteEmail && <p className="text-red-500 text-xs mt-1">{errors.clienteEmail}</p>}
            </div>
            <button
              type="button"
              onClick={nextStep}
              className="w-full bg-brand text-white text-sm font-bold py-3 rounded-xl hover:bg-brand/90 transition shadow-md"
            >
              Confirmar y Continuar
            </button>
          </div>
        )}

        {/* ─── PASO 2: DETALLES DE LA RESERVA ─── */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="text-center mb-2">
              <h2 className="text-xl font-bold text-text">¿Cuándo nos visitas?</h2>
              {isLogged && <p className="text-xs text-brand font-medium mt-1">Hola {formData.clienteNombre}, continuemos con tu reserva.</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-sec uppercase tracking-wider mb-1">Fecha</label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  min={today}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-surface text-sm focus:ring-2 focus:ring-brand/30 outline-none transition"
                />
                {errors.fecha && <p className="text-red-500 text-xs mt-1">{errors.fecha}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-sec uppercase tracking-wider mb-1">Hora</label>
                <input
                  type="time"
                  value={formData.hora}
                  onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-surface text-sm focus:ring-2 focus:ring-brand/30 outline-none transition"
                />
                {errors.hora && <p className="text-red-500 text-xs mt-1">{errors.hora}</p>}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-sec uppercase tracking-wider mb-1">Número de comensales</label>
              <input
                type="number"
                min="1"
                value={formData.numComensales}
                onChange={(e) => setFormData({ ...formData, numComensales: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-surface text-sm focus:ring-2 focus:ring-brand/30 outline-none transition"
              />
              {errors.numComensales && <p className="text-red-500 text-xs mt-1">{errors.numComensales}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-sec uppercase tracking-wider mb-1">Ocasión (Opcional)</label>
              <input
                type="text"
                placeholder="Aniversario, propuesta, negocios..."
                value={formData.ocasion}
                onChange={(e) => setFormData({ ...formData, ocasion: e.target.value })}
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-surface text-sm focus:ring-2 focus:ring-brand/30 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-sec uppercase tracking-wider mb-1">Peticiones especiales</label>
              <textarea
                value={formData.peticionesEspeciales}
                onChange={(e) => setFormData({ ...formData, peticionesEspeciales: e.target.value })}
                rows={2}
                placeholder="Silla alta para niños, alergias particulares, etc..."
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-surface text-sm focus:ring-2 focus:ring-brand/30 outline-none transition resize-none"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={prevStep} className="w-1/3 border border-border text-text-sec text-sm font-semibold py-3 rounded-xl hover:bg-surface-muted transition">
                Atrás
              </button>
              <button type="button" onClick={nextStep} className="w-2/3 bg-brand text-white text-sm font-bold py-3 rounded-xl hover:bg-brand/90 transition shadow-md">
                Buscar mesas disponibles
              </button>
            </div>
          </div>
        )}

        {/* ─── PASO 3: EL MAPA INTEGRADO ─── */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-in">
            <TableMap
              selectedTableId={selectedTableId}
              onSelectTable={(id) => setSelectedTableId(id)}
              fechaHora={targetFechaHora}
            />

            {errors.mesa && <p className="text-red-500 text-xs text-center font-medium">{errors.mesa}</p>}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={prevStep} className="w-1/3 border border-border text-text-sec text-sm font-semibold py-3 rounded-xl hover:bg-surface-muted transition">
                Atrás
              </button>
              <button
                type="button"
                onClick={nextStep}
                disabled={!selectedTableId || availabilityLoading}
                className="w-2/3 bg-brand text-white text-sm font-bold py-3 rounded-xl hover:bg-brand/90 transition shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {selectedTableId ? `Mesa #${selectedTableId} seleccionada →` : 'Elige una mesa'}
              </button>
            </div>
          </div>
        )}

        {/* ─── PASO 4: RESUMEN Y ENVÍO ─── */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-xl font-bold text-text">Revisa los detalles de tu mesa</h2>
              <p className="text-xs text-text-sec mt-1">Si todo es correcto, confirma tu asistencia.</p>
            </div>

            <div className="bg-surface-muted p-5 rounded-2xl border border-border space-y-3.5 text-sm shadow-inner">
              <div className="flex justify-between items-center"><span className="text-text-sec">Anfitrión:</span> <span className="font-bold text-text">{formData.clienteNombre}</span></div>
              <div className="flex justify-between items-center"><span className="text-text-sec">Contacto:</span> <span className="text-text">{formData.clienteTelefono}</span></div>
              <div className="flex justify-between items-center"><span className="text-text-sec">Fecha y Hora:</span> <span className="font-bold text-brand">{formData.fecha} a las {formData.hora} hrs</span></div>
              <div className="flex justify-between items-center"><span className="text-text-sec">Asientos:</span> <span className="font-semibold text-text">{formData.numComensales} comensales</span></div>
              <div className="flex justify-between items-center"><span className="text-text-sec">Mesa reservada:</span> <span className="font-black text-green-600 bg-green-500/10 px-2.5 py-1 rounded-md">Mesa {selectedTableId}</span></div>
              {formData.ocasion && <div className="flex justify-between items-center"><span className="text-text-sec">Celebración:</span> <span className="text-text italic font-medium">"{formData.ocasion}"</span></div>}
              {formData.peticionesEspeciales && (
                <div className="pt-3 border-t border-border mt-2">
                  <span className="text-text-sec block text-xs font-semibold mb-1 uppercase tracking-wider">Notas especiales:</span>
                  <p className="text-text bg-surface p-3 rounded-xl border border-border italic text-xs">"{formData.peticionesEspeciales}"</p>
                </div>
              )}
            </div>

            {errors.general && <p className="text-red-500 text-xs text-center">{errors.general}</p>}

            <div className="flex gap-3">
              <button type="button" onClick={prevStep} disabled={submitting} className="w-1/3 border border-border text-text-sec text-sm font-semibold py-3 rounded-xl hover:bg-surface-muted transition disabled:opacity-50">
                Atrás
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="w-2/3 bg-green-600 text-white text-sm font-black py-3 rounded-xl hover:bg-green-700 transition shadow-md flex justify-center items-center"
              >
                {submitting ? 'Creando reserva...' : 'Confirmar y Agendar'}
              </button>
            </div>
          </div>
        )}

      </form>
    </div>
  );
}
