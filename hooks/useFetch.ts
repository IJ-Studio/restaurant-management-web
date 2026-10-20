"use client";

import { useEffect, useState } from "react";
import { useConfirmedOnline, useOnlineStatus } from "@/hooks/useOnlineStatus";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export function useFetch<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const online = useOnlineStatus();
  const confirmedOnline = useConfirmedOnline();

  useEffect(() => {
    if (!url) {
      setLoading(false);
      return;
    }
    // Sin conexión no se intenta la petición (fallaría); se hace al reconectar.
    if (!confirmedOnline) {
      if (!online) setLoading(false);
      return;
    }

    let isMounted = true;
    const fullUrl = `${API_BASE}${url}`; // 👈 siempre agrega la base del backend

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(fullUrl);
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const json = await res.json();
        if (isMounted) setData(json);
      } catch (err: any) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [url, online, confirmedOnline]);

  return { data, loading, error };
}
