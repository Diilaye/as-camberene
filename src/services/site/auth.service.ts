/**
 * Comptes du site.
 *
 * Le site est seul dépositaire de ses comptes : administrateurs et supporters
 * vivent dans son backend, pas dans fconnect. C'est ce qui rend son
 * administration autonome — elle se connecte que fconnect réponde ou non.
 *
 * Aucune route publique ne crée de compte d'administration : l'inscription ne
 * produit que des supporters, et le rôle est fixé par le serveur. Les profils
 * s'ouvrent depuis `/admin/utilisateurs`, réservé au super administrateur, et
 * le tout premier depuis le serveur :
 * `cd server && npm run create:superadmin -- <email>`.
 */

import { ApiError, siteApi } from '../../lib/api';
import { AuthTokens } from '../../lib/tokens';
import { Permission, UserRole, permissionsOf } from '../../lib/roles';
import { User } from '../../types';

/** Compte tel que le backend le rend. */
export interface SiteUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  favorite_team?: string;
  is_active: boolean;
  last_login_at?: string;
  created_at?: string;
}

interface AuthPayload {
  user: SiteUser;
  /** Droits du compte ; le serveur en est l'autorité. */
  permissions?: Permission[];
  tokens: AuthTokens;
}

interface AuthResponse {
  success: boolean;
  data: AuthPayload;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  favorite?: string;
}

/**
 * Traduction vers le type `User` que connaissent les pages.
 *
 * Les permissions viennent du serveur ; la table locale ne sert que si la
 * réponse ne les porte pas — un backend plus ancien que le site.
 */
export const toUser = (user: SiteUser, permissions?: Permission[]): User => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  permissions: permissions ?? permissionsOf(user.role),
  favoriteTeam: user.favorite_team,
});

const persist = (payload: AuthPayload): User => {
  siteApi.tokens.set(payload.tokens);
  return toUser(payload.user, payload.permissions);
};

export const login = async (email: string, password: string): Promise<User> => {
  const response = await siteApi.post<AuthResponse>('/auth/login', { email, password });
  return persist(response.data);
};

export const register = async (payload: RegisterPayload): Promise<User> => {
  const response = await siteApi.post<AuthResponse>('/auth/register', payload);
  return persist(response.data);
};

/**
 * Profil du visiteur connecté, ou `null`.
 *
 * Appelé au chargement du site pour rétablir la session : c'est le serveur qui
 * dit si le jeton conservé vaut encore, jamais le client.
 */
export const getCurrentUser = async (signal?: AbortSignal): Promise<User | null> => {
  if (!siteApi.tokens.getAccess()) return null;

  try {
    const response = await siteApi.get<{
      success: boolean;
      data: { user: SiteUser; permissions?: Permission[] };
    }>('/auth/me', { auth: true, signal });
    return toUser(response.data.user, response.data.permissions);
  } catch (error) {
    /*
     * Seul un refus du serveur condamne le jeton.
     *
     * Une requête annulée — le composant s'est démonté, React a rejoué son
     * effet, le visiteur a changé de page — et un serveur injoignable ne disent
     * rien de sa validité. Les traiter comme un rejet effaçait la session à la
     * moindre navigation rapide : le compte restait affiché, mais les appels
     * suivants partaient sans jeton et se faisaient refuser.
     */
    if (error instanceof ApiError && error.isUnauthorized) siteApi.tokens.clear();
    return null;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await siteApi.post('/auth/logout');
  } catch {
    // Le serveur n'a pas de liste noire à mettre à jour : la déconnexion est
    // locale, et ne doit pas dépendre du réseau.
  }
  siteApi.tokens.clear();
};
