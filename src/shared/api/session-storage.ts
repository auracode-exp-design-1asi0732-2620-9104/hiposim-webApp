const TOKEN_KEY = 'hiposim.accessToken'
const SESSION_KEY = 'hiposim.session'

/** Browser storage can be blocked or empty (private window), so every access is guarded. */
function safe<T>(action: () => T, fallback: T): T {
  try {
    return action()
  } catch {
    return fallback
  }
}

export const sessionStorageApi = {
  getToken: () => safe(() => localStorage.getItem(TOKEN_KEY), null),
  getSession: () => safe(() => localStorage.getItem(SESSION_KEY), null),
  save: (token: string, session: string) =>
    safe(() => {
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(SESSION_KEY, session)
    }, undefined),
  clear: () =>
    safe(() => {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(SESSION_KEY)
    }, undefined),
}
