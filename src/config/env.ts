/**
 * Configuration des deux backends du site.
 *
 * ── Qui sert quoi ──────────────────────────────────────────────────────────
 *
 * Le site a son propre serveur (`server/`), seul dépositaire du contenu
 * éditorial — actualités, boutique, légendes, histoire — et des comptes.
 * L'administration du site en dépend uniquement : elle fonctionne que fconnect
 * soit joignable ou non.
 *
 * fconnect reste la source des données sportives : profil du club, équipes,
 * effectif, matchs. Le club les saisit dans son tableau de bord fconnect, le
 * site les lit en anonyme. Rien ne s'y écrit depuis ici.
 */

const trimSlash = (url: string): string => url.replace(/\/+$/, '');

const rawSiteUrl = import.meta.env.VITE_SITE_API_URL?.trim() || 'http://localhost:4100';
const rawFconnectUrl = import.meta.env.VITE_API_URL?.trim() || 'http://localhost:4000';

/** Racine du backend du site, sans `/api` : sert aussi à résoudre `/uploads`. */
export const SITE_ORIGIN = trimSlash(rawSiteUrl);

/** Racine de l'API du site, `/api` compris. */
export const SITE_API_URL = `${SITE_ORIGIN}/api`;

/** Racine de l'API fconnect, `/api` compris : la gateway monte tout dessous. */
export const FCONNECT_API_URL = `${trimSlash(rawFconnectUrl)}/api`;

/** Identifiant du club dans fconnect. Chaîne vide tant qu'il n'est pas créé. */
export const CLUB_ID = import.meta.env.VITE_CLUB_ID?.trim() || '';

/**
 * fconnect est-il exploitable ?
 *
 * Sans `VITE_CLUB_ID`, aucune requête club-scopée n'a de sens : les hooks
 * sportifs servent alors les données statiques de `src/data/`. C'est ce qui
 * permet au site de tourner avant que le compte club n'existe.
 */
export const isFconnectConfigured = (): boolean => CLUB_ID.length > 0;

/** Durée au-delà de laquelle une requête est abandonnée (ms). */
export const REQUEST_TIMEOUT_MS = 15_000;
