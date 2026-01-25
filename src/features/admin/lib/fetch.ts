/**
 * Typed fetch wrapper for admin API calls.
 * Provides consistent error handling and type safety.
 */

export type AdminApiError = {
  error: string
  details?: unknown
}

export type AdminApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  headers?: HeadersInit
}

/**
 * Fetch wrapper for admin API endpoints with consistent error handling
 */
export async function adminFetch<T>(
  url: string,
  options: AdminApiOptions = {},
): Promise<T> {
  const { method = 'GET', body, headers = {} } = options

  const response = await fetch(url, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  if (!response.ok) {
    const error = (await response.json().catch(() => ({ error: 'Unknown error' }))) as AdminApiError
    throw new Error(error.error ?? 'Request failed')
  }

  return response.json() as Promise<T>
}

/**
 * Build URLSearchParams from an object, filtering out undefined values
 */
export function buildSearchParams(params: Record<string, string | number | boolean | undefined>): URLSearchParams {
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      searchParams.set(key, String(value))
    }
  }

  return searchParams
}
