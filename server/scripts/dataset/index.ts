/**
 * Jeu de donnees d'amorcage du site.
 *
 * Autonome : il ne depend pas de `src/data/`, qui n'est plus qu'un repli hors
 * ligne. Le contenu vit ici, il est verse en base par `scripts/seed-site.ts`,
 * et c'est l'administration qui le fait vivre ensuite.
 */

export * from './types';
export { seedArticles } from './articles';
export { seedProducts } from './products';
export { seedLegends } from './legends';
export { seedHistoryEvents } from './history';
export { seedHeroSlides } from './heroSlides';
