/**
 * Équipes du club.
 *
 * Deux familles d'équipes coexistent dans fconnect : celles rattachées à un
 * club (`/api/clubs/:clubId/teams`, auth-service) et celles du team-service
 * autonome (`/api/teams`). Seules les premières appartiennent au club — le site
 * n'utilise qu'elles.
 *
 * `GET /api/clubs/:clubId/teams` peuple déjà les joueurs avec une projection
 * réduite (nom, numéro, poste, photo) : c'est la source d'effectif à privilégier,
 * cf. `members.service.ts`.
 */

import { fconnectApi } from '../../lib/api';
import { CLUB_ID } from '../../config/env';
import { FcDataResponse, FcTeam, FcTeamCategory } from '../../types/fconnect';

export interface TeamFilters {
  category?: FcTeamCategory;
  season?: string;
  status?: 'active' | 'inactive' | 'disbanded';
  page?: number;
  limit?: number;
}

export const getTeams = async (
  filters: TeamFilters = {},
  signal?: AbortSignal
): Promise<FcTeam[]> => {
  const response = await fconnectApi.get<FcDataResponse<FcTeam[]>>(`/clubs/${CLUB_ID}/teams`, {
    query: {
      // Les équipes dissoutes n'ont rien à faire sur la vitrine, sauf demande
      // explicite d'un autre statut.
      status: filters.status ?? 'active',
      category: filters.category,
      season: filters.season,
      page: filters.page,
      limit: filters.limit ?? 50,
    },
    signal,
  });
  return response.data;
};

/** Détail d'une équipe : effectif complet, encadrement, stats de championnat. */
export const getTeam = async (teamId: string, signal?: AbortSignal): Promise<FcTeam> => {
  const response = await fconnectApi.get<FcDataResponse<FcTeam>>(`/clubs/teams/${teamId}`, { signal });
  return response.data;
};
