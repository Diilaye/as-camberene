/**
 * Membre fconnect → `Player` du site.
 *
 * ── Ce que fconnect ne dit pas publiquement ────────────────────────────────
 *
 * L'effectif public vient de la projection des équipes : nom, numéro, poste,
 * photo, et la date de naissance sur le détail d'une équipe. Le reste du type
 * `Player` n'a pas d'équivalent accessible sans authentification :
 *
 * — `stats` (matchs, buts, passes) vit dans `/api/clubs/me/performances`,
 *   réservé au club. D'où des compteurs à zéro : mieux vaut un zéro visible
 *   qu'un chiffre inventé. À rebrancher quand fconnect exposera un agrégat
 *   public.
 * — `nationality`, `biography`, `joinedYear` ne sont pas dans la projection.
 *
 * Les pages qui affichent ces champs doivent donc les traiter comme
 * facultatifs — `hasPublicStats` permet de les masquer proprement.
 */

import { Player } from '../types';
import { FcTeamPlayerRef } from '../types/fconnect';
import { mediaUrl } from '../services/fconnect/files.service';
import { ageFrom, fullName } from './helpers';

/** Silhouette neutre affichée quand le membre n'a pas de photo. */
export const PLAYER_PHOTO_FALLBACK = 'assets/img/vue-du-ballon-de-football.jpg';

/** `Player` enrichi de ce que le site doit savoir sur l'origine des données. */
export interface ApiPlayer extends Player {
  /** Identifiant fconnect, tel quel — c'est lui qui sert au routage. */
  fcId: string;
  /** `false` tant que fconnect ne publie pas de statistiques publiques. */
  hasPublicStats: boolean;
  /** Blessé, en essai, prêté… quand l'endpoint le renseigne. */
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

/**
 * Effectif statique de `src/data/players.ts`, promu en `ApiPlayer`.
 *
 * Ces fiches-là portent bien des statistiques — elles ont été écrites à la
 * main : `hasPublicStats` y est vrai, contrairement à ce qui vient de fconnect.
 */
export const fromStaticPlayers = (players: Player[]): ApiPlayer[] =>
  players.map((player) => ({ ...player, fcId: String(player.id), hasPublicStats: true }));
