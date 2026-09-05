/**
 * Match fconnect → `Match` du site.
 *
 * fconnect décrit une rencontre de façon neutre (équipe à domicile, équipe à
 * l'extérieur) ; le site la raconte du point de vue du club (« adversaire »,
 * « domicile ou extérieur »). C'est tout le travail de cet adaptateur, et il
 * repose sur `clubId` porté par chaque camp.
 */

import { CLUB_ID } from '../config/env';
import { Match } from '../types';
import { FcMatch, FcMatchStatus, FcMatchTeamRef } from '../types/fconnect';
import { isoDate } from './helpers';

/** Vocabulaire du site pour les états de fconnect. */
const STATUS_LABELS: Record<FcMatchStatus, Match['status']> = {
  scheduled: 'À venir',
  live: 'En cours',
  halftime: 'En cours',
  finished: 'Terminé',
  // Un match reporté ou annulé n'est plus « à venir » à une date donnée, mais
  // le type du site n'a que trois états : il reste annoncé, et la mention
  // précise est portée par `rawStatus`.
  postponed: 'À venir',
  cancelled: 'À venir',
};

export interface ApiMatch extends Match {
  fcId: string;
  /** État fconnect non traduit : distingue reporté, annulé, mi-temps. */
  rawStatus: FcMatchStatus;
  /** Logo de l'adversaire, quand il est renseigné. */
  opponentLogo?: string;
  isHome: boolean;
}

const isClubSide = (side: FcMatchTeamRef): boolean => Boolean(CLUB_ID) && side.clubId === CLUB_ID;

export const toMatch = (match: FcMatch): ApiMatch => {
  // À défaut de `clubId` exploitable (match saisi sans rattachement), on tient
  // le club pour l'équipe à domicile : c'est le cas le plus fréquent, et le
  // seul repli qui ne fasse pas disparaître la rencontre.
  const playingHome = isClubSide(match.homeTeam) || !isClubSide(match.awayTeam);
  const opponent = playingHome ? match.awayTeam : match.homeTeam;
  const finished = match.status === 'finished';

  return {
    id: match.id ?? match._id ?? '',
    fcId: match.id ?? match._id ?? '',
    opponent: opponent.name,
    opponentLogo: opponent.logo,
    date: isoDate(match.date),
    time: match.time ?? '',
    venue: playingHome ? 'Domicile' : 'Extérieur',
    isHome: playingHome,
    competition: match.competition?.name ?? '',
    result: finished ? { home: match.score.home, away: match.score.away } : undefined,
    status: STATUS_LABELS[match.status] ?? 'À venir',
    rawStatus: match.status,
  };
};

export const toMatches = (matches: FcMatch[]): ApiMatch[] => matches.map(toMatch);
