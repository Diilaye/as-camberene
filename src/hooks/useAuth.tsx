import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Permission } from '../lib/roles';
import { isStaffRole } from '../lib/roles';
import { User } from '../types';
import { ApiError } from '../lib/api';
import * as authService from '../services/site/auth.service';



interface AuthContextValue {
  user: User | null;
 
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: authService.RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
 
  can: (permission: Permission) => boolean;
 
  isStaff: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

 
 
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


export const authErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) return error.fullMessage;
  return 'Erreur de connexion. Veuillez réessayer.';
};

export default useAuth;
