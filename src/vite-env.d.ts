/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL du backend du site (server/), sans `/api` final. */
  readonly VITE_SITE_API_URL?: string;
  /** URL de la gateway fconnect, sans `/api` final. */
  readonly VITE_API_URL?: string;
  /** Identifiant Mongo du club ASC Cambérène dans fconnect. */
  readonly VITE_CLUB_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
