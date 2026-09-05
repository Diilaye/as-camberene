import { useCallback, useState } from 'react';
import { ApiError } from '../lib/api';
import { ListParams } from '../services/site/content.service';
import { useApiResource } from './useApiResource';

/**
 * Ressource éditoriale vue depuis l'administration : lecture et écriture.
 *
 * Après chaque écriture réussie, la liste est rechargée depuis le serveur
 * plutôt que corrigée en mémoire. C'est un aller-retour de plus, mais l'écran
 * montre alors ce que le serveur a réellement enregistré — valeurs par défaut
 * et normalisations comprises — et non ce que le formulaire croyait envoyer.
 *
 * Les erreurs d'écriture sont tenues à part des erreurs de lecture : « la
 * sauvegarde a échoué » et « la liste n'a pas pu être chargée » ne se disent
 * pas au même endroit de l'écran.
 */

export interface ResourceApi<T> {
  list: (params?: ListParams, signal?: AbortSignal) => Promise<T[]>;
  create: (payload: Partial<T>) => Promise<T>;
  update: (id: string, payload: Partial<T>) => Promise<T>;
  remove: (id: string) => Promise<void>;
}

export interface EditableResource<T> {
  items: T[];
  loading: boolean;
  /** Échec du chargement de la liste. */
  error: ApiError | null;
  /** Échec de la dernière écriture. */
  actionError: ApiError | null;
  saving: boolean;
  reload: () => void;
  clearActionError: () => void;
  create: (payload: Partial<T>) => Promise<T | null>;
  update: (id: string, payload: Partial<T>) => Promise<T | null>;
  remove: (id: string) => Promise<boolean>;
}

const asApiError = (cause: unknown): ApiError =>
  cause instanceof ApiError ? cause : new ApiError(0, 'Erreur inattendue du serveur.');

export function useEditableResource<T extends { id: string }>(
  api: ResourceApi<T>,
  params: ListParams = {}
): EditableResource<T> {
  // L'administration ne se replie pas sur les données statiques : proposer de
  // modifier un contenu qui n'existe pas en base induirait en erreur. Serveur
  // muet, liste vide, et le message d'erreur le dit.
  const { data, loading, error, reload } = useApiResource<T[]>(
    (signal) => api.list(params, signal),
    [],
    { deps: [JSON.stringify(params)] }
  );

  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<ApiError | null>(null);

  const run = useCallback(
    async <R,>(operation: () => Promise<R>, fallback: R): Promise<R> => {
      setSaving(true);
      setActionError(null);
      try {
        const result = await operation();
        reload();
        return result;
      } catch (cause) {
        setActionError(asApiError(cause));
        return fallback;
      } finally {
        setSaving(false);
      }
    },
    [reload]
  );

  return {
    items: data,
    loading,
    error,
    actionError,
    saving,
    reload,
    clearActionError: () => setActionError(null),
    create: (payload) => run(() => api.create(payload), null),
    update: (id, payload) => run(() => api.update(id, payload), null),
    remove: (id) => run(() => api.remove(id).then(() => true), false),
  };
}

export default useEditableResource;
