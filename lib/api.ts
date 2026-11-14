// Sin respaldo a localhost: el build exige la variable (PLAN 2.16).
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | undefined>;
}

export class APIError extends Error {
  statusCode: number;
  error: string;
  /** Mensajes por campo de la validación del API (`details`), si los hay. */
  details: string[];

  constructor(message: string, statusCode: number, error: string, details: string[] = []) {
    super(message);
    this.name = "APIError";
    this.statusCode = statusCode;
    this.error = error;
    this.details = details;
  }
}

export async function apiFetch<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, ...restOptions } = options;

  let url = `${BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Inject token if client-side
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("authToken");
    if (token) {
      defaultHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  const mergedHeaders = {
    ...defaultHeaders,
    ...headers,
  };

  const response = await fetch(url, { cache: "no-store",
    ...restOptions,
    headers: mergedHeaders,
  });

  if (!response.ok) {
    let errorData: { message?: string; statusCode?: number; error?: string; details?: unknown } = {};
    try {
      errorData = await response.json();
    } catch {
      // Respuesta sin JSON: se usan el código y el texto del estado.
    }

    const message = errorData.message || "Ocurrió un error inesperado";
    const statusCode = errorData.statusCode || response.status;
    const error = errorData.error || response.statusText;

    const details = Array.isArray(errorData.details) ? errorData.details.filter((d): d is string => typeof d === "string") : [];

    throw new APIError(message, statusCode, error, details);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiFetch<T>(endpoint, { ...options, method: "GET" }),
  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiFetch<T>(endpoint, { ...options, method: "DELETE" }),
};
