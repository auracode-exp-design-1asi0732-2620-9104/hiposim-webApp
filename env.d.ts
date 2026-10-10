/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the HipoSim API, without a trailing slash (e.g. http://localhost:5000). */
  readonly VITE_API_URL: string
  /** "true" serves sample data from the browser instead of calling the API. */
  readonly VITE_USE_MOCK: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
