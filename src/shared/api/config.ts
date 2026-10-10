export const apiBaseUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:5000').replace(/\/$/, '')

/** When true, the api modules answer with sample data and never touch the network. */
export const useMockApi = import.meta.env.VITE_USE_MOCK === 'true'
