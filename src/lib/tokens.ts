/**
 * Stockage des jetons, un jeu par backend.
 *
 * Le site parle à deux serveurs — le sien pour le contenu et les comptes,
 * fconnect pour les données sportives — et leurs jetons ne sont pas
 * interchangeables. Les mélanger enverrait un jeton du site à fconnect, qui le
 * refuserait sans qu'on comprenne pourquoi : d'où un préfixe par backend.
 */

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  /** Durée de validité de l'access token, en secondes. */
  expires_in?: number;
}

export interface TokenStore {
  getAccess(): string | null;
  getRefresh(): string | null;
  set(tokens: AuthTokens): void;
  clear(): void;
}

const read = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    // Navigation privée, stockage désactivé : on se comporte comme un anonyme.
    return null;
  }
};

const write = (key: string, value: string | null): void => {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* ignoré : l'absence de stockage ne doit pas casser la navigation */
  }
};

export const createTokenStore = (prefix: string): TokenStore => {
  const accessKey = `${prefix}_access_token`;
  const refreshKey = `${prefix}_refresh_token`;

  return {
    getAccess: () => read(accessKey),
    getRefresh: () => read(refreshKey),
    set: (tokens) => {
      write(accessKey, tokens.access_token);
      write(refreshKey, tokens.refresh_token);
    },
    clear: () => {
      write(accessKey, null);
      write(refreshKey, null);
    },
  };
};

/** Comptes du site : administrateurs et supporters. */
export const siteTokens = createTokenStore('asc_camberene_site');

/**
 * Comptes fconnect.
 *
 * Le site ne lit fconnect qu'en anonyme aujourd'hui ; ce magasin existe pour le
 * jour où une lecture demanderait un compte, et pour que le client HTTP ait la
 * même forme des deux côtés.
 */
export const fconnectTokens = createTokenStore('asc_camberene_fconnect');
