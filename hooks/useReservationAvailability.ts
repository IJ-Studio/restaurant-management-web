import { useState, useEffect } from 'react';
import { getAvailability } from '@/features/reservations/services/reservations.service';

export function useReservationAvailability(fecha: string, hora: string, numComensales: number) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fecha || !hora || !numComensales) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const result = await getAvailability(fecha, hora, numComensales);
        setData(result);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [fecha, hora, numComensales]);

  return { loading, data, error };
}
