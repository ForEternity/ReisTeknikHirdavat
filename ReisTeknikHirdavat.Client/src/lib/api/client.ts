import { toast } from "sonner";

const rawApiBaseUrl =
  (typeof import.meta.env !== "undefined"
    ? import.meta.env.VITE_API_URL
    : process.env.VITE_API_URL
  )?.trim() || "https://reisteknikhirdavat-production.up.railway.app/api";

export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, "");

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
  silent?: boolean;
  headers?: Record<string, string>;
}

function buildUrl(path: string, query?: ApiOptions["query"]): string {
  const base = API_BASE_URL.replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;

  const normalized =
    base.endsWith("/api") && p.startsWith("/api/")
      ? p.slice(4)
      : p;

  const url = new URL(`${base}${normalized}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
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

      // Auth/cookie kullanmaya başlayana kadar omit daha sorunsuz.
      credentials: "omit",
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Sunucuya bağlanılamadı.";

    if (!silent) {
      toast.error("Bağlantı hatası", { description: message });
    }

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
      typeof payload === "object" &&
      payload !== null &&
      "message" in payload &&
      typeof (payload as { message: unknown }).message === "string"
        ? (payload as { message: string }).message
        : `İstek başarısız oldu (HTTP ${res.status})`;

    if (!silent) {
      toast.error(res.status >= 500 ? "Sunucu hatası" : "Hatalı istek", {
        description: message,
      });
    }

    throw new ApiError(message, res.status, payload);
  }

  return payload as T;
}

export const api = {
  get: <T = unknown>(
    path: string,
    opts?: Omit<ApiOptions, "method" | "body">,
  ) => apiFetch<T>(path, { ...opts, method: "GET" }),

  post: <T = unknown>(
    path: string,
    body?: unknown,
    opts?: Omit<ApiOptions, "method" | "body">,
  ) => apiFetch<T>(path, { ...opts, method: "POST", body }),

  put: <T = unknown>(
    path: string,
    body?: unknown,
    opts?: Omit<ApiOptions, "method" | "body">,
  ) => apiFetch<T>(path, { ...opts, method: "PUT", body }),

  del: <T = unknown>(
    path: string,
    opts?: Omit<ApiOptions, "method" | "body">,
  ) => apiFetch<T>(path, { ...opts, method: "DELETE" }),
};
