import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { ApiError } from '@/shared/api/http'
import { sessionStorageApi } from '@/shared/api/session-storage'
import { agencyNameFor, loginRequest, type LoginResponse } from '@/features/auth/api/auth.api'
import { useAuthStore } from './auth.store'

vi.mock('@/features/auth/api/auth.api', () => ({ loginRequest: vi.fn(), agencyNameFor: vi.fn() }))

const response = (role: 'advisor' | 'buyer'): LoginResponse => ({
  accessToken: 'jwt-token',
  tokenType: 'Bearer',
  expiresIn: 28800,
  user: { id: '1', fullName: 'Test Advisor', email: 'advisor@test.pe', role, agencyName: 'Test Agency' },
})

describe('auth store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    vi.mocked(loginRequest).mockReset()
  })

  it('stores the session and the token after an advisor logs in (US22 scenario 1)', async () => {
    vi.mocked(loginRequest).mockResolvedValue(response('advisor'))
    const auth = useAuthStore()

    await auth.login('advisor@test.pe', 'secret')

    expect(auth.isAuthenticated).toBe(true)
    expect(auth.isAdvisor).toBe(true)
    expect(auth.session?.companyName).toBe('Test Agency')
    expect(sessionStorageApi.getToken()).toBe('jwt-token')
  })

  it('looks the agency name up when the login response does not carry it', async () => {
    const withoutAgency = response('advisor')
    delete withoutAgency.user.agencyName
    vi.mocked(loginRequest).mockResolvedValue(withoutAgency)
    vi.mocked(agencyNameFor).mockResolvedValue('Inmobiliaria Sol')
    const auth = useAuthStore()

    await auth.login('advisor@test.pe', 'secret')

    expect(agencyNameFor).toHaveBeenCalledWith('jwt-token')
    expect(auth.session?.companyName).toBe('Inmobiliaria Sol')
  })

  it('rejects a buyer account: the portal is for advisors only', async () => {
    vi.mocked(loginRequest).mockResolvedValue(response('buyer'))
    const auth = useAuthStore()

    await expect(auth.login('buyer@test.pe', 'secret')).rejects.toThrow('Only advisors')

    expect(auth.isAuthenticated).toBe(false)
    expect(sessionStorageApi.getToken()).toBeNull()
  })

  it('does not open a session when the credentials are invalid (US22 scenario 2)', async () => {
    vi.mocked(loginRequest).mockRejectedValue(new ApiError(401, 'Invalid credentials.'))
    const auth = useAuthStore()

    await expect(auth.login('advisor@test.pe', 'wrong')).rejects.toBeInstanceOf(ApiError)

    expect(auth.isAuthenticated).toBe(false)
  })

  it('clears the session and the token on logout', async () => {
    vi.mocked(loginRequest).mockResolvedValue(response('advisor'))
    const auth = useAuthStore()
    await auth.login('advisor@test.pe', 'secret')

    auth.logout()

    expect(auth.isAuthenticated).toBe(false)
    expect(sessionStorageApi.getToken()).toBeNull()
    expect(sessionStorageApi.getSession()).toBeNull()
  })

  it('restores the session after a page reload', async () => {
    vi.mocked(loginRequest).mockResolvedValue(response('advisor'))
    await useAuthStore().login('advisor@test.pe', 'secret')

    setActivePinia(createPinia()) // a new store, as after reloading the page
    const restored = useAuthStore()

    expect(restored.isAuthenticated).toBe(true)
    expect(restored.session?.email).toBe('advisor@test.pe')
  })
})
