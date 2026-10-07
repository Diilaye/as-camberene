import { Match } from '../types';

/** Instant du coup d'envoi, en millisecondes. */
export const kickoff = (match: Match): number => new Date(`${match.date}T${match.time || '00:00'}:00`).getTime();

/**
 * Une rencontre est jouée quand le club l'a marquée « Terminé » dans
 * l'administration — et seulement alors. Tant qu'elle est « À venir » ou
 * « En cours », elle reste parmi les prochaines rencontres, même si sa date
 * est passée : c'est le statut saisi qui fait foi, pas l'horloge.
 *
 * L'accueil et le calendrier partagent cette règle : ils ne peuvent pas se
 * contredire sur ce qui est joué et ce qui reste à jouer.
 */
export const isOver = (match: Match): boolean => match.status === 'Terminé';

/** Les prochaines rencontres (non terminées), la plus proche d'abord. */
export const upcomingMatches = (matches: Match[], count: number): Match[] =>
  matches
    .filter((match) => !isOver(match))
    .sort((a, b) => kickoff(a) - kickoff(b))
    .slice(0, count);

/** Les dernières rencontres terminées, la plus récente d'abord. */
export const recentResults = (matches: Match[], count: number): Match[] =>
  matches
    .filter((match) => isOver(match))
    .sort((a, b) => kickoff(b) - kickoff(a))
    .slice(0, count);
