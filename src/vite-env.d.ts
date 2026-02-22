/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY: string
  /** Backend base URL (e.g. http://0.0.0.0:3000). Required for analyze API. */
  readonly VITE_API_BASE_URL: string
  /** Analyze endpoint path (default /api/v1/analyze). Use /api/v1/analyze-solar if backend uses that. */
  readonly VITE_ANALYZE_PATH: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
