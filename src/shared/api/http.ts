import axios, { AxiosError } from 'axios'
import { apiBaseUrl } from './config'
import { sessionStorageApi } from './session-storage'

export const http = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json', 'Accept-Language': 'es-419' },
  timeout: 15000,
})

http.interceptors.request.use((config) => {
  const token = sessionStorageApi.getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

/** Registered by the auth store so an expired token logs the advisor out without a circular import. */
let onUnauthorized: (() => void) | null = null
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler
}

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // A 401 from the login call itself means wrong credentials, not an expired session.
    const isLoginCall = error.config?.url?.includes('/api/auth/login')
    if (error.response?.status === 401 && !isLoginCall) onUnauthorized?.()
    return Promise.reject(error)
  },
)

/** RFC 9457 problem details returned by the API (application/problem+json). */
export interface ProblemDetails {
  title?: string
  status?: number
  detail?: string
  errors?: Record<string, string[]>
}

export function getProblem(error: unknown): ProblemDetails | null {
  if (axios.isAxiosError(error)) return (error.response?.data as ProblemDetails) ?? null
  return null
}

/** Error with an HTTP status, used by the sample-data mode so screens handle it like a real response. */
export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export function getStatus(error: unknown): number | null {
  if (error instanceof ApiError) return error.status
  return axios.isAxiosError(error) ? (error.response?.status ?? null) : null
}
