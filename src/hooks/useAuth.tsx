import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Permission } from '../lib/roles';
import { isStaffRole } from '../lib/roles';
import { User } from '../types';
import { ApiError } from '../lib/api';
import * as authService from '../services/site/auth.service';

/**
 * Session du visiteur, tenue par le backend du site.
 *
 * Les comptes appartiennent au site et à lui seul : administrateurs comme
 * supporters. Se connecter ne dépend donc pas de fconnect — l'administration
 * reste utilisable quand la plateforme ne répond pas.
 *
 * Remplace l'authentification de démonstration qui vivait dans le navigateur,
 * avec ses identifiants écrits en clair dans le bundle et son rôle décidé côté
 * client. Ici le rôle vient du serveur, qui le vérifie à chaque écriture.
 */

interface AuthContextValue {
  user: User | null;
  /** Vrai tant que la session n'a pas été rétablie au chargement. */
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: authService.RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  /**
   * Le compte a-t-il ce droit ?
   *
   * Sert à masquer un écran ou un bouton, pas à autoriser : le serveur
   * revérifie chaque écriture, et la garde d'affichage n'est qu'une politesse.
   */
  can: (permission: Permission) => boolean;
  /** Le compte accède-t-il à l'administration, quel que soit son profil ? */
  isStaff: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Rétablissement de la session : le jeton conservé ne prouve rien, c'est le
  // serveur qui dit s'il vaut encore.
  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    authService
      .getCurrentUser(controller.signal)
      .then((current) => {
        if (active) setUser(current);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const connected = await authService.login(email, password);
    setUser(connected);
    return connected;
  }, []);

  const register = useCallback(async (data: authService.RegisterPayload) => {
    const created = await authService.register(data);
    setUser(created);
    return created;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const can = useCallback(
    (permission: Permission) => Boolean(user?.permissions.includes(permission)),
    [user]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      can,
      isStaff: Boolean(user && isStaffRole(user.role)),
    }),
    [user, loading, login, register, logout, can]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé à l’intérieur de <AuthProvider>.');
  return ctx;
};

/** Message d'erreur lisible pour un formulaire de connexion ou d'inscription. */
export const authErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) return error.fullMessage;
  return 'Erreur de connexion. Veuillez réessayer.';
};

export default useAuth;
