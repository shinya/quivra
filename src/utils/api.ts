// REST API クライアント

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8090'

export const WS_URL =
  import.meta.env.VITE_WS_URL ?? API_BASE_URL.replace(/^http/, 'ws') + '/ws'

const TOKEN_KEY = 'quivra_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

interface ApiOptions {
  method?: string
  body?: unknown
}

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(API_BASE_URL + path, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })

  let json: unknown
  try {
    json = await res.json()
  } catch {
    json = {}
  }

  if (!res.ok) {
    const message =
      typeof json === 'object' && json !== null && 'error' in json
        ? String((json as { error: unknown }).error)
        : `リクエストに失敗しました (${res.status})`
    throw new ApiError(res.status, message)
  }
  return json as T
}
