'use client';
import { useState } from 'react';
import ReservationSidebar from '@/components/reservations/ReservationSidebar';

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
        <ReservationSidebar
          key={refreshTrigger}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
}
