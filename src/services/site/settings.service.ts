import { siteApi } from '../../lib/api';
import { SiteSettings, withDefaults } from '../../data/siteSettings';
import { siteMediaUrl } from './media';

interface SettingsResponse {
  success: boolean;
  data: Partial<SiteSettings> | null;
}

/** Contenu du site, complété des valeurs d'origine. */
export const getSiteSettings = async (signal?: AbortSignal): Promise<SiteSettings> => {
  const response = await siteApi.get<SettingsResponse>('/settings', { signal });
  return withDefaults(response.data);
};

/** Remplace tout le contenu du site : l'écran envoie toujours l'ensemble. */
export const saveSiteSettings = async (settings: SiteSettings): Promise<SiteSettings> => {
  const response = await siteApi.put<SettingsResponse>('/settings', settings, { auth: true });
  return withDefaults(response.data);
};

/** Adresse affichable d'une image saisie : chemin téléversé ou URL. */
export const settingsImage = (value: string): string => siteMediaUrl(value);
