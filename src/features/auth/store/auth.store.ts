import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loginRequest } from '@/features/auth/api/auth.api'
import { sessionStorageApi } from '@/shared/api/session-storage'
import { setUnauthorizedHandler } from '@/shared/api/http'

export interface Session {
  email: string
  fullName: string
  role: 'buyer' | 'advisor'
  /** Shown in the top bar; the advisor only sees leads of this agency. */
  companyName: string
}

function restoreSession(): Session | null {
  const raw = sessionStorageApi.getSession()
  if (!raw || !sessionStorageApi.getToken()) return null
  try {
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const session = ref<Session | null>(restoreSession())
  const isAuthenticated = computed(() => session.value !== null)
  /** This web app is the advisor portal (US22): a buyer token must not open it. */
  const isAdvisor = computed(() => session.value?.role === 'advisor')

  async function login(email: string, password: string) {
    const response = await loginRequest(email, password)
    if (response.user.role !== 'advisor') {
      throw new Error('Only advisors can use this portal.')
    }
    const next: Session = {
      email: response.user.email,
      fullName: response.user.fullName,
      role: response.user.role,
      companyName: response.user.agencyName ?? 'Inmobiliaria',
    }
    sessionStorageApi.save(response.accessToken, JSON.stringify(next))
    session.value = next
  }

  function logout() {
    sessionStorageApi.clear()
    session.value = null
  }

  // An expired or revoked token (401) ends the session; the router sends the advisor to the login.
  setUnauthorizedHandler(() => {
    logout()
    if (window.location.pathname !== '/login') window.location.assign('/login')
  })

  return { session, isAuthenticated, isAdvisor, login, logout }
})
