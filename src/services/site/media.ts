/**
 * Images gérées par le backend du site.
 *
 * L'administration téléverse dans `server/uploads`, qui renvoie un chemin
 * relatif (`/uploads/…`) et non une URL complète : l'API peut ainsi changer de
 * domaine sans invalider les images déjà citées dans les articles. C'est ici
 * que le chemin redevient affichable.
 */

import { SITE_ORIGIN } from '../../config/env';

export const siteMediaUrl = (value: string | undefined | null, fallback = ''): string => {
  const trimmed = value?.trim();
  if (!trimmed) return fallback;

  // URL complète ou donnée inline : rien à faire.
  if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith('data:')) return trimmed;

  // Fichier téléversé : il est servi par le backend du site.
  if (trimmed.startsWith('/uploads/')) return `${SITE_ORIGIN}${trimmed}`;

  // Visuel livré avec le site (`assets/img/…`), servi par le front lui-même.
  return trimmed;
};
