

import { TeamData } from '../data/teams';
import { FcTeam, FcTeamCategory, FcTeamStaffRef } from '../types/fconnect';
import { mediaUrl } from '../services/fconnect/files.service';
import { fullName } from './helpers';
import { ApiPlayer, toPlayers } from './player.adapter';
import { rosterOf } from '../services/fconnect/members.service';


const PRESENTATION: Record<FcTeamCategory, { ageRange: string }> = {
  senior: { ageRange: 'Seniors' },
  u23: { ageRange: '20–23' },
  u19: { ageRange: '17–19' },
  u17: { ageRange: '15–17' },
  u15: { ageRange: '13–15' },
  u13: { ageRange: '11–13' },
  u11: { ageRange: '9–11' },
  veterans: { ageRange: 'Vétérans' },
  women: { ageRange: 'Féminines' },
  other: { ageRange: '' },
};

const DEFAULT_PRESENTATION = PRESENTATION.other;


const SENIOR_CATEGORIES: FcTeamCategory[] = ['senior', 'veterans', 'women'];

export const TEAM_IMAGE_FALLBACK = 'assets/img/asc-camberene-equipe-2025.webp';

const staffName = (staff?: FcTeamStaffRef | string | null): string =>
  staff && typeof staff === 'object' ? fullName(staff.first_name, staff.last_name) : '';


export interface ApiTeam extends TeamData {
  fcId: string;
  season: string;
 
  players: number;
  players_list: ApiPlayer[];
}

export const toTeam = (team: FcTeam): ApiTeam => {
  const category = team.category ?? 'other';
  const presentation = PRESENTATION[category] ?? DEFAULT_PRESENTATION;
  const roster = rosterOf(team);

  return {
    id: team.id,
   
   
    slug: team.id,
    fcId: team.id,
    category: SENIOR_CATEGORIES.includes(category) ? 'senior' : 'youth',
    name: team.name.toUpperCase(),
    ageRange: presentation.ageRange,
    subtitle: team.league_name || team.division || team.description?.slice(0, 60) || '',
    description: team.description ?? '',
    players: team.playersCount ?? roster.length,
    coach: staffName(team.manager_id),
    training: '',
    stadium: team.home_stadium ?? '',
    achievements: [],
    stats: {
      wins: team.matches_won ?? 0,
      draws: team.matches_drawn ?? 0,
      losses: team.matches_lost ?? 0,
    },
    established: '',
    image: mediaUrl(team.logo_url, TEAM_IMAGE_FALLBACK),
    season: team.season,
    players_list: toPlayers(roster),
  };
};

export const toTeams = (teams: FcTeam[]): ApiTeam[] => teams.map(toTeam);


export const CATEGORY_BY_ROUTE: Record<string, FcTeamCategory> = {
  'equipe-a': 'senior',
  'equipe-u19': 'u19',
  'equipe-u17': 'u17',
  'equipe-u15': 'u15',
 
  'equipe-u12': 'u13',
};
