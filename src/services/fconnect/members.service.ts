/**
 * Effectif du club.
 *
 * ── Pourquoi ce service ne tape pas `/api/clubs/:clubId/members` ──────────
 *
 * Cet endpoint est public dans fconnect, mais il renvoie le document
 * `ClubMember` entier, sans projection : téléphone, e-mail, date de naissance,
 * contrat (rémunération comprise), notes internes, contact d'urgence, numéro de
 * licence. L'afficher sur un site public exposerait ces données personnelles.
 *
 * `GET /api/clubs/:clubId/teams` peuple en revanche ses joueurs avec la seule
 * projection `first_name last_name jersey_number position profile_picture_url` :
 * exactement ce qu'une page « Effectif » doit montrer, et rien de plus. C'est
 * donc par les équipes que le site lit son effectif.
 *
 * Le jour où fconnect exposera une vue publique projetée des membres, ce
 * service sera le seul fichier à changer.
 */

import { FcTeam, FcTeamPlayerRef } from '../../types/fconnect';
import { getTeams, TeamFilters } from './teams.service';

const isPopulated = (value: FcTeamPlayerRef | string): value is FcTeamPlayerRef =>
  typeof value === 'object' && value !== null;

/** Joueurs d'une équipe déjà chargée, doublons de peuplement écartés. */
export const rosterOf = (team: FcTeam): FcTeamPlayerRef[] =>
  (team.players ?? []).filter(isPopulated);

/**
 * Effectif de tout le club, dédoublonné.
 *
 * Un même joueur peut figurer dans deux équipes (un U19 surclassé en senior) :
 * il ne doit apparaître qu'une fois sur la page « Joueurs ».
 */
export const getClubRoster = async (
  filters: TeamFilters = {},
  signal?: AbortSignal
): Promise<FcTeamPlayerRef[]> => {
  const teams = await getTeams(filters, signal);

  const byId = new Map<string, FcTeamPlayerRef>();
  for (const team of teams) {
    for (const player of rosterOf(team)) {
      if (!byId.has(player.id)) byId.set(player.id, player);
    }
  }

  return [...byId.values()];
};
