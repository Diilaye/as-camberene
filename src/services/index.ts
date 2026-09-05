/**
 * Les deux sources de données du site.
 *
 * `site/`     — backend propre au site : actualités, boutique, légendes,
 *               histoire, comptes. Lecture et écriture.
 * `fconnect/` — plateforme fconnect : club, équipes, effectif, matchs.
 *               Lecture seule et anonyme.
 *
 * La frontière est celle de la responsabilité : le club saisit son sportif dans
 * fconnect, sa communication sur son site.
 */

export * from './site';
export * from './fconnect';
