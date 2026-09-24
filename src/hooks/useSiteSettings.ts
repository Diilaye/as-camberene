import { useEffect, useState } from 'react';
import { DEFAULT_SITE_SETTINGS, SiteSettings } from '../data/siteSettings';
import { getSiteSettings } from '../services/site/settings.service';

/**
 * Contenu du site, partagé par l'en-tête, le pied de page et l'accueil.
 *
 * Une seule requête pour toute la page : le premier composant la lance, les
 * autres attendent la même réponse. Tant qu'elle n'est pas arrivée — ou si le
 * serveur ne répond pas — ce sont les valeurs d'origine qui s'affichent.
 */
let cache: SiteSettings | null = null;
let inflight: Promise<void> | null = null;
const listeners = new Set<(settings: SiteSettings) => void>();

const broadcast = (settings: SiteSettings) => {
  cache = settings;
  listeners.forEach((listener) => listener(settings));
};

/** Pousse un contenu fraîchement enregistré à tous les composants affichés. */
export const publishSiteSettings = broadcast;

export const useSiteSettings = (): SiteSettings => {
  const [settings, setSettings] = useState<SiteSettings>(cache ?? DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    listeners.add(setSettings);
    if (cache) setSettings(cache);
    else if (!inflight) {
      inflight = getSiteSettings()
        .then(broadcast)
        .catch(() => {
          // Serveur injoignable : on garde les valeurs d'origine, et la
          // prochaine page retentera.
          inflight = null;
        });
    }
    return () => {
      listeners.delete(setSettings);
    };
  }, []);

  return settings;
};

export default useSiteSettings;
