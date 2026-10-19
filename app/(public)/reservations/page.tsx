'use client';
import { useState } from 'react';
import { Phone } from 'lucide-react';
import ReservationSidebar from '@/components/reservations/ReservationSidebar';
import OnlineOnly from '@/components/pwa/OnlineOnly';

const RESTAURANT_PHONE = '+52 771 702 8172';

export default function ReservarPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-surface-muted py-12 flex items-center justify-center">
      <div className="container mx-auto px-4 w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-text text-center mb-8">Reserva tu mesa</h1>

        {/* El formulario ahora toma el control total de la experiencia centralizada */}
        {/* Reservar requiere el servidor; sin conexión se ofrece llamar al restaurante. */}
        <OnlineOnly
          what="el formulario de reservaciones"
          className="flex justify-center"
          extra={
            <a
              href={`tel:${RESTAURANT_PHONE.replace(/\s/g, '')}`}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-brand)] px-5 py-3 text-sm font-bold text-white"
            >
              <Phone size={16} /> Llamar para reservar
            </a>
          }
        >
          <ReservationSidebar
            key={refreshTrigger}
            onSuccess={handleSuccess}
          />
        </OnlineOnly>
      </div>
    </div>
  );
}
