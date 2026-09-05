/**
 * Médias servis par fconnect (file-service, exposé sur `/api/files`).
 *
 * Ne concerne que les visuels venus du club dans fconnect — logos d'équipe,
 * photos de joueurs. Les images de l'administration du site passent par
 * `services/site/media.ts`.
 */

import { FCONNECT_API_URL } from '../../config/env';

/**
 * Rend une URL affichable à partir de ce que stocke fconnect.
 *
 * Le backend range tantôt une URL complète (import depuis un CDN), tantôt le
 * seul nom du fichier téléversé. Les deux se croisent dans la même base, d'où
 * ce passage obligé avant tout `src=`.
 */
export const mediaUrl = (value: string | undefined | null, fallback = ''): string => {
  if (!value) return fallback;

  const trimmed = value.trim();
  if (!trimmed) return fallback;

  // Déjà une adresse complète, ou une donnée inline.
  if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith('data:')) return trimmed;

  // Chemin déjà relatif à l'API.
  if (trimmed.startsWith('/api/')) return `${FCONNECT_API_URL.replace(/\/api$/, '')}${trimmed}`;

  // Asset local du site (`assets/img/...`), laissé tel quel.
  if (trimmed.startsWith('assets/') || trimmed.startsWith('/assets/')) return trimmed;

  return `${FCONNECT_API_URL}/files/${trimmed.replace(/^\/+/, '')}`;
};
