/**
 * Calendrier et résultats.
 *
 * `match-service` accepte un filtre `clubId` natif et reste lisible sans
 * compte : les matchs sont l'affiche du club.
 */

import { fconnectApi } from '../../lib/api';
import { CLUB_ID } from '../../config/env';
import { FcMatch, FcMatchStatus, FcMatchType, FcMatchesResponse } from '../../types/fconnect';

export interface MatchFilters {
  status?: FcMatchStatus;
  type?: FcMatchType;
  dateFrom?: string;
  dateTo?: string;
  /** Tri Mongo : `date` (croissant) ou `-date` (décroissant). */
  sort?: 'date' | '-date';
  page?: number;
  limit?: number;
}

export const getMatches = async (
  filters: MatchFilters = {},
  signal?: AbortSignal
): Promise<FcMatch[]> => {
  const response = await fconnectApi.get<FcMatchesResponse>('/matches', {
    query: { clubId: CLUB_ID, ...filters, limit: filters.limit ?? 20 },
    signal,
  });
  return response.matches;
};

/** Prochaines rencontres, de la plus proche à la plus lointaine. */
export const getUpcomingMatches = (limit = 5, signal?: AbortSignal): Promise<FcMatch[]> =>
  getMatches(
    { status: 'scheduled', sort: 'date', dateFrom: new Date().toISOString(), limit },
    signal
  );

/** Derniers résultats, du plus récent au plus ancien. */
export const getRecentResults = (limit = 5, signal?: AbortSignal): Promise<FcMatch[]> =>
  getMatches({ status: 'finished', sort: '-date', limit }, signal);

export const getMatch = async (matchId: string, signal?: AbortSignal): Promise<FcMatch> => {
  const response = await fconnectApi.get<{ success: boolean; match: FcMatch }>(`/matches/${matchId}`, {
    signal,
  });
  return response.match;
};
