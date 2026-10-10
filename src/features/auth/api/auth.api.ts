import { http, ApiError } from '@/shared/api/http'
import { useMockApi } from '@/shared/api/config'

/** Contract v0 (hiposim-backEnd/docs/api-contract/openapi.v0.yaml): POST /api/auth/login. */
export interface LoginResponse {
  accessToken: string
  tokenType: 'Bearer'
  expiresIn: number
  user: {
    id: string
    fullName: string
    email: string
    role: 'buyer' | 'advisor'
    /** Not in contract v0 yet: the advisor token must carry the agency (US22). Optional until Carlos adds it. */
    agencyName?: string
  }
}

export async function loginRequest(email: string, password: string): Promise<LoginResponse> {
  if (useMockApi) return mockLogin(email, password)
  const { data } = await http.post<LoginResponse>('/api/auth/login', { email, password })
  return data
}

/** The advisor token carries the agency in its `agencyId` claim; the payload is base64url JSON. */
export function agencyIdFromToken(token: string): string | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    const claims = JSON.parse(json) as { agencyId?: unknown }
    return typeof claims.agencyId === 'string' ? claims.agencyId : null
  } catch {
    return null
  }
}

/**
 * The login response has no agency name, so it is looked up in the public catalogue (GET /api/agencies).
 * Returns an empty string when anything fails: the screens show a translated fallback.
 */
export async function agencyNameFor(token: string): Promise<string> {
  const agencyId = agencyIdFromToken(token)
  if (!agencyId || useMockApi) return ''
  try {
    const { data } = await http.get<{ id: string; name: string }[]>('/api/agencies')
    return data.find((agency) => agency.id === agencyId)?.name ?? ''
  } catch {
    return ''
  }
}

// Sample advisor so the screens can be developed without the API. Remove with VITE_USE_MOCK=false.
async function mockLogin(email: string, password: string): Promise<LoginResponse> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  if (!email || !password) throw new ApiError(401, 'Invalid credentials.')
  return {
    accessToken: 'mock-token',
    tokenType: 'Bearer',
    expiresIn: 28800,
    user: {
      id: '00000000-0000-0000-0000-000000000001',
      fullName: 'Asesor de prueba',
      email,
      role: 'advisor',
      agencyName: 'Inmobiliaria de prueba',
    },
  }
}
