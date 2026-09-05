/**
 * Comptes de l'administration.
 *
 * Toutes ces routes exigent le droit `users:manage`, c'est-à-dire le profil
 * super administrateur. L'écran qui les appelle est déjà gardé, mais c'est le
 * serveur qui décide : un appel direct depuis la console se solde par un 403.
 */

import { siteApi } from '../../lib/api';
import { Permission, UserRole } from '../../lib/roles';
import { SiteUser } from './auth.service';

export interface UserListParams {
  search?: string;
  role?: UserRole | '';
  is_active?: 'true' | 'false' | '';
  page?: number;
  limit?: number;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  role: UserRole;
  /** Laissé vide, le serveur en tire un au sort et le rend une seule fois. */
  password?: string;
  is_active?: boolean;
}

export interface UpdateUserPayload {
  name?: string;
  role?: UserRole;
  is_active?: boolean;
}

interface ListResponse {
  success: boolean;
  data: SiteUser[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

/**
 * Réponse d'une création ou d'une réinitialisation.
 *
 * `generated_password` n'apparaît que si le serveur a tiré le mot de passe :
 * il n'est pas stocké en clair, donc jamais redonné ensuite.
 */
interface MutationResponse {
  success: boolean;
  data: { user: SiteUser; generated_password?: string };
}

export const listUsers = async (
  params: UserListParams = {},
  signal?: AbortSignal
): Promise<SiteUser[]> => {
  const response = await siteApi.get<ListResponse>('/users', {
    query: { ...params },
    auth: true,
    signal,
  });
  return response.data;
};

export const listRoles = async (
  signal?: AbortSignal
): Promise<{ value: UserRole; label: string; permissions: Permission[] }[]> => {
  const response = await siteApi.get<{
    success: boolean;
    data: { value: UserRole; label: string; permissions: Permission[] }[];
  }>('/users/roles', { auth: true, signal });
  return response.data;
};

export const createUser = async (
  payload: CreateUserPayload
): Promise<{ user: SiteUser; generatedPassword?: string }> => {
  const response = await siteApi.post<MutationResponse>('/users', payload, { auth: true });
  return { user: response.data.user, generatedPassword: response.data.generated_password };
};

export const updateUser = async (id: string, payload: UpdateUserPayload): Promise<SiteUser> => {
  const response = await siteApi.put<{ success: boolean; data: SiteUser }>(
    `/users/${id}`,
    payload,
    { auth: true }
  );
  return response.data;
};

export const resetUserPassword = async (
  id: string,
  password?: string
): Promise<{ user: SiteUser; generatedPassword?: string }> => {
  const response = await siteApi.post<MutationResponse>(
    `/users/${id}/password`,
    password ? { password } : {},
    { auth: true }
  );
  return { user: response.data.user, generatedPassword: response.data.generated_password };
};

export const deleteUser = async (id: string): Promise<void> => {
  await siteApi.del(`/users/${id}`, { auth: true });
};
