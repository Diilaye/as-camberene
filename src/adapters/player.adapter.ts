

import { Player } from '../types';
import { FcTeamPlayerRef } from '../types/fconnect';
import { mediaUrl } from '../services/fconnect/files.service';
import { ageFrom, fullName } from './helpers';


export const PLAYER_PHOTO_FALLBACK = 'assets/img/vue-du-ballon-de-football.jpg';


export interface ApiPlayer extends Player {
 
  fcId: string;
 
  hasPublicStats: boolean;
 
  status?: FcTeamPlayerRef['status'];
}

export const toPlayer = (member: FcTeamPlayerRef): ApiPlayer => ({
  id: member.id,
  fcId: member.id,
  name: fullName(member.first_name, member.last_name) || 'Joueur',
  number: member.jersey_number ?? 0,
  position: member.position?.trim() || 'Joueur',
  nationality: '',
  age: ageFrom(member.date_of_birth) ?? 0,
  photo: mediaUrl(member.profile_picture_url, PLAYER_PHOTO_FALLBACK),
  stats: { matches: 0, goals: 0, assists: 0 },
  hasPublicStats: false,
  biography: '',
  joinedYear: 0,
  status: member.status,
});

export const toPlayers = (members: FcTeamPlayerRef[]): ApiPlayer[] => members.map(toPlayer);


export const fromStaticPlayers = (players: Player[]): ApiPlayer[] =>
  players.map((player) => ({ ...player, fcId: String(player.id), hasPublicStats: true }));
