/**
 * Données sportives, lues dans fconnect.
 *
 * Profil du club, équipes, effectif, calendrier : le club les saisit dans son
 * tableau de bord fconnect, le site les lit en anonyme. Aucune écriture ne part
 * d'ici — ce qui se modifie depuis le site vit dans `services/site/`.
 */

export * as clubService from './club.service';
export * as matchesService from './matches.service';
export * as membersService from './members.service';
export * as teamsService from './teams.service';
export { mediaUrl as fconnectMediaUrl } from './files.service';
