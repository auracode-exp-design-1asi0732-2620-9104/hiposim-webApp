import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface Session {
  email: string
  companyName: string
}

export const useAuthStore = defineStore('auth', () => {
  const session = ref<Session | null>(null)
  const isAuthenticated = computed(() => session.value !== null)

  async function login(email: string, _password: string) {
    // TODO: reemplazar por la llamada real al backend (Identity & Access).
    session.value = { email, companyName: 'Inmobiliaria ViraPerú' }
  }

  function logout() {
    session.value = null
  }

  return { session, isAuthenticated, login, logout }
})
