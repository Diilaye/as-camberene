import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../lib/api';

/**
 * Lecture d'une ressource distante, avec repli sur les données statiques.
 *
 * Le site doit rester debout quand un backend manque : le serveur du site
 * éteint, fconnect injoignable, ou le compte club pas encore créé. Dans ces
 * cas, le hook sert la valeur de repli — celle de `src/data/` — et signale
 * l'origine par `source`, pour qu'une page puisse afficher un bandeau.
 *
 * Une erreur n'efface jamais un contenu déjà affiché : on préfère une donnée
 * datée à une page vide.
 */

export type ResourceSource = 'api' | 'fallback';

export interface ApiResource<T> {
  data: T;
  loading: boolean;
  error: ApiError | null;
  source: ResourceSource;
  /** Relance la requête — bouton « réessayer », ou après une écriture. */
  reload: () => void;
}

export interface ResourceOptions {
  /**
   * Faut-il seulement interroger le backend ?
   *
   * `false` sert au cas où la requête n'a pas de sens — les ressources
   * fconnect sans identifiant de club, par exemple : autant servir le repli
   * tout de suite qu'appeler une URL qu'on sait incomplète.
   */
  enabled?: boolean;
  /** Dépendances qui, en changeant, relancent la requête. */
  deps?: readonly unknown[];
}

export function useApiResource<T>(
  loader: (signal: AbortSignal) => Promise<T>,
  fallback: T,
  { enabled = true, deps = [] }: ResourceOptions = {}
): ApiResource<T> {
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<ApiError | null>(null);
  const [source, setSource] = useState<ResourceSource>('fallback');
  const [attempt, setAttempt] = useState(0);

  // Le loader est souvent une lambda recréée à chaque rendu : le garder dans
  // une référence évite de relancer la requête sans raison. Ce sont `deps` qui
  // décident quand recharger.
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const fallbackRef = useRef(fallback);
  fallbackRef.current = fallback;

  useEffect(() => {
    if (!enabled) {
      setData(fallbackRef.current);
      setSource('fallback');
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    let active = true;

    setLoading(true);
    setError(null);

    loaderRef
      .current(controller.signal)
      .then((result) => {
        if (!active) return;
        setData(result);
        setSource('api');
        setError(null);
      })
      .catch((cause: unknown) => {
        if (!active) return;
        const apiError =
          cause instanceof ApiError ? cause : new ApiError(0, 'Erreur inattendue du serveur.');
        setError(apiError);
        setData(fallbackRef.current);
        setSource('fallback');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt, enabled, ...deps]);

  const reload = useCallback(() => setAttempt((value) => value + 1), []);

  return { data, loading, error, source, reload };
}

export default useApiResource;
