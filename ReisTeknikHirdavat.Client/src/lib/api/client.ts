// Centralized HTTP client for the Reis Teknik .NET 10 Web API.
// - Reads base URL from VITE_API_URL (fallback http://localhost:5000/api).
// - Sends/receives JSON in camelCase (matches ASP.NET System.Text.Json defaults).
// - Surfaces server-supplied { message } payloads via sonner toast on 4xx/5xx.

import { toast } from "sonner";

export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:5000/api";

export class ApiError extends Error {
  status: number;
  payload: unknown;
  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  signal?: AbortSignal;
  silent?: boolean; // suppress automatic error toast
  headers?: Record<string, string>;
}

function buildUrl(path: string, query?: ApiOptions["query"]): string {
  const base = API_BASE_URL.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  // Strip a leading "/api" from the path if base already ends in "/api".
  const normalized = base.endsWith("/api") && p.startsWith("/api/")
    ? p.slice(4)
    : p;
  const url = new URL(`${base}${normalized}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === "") continue;
      url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

export async function apiFetch<T = unknown>(
  path: string,
  opts: ApiOptions = {},
): Promise<T> {
  const { method = "GET", body, query, signal, silent, headers } = opts;
  const url = buildUrl(path, query);

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      signal,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: "include",
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Sunucuya bağlanılamadı.";
    if (!silent) toast.error("Bağlantı hatası", { description: message });
    throw new ApiError(message, 0, null);
  }

  const text = await res.text();
  let payload: unknown = null;
  if (text.length > 0) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!res.ok) {
    const message =
      (typeof payload === "object" && payload !== null && "message" in payload &&
        typeof (payload as { message: unknown }).message === "string"
        ? (payload as { message: string }).message
        : null) ?? `İstek başarısız oldu (HTTP ${res.status})`;
    if (!silent) {
      const title = res.status >= 500 ? "Sunucu hatası" : "Hatalı istek";
      toast.error(title, { description: message });
    }
    throw new ApiError(message, res.status, payload);
  }

  return payload as T;
}

export const api = {
  get: <T = unknown>(path: string, opts?: Omit<ApiOptions, "method" | "body">) =>
    apiFetch<T>(path, { ...opts, method: "GET" }),
  post: <T = unknown>(path: string, body?: unknown, opts?: Omit<ApiOptions, "method" | "body">) =>
    apiFetch<T>(path, { ...opts, method: "POST", body }),
  put: <T = unknown>(path: string, body?: unknown, opts?: Omit<ApiOptions, "method" | "body">) =>
    apiFetch<T>(path, { ...opts, method: "PUT", body }),
  del: <T = unknown>(path: string, opts?: Omit<ApiOptions, "method" | "body">) =>
    apiFetch<T>(path, { ...opts, method: "DELETE" }),
};
