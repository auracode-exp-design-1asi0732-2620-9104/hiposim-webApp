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
