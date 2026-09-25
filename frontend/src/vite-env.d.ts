/// <reference types="vite/client" />

// Extend ImportMetaEnv to document the custom env variables used in this app.
// Vite exposes only VITE_-prefixed variables to the client bundle.
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
