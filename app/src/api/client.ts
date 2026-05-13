import { useAuthStore } from '../store/authStore';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = useAuthStore.getState().token;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  const isAuthEndpoint = /^\/api\/v1\/auth\/(login|signup)$/.test(path);
  if (token && !isAuthEndpoint) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const body = await res.json().catch(() => null);

  if (!res.ok) {
    if (res.status === 401) {
      // Token expired or revoked — clear auth so app redirects to login.
      // Refresh token flow can be wired here when the backend supports it.
      useAuthStore.getState().clearAuth();
    }
    throw new ApiError(res.status, body?.error?.message ?? body?.message ?? res.statusText, body?.error?.code ?? body?.code);
  }
  return body?.data ?? body;
}

async function streamRequest(path: string, data: unknown, signal?: AbortSignal): Promise<Response> {
  const token = useAuthStore.getState().token;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
    signal,
  });

  if (res.status === 401) {
    useAuthStore.getState().clearAuth();
    throw new ApiError(401, 'Unauthorized');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, body?.error?.message ?? body?.message ?? res.statusText, body?.error?.code ?? body?.code);
  }
  return res;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(data) }),
  patch: <T>(path: string, data: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(data) }),
  put: <T>(path: string, data: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(data) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  streamPost: (path: string, data: unknown, signal?: AbortSignal) =>
    streamRequest(path, data, signal),
};
