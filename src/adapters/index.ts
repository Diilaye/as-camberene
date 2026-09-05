/**
 * Traduction des formes fconnect vers les types du site.
 *
 * Ne concerne que le sportif : le contenu éditorial vient du backend du site,
 * qui rend déjà les types du front — il n'a rien à traduire.
 *
 * Toute la divergence entre les deux modèles est confinée ici : les pages
 * continuent de manipuler `Player`, `Match` et `TeamData`, et ignorent que la
 * donnée vient d'un backend. Les types `Api*` en sont des versions
 * enrichies — identifiant fconnect d'origine, champs sans équivalent local —
 * utilisables partout où un `Player` est attendu.
 */

export * from './helpers';
export * from './match.adapter';
export * from './player.adapter';
export * from './team.adapter';
