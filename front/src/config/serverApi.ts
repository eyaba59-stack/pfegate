import { cookies } from "next/headers";
import { API_BASE_URL, TOKEN_COOKIE, ApiError, errorMessage } from "./api";

/**
 * Server-only fetch helper for Server Components. Reads the JWT from the
 * `mir.token` cookie so protected backend routes can be called with a Bearer
 * header during RSC rendering.
 */
export async function serverFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = cookies().get(TOKEN_COOKIE)?.value;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new ApiError(await errorMessage(res), res.status);
  }
  return (await res.json()) as T;
}

export { ApiError };

/** Data helper: return empty/fallback instead of letting RSC render crash. */
export async function safe<T>(path: string, fallback: T): Promise<T> {
  try {
    return await serverFetch<T>(path);
  } catch (err) {
    console.warn(`[api] ${path} -> ${err instanceof Error ? err.message : err}`);
    return fallback;
  }
}
